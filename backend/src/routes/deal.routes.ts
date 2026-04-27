import { Router } from "express";
import {
  clearDealOfDay,
  getCurrentDealOfDay,
  setDealOfDay,
} from "../controller/deal.controller";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import { dealOfDaySchema } from "../validations/deal.validation";

const router = Router();

router.get("/current", getCurrentDealOfDay);
router.put(
  "/current",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  validate(dealOfDaySchema),
  setDealOfDay,
);
router.delete(
  "/current",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  clearDealOfDay,
);

export default router;
