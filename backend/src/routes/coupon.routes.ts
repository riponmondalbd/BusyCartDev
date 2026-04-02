import { Router } from "express";
import { applyCoupon, createCoupon, removeCoupon } from "../controller/coupon.controller";
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

export default router;
