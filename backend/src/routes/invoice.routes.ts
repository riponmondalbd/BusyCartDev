import { Router } from "express";
import { generateInvoice } from "../controller/invoice.controller";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize";

const router = Router();

router.get(
  "/generate/:orderId",
  protect,
  authorize("USER", "ADMIN", "SUPER_ADMIN"),
  generateInvoice,
);

export default router;
