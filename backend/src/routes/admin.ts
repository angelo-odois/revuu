import { Router } from "express";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { authenticate, requireAdmin } from "../middlewares/auth.js";
import { adminController } from "../controllers/AdminController.js";

const router: ReturnType<typeof Router> = Router();

// All admin routes require authentication and admin role
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
router.get("/users", asyncHandler(adminController.getUsers.bind(adminController)));

/**
 * @swagger
 * /api/admin/users/stats:
 *   get:
 *     summary: Get user statistics (admin only)
 *     tags: [Admin]
 */
router.get("/users/stats", asyncHandler(adminController.getUserStats.bind(adminController)));

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user details (admin only)
 *     tags: [Admin]
 */
router.get("/users/:id", asyncHandler(adminController.getUserById.bind(adminController)));

/**
 * @swagger
 * /api/admin/users/{id}:
 *   patch:
 *     summary: Update user (admin only)
 *     tags: [Admin]
 */
router.patch("/users/:id", asyncHandler(adminController.updateUser.bind(adminController)));

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete user (admin only)
 *     tags: [Admin]
 */
router.delete("/users/:id", asyncHandler(adminController.deleteUser.bind(adminController)));

// ==================== CACHE MANAGEMENT ====================

/**
 * @swagger
 * /api/admin/cache/clear:
 *   post:
 *     summary: Clear all cache (admin only)
 *     tags: [Admin]
 */
router.post("/cache/clear", asyncHandler(adminController.clearAllCache.bind(adminController)));

/**
 * @swagger
 * /api/admin/cache/clear/:pattern:
 *   post:
 *     summary: Clear cache by pattern (admin only)
 *     tags: [Admin]
 */
router.post("/cache/clear/:pattern", asyncHandler(adminController.clearCacheByPattern.bind(adminController)));

export default router;
