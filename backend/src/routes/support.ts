import { Router } from "express";
import { AppDataSource } from "../data-source.js";
import {
  Ticket,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  SLA_DEADLINES,
  TicketMessage,
  MessageType,
  User,
  UserRole,
} from "../entities/index.js";
import { asyncHandler, AppError } from "../middlewares/errorHandler.js";
import { authenticate, requireSupport } from "../middlewares/auth.js";
import { In } from "typeorm";

const router: ReturnType<typeof Router> = Router();
const ticketRepository = () => AppDataSource.getRepository(Ticket);
const messageRepository = () => AppDataSource.getRepository(TicketMessage);
const userRepository = () => AppDataSource.getRepository(User);

// All support routes require authentication
router.use(authenticate);

// ==================== USER TICKET ROUTES ====================

/**
 * @swagger
 * /api/support/tickets:
 *   get:
 *     summary: Get user's tickets
 *     tags: [Support]
 */
router.get(
  "/tickets",
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const status = req.query.status as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = ticketRepository()
      .createQueryBuilder("ticket")
      .leftJoinAndSelect("ticket.user", "user")
      .leftJoinAndSelect("ticket.assignedTo", "assignedTo")
      .where("ticket.userId = :userId", { userId });

    if (status && Object.values(TicketStatus).includes(status as TicketStatus)) {
      queryBuilder.andWhere("ticket.status = :status", { status });
    }

    queryBuilder
      .orderBy("ticket.createdAt", "DESC")
      .skip(skip)
      .take(limit);

    const [tickets, total] = await queryBuilder.getManyAndCount();

    res.json({
      tickets: tickets.map((t) => ({
        ...t,
        user: t.user ? { id: t.user.id, name: t.user.name, email: t.user.email } : null,
        assignedTo: t.assignedTo ? { id: t.assignedTo.id, name: t.assignedTo.name } : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  })
);

/**
 * @swagger
 * /api/support/tickets:
 *   post:
 *     summary: Create a new ticket
 *     tags: [Support]
 */
router.post(
  "/tickets",
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const { subject, description, priority, category } = req.body;

    if (!subject || !description) {
      throw new AppError("Assunto e descrição são obrigatórios", 400);
    }

    const ticketPriority = priority && Object.values(TicketPriority).includes(priority)
      ? priority
      : TicketPriority.MEDIUM;

    const ticketCategory = category && Object.values(TicketCategory).includes(category)
      ? category
      : TicketCategory.OTHER;

    // Calculate SLA deadline based on priority
    const slaHours = SLA_DEADLINES[ticketPriority as TicketPriority];
    const slaDeadline = new Date();
    slaDeadline.setHours(slaDeadline.getHours() + slaHours);

    const ticket = ticketRepository().create({
      userId,
      subject,
      description,
      priority: ticketPriority,
      category: ticketCategory,
      status: TicketStatus.OPEN,
      slaDeadline,
      slaBreach: false,
    });

    await ticketRepository().save(ticket);

    // Create initial message with the description
    const initialMessage = messageRepository().create({
      ticketId: ticket.id,
      userId,
      content: description,
      type: MessageType.USER,
    });

    await messageRepository().save(initialMessage);

    res.status(201).json(ticket);
  })
);

/**
 * @swagger
 * /api/support/tickets/:id:
 *   get:
 *     summary: Get ticket details
 *     tags: [Support]
 */
router.get(
  "/tickets/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const ticket = await ticketRepository().findOne({
      where: { id },
      relations: ["user", "assignedTo", "messages", "messages.user"],
    });

    if (!ticket) {
      throw new AppError("Ticket não encontrado", 404);
    }

    // Users can only see their own tickets, admins/support can see all
    const isStaff = userRole === UserRole.ADMIN || userRole === UserRole.SUPPORT;
    if (ticket.userId !== userId && !isStaff) {
      throw new AppError("Acesso negado", 403);
    }

    // Filter internal messages for non-staff users
    const messages = isStaff
      ? ticket.messages
      : ticket.messages.filter((m) => !m.isInternal);

    res.json({
      ...ticket,
      user: ticket.user ? { id: ticket.user.id, name: ticket.user.name, email: ticket.user.email } : null,
      assignedTo: ticket.assignedTo ? { id: ticket.assignedTo.id, name: ticket.assignedTo.name } : null,
      messages: messages.map((m) => ({
        ...m,
        user: m.user ? { id: m.user.id, name: m.user.name } : null,
      })),
    });
  })
);

