import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from "../controllers/product";

const router = Router();

router.post("/", getProducts);
router.get("/:id", getProduct);
router.post("/create", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export { router };
