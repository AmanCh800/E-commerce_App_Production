import express from "express";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";
import formidable from "express-formidable";
import {
  braintreePaymentController,
  braintreeTokenController,
  deleteProductController,
  listProductController,
  photoProductController,
  productCategoryController,
  productController,
  productCountController,
  productFiltersController,
  productListPageController,
  relatedProductController,
  searchProductController,
  singleProductController,
  updateProductController,
} from "../controllers/productController.js";

const router = express.Router();

//Create product POST route
router.post(
  "/create-product",
  requireSignIn,
  isAdmin,
  formidable(),
  productController
);

//List of all products GET route
router.get("/list-product", listProductController);

//List a single product GET route
router.get("/single-product/:slug", singleProductController);

//Show photo of a product GET route
router.get("/photo-product/:id", photoProductController);

//Delete a product DELETE route
router.delete(
  "/delete-product/:id",
  requireSignIn,
  isAdmin,
  deleteProductController
);

//Update product PUT route
router.put(
  "/update-product/:id",
  requireSignIn,
  isAdmin,
  formidable(),
  updateProductController
);

//Filter Products
router.post("/product-filters", productFiltersController);

//Product count
router.get("/product-count", productCountController);

//Product list per page
router.get("/product-list/:page", productListPageController);

//Search product
router.get("/product-search/:keyword", searchProductController);

//Related products
router.get("/product-related/:pid/:cid", relatedProductController);

//Products by category
router.get("/product-category/:slug", productCategoryController);

//Payment Routes

//Braintree token
router.get("/braintree/token", braintreeTokenController);

//Payments
router.post("/braintree/payment", requireSignIn, braintreePaymentController);

export default router;
