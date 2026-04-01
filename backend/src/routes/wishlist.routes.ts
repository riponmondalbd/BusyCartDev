import express from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controller/wishlist.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/add", protect, addToWishlist);
router.delete("/remove/:productId", protect, removeFromWishlist);
router.get("/all", protect, getWishlist);

export default router;
