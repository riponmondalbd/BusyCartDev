import { Router } from "express";

import {
  deleteUserByAdmin,
  getAllUsers,
  updateUserRoleAdmin,
} from "../controller/admin.controller";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize";

const router = Router();

router.get("/users", protect, authorize("ADMIN", "SUPER_ADMIN"), getAllUsers);
router.delete("/users/:id", protect, authorize("ADMIN", "SUPER_ADMIN"), deleteUserByAdmin);
router.put("/users/:id/role", protect, authorize("ADMIN", "SUPER_ADMIN"), updateUserRoleAdmin);

export default router;
