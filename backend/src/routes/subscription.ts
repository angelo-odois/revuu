import { Router } from "express";
import { AppDataSource } from "../data-source.js";
import { User, UserPlan, SubscriptionStatus, Page } from "../entities/index.js";
import { asyncHandler, AppError } from "../middlewares/errorHandler.js";
import { authenticate } from "../middlewares/auth.js";
import { PLAN_LIMITS, getPlanLimits, canCreatePortfolio } from "../config/plans.js";
import { stripeService } from "../services/stripe.js";

const router: ReturnType<typeof Router> = Router();
const userRepository = () => AppDataSource.getRepository(User);
const pageRepository = () => AppDataSource.getRepository(Page);

/**
 * @swagger
 * /api/subscription/plans:
 *   get:
 *     summary: Get all available plans with their features
 *     tags: [Subscription]
 */
router.get(
  "/plans",
  asyncHandler(async (_req, res) => {
    const plans = Object.entries(PLAN_LIMITS).map(([key, limits]) => ({
      id: key,
      name: key === "free" ? "Grátis" : key === "pro" ? "Pro" : "Business",
      ...limits,
    }));
    res.json(plans);
  })
);

/**
 * @swagger
 * /api/subscription/current:
 *   get:
 *     summary: Get current user's subscription info
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/current",
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;

    const user = await userRepository().findOne({
      where: { id: userId },
      select: [
        "id",
        "plan",
        "subscriptionStatus",
        "subscriptionStartedAt",
        "subscriptionEndsAt",
      ],
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Get current usage
    const portfolioCount = await pageRepository().count({
      where: { createdBy: { id: userId } },
    });

    const limits = getPlanLimits(user.plan);

    res.json({
      plan: user.plan,
      status: user.subscriptionStatus,
      startedAt: user.subscriptionStartedAt,
      endsAt: user.subscriptionEndsAt,
      limits,
      usage: {
        portfolios: portfolioCount,
        maxPortfolios: limits.maxPortfolios,
        canCreateMore: canCreatePortfolio(user.plan, portfolioCount),
      },
    });
  })
);

/**
 * @swagger
 * /api/subscription/check-limit:
 *   get:
 *     summary: Check if user can create more portfolios
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/check-limit",
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;

    const user = await userRepository().findOne({
      where: { id: userId },
      select: ["id", "plan"],
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const portfolioCount = await pageRepository().count({
      where: { createdBy: { id: userId } },
    });

    const canCreate = canCreatePortfolio(user.plan, portfolioCount);
    const limits = getPlanLimits(user.plan);

    res.json({
      canCreate,
      current: portfolioCount,
      max: limits.maxPortfolios,
      plan: user.plan,
      upgradeRequired: !canCreate,
    });
  })
);

/**
 * @swagger
 * /api/subscription/checkout:
 *   post:
 *     summary: Create a Stripe checkout session for subscription
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plan:
 *                 type: string
 *                 enum: [pro, business]
 *               billingPeriod:
 *                 type: string
 *                 enum: [monthly, yearly]
 *     responses:
 *       200:
 *         description: Checkout session URL
 */
router.post(
  "/checkout",
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const { plan, billingPeriod = "monthly" } = req.body;

    if (!plan || !["pro", "business"].includes(plan)) {
      throw new AppError("Plan must be 'pro' or 'business'", 400);
    }

    if (!["monthly", "yearly"].includes(billingPeriod)) {
      throw new AppError("Billing period must be 'monthly' or 'yearly'", 400);
    }

    const user = await userRepository().findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Check if user already has a paid subscription
    if (user.plan !== UserPlan.FREE && user.subscriptionStatus === SubscriptionStatus.ACTIVE) {
      throw new AppError("You already have an active subscription. Use the portal to manage it.", 400);
    }

    const checkoutUrl = await stripeService.createCheckoutSession(
      user,
      plan as "pro" | "business",
      billingPeriod as "monthly" | "yearly"
    );

    res.json({ url: checkoutUrl });
  })
);

/**
 * @swagger
 * /api/subscription/portal:
 *   post:
 *     summary: Create a Stripe customer portal session
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Portal session URL
 */
router.post(
  "/portal",
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;

    const user = await userRepository().findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!user.stripeCustomerId) {
      throw new AppError("No subscription found. Please subscribe first.", 400);
    }

    const portalUrl = await stripeService.createPortalSession(user);

    res.json({ url: portalUrl });
  })
);

/**
 * @swagger
 * /api/subscription/upgrade:
 *   post:
 *     summary: Upgrade user's plan (redirects to Stripe checkout)
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/upgrade",
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const { plan, billingPeriod = "monthly" } = req.body;

    if (!plan || !["pro", "business"].includes(plan)) {
      throw new AppError("Plan must be 'pro' or 'business'", 400);
    }

    const user = await userRepository().findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // If user already has Stripe subscription, redirect to portal
    if (user.stripeSubscriptionId) {
      const portalUrl = await stripeService.createPortalSession(user);
      res.json({ url: portalUrl, portal: true });
      return;
    }

    // Otherwise create checkout session
    const checkoutUrl = await stripeService.createCheckoutSession(
      user,
      plan as "pro" | "business",
      billingPeriod as "monthly" | "yearly"
    );

    res.json({ url: checkoutUrl });
  })
);

/**
 * @swagger
 * /api/subscription/cancel:
 *   post:
 *     summary: Cancel user's subscription
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/cancel",
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;

    const user = await userRepository().findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.plan === UserPlan.FREE) {
      throw new AppError("You don't have an active subscription to cancel", 400);
    }

    // If user has Stripe subscription, cancel it through Stripe
    if (user.stripeSubscriptionId) {
      try {
        await stripeService.cancelSubscription(user);
      } catch (error: any) {
        console.error("[Subscription] Failed to cancel Stripe subscription:", error.message);
        // Continue anyway to update local status
      }
    }

    // Mark as canceled but keep active until end date
    user.subscriptionStatus = SubscriptionStatus.CANCELED;
    await userRepository().save(user);

    res.json({
      message: "Subscription canceled. You will continue to have access until the end of your billing period.",
      endsAt: user.subscriptionEndsAt,
    });
  })
);

/**
 * @swagger
 * /api/subscription/features:
 *   get:
 *     summary: Get features available for the current user's plan
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/features",
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;

    const user = await userRepository().findOne({
      where: { id: userId },
      select: ["id", "plan"],
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const limits = getPlanLimits(user.plan);

    res.json({
      plan: user.plan,
      features: {
        customDomain: limits.hasCustomDomain,
        allTemplates: limits.hasAllTemplates,
        advancedAnalytics: limits.hasAdvancedAnalytics,
        teamAnalytics: limits.hasTeamAnalytics,
        removeBranding: limits.removeBranding,
        contactForm: limits.hasContactForm,
        prioritySupport: limits.hasPrioritySupport,
        dedicatedSupport: limits.hasDedicatedSupport,
        exportPdf: limits.hasExportPdf,
        whiteLabel: limits.hasWhiteLabel,
        apiAccess: limits.hasApiAccess,
        training: limits.hasTraining,
      },
    });
  })
);

export default router;