/**
 * @swagger
 * /api/support/tickets/:id/messages:
 *   post:
 *     summary: Add message to ticket
 *     tags: [Support]
 */
router.post(
  "/tickets/:id/messages",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const { content, isInternal } = req.body;

    if (!content) {
      throw new AppError("Conteúdo da mensagem é obrigatório", 400);
    }

    const ticket = await ticketRepository().findOne({ where: { id } });

    if (!ticket) {
      throw new AppError("Ticket não encontrado", 404);
    }

    // Users can only add messages to their own tickets
    const isStaff = userRole === UserRole.ADMIN || userRole === UserRole.SUPPORT;
    if (ticket.userId !== userId && !isStaff) {
      throw new AppError("Acesso negado", 403);
    }

    // Only staff can add internal messages
    const messageIsInternal = isStaff && isInternal === true;

    const message = messageRepository().create({
      ticketId: id,
      userId,
      content,
      type: isStaff ? MessageType.SUPPORT : MessageType.USER,
      isInternal: messageIsInternal,
    });

    await messageRepository().save(message);

    // Update ticket status based on who replied
    if (isStaff && !messageIsInternal) {
      // Admin replied - set to waiting for user response
      if (ticket.status === TicketStatus.OPEN) {
        ticket.status = TicketStatus.IN_PROGRESS;
        ticket.firstResponseAt = new Date();
      }
      ticket.status = TicketStatus.WAITING_RESPONSE;
    } else if (ticket.userId === userId) {
      // User replied - set to open if it was waiting
      if (ticket.status === TicketStatus.WAITING_RESPONSE) {
        ticket.status = TicketStatus.OPEN;
      }
    }

    await ticketRepository().save(ticket);

    const savedMessage = await messageRepository().findOne({
      where: { id: message.id },
      relations: ["user"],
    });

    res.status(201).json({
      ...savedMessage,
      user: savedMessage?.user ? { id: savedMessage.user.id, name: savedMessage.user.name } : null,
    });
  })
);

/**
 * @swagger
 * /api/support/tickets/:id/close:
 *   post:
 *     summary: Close ticket (user can close their own tickets)
 *     tags: [Support]
 */
router.post(
  "/tickets/:id/close",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user!.userId;

    const ticket = await ticketRepository().findOne({ where: { id } });

    if (!ticket) {
      throw new AppError("Ticket não encontrado", 404);
    }

    if (ticket.userId !== userId) {
      throw new AppError("Acesso negado", 403);
    }

    ticket.status = TicketStatus.CLOSED;
    ticket.closedAt = new Date();

    await ticketRepository().save(ticket);

    // Add system message
    const systemMessage = messageRepository().create({
      ticketId: id,
      content: "Ticket fechado pelo usuário",
      type: MessageType.SYSTEM,
    });

    await messageRepository().save(systemMessage);

    res.json(ticket);
  })
);

// ==================== ADMIN TICKET ROUTES ====================

/**
 * @swagger
 * /api/support/admin/tickets:
 *   get:
 *     summary: Get all tickets (admin only)
 *     tags: [Support]
 */
