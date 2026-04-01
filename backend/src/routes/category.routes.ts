import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
} from "../controller/category.controller";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize";
import upload from "../middleware/upload";

const router = Router();

router.post(
  "/create",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  upload.single("image"),
  createCategory,
);
router.get("/all", getAllCategories);
router.put(
  "/update/:id",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  upload.single("image"),
  updateCategory,
);
router.delete(
  "/delete/:id",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  deleteCategory,
);

export default router;
