import { Router } from "express";
import { login, logout, register } from "../controllers/authController";

const router = Router();
router.post("/register", register);
router.post("/login", (req, res) => login(req, res, false));
router.post("/admin/login", (req, res) => login(req, res, true));
router.post("/logout", logout);

export default router;
