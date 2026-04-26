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
import { validate } from "../middleware/validate";
import {
  createProductSchema,
  updateProductSchema,
} from "../validations/product.validation";

const router = Router();

router.post(
  "/create",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  upload.array("images", 5),
  validate(createProductSchema),
  createProduct,
);
router.get("/products", getAllProducts);
router.get("/products/:id", getProductById);
router.put(
  "/products/:id",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  upload.array("images", 5),
  validate(updateProductSchema),
  updateProduct,
);
router.delete(
  "/products/:id",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  deleteProduct,
);

export default router;
