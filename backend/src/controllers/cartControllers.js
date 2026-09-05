import mongoose from "mongoose";

import Customer from "../models/customers.js";
import Product from "../models/products.js";

// ==========================================
// GET CART
// ==========================================

export const getCart = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      user: req.user.userId,
    }).populate({
      path: "cart.product",
      select:
        "name images price unit stock status farm farmer discountPercentage",
      populate: {
        path: "farm",
        select: "name",
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      count: customer.cart.length,
      cart: customer.cart,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ==========================================
// ADD TO CART
// ==========================================

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "A valid product ID is required",
      });
    }

    const quantityNumber = Number(quantity);

    if (!Number.isInteger(quantityNumber) || quantityNumber < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a whole number greater than 0",
      });
    }

    const customer = await Customer.findOne({
      user: req.user.userId,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      status: "active",
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or currently unavailable",
      });
    }

    // Check if product has expired
    if (product.expiresAt <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "This product has expired",
      });
    }

    // Check available stock
    if (product.stock < quantityNumber) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity is greater than available stock",
      });
    }

    const existingItem = customer.cart.find(
      (item) => item.product.toString() === productId,
    );

    // If product already exists, increase quantity
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantityNumber;

      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: "Total cart quantity exceeds available stock",
        });
      }

      existingItem.quantity = newQuantity;
    } else {
      customer.cart.push({
        product: product._id,
        quantity: quantityNumber,
      });
    }

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      cart: customer.cart,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ==========================================
// UPDATE CART ITEM
// ==========================================

export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const quantityNumber = Number(quantity);

    if (!Number.isInteger(quantityNumber) || quantityNumber < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a whole number greater than 0",
      });
    }

    const customer = await Customer.findOne({
      user: req.user.userId,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found",
      });
    }

    const product = await Product.findById(productId);

    if (!product || product.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Product not found or currently unavailable",
      });
    }

    // Check if product has expired
    if (product.expiresAt <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "This product has expired",
      });
    }

    // Check available stock
    if (quantityNumber > product.stock) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity exceeds available stock",
      });
    }

    const cartItem = customer.cart.find(
      (item) => item.product.toString() === productId,
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Product is not in the cart",
      });
    }

    cartItem.quantity = quantityNumber;

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart: customer.cart,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ==========================================
// REMOVE FROM CART
// ==========================================

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const customer = await Customer.findOne({
      user: req.user.userId,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found",
      });
    }

    const cartItemIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (cartItemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product is not in the cart",
      });
    }

    customer.cart.splice(cartItemIndex, 1);

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from cart successfully",
      cart: customer.cart,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
