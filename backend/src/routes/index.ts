import { Router } from "express";
import adminRoutes from "./admin.routes";
import authRoutes from "./auth.routes";
import googleAuthRoutes from "./googleAuth.routes";
import refreshTokenRoutes from "./refresh.router";
import superAdminRoutes from "./super.admin.routes";
import userRoutes from "./user.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/auth", googleAuthRoutes);
router.use("/user", userRoutes);
router.use("/super/admin", superAdminRoutes);
router.use("/admin", adminRoutes);
router.use("/refresh", refreshTokenRoutes);

export default router;
