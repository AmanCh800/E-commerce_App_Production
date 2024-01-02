import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import JWT from "jsonwebtoken";

export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, answer } = req.body;

    //Validations
    if (!name) {
      return res.send({ message: "Name is required" });
    }
    if (!email) {
      return res.send({ message: "Email is required" });
    }
    if (!password) {
      return res.send({ message: "Password is required" });
    }
    if (!phone) {
      return res.send({ message: "Phone is required" });
    }
    if (!address) {
      return res.send({ message: "Address is required" });
    }
    if (!answer) {
      return res.send({ message: "Answer is required" });
    }

    //Check user
    const existingUser = await userModel.findOne({ email });

    //Existing user
    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "Already registered, please login",
      });
    }

    //Register user
    const encryptPassword = await hashPassword(password);

    //Save user
    const user = await new userModel({
      name,
      email,
      phone,
      address,
      answer,
      password: encryptPassword,
    }).save();

    res.status(200).send({
      success: true,
      message: "User Register Successfully!",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(200).send({
      success: false,
      message: "Error in Registration",
      error,
    });
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(200).send({
        success: false,
        message: "Invalid email and password",
      });
    }

    //Check user
    const user = await userModel.findOne({ email });

    //Validate user
    if (!user) {
      return res.status(200).send({
        success: false,
        message: "Email is not registered",
      });
    }

    const match = await comparePassword(password, user.password);

    //Validate password
    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Invalid password",
      });
    }

    //Generate token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return res.status(200).send({
      success: true,
      message: "Login successfully",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(200).send({
      success: false,
      message: "Error in login",
      error,
    });
  }
};

//Forgot Password Controller

export const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;

    //validations
    if (!email) {
      return res.send({ error: "Email is required!" });
    }
    if (!answer) {
      return res.send({ error: "Answer is required!" });
    }
    if (!newPassword) {
      return res.send({ error: "New Password is required!" });
    }

    //Check email and password
    const user = await userModel.findOne({ email, answer });
    //Validate user
    if (!user) {
      return res.status(200).send({
        success: false,
        message: "Email or Answer is wrong!",
      });
    }

    const encryptPassword = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: encryptPassword });
    res.status(200).send({
      success: true,
      message: "Password reset successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(200).send({
      success: false,
      message: "Something went wrong!",
      error,
    });
  }
};

//Update user profile controller
export const updateUserProfileController = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    const user = await userModel.findById(req.user._id);
    if (password && password.length < 4) {
      return res.JSON({
        message: "Password is required and should be atleast 4 characters long",
      });
    }
    const encryptedPassword = password
      ? await hashPassword(password)
      : undefined;
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        email: email || user.email,
        password: encryptedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "User profile updated successfully",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Something went wrong while updating user profile!",
      error,
    });
  }
};

//Get orders controller
export const getOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name");
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong while fetching orders!",
      error,
    });
  }
};

//Get all orders controller
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: "-1" });
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong while fetching all orders!",
      error,
    });
  }
};

//Update order status controller
export const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const orders = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong while updating status of the orders!",
      error,
    });
  }
};

//Test controller

export const testController = (req, res) => {
  try {
    res.send("Protected routes");
  } catch (error) {
    console.log(error);
    return res.status(401).send({
      success: false,
      message: "Error in test controller",
      error,
    });
  }
};
