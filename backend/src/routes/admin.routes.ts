import { Router } from "express";

import { getAllAdmins, getAllUsers } from "../controller/admin.controller";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize";

const router = Router();

router.get("/users", protect, authorize("SUPER_ADMIN"), getAllUsers);
router.get("/admins", protect, authorize("SUPER_ADMIN"), getAllAdmins);

export default router;
