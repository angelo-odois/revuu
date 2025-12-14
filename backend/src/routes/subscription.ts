import { Router } from "express";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { authenticate } from "../middlewares/auth.js";
import { subscriptionController } from "../controllers/SubscriptionController.js";

const router: ReturnType<typeof Router> = Router();

/**
 * @swagger
 * /api/subscription/plans:
 *   get:
 *     summary: Get all available plans with their features
 *     tags: [Subscription]
 */
router.get("/plans", asyncHandler(subscriptionController.getPlans.bind(subscriptionController)));

/**
 * @swagger
 * /api/subscription/current:
 *   get:
 *     summary: Get current user's subscription info
 *     tags: [Subscription]
 */
router.get("/current", authenticate, asyncHandler(subscriptionController.getCurrentSubscription.bind(subscriptionController)));

/**
 * @swagger
 * /api/subscription/check-limit:
 *   get:
 *     summary: Check if user can create more portfolios
 *     tags: [Subscription]
 */
router.get("/check-limit", authenticate, asyncHandler(subscriptionController.checkLimit.bind(subscriptionController)));

/**
 * @swagger
 * /api/subscription/checkout:
 *   post:
 *     summary: Create a Stripe checkout session for subscription
 *     tags: [Subscription]
 */
router.post("/checkout", authenticate, asyncHandler(subscriptionController.createCheckout.bind(subscriptionController)));

/**
 * @swagger
 * /api/subscription/portal:
 *   post:
 *     summary: Create a Stripe customer portal session
 *     tags: [Subscription]
 */
router.post("/portal", authenticate, asyncHandler(subscriptionController.createPortal.bind(subscriptionController)));

/**
 * @swagger
 * /api/subscription/upgrade:
 *   post:
 *     summary: Upgrade user's plan (redirects to Stripe checkout)
 *     tags: [Subscription]
 */
router.post("/upgrade", authenticate, asyncHandler(subscriptionController.upgrade.bind(subscriptionController)));

/**
 * @swagger
 * /api/subscription/cancel:
 *   post:
 *     summary: Cancel user's subscription
 *     tags: [Subscription]
 */
router.post("/cancel", authenticate, asyncHandler(subscriptionController.cancel.bind(subscriptionController)));

/**
 * @swagger
 * /api/subscription/features:
 *   get:
 *     summary: Get features available for the current user's plan
 *     tags: [Subscription]
 */
router.get("/features", authenticate, asyncHandler(subscriptionController.getFeatures.bind(subscriptionController)));

export default router;
