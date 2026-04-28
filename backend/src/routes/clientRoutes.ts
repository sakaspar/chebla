import { Router } from "express";
import { getMyNotifications, getMyOrder, getMyOrders, getProfile, patchProfile } from "../controllers/clientController";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth(["client"]));
router.get("/profile", getProfile);
router.patch("/profile", patchProfile);
router.get("/orders", getMyOrders);
router.get("/orders/:id", getMyOrder);
router.get("/notifications", getMyNotifications);

export default router;
