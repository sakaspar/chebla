import { Router } from "express";
import { getService, listServices } from "../controllers/serviceController";

const router = Router();
router.get("/", listServices);
router.get("/:id", getService);

export default router;
