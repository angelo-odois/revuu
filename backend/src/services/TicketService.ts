import {
  Ticket,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  TicketMessage,
  MessageType,
  SLA_DEADLINES,
  UserRole,
} from "../entities/index.js";
import { ticketRepository, TicketFilters, PaginationParams, TicketStats } from "../repositories/TicketRepository.js";
import { AppError } from "../middlewares/errorHandler.js";

export interface CreateTicketDTO {
  userId: string;
  subject: string;
  description: string;
  priority?: TicketPriority;
  category?: TicketCategory;
}

export interface AddMessageDTO {
  ticketId: string;
  userId: string;
  userRole: UserRole;
  content: string;
  isInternal?: boolean;
}

export interface UpdateTicketDTO {
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedToId?: string | null;
}

export interface TicketResponse {
  ticket: Ticket;
  user: { id: string; name: string; email: string } | null;
  assignedTo: { id: string; name: string } | null;
}

export interface MessageResponse {
  message: TicketMessage;
  user: { id: string; name: string } | null;
}

const STATUS_LABELS: Record<TicketStatus, string> = {
  [TicketStatus.OPEN]: "Aberto",
  [TicketStatus.IN_PROGRESS]: "Em Andamento",
  [TicketStatus.WAITING_RESPONSE]: "Aguardando Resposta",
  [TicketStatus.RESOLVED]: "Resolvido",
  [TicketStatus.CLOSED]: "Fechado",
};

class TicketService {
  // ==================== TICKET OPERATIONS ====================

