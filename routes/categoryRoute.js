import express from "express";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";
import {
  categoryController,
  deleteCategoryController,
  listCategoryController,
  singleCategoryController,
  updateCategoryController,
} from "../controllers/categoryController.js";

const router = express.Router();

//Create category POST route
router.post("/create-category", requireSignIn, isAdmin, categoryController);

//Update category PUT route
router.put(
  "/update-category/:id",
  requireSignIn,
  isAdmin,
  updateCategoryController
);

//List categories GET route
router.get("/list-category", listCategoryController);

//Single category GET route
router.get("/single-category/:slug", singleCategoryController);

//DELETE category route
router.delete(
  "/delete-category/:id",
  requireSignIn,
  isAdmin,
  deleteCategoryController
);

export default router;
