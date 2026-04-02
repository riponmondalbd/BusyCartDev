import { Router } from "express";
import { refundOrder } from "../controller/refund.controller";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize";

const router = Router();

router.post("/", protect, authorize("ADMIN", "SUPER_ADMIN"), refundOrder);

export default router;
