import { Router } from "express";
import {
  getAllRefunds,
  getMyRefunds,
  refundOrder,
  requestRefund,
  updateRefundStatus,
} from "../controller/refund.controller";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize";

const router = Router();

router.post("/", protect, authorize("ADMIN", "SUPER_ADMIN"), refundOrder);
router.get(
  "/get-all-refunds",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  getAllRefunds,
);
router.get("/my-refunds", protect, getMyRefunds);
router.post("/request-refund", protect, requestRefund);
router.put(
  "/update-status/:id",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  updateRefundStatus,
);

export default router;
