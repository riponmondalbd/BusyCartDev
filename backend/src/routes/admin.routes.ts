import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize";

const router = Router();

router.get("/users", protect, authorize("ADMIN"), getAllUsers);

export default router;
