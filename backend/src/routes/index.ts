import { Router } from "express";
import adminRoutes from "./admin.routes";
import authRoutes from "./auth.routes";
import googleAuthRoutes from "./googleAuth.routes";
import userRoutes from "./user.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/auth", googleAuthRoutes);
router.use("/user", userRoutes);
router.use("/admin", adminRoutes);

export default router;
