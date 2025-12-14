import { Repository, In, SelectQueryBuilder } from "typeorm";
import { AppDataSource } from "../data-source.js";
import {
  Ticket,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  TicketMessage,
  User,
  UserRole,
} from "../entities/index.js";

export interface TicketFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  search?: string;
  assignedToId?: string;
  userId?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface TicketStats {
  totalOpen: number;
  totalResolved: number;
  totalClosed: number;
  slaBreached: number;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
  avgResolutionTimeHours: string | null;
}

export class TicketRepository {
  private ticketRepo: Repository<Ticket>;
  private messageRepo: Repository<TicketMessage>;
  private userRepo: Repository<User>;

  constructor() {
    this.ticketRepo = AppDataSource.getRepository(Ticket);
    this.messageRepo = AppDataSource.getRepository(TicketMessage);
    this.userRepo = AppDataSource.getRepository(User);
  }

  // ==================== TICKET OPERATIONS ====================

  async findById(id: string): Promise<Ticket | null> {
    return this.ticketRepo.findOne({ where: { id } });
  }

  async findByIdWithRelations(id: string): Promise<Ticket | null> {
    return this.ticketRepo.findOne({
      where: { id },
      relations: ["user", "assignedTo", "messages", "messages.user"],
    });
  }

  async findByIdWithUserAndAssigned(id: string): Promise<Ticket | null> {
    return this.ticketRepo.findOne({
      where: { id },
      relations: ["user", "assignedTo"],
    });
  }

  async findUserTickets(
    userId: string,
    status: TicketStatus | undefined,
    pagination: PaginationParams
  ): Promise<{ tickets: Ticket[]; total: number }> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const queryBuilder = this.ticketRepo
      .createQueryBuilder("ticket")
      .leftJoinAndSelect("ticket.user", "user")
      .leftJoinAndSelect("ticket.assignedTo", "assignedTo")
      .where("ticket.userId = :userId", { userId });

    if (status) {
      queryBuilder.andWhere("ticket.status = :status", { status });
    }

    queryBuilder
      .orderBy("ticket.createdAt", "DESC")
      .skip(skip)
      .take(limit);

    const [tickets, total] = await queryBuilder.getManyAndCount();
    return { tickets, total };
  }

  async findAdminTickets(
    filters: TicketFilters,
    pagination: PaginationParams
  ): Promise<{ tickets: Ticket[]; total: number }> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const queryBuilder = this.ticketRepo
      .createQueryBuilder("ticket")
      .leftJoinAndSelect("ticket.user", "user")
      .leftJoinAndSelect("ticket.assignedTo", "assignedTo");

    this.applyFilters(queryBuilder, filters);

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
    return { tickets, total };
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<Ticket>,
    filters: TicketFilters
  ): void {
    if (filters.status) {
      queryBuilder.andWhere("ticket.status = :status", { status: filters.status });
    }

    if (filters.priority) {
      queryBuilder.andWhere("ticket.priority = :priority", { priority: filters.priority });
    }

    if (filters.category) {
      queryBuilder.andWhere("ticket.category = :category", { category: filters.category });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        "(ticket.subject ILIKE :search OR user.name ILIKE :search OR user.email ILIKE :search)",
        { search: `%${filters.search}%` }
      );
    }

    if (filters.assignedToId) {
      queryBuilder.andWhere("ticket.assignedToId = :adminId", { adminId: filters.assignedToId });
    }
  }

  async create(ticketData: Partial<Ticket>): Promise<Ticket> {
    const ticket = this.ticketRepo.create(ticketData);
    return this.ticketRepo.save(ticket);
  }

  async save(ticket: Ticket): Promise<Ticket> {
    return this.ticketRepo.save(ticket);
  }

  // ==================== STATS OPERATIONS ====================

  async getStats(): Promise<TicketStats> {
    const now = new Date();

    const totalOpen = await this.ticketRepo.count({
      where: { status: In([TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.WAITING_RESPONSE]) },
    });

    const totalResolved = await this.ticketRepo.count({
      where: { status: TicketStatus.RESOLVED },
    });

    const totalClosed = await this.ticketRepo.count({
      where: { status: TicketStatus.CLOSED },
    });

    const slaBreached = await this.ticketRepo
      .createQueryBuilder("ticket")
      .where("ticket.status NOT IN (:...closedStatuses)", {
        closedStatuses: [TicketStatus.RESOLVED, TicketStatus.CLOSED],
      })
      .andWhere("ticket.slaDeadline < :now", { now })
      .getCount();

    const byPriority = await this.ticketRepo
      .createQueryBuilder("ticket")
      .select("ticket.priority", "priority")
      .addSelect("COUNT(*)", "count")
      .where("ticket.status NOT IN (:...closedStatuses)", {
        closedStatuses: [TicketStatus.RESOLVED, TicketStatus.CLOSED],
      })
      .groupBy("ticket.priority")
      .getRawMany();

    const byCategory = await this.ticketRepo
      .createQueryBuilder("ticket")
      .select("ticket.category", "category")
      .addSelect("COUNT(*)", "count")
      .where("ticket.status NOT IN (:...closedStatuses)", {
        closedStatuses: [TicketStatus.RESOLVED, TicketStatus.CLOSED],
      })
      .groupBy("ticket.category")
      .getRawMany();

    const avgResolutionResult = await this.ticketRepo
      .createQueryBuilder("ticket")
      .select("AVG(EXTRACT(EPOCH FROM (ticket.resolvedAt - ticket.createdAt)) / 3600)", "avgHours")
      .where("ticket.resolvedAt IS NOT NULL")
      .getRawOne();

    return {
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
      avgResolutionTimeHours: avgResolutionResult?.avgHours
        ? parseFloat(avgResolutionResult.avgHours).toFixed(1)
        : null,
    };
  }

  // ==================== MESSAGE OPERATIONS ====================

  async createMessage(messageData: Partial<TicketMessage>): Promise<TicketMessage> {
    const message = this.messageRepo.create(messageData);
    return this.messageRepo.save(message);
  }

  async findMessageById(id: string): Promise<TicketMessage | null> {
    return this.messageRepo.findOne({
      where: { id },
      relations: ["user"],
    });
  }

  // ==================== USER OPERATIONS ====================

  async findUserById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async findStaffMember(id: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: [
        { id, role: UserRole.ADMIN },
        { id, role: UserRole.SUPPORT },
      ],
    });
  }
}

export const ticketRepository = new TicketRepository();
