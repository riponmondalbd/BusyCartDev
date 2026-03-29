import { Router } from "express";

import {
  deleteUserByAdmin,
  getAllUsers,
  updateUserRoleAdmin,
} from "../controller/admin.controller";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize";

const router = Router();

router.get("/users", protect, authorize("ADMIN"), getAllUsers);
router.delete("/users/:id", protect, authorize("ADMIN"), deleteUserByAdmin);
router.put("/users/:id/role", protect, authorize("ADMIN"), updateUserRoleAdmin);

export default router;
