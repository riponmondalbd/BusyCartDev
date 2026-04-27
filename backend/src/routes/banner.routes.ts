import { Router } from "express";
import {
  createBanner,
  deleteBanner,
  getActiveBanners,
  getAdminBanners,
  updateBanner,
} from "../controller/banner.controller";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize";
import upload from "../middleware/upload";

const router = Router();

// Public route for homepage
router.get("/active", getActiveBanners);

// Admin routes
router.get(
  "/admin/all",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  getAdminBanners
);

router.post(
  "/create",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  upload.single("image"),
  createBanner
);

router.put(
  "/update/:id",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  upload.single("image"),
  updateBanner
);

router.delete(
  "/delete/:id",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  deleteBanner
);

export default router;
