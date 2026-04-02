import { Router } from "express";
import adminRoutes from "./admin.routes";
import authRoutes from "./auth.routes";
import cartRoutes from "./cart.routes";
import categoryRoutes from "./category.routes";
import couponRoutes from "./coupon.routes";
import googleAuthRoutes from "./googleAuth.routes";
import orderRoutes from "./order.routes";
import paymentRoutes from "./payment.routes";
import productRoutes from "./product.routes";
import refreshTokenRoutes from "./refresh.router";
import refundRoutes from "./refund.router";
import superAdminRoutes from "./super.admin.routes";
import userRoutes from "./user.routes";
import wishlistRoutes from "./wishlist.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/auth", googleAuthRoutes);
router.use("/user", userRoutes);
router.use("/super/admin", superAdminRoutes);
router.use("/admin", adminRoutes);
router.use("/refresh", refreshTokenRoutes);
router.use("/product", productRoutes);
router.use("/category", categoryRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/cart", cartRoutes);
router.use("/order", orderRoutes);
router.use("/payment", paymentRoutes);
router.use("/coupon", couponRoutes);
router.use("/refund", refundRoutes);

export default router;
