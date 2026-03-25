import express from "express";
import {
  deleteProfilePhoto,
  getProfile,
  updatePassword,
  updateProfilePhoto,
  updateUserProfile,
} from "../controller/user.controller";
import { protect } from "../middleware/auth.middleware";
import upload from "../middleware/upload";

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateUserProfile);
router.put("/password", protect, updatePassword);
router.put(
  "/profile/photo",
  protect,
  upload.single("image"),
  updateProfilePhoto,
);
router.delete("/profile/photo", protect, deleteProfilePhoto);

export default router;
