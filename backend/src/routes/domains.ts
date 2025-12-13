import { Router } from "express";
import { randomBytes } from "crypto";
import { AppDataSource } from "../data-source.js";
import { CustomDomain, DomainStatus, UserPlan } from "../entities/index.js";
import { asyncHandler, AppError } from "../middlewares/errorHandler.js";
import { authenticate } from "../middlewares/auth.js";

const router: ReturnType<typeof Router> = Router();
const domainRepository = () => AppDataSource.getRepository(CustomDomain);

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/domains:
 *   get:
 *     summary: Get current user's custom domains
 *     tags: [Domains]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;

    const domains = await domainRepository().find({
      where: { userId },
      order: { createdAt: "DESC" },
    });

    res.json(domains);
  })
);

/**
 * @swagger
 * /api/domains:
 *   post:
 *     summary: Add a new custom domain
 *     tags: [Domains]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const userPlan = req.user!.plan;
    const { domain } = req.body;

    // Check if user has Pro or Business plan (required for custom domains)
    if (userPlan !== UserPlan.PRO && userPlan !== UserPlan.BUSINESS) {
      throw new AppError("Custom domains require a Pro or Business plan", 403);
    }

    if (!domain) {
      throw new AppError("Domain is required", 400);
    }

    // Validate domain format
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      throw new AppError("Invalid domain format", 400);
    }

    // Check if domain already exists
    const existing = await domainRepository().findOne({
      where: { domain: domain.toLowerCase() },
    });

    if (existing) {
      throw new AppError("This domain is already registered", 400);
    }

    // Generate verification token
    const verificationToken = randomBytes(32).toString("hex");

    const customDomain = domainRepository().create({
      userId,
      domain: domain.toLowerCase(),
      status: DomainStatus.PENDING,
      verificationToken,
    });

    await domainRepository().save(customDomain);

    res.status(201).json(customDomain);
  })
);

/**
 * @swagger
 * /api/domains/{id}/verify:
 *   post:
 *     summary: Verify domain DNS configuration
 *     tags: [Domains]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/:id/verify",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user!.userId;

    const domain = await domainRepository().findOne({
      where: { id, userId },
    });

    if (!domain) {
      throw new AppError("Domain not found", 404);
    }

    // TODO: Implement actual DNS verification
    // For now, just mark as active after verification attempt
    // In production, you would:
    // 1. Check DNS TXT record for verification token
    // 2. Check CNAME or A record pointing to your server

    // Simulate verification (in production, check DNS records)
    domain.status = DomainStatus.ACTIVE;
    domain.verifiedAt = new Date();
    domain.errorMessage = undefined;

    await domainRepository().save(domain);

    res.json(domain);
  })
);

/**
 * @swagger
 * /api/domains/{id}:
 *   delete:
 *     summary: Remove a custom domain
 *     tags: [Domains]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user!.userId;

    const domain = await domainRepository().findOne({
      where: { id, userId },
    });

    if (!domain) {
      throw new AppError("Domain not found", 404);
    }

    await domainRepository().remove(domain);

    res.json({ message: "Domain removed successfully" });
  })
);

export default router;
