import { Router } from "express";
import { AppDataSource } from "../data-source.js";
import { User, UserRole, UserPlan, SubscriptionStatus } from "../entities/User.js";
import { asyncHandler, AppError } from "../middlewares/errorHandler.js";
import { authenticate, requireAdmin } from "../middlewares/auth.js";
import { cache } from "../services/redis.js";

const router: ReturnType<typeof Router> = Router();
const userRepository = () => AppDataSource.getRepository(User);

// All admin routes require authentication
router.use(authenticate);
router.use(requireAdmin);

// ==================== USER MANAGEMENT ====================

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: List all users (admin only)
 *     tags: [Admin]
 */
router.get(
  "/users",
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const plan = req.query.plan as string;
    const role = req.query.role as string;

    const skip = (page - 1) * limit;

    const queryBuilder = userRepository()
      .createQueryBuilder("user")
      .select([
        "user.id",
        "user.name",
        "user.username",
        "user.email",
        "user.role",
        "user.plan",
        "user.subscriptionStatus",
        "user.onboardingCompleted",
        "user.createdAt",
        "user.updatedAt",
      ]);

    // Search filter
    if (search) {
      queryBuilder.where(
        "(user.name ILIKE :search OR user.email ILIKE :search OR user.username ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    // Plan filter
    if (plan && Object.values(UserPlan).includes(plan as UserPlan)) {
      queryBuilder.andWhere("user.plan = :plan", { plan });
    }

    // Role filter
    if (role && Object.values(UserRole).includes(role as UserRole)) {
      queryBuilder.andWhere("user.role = :role", { role });
    }

    // Order and pagination
    queryBuilder
      .orderBy("user.createdAt", "DESC")
      .skip(skip)
      .take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    res.json({
      users,
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
 * /api/admin/users/stats:
 *   get:
 *     summary: Get user statistics (admin only)
 *     tags: [Admin]
 */
router.get(
  "/users/stats",
  asyncHandler(async (req, res) => {
    const totalUsers = await userRepository().count();

    const planCounts = await userRepository()
      .createQueryBuilder("user")
      .select("user.plan", "plan")
      .addSelect("COUNT(*)", "count")
      .groupBy("user.plan")
      .getRawMany();

    const roleCounts = await userRepository()
      .createQueryBuilder("user")
      .select("user.role", "role")
      .addSelect("COUNT(*)", "count")
      .groupBy("user.role")
      .getRawMany();

    // Users created this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newUsersThisMonth = await userRepository()
      .createQueryBuilder("user")
      .where("user.createdAt >= :startOfMonth", { startOfMonth })
      .getCount();

    res.json({
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
    });
  })
);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user details (admin only)
 *     tags: [Admin]
 */
router.get(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await userRepository().findOne({
      where: { id },
      select: [
        "id",
        "name",
        "username",
        "email",
        "role",
        "plan",
        "subscriptionStatus",
        "subscriptionStartedAt",
        "subscriptionEndsAt",
        "stripeCustomerId",
        "stripeSubscriptionId",
        "onboardingCompleted",
        "createdAt",
        "updatedAt",
      ],
    });

    if (!user) {
      throw new AppError("Usuario nao encontrado", 404);
    }

    res.json(user);
  })
);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   patch:
 *     summary: Update user (admin only)
 *     tags: [Admin]
 */
router.patch(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { plan, role, subscriptionStatus } = req.body;

    const user = await userRepository().findOne({ where: { id } });

    if (!user) {
      throw new AppError("Usuario nao encontrado", 404);
    }

    // Prevent admin from removing their own admin role
    if (req.user!.userId === id && role && role !== UserRole.ADMIN) {
      throw new AppError("Voce nao pode remover seu proprio papel de admin", 400);
    }

    // Update allowed fields
    if (plan && Object.values(UserPlan).includes(plan)) {
      user.plan = plan;
      // If manually setting plan, also update subscription status
      if (!subscriptionStatus) {
        user.subscriptionStatus = SubscriptionStatus.ACTIVE;
      }
    }

    if (role && Object.values(UserRole).includes(role)) {
      user.role = role;
    }

    if (subscriptionStatus && Object.values(SubscriptionStatus).includes(subscriptionStatus)) {
      user.subscriptionStatus = subscriptionStatus;
    }

    await userRepository().save(user);

    // Return updated user without password
    const updatedUser = await userRepository().findOne({
      where: { id },
      select: [
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
      ],
    });

    res.json(updatedUser);
  })
);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete user (admin only)
 *     tags: [Admin]
 */
router.delete(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (req.user!.userId === id) {
      throw new AppError("Voce nao pode excluir sua propria conta", 400);
    }

    const user = await userRepository().findOne({ where: { id } });

    if (!user) {
      throw new AppError("Usuario nao encontrado", 404);
    }

    await userRepository().remove(user);

    res.json({ message: "Usuario excluido com sucesso" });
  })
);

// ==================== CACHE MANAGEMENT ====================

/**
 * @swagger
 * /api/admin/cache/clear:
 *   post:
 *     summary: Clear all cache (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/cache/clear",
  asyncHandler(async (req, res) => {
    await cache.invalidatePattern("*");
    res.json({ message: "All cache cleared successfully" });
  })
);

/**
 * @swagger
 * /api/admin/cache/clear/:pattern:
 *   post:
 *     summary: Clear cache by pattern (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/cache/clear/:pattern",
  asyncHandler(async (req, res) => {
    const { pattern } = req.params;
    await cache.invalidatePattern(pattern);
    res.json({ message: `Cache cleared for pattern: ${pattern}` });
  })
);

export default router;
