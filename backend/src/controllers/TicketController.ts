import { Request, Response } from "express";
import { ticketService } from "../services/TicketService.js";
import {
  TicketStatus,
  TicketPriority,
  TicketCategory,
} from "../entities/index.js";
import { TicketFilters } from "../repositories/TicketRepository.js";

class TicketController {
  // ==================== USER ENDPOINTS ====================

  async getUserTickets(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const status = req.query.status as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await ticketService.getUserTickets(userId, status, { page, limit });

    res.json({
      tickets: result.tickets.map((t) => ({
        ...t.ticket,
        user: t.user,
        assignedTo: t.assignedTo,
      })),
      pagination: result.pagination,
    });
  }

  async createTicket(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const { subject, description, priority, category } = req.body;

    const ticket = await ticketService.createTicket({
      userId,
      subject,
      description,
      priority,
      category,
    });

    res.status(201).json(ticket);
  }

  async getTicketById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const result = await ticketService.getTicketById(id, userId, userRole);

    res.json({
      ...result.ticket.ticket,
      user: result.ticket.user,
      assignedTo: result.ticket.assignedTo,
      messages: result.messages.map((m) => ({
        ...m.message,
        user: m.user,
      })),
    });
  }

  async addMessage(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const { content, isInternal } = req.body;

    const result = await ticketService.addMessage({
      ticketId: id,
      userId,
      userRole,
      content,
      isInternal,
    });

    res.status(201).json({
      ...result.message,
      user: result.user,
    });
  }

  async closeTicket(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user!.userId;

    const ticket = await ticketService.closeTicket(id, userId);
    res.json(ticket);
  }

  // ==================== ADMIN ENDPOINTS ====================

  async getAdminTickets(req: Request, res: Response): Promise<void> {
    const status = req.query.status as string;
    const priority = req.query.priority as string;
    const category = req.query.category as string;
    const search = req.query.search as string;
    const assignedToMe = req.query.assignedToMe === "true";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const filters: TicketFilters = {};

    if (status && Object.values(TicketStatus).includes(status as TicketStatus)) {
      filters.status = status as TicketStatus;
    }
    if (priority && Object.values(TicketPriority).includes(priority as TicketPriority)) {
      filters.priority = priority as TicketPriority;
    }
    if (category && Object.values(TicketCategory).includes(category as TicketCategory)) {
      filters.category = category as TicketCategory;
    }
    if (search) {
      filters.search = search;
    }
    if (assignedToMe) {
      filters.assignedToId = req.user!.userId;
    }

    const result = await ticketService.getAdminTickets(filters, { page, limit });

    res.json({
      tickets: result.tickets.map((t) => ({
        ...t.ticket,
        user: t.user,
        assignedTo: t.assignedTo,
      })),
      pagination: result.pagination,
    });
  }

  async getStats(req: Request, res: Response): Promise<void> {
    const stats = await ticketService.getStats();
    res.json(stats);
  }

  async updateTicket(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { status, priority, assignedToId } = req.body;

    const result = await ticketService.updateTicket(id, {
      status,
      priority,
      assignedToId,
    });

    res.json({
      ...result.ticket,
      user: result.user,
      assignedTo: result.assignedTo,
    });
  }

  async assignTicketToSelf(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const adminId = req.user!.userId;

    const ticket = await ticketService.assignTicketToSelf(id, adminId);
    res.json(ticket);
  }
}

export const ticketController = new TicketController();
