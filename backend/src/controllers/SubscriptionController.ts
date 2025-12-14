import { Request, Response } from "express";
import { subscriptionService } from "../services/SubscriptionService.js";

class SubscriptionController {
  async getPlans(_req: Request, res: Response): Promise<void> {
    const plans = subscriptionService.getAllPlans();
    res.json(plans);
  }

  async getCurrentSubscription(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const subscription = await subscriptionService.getCurrentSubscription(userId);
    res.json(subscription);
  }

  async checkLimit(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const result = await subscriptionService.checkLimit(userId);
    res.json(result);
  }

  async createCheckout(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const { plan, billingPeriod = "monthly" } = req.body;

    const url = await subscriptionService.createCheckoutSession(userId, plan, billingPeriod);
    res.json({ url });
  }

  async createPortal(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const url = await subscriptionService.createPortalSession(userId);
    res.json({ url });
  }

  async upgrade(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const { plan, billingPeriod = "monthly" } = req.body;

    const result = await subscriptionService.upgradeSubscription(userId, plan, billingPeriod);
    res.json(result);
  }

  async cancel(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const result = await subscriptionService.cancelSubscription(userId);
    res.json(result);
  }

  async getFeatures(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const features = await subscriptionService.getFeatures(userId);
    res.json(features);
  }
}

export const subscriptionController = new SubscriptionController();
