import { Router } from "express";
import { applyCoupon, createCoupon, removeCoupon, getAllCoupons, deleteCoupon } from "../controller/coupon.controller";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize";

const router = Router();

router.post(
  "/create",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  createCoupon,
);
router.post("/apply", protect, applyCoupon);
router.delete("/remove", protect, removeCoupon);

router.get("/all", protect, authorize("ADMIN", "SUPER_ADMIN"), getAllCoupons);
router.delete("/delete/:id", protect, authorize("ADMIN", "SUPER_ADMIN"), deleteCoupon);

export default router;
