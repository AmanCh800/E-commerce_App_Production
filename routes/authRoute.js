import express from "express";
import {
  registerController,
  loginController,
  testController,
  forgotPasswordController,
  updateUserProfileController,
  getOrdersController,
  getAllOrdersController,
  orderStatusController,
} from "../controllers/authController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

//Router objects
const router = express.Router();

//Register method POST
router.post("/register", registerController);

//Login method POST
router.post("/login", loginController);

//Forgot Password method POST
router.post("/forgot-password", forgotPasswordController);

//Test route
router.get("/test", requireSignIn, isAdmin, testController);

//Protected Private Routes - User
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});

//Protected Private Routes - Admin
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

//Update User Profile
router.put("/profile", requireSignIn, updateUserProfileController);

//Get Orders
router.get("/orders", requireSignIn, getOrdersController);

//Get All Orders
router.get("/all-orders", requireSignIn, isAdmin, getAllOrdersController);

//Update Orders Status
router.put(
  "/order-status/:orderId",
  requireSignIn,
  isAdmin,
  orderStatusController
);

export default router;
