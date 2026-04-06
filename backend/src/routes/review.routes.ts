import { Router } from "express";
import {
  createReview,
  deleteReview,
  getAllReviewsPublic,
  getProductReviews,
  updateReview,
} from "../controller/review.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.post("/create", protect, createReview);
router.put("/update/:reviewId", protect, updateReview);
router.delete("/delete/:reviewId", protect, deleteReview);

router.get("/product/:productId", getProductReviews);
router.get("/all", getAllReviewsPublic);

export default router;