  async getUserTickets(
    userId: string,
    status: string | undefined,
    pagination: PaginationParams
  ): Promise<{ tickets: TicketResponse[]; pagination: object }> {
    const validStatus = status && Object.values(TicketStatus).includes(status as TicketStatus)
      ? (status as TicketStatus)
      : undefined;

    const { tickets, total } = await ticketRepository.findUserTickets(userId, validStatus, pagination);

    return {
      tickets: tickets.map((t) => this.mapTicketResponse(t)),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async getAdminTickets(
    filters: TicketFilters,
    pagination: PaginationParams
  ): Promise<{ tickets: TicketResponse[]; pagination: object }> {
    const { tickets, total } = await ticketRepository.findAdminTickets(filters, pagination);

    return {
      tickets: tickets.map((t) => this.mapTicketResponse(t)),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async getTicketById(
    ticketId: string,
    userId: string,
    userRole: UserRole
  ): Promise<{
    ticket: TicketResponse;
    messages: MessageResponse[];
  }> {
    const ticket = await ticketRepository.findByIdWithRelations(ticketId);

    if (!ticket) {
      throw new AppError("Ticket não encontrado", 404);
    }

    const isStaff = this.isStaff(userRole);
    if (ticket.userId !== userId && !isStaff) {
      throw new AppError("Acesso negado", 403);
    }

    // Filter internal messages for non-staff users
    const messages = isStaff
      ? ticket.messages
      : ticket.messages.filter((m) => !m.isInternal);

    return {
      ticket: this.mapTicketResponse(ticket),
      messages: messages.map((m) => ({
        message: m,
        user: m.user ? { id: m.user.id, name: m.user.name } : null,
      })),
    };
  }

  async createTicket(dto: CreateTicketDTO): Promise<Ticket> {
    if (!dto.subject || !dto.description) {
      throw new AppError("Assunto e descrição são obrigatórios", 400);
    }

    const priority = dto.priority && Object.values(TicketPriority).includes(dto.priority)
      ? dto.priority
      : TicketPriority.MEDIUM;

    const category = dto.category && Object.values(TicketCategory).includes(dto.category)
      ? dto.category
      : TicketCategory.OTHER;

    const slaDeadline = this.calculateSlaDeadline(priority);

    const ticket = await ticketRepository.create({
      userId: dto.userId,
      subject: dto.subject,
      description: dto.description,
      priority,
      category,
      status: TicketStatus.OPEN,
      slaDeadline,
      slaBreach: false,
    });

    // Create initial message with the description
    await ticketRepository.createMessage({
      ticketId: ticket.id,
      userId: dto.userId,
      content: dto.description,
      type: MessageType.USER,
    });

    return ticket;
  }

  async addMessage(dto: AddMessageDTO): Promise<MessageResponse> {
    if (!dto.content) {
      throw new AppError("Conteúdo da mensagem é obrigatório", 400);
    }

    const ticket = await ticketRepository.findById(dto.ticketId);

    if (!ticket) {
      throw new AppError("Ticket não encontrado", 404);
    }

    const isStaff = this.isStaff(dto.userRole);
    if (ticket.userId !== dto.userId && !isStaff) {
      throw new AppError("Acesso negado", 403);
    }

    const messageIsInternal = isStaff && dto.isInternal === true;

    const message = await ticketRepository.createMessage({
      ticketId: dto.ticketId,
      userId: dto.userId,
      content: dto.content,
      type: isStaff ? MessageType.SUPPORT : MessageType.USER,
      isInternal: messageIsInternal,
    });

    // Update ticket status based on who replied
    await this.updateTicketStatusAfterMessage(ticket, dto.userId, isStaff, messageIsInternal);

    const savedMessage = await ticketRepository.findMessageById(message.id);

    return {
      message: savedMessage!,
      user: savedMessage?.user ? { id: savedMessage.user.id, name: savedMessage.user.name } : null,
    };
  }

  async closeTicket(ticketId: string, userId: string): Promise<Ticket> {
    const ticket = await ticketRepository.findById(ticketId);

    if (!ticket) {
      throw new AppError("Ticket não encontrado", 404);
    }

    if (ticket.userId !== userId) {
      throw new AppError("Acesso negado", 403);
    }

    ticket.status = TicketStatus.CLOSED;
    ticket.closedAt = new Date();

    await ticketRepository.save(ticket);

    // Add system message
    await ticketRepository.createMessage({
      ticketId,
      content: "Ticket fechado pelo usuário",
      type: MessageType.SYSTEM,
    });

    return ticket;
  }

  async updateTicket(ticketId: string, dto: UpdateTicketDTO): Promise<TicketResponse> {
    const ticket = await ticketRepository.findById(ticketId);

    if (!ticket) {
      throw new AppError("Ticket não encontrado", 404);
    }

    let statusChanged = false;
    const oldStatus = ticket.status;

    if (dto.status && Object.values(TicketStatus).includes(dto.status)) {
      ticket.status = dto.status;
      statusChanged = true;

      if (dto.status === TicketStatus.RESOLVED && !ticket.resolvedAt) {
        ticket.resolvedAt = new Date();
      }

      if (dto.status === TicketStatus.CLOSED && !ticket.closedAt) {
        ticket.closedAt = new Date();
      }
    }

    if (dto.priority && Object.values(TicketPriority).includes(dto.priority)) {
      ticket.priority = dto.priority;
      ticket.slaDeadline = this.calculateSlaDeadline(dto.priority, ticket.createdAt);
    }

    if (dto.assignedToId !== undefined) {
      if (dto.assignedToId === null) {
        ticket.assignedToId = undefined;
      } else {
        const staffMember = await ticketRepository.findStaffMember(dto.assignedToId);
        if (!staffMember) {
          throw new AppError("Membro da equipe não encontrado", 404);
        }
        ticket.assignedToId = dto.assignedToId;
      }
    }

    await ticketRepository.save(ticket);

    if (statusChanged) {
      await ticketRepository.createMessage({
        ticketId,
        content: `Status alterado de "${STATUS_LABELS[oldStatus]}" para "${STATUS_LABELS[ticket.status]}"`,
        type: MessageType.SYSTEM,
      });
    }

    const updatedTicket = await ticketRepository.findByIdWithUserAndAssigned(ticketId);
    return this.mapTicketResponse(updatedTicket!);
  }

  async assignTicketToSelf(ticketId: string, adminId: string): Promise<Ticket> {
    const ticket = await ticketRepository.findById(ticketId);

    if (!ticket) {
      throw new AppError("Ticket não encontrado", 404);
    }

    ticket.assignedToId = adminId;

    if (ticket.status === TicketStatus.OPEN) {
      ticket.status = TicketStatus.IN_PROGRESS;
    }

    await ticketRepository.save(ticket);

    const admin = await ticketRepository.findUserById(adminId);

    await ticketRepository.createMessage({
      ticketId,
      content: `Ticket atribuído para ${admin?.name || "Suporte"}`,
      type: MessageType.SYSTEM,
    });

    return ticket;
  }

  async getStats(): Promise<TicketStats> {
    return ticketRepository.getStats();
  }

  // ==================== PRIVATE HELPERS ====================

  private isStaff(role: UserRole): boolean {
    return role === UserRole.ADMIN || role === UserRole.SUPPORT;
  }

  private calculateSlaDeadline(priority: TicketPriority, fromDate?: Date): Date {
    const slaHours = SLA_DEADLINES[priority];
    const deadline = fromDate ? new Date(fromDate) : new Date();
    deadline.setHours(deadline.getHours() + slaHours);
    return deadline;
  }

  private async updateTicketStatusAfterMessage(
    ticket: Ticket,
    userId: string,
    isStaff: boolean,
    messageIsInternal: boolean
  ): Promise<void> {
    if (isStaff && !messageIsInternal) {
      if (ticket.status === TicketStatus.OPEN) {
        ticket.status = TicketStatus.IN_PROGRESS;
        ticket.firstResponseAt = new Date();
      }
      ticket.status = TicketStatus.WAITING_RESPONSE;
    } else if (ticket.userId === userId) {
      if (ticket.status === TicketStatus.WAITING_RESPONSE) {
        ticket.status = TicketStatus.OPEN;
      }
    }

    await ticketRepository.save(ticket);
  }

  private mapTicketResponse(ticket: Ticket): TicketResponse {
    return {
      ticket,
      user: ticket.user ? { id: ticket.user.id, name: ticket.user.name, email: ticket.user.email } : null,
      assignedTo: ticket.assignedTo ? { id: ticket.assignedTo.id, name: ticket.assignedTo.name } : null,
    };
  }
}

export const ticketService = new TicketService();
