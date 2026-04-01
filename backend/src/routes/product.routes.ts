import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
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
router.get("/products/:id", getProductById);
router.put(
  "/products/:id",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  upload.array("images", 5),
  updateProduct,
);
router.delete(
  "/products/:id",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  deleteProduct,
);

export default router;

// GET http://localhost:5000/api/products?page=2&limit=5&search=phone&minPrice=100&maxPrice=500&sort=price_desc
