import { Router } from "express";
import authRoutes from "./auth.routes";
import googleAuthRoutes from "./googleAuth.routes";
import userRoutes from "./user.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/auth", googleAuthRoutes);
router.use("/user", userRoutes);

export default router;
