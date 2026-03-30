import { Router } from "express";
import {
  createProduct,
  getAllProducts,
} from "../controller/product.controller";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize";
import upload from "../middleware/upload";

const router = Router();

router.post(
  "/create",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  upload.array("images", 5),
  createProduct,
);
router.get("/products", getAllProducts);

export default router;
