import { Router, Request, Response } from "express";
import Stripe from "stripe";
import { stripeService } from "../services/stripe.js";

const router: ReturnType<typeof Router> = Router();

/**
 * @swagger
 * /api/webhooks/stripe:
 *   post:
 *     summary: Stripe webhook endpoint
 *     tags: [Webhooks]
 *     description: Handles Stripe webhook events for subscription management
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Invalid webhook signature
 */
router.post(
  "/stripe",
  // Note: This route needs raw body for signature verification
  // The raw body middleware is configured in index.ts
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("[Webhook] STRIPE_WEBHOOK_SECRET not configured");
      res.status(500).json({ error: "Webhook secret not configured" });
      return;
    }

    let event: Stripe.Event;

    try {
      const stripe = stripeService.getStripeInstance();
      // req.body should be raw buffer for webhook verification
      const rawBody = (req as any).rawBody || req.body;
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err: any) {
      console.error(`[Webhook] Signature verification failed: ${err.message}`);
      res.status(400).json({ error: `Webhook Error: ${err.message}` });
      return;
    }

    // Log the event
    console.log(`[Webhook] Received event: ${event.type} (${event.id})`);

    try {
      // Handle the event
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          await stripeService.handleCheckoutCompleted(session);
          break;
        }

        case "customer.subscription.created":
        case "customer.subscription.updated": {
          const subscription = event.data.object as Stripe.Subscription;
          await stripeService.handleSubscriptionUpdated(subscription);
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          await stripeService.handleSubscriptionDeleted(subscription);
          break;
        }

        case "invoice.paid": {
          const invoice = event.data.object as Stripe.Invoice;
          await stripeService.handleInvoicePaid(invoice);
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          await stripeService.handleInvoicePaymentFailed(invoice);
          break;
        }

        default:
          console.log(`[Webhook] Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (err: any) {
      console.error(`[Webhook] Error processing event: ${err.message}`);
      // Return 200 to prevent Stripe from retrying
      // Log the error for investigation
      res.json({ received: true, error: err.message });
    }
  }
);

export default router;
