import { Router } from "express";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { authenticate } from "../middlewares/auth.js";
import { authController } from "../controllers/AuthController.js";
import rateLimit from "express-rate-limit";
import { ErrorCodes } from "../errors/codes.js";

const router: ReturnType<typeof Router> = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  handler: (_req, res) => {
    const error = ErrorCodes.SYSTEM_RATE_LIMITED;
    res.status(error.status).json({
      error: {
        code: error.code,
        message: "Muitas tentativas de login. Tente novamente em 15 minutos.",
        timestamp: new Date().toISOString(),
      },
    });
  },
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 */
router.post("/register", asyncHandler(authController.register.bind(authController)));

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 */
router.post("/login", loginLimiter, asyncHandler(authController.login.bind(authController)));

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 */
router.post("/refresh", asyncHandler(authController.refresh.bind(authController)));

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 */
router.post("/logout", authenticate, asyncHandler(authController.logout.bind(authController)));

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Auth]
 */
router.get("/me", authenticate, asyncHandler(authController.me.bind(authController)));

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Auth]
 */
router.post("/change-password", authenticate, asyncHandler(authController.changePassword.bind(authController)));

/**
 * @swagger
 * /api/auth/avatar:
 *   put:
 *     summary: Update user avatar
 *     tags: [Auth]
 */
router.put("/avatar", authenticate, asyncHandler(authController.updateAvatar.bind(authController)));

/**
 * @swagger
 * /api/auth/complete-onboarding:
 *   post:
 *     summary: Mark onboarding as completed
 *     tags: [Auth]
 */
router.post("/complete-onboarding", authenticate, asyncHandler(authController.completeOnboarding.bind(authController)));

/**
 * @swagger
 * /api/auth/delete-account:
 *   delete:
 *     summary: Permanently delete user account and all associated data
 *     tags: [Auth]
 */
router.delete("/delete-account", authenticate, asyncHandler(authController.deleteAccount.bind(authController)));

export default router;
