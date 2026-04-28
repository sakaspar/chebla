import { Router } from "express";
import { getAdminNotifications, getClientById, getDashboardStats, listClients, listOrders, updateOrderNotes, updateOrderStatus } from "../controllers/adminController";
import { requireAuth } from "../middleware/auth";
import { createService, deactivateService, patchService } from "../controllers/serviceController";

const router = Router();
router.use(requireAuth(["admin"]));

router.get("/orders", listOrders);
router.patch("/orders/:id/status", updateOrderStatus);
router.patch("/orders/:id/notes", updateOrderNotes);
router.get("/clients", listClients);
router.get("/clients/:id", getClientById);
router.post("/services", createService);
router.patch("/services/:id", patchService);
router.delete("/services/:id", deactivateService);
router.get("/notifications", getAdminNotifications);
router.get("/dashboard/stats", getDashboardStats);

export default router;
