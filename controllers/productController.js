import fs from "fs";
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";
import braintree from "braintree";
import { log } from "console";
import orderModel from "../models/orderModel.js";
import dotenv from "dotenv";

dotenv.config();

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

//Create product controller
export const productController = async (req, res) => {
  try {
    const { name, description, price, quantity, category } = req.fields;
    const { photo } = req.files;

    //Validations
    switch (true) {
      case !name:
        return res.status(400).send({ message: "Name is required!" });
      case !description:
        return res.status(400).send({ message: "Description is required!" });
      case !price:
        return res.status(400).send({ message: "Price is required!" });
      case !quantity:
        return res.status(400).send({ message: "Quantity is required!" });
      case !category:
        return res.status(400).send({ message: "Category is required!" });
      case photo && photo.size > 1000000:
        return res.status(400).send({
          message: "Photo is required and photo size should be less than 1MB",
        });
    }

    const product = new productModel({ ...req.fields, slug: slugify(name) });
    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }

    await product.save();
    res.status(200).send({
      success: true,
      message: "Product successfully created!",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in creating product!",
      error,
    });
  }
};

//List all products controller
export const listProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      message: "Successfully listed all products!",
      total: products.length,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in listing all products!",
      error,
    });
  }
};

//List single product controller
export const singleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .populate("category")
      .select("-photo");
    res.status(200).send({
      success: true,
      message: "Successfully listed single product!",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while fetching single product details!",
      error,
    });
  }
};

//Show photo of a product controller
export const photoProductController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id).select("photo");
    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      res.status(200).send(product.photo.data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting product photo!",
      error,
    });
  }
};

//Delete product controller
export const deleteProductController = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.id).select("-photo");
    res.status(200).send({
      success: true,
      message: "Successfully deleted product!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in deleting product!",
      error,
    });
  }
};

//Update product controller
export const updateProductController = async (req, res) => {
  try {
    const { name, description, price, quantity, category } = req.fields;
    const { photo } = req.files;

    //Validations
    switch (true) {
      case !name:
        return res.status(400).send({ message: "Name is required!" });
      case !description:
        return res.status(400).send({ message: "Description is required!" });
      case !price:
        return res.status(400).send({ message: "Price is required!" });
      case !quantity:
        return res.status(400).send({ message: "Quantity is required!" });
      case !category:
        return res.status(400).send({ message: "Category is required!" });
      case photo && photo.size > 1000000:
        return res.status(400).send({
          message: "Photo is required and photo size should be less than 1MB",
        });
    }

    const product = await productModel
      .findByIdAndUpdate(
        req.params.id,
        { ...req.fields, slug: slugify(name) },
        { new: true }
      )
      .populate("category");
    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }

    await product.save();
    res.status(200).send({
      success: true,
      message: "Product successfully updated!",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in updating product!",
      error,
    });
  }
};

//Filters Product Controllers
export const productFiltersController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await productModel.find(args);
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in filtering the products!",
      error,
    });
  }
};

//Product count controller
export const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Something went wrong in counting the products!",
      error,
    });
  }
};

//Product list per page controller
export const productListPageController = async (req, res) => {
  try {
    const perPage = 3;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .sort("_id")
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage);
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Something went wrong while listing product page!",
      error,
    });
  }
};

//Search product controller
export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const results = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo");
    res.json(results);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Something went wrong while searching the product!",
      error,
    });
  }
};

//Related product controller
export const relatedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .select("-photo")
      .limit(2)
      .populate("category");
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Something went wrong while getting related products!",
      error,
    });
  }
};

//Get products by category controller
export const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    const products = await productModel.find({ category }).populate("category");
    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Something went wrong while getting products by category!",
      error,
    });
  }
};

//Payment Gateway API

//Braintree token controller
export const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

//Braintree payment controller
export const braintreePaymentController = async (req, res) => {
  try {
    const { cart, nonce } = req.body;
    let total = 0;
    cart.map((i) => {
      total += i.price;
    });
    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          const order = new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};