router.get(
  "/admin/tickets",
  requireSupport,
  asyncHandler(async (req, res) => {
    const status = req.query.status as string;
    const priority = req.query.priority as string;
    const category = req.query.category as string;
    const search = req.query.search as string;
    const assignedToMe = req.query.assignedToMe === "true";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = ticketRepository()
      .createQueryBuilder("ticket")
      .leftJoinAndSelect("ticket.user", "user")
      .leftJoinAndSelect("ticket.assignedTo", "assignedTo");

    if (status && Object.values(TicketStatus).includes(status as TicketStatus)) {
      queryBuilder.andWhere("ticket.status = :status", { status });
    }

    if (priority && Object.values(TicketPriority).includes(priority as TicketPriority)) {
      queryBuilder.andWhere("ticket.priority = :priority", { priority });
    }

    if (category && Object.values(TicketCategory).includes(category as TicketCategory)) {
      queryBuilder.andWhere("ticket.category = :category", { category });
    }

    if (search) {
      queryBuilder.andWhere(
        "(ticket.subject ILIKE :search OR user.name ILIKE :search OR user.email ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    if (assignedToMe) {
      queryBuilder.andWhere("ticket.assignedToId = :adminId", { adminId: req.user!.userId });
    }

    // Check for SLA breach
    const now = new Date();
    queryBuilder.addSelect(
      `CASE WHEN ticket.status NOT IN ('resolved', 'closed') AND ticket.slaDeadline < :now THEN true ELSE ticket.slaBreach END`,
      "ticket_slaBreach"
    );
    queryBuilder.setParameter("now", now);

    queryBuilder
      .orderBy("ticket.priority", "DESC")
      .addOrderBy("ticket.createdAt", "ASC")
      .skip(skip)
      .take(limit);

    const [tickets, total] = await queryBuilder.getManyAndCount();

    res.json({
      tickets: tickets.map((t) => ({
        ...t,
        user: t.user ? { id: t.user.id, name: t.user.name, email: t.user.email } : null,
        assignedTo: t.assignedTo ? { id: t.assignedTo.id, name: t.assignedTo.name } : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  })
);

/**
 * @swagger
 * /api/support/admin/tickets/stats:
 *   get:
 *     summary: Get ticket statistics (admin only)
 *     tags: [Support]
 */
router.get(
  "/admin/tickets/stats",
  requireSupport,
  asyncHandler(async (req, res) => {
    const now = new Date();

    const totalOpen = await ticketRepository().count({
      where: { status: In([TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.WAITING_RESPONSE]) },
    });

    const totalResolved = await ticketRepository().count({
      where: { status: TicketStatus.RESOLVED },
    });

    const totalClosed = await ticketRepository().count({
      where: { status: TicketStatus.CLOSED },
    });

    const slaBreached = await ticketRepository()
      .createQueryBuilder("ticket")
      .where("ticket.status NOT IN (:...closedStatuses)", {
        closedStatuses: [TicketStatus.RESOLVED, TicketStatus.CLOSED],
      })
      .andWhere("ticket.slaDeadline < :now", { now })
      .getCount();

    const byPriority = await ticketRepository()
      .createQueryBuilder("ticket")
      .select("ticket.priority", "priority")
      .addSelect("COUNT(*)", "count")
      .where("ticket.status NOT IN (:...closedStatuses)", {
        closedStatuses: [TicketStatus.RESOLVED, TicketStatus.CLOSED],
      })
      .groupBy("ticket.priority")
      .getRawMany();

    const byCategory = await ticketRepository()
      .createQueryBuilder("ticket")
      .select("ticket.category", "category")
      .addSelect("COUNT(*)", "count")
      .where("ticket.status NOT IN (:...closedStatuses)", {
        closedStatuses: [TicketStatus.RESOLVED, TicketStatus.CLOSED],
      })
      .groupBy("ticket.category")
      .getRawMany();

    // Average resolution time (in hours)
    const avgResolutionResult = await ticketRepository()
      .createQueryBuilder("ticket")
      .select("AVG(EXTRACT(EPOCH FROM (ticket.resolvedAt - ticket.createdAt)) / 3600)", "avgHours")
      .where("ticket.resolvedAt IS NOT NULL")
      .getRawOne();

    res.json({
      totalOpen,
      totalResolved,
      totalClosed,
      slaBreached,
      byPriority: byPriority.reduce((acc, { priority, count }) => {
        acc[priority] = parseInt(count);
        return acc;
      }, {} as Record<string, number>),
      byCategory: byCategory.reduce((acc, { category, count }) => {
        acc[category] = parseInt(count);
        return acc;
      }, {} as Record<string, number>),
      avgResolutionTimeHours: avgResolutionResult?.avgHours ? parseFloat(avgResolutionResult.avgHours).toFixed(1) : null,
    });
  })
);

/**
 * @swagger
 * /api/support/admin/tickets/:id:
 *   patch:
 *     summary: Update ticket (admin only)
 *     tags: [Support]
 */
router.patch(
  "/admin/tickets/:id",
  requireSupport,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, priority, assignedToId } = req.body;

    const ticket = await ticketRepository().findOne({ where: { id } });

    if (!ticket) {
      throw new AppError("Ticket não encontrado", 404);
    }

    let statusChanged = false;
    let oldStatus = ticket.status;

    if (status && Object.values(TicketStatus).includes(status)) {
      ticket.status = status;
      statusChanged = true;

      if (status === TicketStatus.RESOLVED && !ticket.resolvedAt) {
        ticket.resolvedAt = new Date();
      }

      if (status === TicketStatus.CLOSED && !ticket.closedAt) {
        ticket.closedAt = new Date();
      }
    }

    if (priority && Object.values(TicketPriority).includes(priority)) {
      ticket.priority = priority;
      // Recalculate SLA deadline if priority changed
      const slaHours = SLA_DEADLINES[priority as TicketPriority];
      const newDeadline = new Date(ticket.createdAt);
      newDeadline.setHours(newDeadline.getHours() + slaHours);
      ticket.slaDeadline = newDeadline;
    }

    if (assignedToId !== undefined) {
      if (assignedToId === null) {
        ticket.assignedToId = undefined;
      } else {
        const staffMember = await userRepository().findOne({
          where: [
            { id: assignedToId, role: UserRole.ADMIN },
            { id: assignedToId, role: UserRole.SUPPORT },
          ],
        });
        if (!staffMember) {
          throw new AppError("Membro da equipe não encontrado", 404);
        }
        ticket.assignedToId = assignedToId;
      }
    }

    await ticketRepository().save(ticket);

    // Add system message if status changed
    if (statusChanged) {
      const statusLabels: Record<TicketStatus, string> = {
        [TicketStatus.OPEN]: "Aberto",
        [TicketStatus.IN_PROGRESS]: "Em Andamento",
        [TicketStatus.WAITING_RESPONSE]: "Aguardando Resposta",
        [TicketStatus.RESOLVED]: "Resolvido",
        [TicketStatus.CLOSED]: "Fechado",
      };

      const systemMessage = messageRepository().create({
        ticketId: id,
        content: `Status alterado de "${statusLabels[oldStatus]}" para "${statusLabels[ticket.status]}"`,
        type: MessageType.SYSTEM,
      });

      await messageRepository().save(systemMessage);
    }

    const updatedTicket = await ticketRepository().findOne({
      where: { id },
      relations: ["user", "assignedTo"],
    });

    res.json({
      ...updatedTicket,
      user: updatedTicket?.user
        ? { id: updatedTicket.user.id, name: updatedTicket.user.name, email: updatedTicket.user.email }
        : null,
      assignedTo: updatedTicket?.assignedTo
        ? { id: updatedTicket.assignedTo.id, name: updatedTicket.assignedTo.name }
        : null,
    });
  })
);

/**
 * @swagger
 * /api/support/admin/tickets/:id/assign:
 *   post:
 *     summary: Assign ticket to self (admin only)
 *     tags: [Support]
 */
router.post(
  "/admin/tickets/:id/assign",
  requireSupport,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const adminId = req.user!.userId;

    const ticket = await ticketRepository().findOne({ where: { id } });

    if (!ticket) {
      throw new AppError("Ticket não encontrado", 404);
    }

    ticket.assignedToId = adminId;

    if (ticket.status === TicketStatus.OPEN) {
      ticket.status = TicketStatus.IN_PROGRESS;
    }

    await ticketRepository().save(ticket);

    const admin = await userRepository().findOne({ where: { id: adminId } });

    // Add system message
    const systemMessage = messageRepository().create({
      ticketId: id,
      content: `Ticket atribuído para ${admin?.name || "Suporte"}`,
      type: MessageType.SYSTEM,
    });

    await messageRepository().save(systemMessage);

    res.json(ticket);
  })
);

export default router;
