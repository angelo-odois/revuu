import { Request, Response } from "express";
import { adminService } from "../services/AdminService.js";
import { UserRole, UserPlan } from "../entities/index.js";
import { UserFilters } from "../repositories/AdminRepository.js";

class AdminController {
  async getUsers(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const plan = req.query.plan as string;
    const role = req.query.role as string;

    const filters: UserFilters = {};
    if (search) filters.search = search;
    if (plan && Object.values(UserPlan).includes(plan as UserPlan)) {
      filters.plan = plan as UserPlan;
    }
    if (role && Object.values(UserRole).includes(role as UserRole)) {
      filters.role = role as UserRole;
    }

    const result = await adminService.getUsers(filters, { page, limit });
    res.json(result);
  }

  async getUserStats(_req: Request, res: Response): Promise<void> {
    const stats = await adminService.getUserStats();
    res.json(stats);
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const user = await adminService.getUserById(id);
    res.json(user);
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { plan, role, subscriptionStatus } = req.body;

    const updatedUser = await adminService.updateUser(id, req.user!.userId, {
      plan,
      role,
      subscriptionStatus,
    });

    res.json(updatedUser);
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await adminService.deleteUser(id, req.user!.userId);
    res.json({ message: "Usuario excluido com sucesso" });
  }

  async clearAllCache(_req: Request, res: Response): Promise<void> {
    await adminService.clearAllCache();
    res.json({ message: "All cache cleared successfully" });
  }

  async clearCacheByPattern(req: Request, res: Response): Promise<void> {
    const { pattern } = req.params;
    await adminService.clearCacheByPattern(pattern);
    res.json({ message: `Cache cleared for pattern: ${pattern}` });
  }
}

export const adminController = new AdminController();
