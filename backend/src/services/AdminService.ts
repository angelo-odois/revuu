import { User, UserRole, UserPlan, SubscriptionStatus } from "../entities/index.js";
import { adminRepository, UserFilters, PaginationParams, UserStats } from "../repositories/AdminRepository.js";
import { cache } from "./redis.js";
import { AppError } from "../middlewares/errorHandler.js";

export interface UpdateUserDTO {
  plan?: UserPlan;
  role?: UserRole;
  subscriptionStatus?: SubscriptionStatus;
}

class AdminService {
  async getUsers(
    filters: UserFilters,
    pagination: PaginationParams
  ): Promise<{ users: User[]; pagination: object }> {
    const { users, total } = await adminRepository.findUsers(filters, pagination);

    return {
      users,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async getUserStats(): Promise<UserStats> {
    return adminRepository.getStats();
  }

  async getUserById(id: string): Promise<User> {
    const user = await adminRepository.findUserByIdWithDetails(id);

    if (!user) {
      throw new AppError("Usuario nao encontrado", 404);
    }

    return user;
  }

  async updateUser(
    id: string,
    currentUserId: string,
    dto: UpdateUserDTO
  ): Promise<User> {
    const user = await adminRepository.findUserById(id);

    if (!user) {
      throw new AppError("Usuario nao encontrado", 404);
    }

    // Prevent admin from removing their own admin role
    if (currentUserId === id && dto.role && dto.role !== UserRole.ADMIN) {
      throw new AppError("Voce nao pode remover seu proprio papel de admin", 400);
    }

    if (dto.plan && Object.values(UserPlan).includes(dto.plan)) {
      user.plan = dto.plan;
      // If manually setting plan, also update subscription status
      if (!dto.subscriptionStatus) {
        user.subscriptionStatus = SubscriptionStatus.ACTIVE;
      }
    }

    if (dto.role && Object.values(UserRole).includes(dto.role)) {
      user.role = dto.role;
    }

    if (dto.subscriptionStatus && Object.values(SubscriptionStatus).includes(dto.subscriptionStatus)) {
      user.subscriptionStatus = dto.subscriptionStatus;
    }

    await adminRepository.saveUser(user);

    const updatedUser = await adminRepository.findUserByIdWithSelect(id);
    return updatedUser!;
  }

  async deleteUser(id: string, currentUserId: string): Promise<void> {
    if (currentUserId === id) {
      throw new AppError("Voce nao pode excluir sua propria conta", 400);
    }

    const user = await adminRepository.findUserById(id);

    if (!user) {
      throw new AppError("Usuario nao encontrado", 404);
    }

    await adminRepository.removeUser(user);
  }

  async clearAllCache(): Promise<void> {
    await cache.invalidatePattern("*");
  }

  async clearCacheByPattern(pattern: string): Promise<void> {
    await cache.invalidatePattern(pattern);
  }
}

export const adminService = new AdminService();
