import { Router } from "express";
import multer from "multer";
import { mkdirSync } from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import { addOrderMessage, createOrder, getOrderById } from "../controllers/orderController";
import { requireAuth } from "../middleware/auth";

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const orderId = req.body.orderId as string;
    const dir = path.join(process.cwd(), "uploads", orderId);
    mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });
const router = Router();

router.post("/", requireAuth(["client"]), (req, _res, next) => {
  req.body.orderId = uuid();
  next();
}, upload.array("attachments"), createOrder);
router.get("/:id", requireAuth(["client", "admin"]), getOrderById);
router.post("/:id/messages", requireAuth(["client", "admin"]), addOrderMessage);

export default router;
