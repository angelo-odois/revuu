import { Repository, SelectQueryBuilder } from "typeorm";
import { AppDataSource } from "../data-source.js";
import { User, UserRole, UserPlan } from "../entities/index.js";

export interface UserFilters {
  search?: string;
  plan?: UserPlan;
  role?: UserRole;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface UserStats {
  totalUsers: number;
  newUsersThisMonth: number;
  byPlan: Record<string, number>;
  byRole: Record<string, number>;
}

const USER_SELECT_FIELDS: (keyof User)[] = [
  "id",
  "name",
  "username",
  "email",
  "role",
  "plan",
  "subscriptionStatus",
  "onboardingCompleted",
  "createdAt",
  "updatedAt",
];

const USER_DETAIL_FIELDS: (keyof User)[] = [
  ...USER_SELECT_FIELDS,
  "subscriptionStartedAt",
  "subscriptionEndsAt",
  "stripeCustomerId",
  "stripeSubscriptionId",
];

export class AdminRepository {
  private userRepo: Repository<User>;

  constructor() {
    this.userRepo = AppDataSource.getRepository(User);
  }

  async findUsers(
    filters: UserFilters,
    pagination: PaginationParams
  ): Promise<{ users: User[]; total: number }> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepo
      .createQueryBuilder("user")
      .select(USER_SELECT_FIELDS.map((f) => `user.${f}`));

    this.applyFilters(queryBuilder, filters);

    queryBuilder
      .orderBy("user.createdAt", "DESC")
      .skip(skip)
      .take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();
    return { users, total };
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<User>,
    filters: UserFilters
  ): void {
    if (filters.search) {
      queryBuilder.where(
        "(user.name ILIKE :search OR user.email ILIKE :search OR user.username ILIKE :search)",
        { search: `%${filters.search}%` }
      );
    }

    if (filters.plan) {
      queryBuilder.andWhere("user.plan = :plan", { plan: filters.plan });
    }

    if (filters.role) {
      queryBuilder.andWhere("user.role = :role", { role: filters.role });
    }
  }

  async getStats(): Promise<UserStats> {
    const totalUsers = await this.userRepo.count();

    const planCounts = await this.userRepo
      .createQueryBuilder("user")
      .select("user.plan", "plan")
      .addSelect("COUNT(*)", "count")
      .groupBy("user.plan")
      .getRawMany();

    const roleCounts = await this.userRepo
      .createQueryBuilder("user")
      .select("user.role", "role")
      .addSelect("COUNT(*)", "count")
      .groupBy("user.role")
      .getRawMany();

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newUsersThisMonth = await this.userRepo
      .createQueryBuilder("user")
      .where("user.createdAt >= :startOfMonth", { startOfMonth })
      .getCount();

    return {
      totalUsers,
      newUsersThisMonth,
      byPlan: planCounts.reduce((acc, { plan, count }) => {
        acc[plan] = parseInt(count);
        return acc;
      }, {} as Record<string, number>),
      byRole: roleCounts.reduce((acc, { role, count }) => {
        acc[role] = parseInt(count);
        return acc;
      }, {} as Record<string, number>),
    };
  }

  async findUserById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async findUserByIdWithDetails(id: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { id },
      select: USER_DETAIL_FIELDS,
    });
  }

  async findUserByIdWithSelect(id: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { id },
      select: USER_SELECT_FIELDS,
    });
  }

  async saveUser(user: User): Promise<User> {
    return this.userRepo.save(user);
  }

  async removeUser(user: User): Promise<void> {
    await this.userRepo.remove(user);
  }
}

export const adminRepository = new AdminRepository();
