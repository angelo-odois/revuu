import { UserPlan, SubscriptionStatus } from "../entities/index.js";
import { subscriptionRepository } from "../repositories/SubscriptionRepository.js";
import { PLAN_LIMITS, getPlanLimits, canCreatePortfolio } from "../config/plans.js";
import { stripeService } from "./stripe.js";
import { AppError } from "../middlewares/errorHandler.js";

export interface PlanInfo {
  id: string;
  name: string;
  maxPortfolios: number;
  hasCustomDomain: boolean;
  hasAllTemplates: boolean;
  hasAdvancedAnalytics: boolean;
  hasTeamAnalytics: boolean;
  removeBranding: boolean;
  hasContactForm: boolean;
  hasPrioritySupport: boolean;
  hasDedicatedSupport: boolean;
  hasExportPdf: boolean;
  hasWhiteLabel: boolean;
  hasApiAccess: boolean;
  hasTraining: boolean;
}

export interface SubscriptionInfo {
  plan: UserPlan;
  status: SubscriptionStatus;
  startedAt?: Date;
  endsAt?: Date;
  limits: ReturnType<typeof getPlanLimits>;
  usage: {
    portfolios: number;
    maxPortfolios: number;
    canCreateMore: boolean;
  };
}

export interface CheckLimitResult {
  canCreate: boolean;
  current: number;
  max: number;
  plan: UserPlan;
  upgradeRequired: boolean;
}

export interface FeaturesInfo {
  plan: UserPlan;
  features: {
    customDomain: boolean;
    allTemplates: boolean;
    advancedAnalytics: boolean;
    teamAnalytics: boolean;
    removeBranding: boolean;
    contactForm: boolean;
    prioritySupport: boolean;
    dedicatedSupport: boolean;
    exportPdf: boolean;
    whiteLabel: boolean;
    apiAccess: boolean;
    training: boolean;
  };
}

class SubscriptionService {
  getAllPlans(): PlanInfo[] {
    return Object.entries(PLAN_LIMITS).map(([key, limits]) => ({
      id: key,
      name: key === "free" ? "Grátis" : key === "pro" ? "Pro" : "Business",
      ...limits,
    }));
  }

  async getCurrentSubscription(userId: string): Promise<SubscriptionInfo> {
    const user = await subscriptionRepository.findUserByIdWithSelect(userId, [
      "id",
      "plan",
      "subscriptionStatus",
      "subscriptionStartedAt",
      "subscriptionEndsAt",
    ]);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const portfolioCount = await subscriptionRepository.countUserPortfolios(userId);
    const limits = getPlanLimits(user.plan);

    return {
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
    };
  }

  async checkLimit(userId: string): Promise<CheckLimitResult> {
    const user = await subscriptionRepository.findUserByIdWithSelect(userId, ["id", "plan"]);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const portfolioCount = await subscriptionRepository.countUserPortfolios(userId);
    const canCreate = canCreatePortfolio(user.plan, portfolioCount);
    const limits = getPlanLimits(user.plan);

    return {
      canCreate,
      current: portfolioCount,
      max: limits.maxPortfolios,
      plan: user.plan,
      upgradeRequired: !canCreate,
    };
  }

  async createCheckoutSession(
    userId: string,
    plan: "pro" | "business",
    billingPeriod: "monthly" | "yearly"
  ): Promise<string> {
    if (!["pro", "business"].includes(plan)) {
      throw new AppError("Plan must be 'pro' or 'business'", 400);
    }

    if (!["monthly", "yearly"].includes(billingPeriod)) {
      throw new AppError("Billing period must be 'monthly' or 'yearly'", 400);
    }

    const user = await subscriptionRepository.findUserById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.plan !== UserPlan.FREE && user.subscriptionStatus === SubscriptionStatus.ACTIVE) {
      throw new AppError("You already have an active subscription. Use the portal to manage it.", 400);
    }

    return stripeService.createCheckoutSession(user, plan, billingPeriod);
  }

  async createPortalSession(userId: string): Promise<string> {
    const user = await subscriptionRepository.findUserById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!user.stripeCustomerId) {
      throw new AppError("No subscription found. Please subscribe first.", 400);
    }

    return stripeService.createPortalSession(user);
  }

  async upgradeSubscription(
    userId: string,
    plan: "pro" | "business",
    billingPeriod: "monthly" | "yearly"
  ): Promise<{ url: string; portal?: boolean }> {
    if (!["pro", "business"].includes(plan)) {
      throw new AppError("Plan must be 'pro' or 'business'", 400);
    }

    const user = await subscriptionRepository.findUserById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.stripeSubscriptionId) {
      const portalUrl = await stripeService.createPortalSession(user);
      return { url: portalUrl, portal: true };
    }

    const checkoutUrl = await stripeService.createCheckoutSession(user, plan, billingPeriod);
    return { url: checkoutUrl };
  }

  async cancelSubscription(userId: string): Promise<{ message: string; endsAt?: Date }> {
    const user = await subscriptionRepository.findUserById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.plan === UserPlan.FREE) {
      throw new AppError("You don't have an active subscription to cancel", 400);
    }

    if (user.stripeSubscriptionId) {
      try {
        await stripeService.cancelSubscription(user);
      } catch (error: any) {
        console.error("[Subscription] Failed to cancel Stripe subscription:", error.message);
      }
    }

    user.subscriptionStatus = SubscriptionStatus.CANCELED;
    await subscriptionRepository.saveUser(user);

    return {
      message: "Subscription canceled. You will continue to have access until the end of your billing period.",
      endsAt: user.subscriptionEndsAt,
    };
  }

  async getFeatures(userId: string): Promise<FeaturesInfo> {
    const user = await subscriptionRepository.findUserByIdWithSelect(userId, ["id", "plan"]);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const limits = getPlanLimits(user.plan);

    return {
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
    };
  }
}

export const subscriptionService = new SubscriptionService();
