import { Router } from "express";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { authenticate, requireSupport } from "../middlewares/auth.js";
import { ticketController } from "../controllers/TicketController.js";

const router: ReturnType<typeof Router> = Router();

// All support routes require authentication
router.use(authenticate);

// ==================== USER TICKET ROUTES ====================

/**
 * @swagger
 * /api/support/tickets:
 *   get:
 *     summary: Get user's tickets
 *     tags: [Support]
 */
router.get("/tickets", asyncHandler(ticketController.getUserTickets.bind(ticketController)));

/**
 * @swagger
 * /api/support/tickets:
 *   post:
 *     summary: Create a new ticket
 *     tags: [Support]
 */
router.post("/tickets", asyncHandler(ticketController.createTicket.bind(ticketController)));

/**
 * @swagger
 * /api/support/tickets/:id:
 *   get:
 *     summary: Get ticket details
 *     tags: [Support]
 */
router.get("/tickets/:id", asyncHandler(ticketController.getTicketById.bind(ticketController)));

/**
 * @swagger
 * /api/support/tickets/:id/messages:
 *   post:
 *     summary: Add message to ticket
 *     tags: [Support]
 */
router.post("/tickets/:id/messages", asyncHandler(ticketController.addMessage.bind(ticketController)));

/**
 * @swagger
 * /api/support/tickets/:id/close:
 *   post:
 *     summary: Close ticket (user can close their own tickets)
 *     tags: [Support]
 */
router.post("/tickets/:id/close", asyncHandler(ticketController.closeTicket.bind(ticketController)));

// ==================== ADMIN TICKET ROUTES ====================

/**
 * @swagger
 * /api/support/admin/tickets:
 *   get:
 *     summary: Get all tickets (admin only)
 *     tags: [Support]
 */
router.get("/admin/tickets", requireSupport, asyncHandler(ticketController.getAdminTickets.bind(ticketController)));

/**
 * @swagger
 * /api/support/admin/tickets/stats:
 *   get:
 *     summary: Get ticket statistics (admin only)
 *     tags: [Support]
 */
router.get("/admin/tickets/stats", requireSupport, asyncHandler(ticketController.getStats.bind(ticketController)));

/**
 * @swagger
 * /api/support/admin/tickets/:id:
 *   patch:
 *     summary: Update ticket (admin only)
 *     tags: [Support]
 */
router.patch("/admin/tickets/:id", requireSupport, asyncHandler(ticketController.updateTicket.bind(ticketController)));

/**
 * @swagger
 * /api/support/admin/tickets/:id/assign:
 *   post:
 *     summary: Assign ticket to self (admin only)
 *     tags: [Support]
 */
router.post("/admin/tickets/:id/assign", requireSupport, asyncHandler(ticketController.assignTicketToSelf.bind(ticketController)));

export default router;
