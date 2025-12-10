import { Router } from "express";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { authenticate, requireAdmin } from "../middlewares/auth.js";
import { cache } from "../services/redis.js";

const router: ReturnType<typeof Router> = Router();

// All admin routes require authentication
router.use(authenticate);
router.use(requireAdmin);

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
