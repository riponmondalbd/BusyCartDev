import { Router } from "express";
import {
  createOrder,
  getAllOrders,
  getMyOrders,
  updateOrderStatus,
  trackOrder,
} from "../controller/order.controller";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize";

const router = Router();

router.post("/create", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/all", protect, authorize("ADMIN", "SUPER_ADMIN"), getAllOrders);
router.put(
  "/update-status/:id",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  updateOrderStatus,
);
router.get("/track/:id", trackOrder);
export default router;
