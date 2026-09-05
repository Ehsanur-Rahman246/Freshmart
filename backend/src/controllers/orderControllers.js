import mongoose from "mongoose";
import Order from "../models/orders.js";
import Customer from "../models/customers.js";
import Product from "../models/products.js";
import Farmer from "../models/farmers.js";
import Farm from "../models/farms.js";
import Zone from "../models/zones.js";

// ==========================================
// CREATE ORDER
// ==========================================

export const createOrder = async (req, res) => {
  try {
    const { addressId, paymentMethod } = req.body;

    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: "Delivery address is required",
      });
    }

    if (!["cashOnDelivery", "online"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    const customer = await Customer.findOne({
      user: req.user.userId,
    }).populate("cart.product");

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found",
      });
    }

    if (customer.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    const selectedAddress = customer.addresses.id(addressId);

    if (!selectedAddress) {
      return res.status(404).json({
        success: false,
        message: "Delivery address not found",
      });
    }

    // Get destination zone using district
    const destinationZone = await Zone.findOne({
      districts: selectedAddress.district,
    });

    if (!destinationZone) {
      return res.status(400).json({
        success: false,
        message: "Delivery zone not found for this district",
      });
    }

    // Group cart items by farm
    const farmOrders = new Map();

    for (const cartItem of customer.cart) {
      const product = cartItem.product;

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "One or more products in the cart no longer exist",
        });
      }

      // Validate product status
      if (product.status !== "active") {
        return res.status(400).json({
          success: false,
          message: `${product.name} is currently unavailable`,
        });
      }

      // Validate expiration
      if (product.expiresAt && product.expiresAt <= new Date()) {
        return res.status(400).json({
          success: false,
          message: `${product.name} has expired`,
        });
      }

      // Validate stock
      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }

      const farmId = product.farm.toString();

      if (!farmOrders.has(farmId)) {
        farmOrders.set(farmId, []);
      }

      farmOrders.get(farmId).push({
        product,
        quantity: cartItem.quantity,
      });
    }

    // Shared group ID for all farm orders
    const orderGroup = new mongoose.Types.ObjectId();

    const createdOrders = [];

    for (const [farmId, items] of farmOrders.entries()) {
      const farm = await Farm.findById(farmId);

      if (!farm) {
        return res.status(404).json({
          success: false,
          message: "Farm not found",
        });
      }

      const farmer = await Farmer.findById(farm.farmer);

      if (!farmer) {
        return res.status(404).json({
          success: false,
          message: "Farmer not found",
        });
      }

      // Find origin zone from farm district
      const originZone = await Zone.findOne({
        districts: farm.location.district,
      });

      if (!originZone) {
        return res.status(400).json({
          success: false,
          message: `Delivery zone not found for ${farm.location.district}`,
        });
      }

      const orderItems = [];

      let itemsTotal = 0;

      for (const item of items) {
        const subtotal = item.product.price * item.quantity;

        itemsTotal += subtotal;

        orderItems.push({
          product: item.product._id,

          name: item.product.name,

          price: item.product.price,

          quantity: item.quantity,

          unit: item.product.unit,

          subtotal,
        });
      }

      // Delivery logic will be added later
      const deliveryCharge = 0;

      const discount = 0;

      const total = itemsTotal + deliveryCharge - discount;

      // Temporary estimate until delivery
      // calculation logic is implemented
      const estimatedHours = 24;

      const estimatedDeliveryAt = new Date(
        Date.now() + estimatedHours * 60 * 60 * 1000,
      );

      const order = await Order.create({
        customer: customer._id,

        orderGroup,

        farmer: farmer._id,

        farm: farm._id,

        items: orderItems,

        deliveryAddress: {
          name: selectedAddress.recipientName,
          phone: selectedAddress.phone,
          district: selectedAddress.district,
          upazila: selectedAddress.upazila,
          village: selectedAddress.village,
          address: selectedAddress.address,
        },

        pricing: {
          itemsTotal,
          deliveryCharge,
          discount,
          total,
        },

        payment: {
          method: paymentMethod,
          status: "pending",
        },

        delivery: {
          originZone: originZone._id,
          destinationZone: destinationZone._id,
          estimatedHours,
          estimatedDeliveryAt,
        },

        status: "processing",
      });

      createdOrders.push(order);

      // Reduce product stock
      for (const item of items) {
        await Product.updateOne(
          {
            _id: item.product._id,
          },
          {
            $inc: {
              stock: -item.quantity,
            },
          },
        );
      }
    }

    // Clear cart after successful orders
    customer.cart = [];

    await customer.save();

    return res.status(201).json({
      success: true,
      message: "Orders placed successfully",
      orderGroup,
      orders: createdOrders,
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
// GET MY ORDERS
// CUSTOMER
// ==========================================

export const getMyOrders = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      user: req.user.userId,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found",
      });
    }

    const orders = await Order.find({
      customer: customer._id,
    })
      .populate("farm", "name")
      .populate("farmer", "user")
      .populate("delivery.originZone")
      .populate("delivery.destinationZone")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
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
// GET SINGLE ORDER
// CUSTOMER / FARMER / ADMIN
// ==========================================

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(orderId)
      .populate("customer")
      .populate("farmer")
      .populate("farm", "name location")
      .populate("items.product", "name images")
      .populate("delivery.originZone")
      .populate("delivery.destinationZone")
      .populate("delivery.courier")
      .populate("delivery.driver");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Admin can access every order
    if (req.user.role === "admin") {
      return res.status(200).json({
        success: true,
        order,
      });
    }

    // Customer access
    if (req.user.role === "customer") {
      const customer = await Customer.findOne({
        user: req.user.userId,
      });

      if (
        !customer ||
        order.customer._id.toString() !== customer._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to access this order",
        });
      }
    }

    // Farmer access
    if (req.user.role === "farmer") {
      const farmer = await Farmer.findOne({
        user: req.user.userId,
      });

      if (!farmer || order.farmer._id.toString() !== farmer._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to access this order",
        });
      }
    }

    return res.status(200).json({
      success: true,
      order,
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
// CANCEL ORDER
// CUSTOMER
// ==========================================

export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const customer = await Customer.findOne({
      user: req.user.userId,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      customer: customer._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Can only cancel before pickup
    if (!["processing", "readyForPickup"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "This order can no longer be cancelled",
      });
    }

    order.status = "cancelled";

    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Product.updateOne(
        {
          _id: item.product,
        },
        {
          $inc: {
            stock: item.quantity,
          },
        },
      );
    }

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
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
// GET FARMER ORDERS
// ==========================================

export const getFarmerOrders = async (req, res) => {
  try {
    const farmer = await Farmer.findOne({
      user: req.user.userId,
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer profile not found",
      });
    }

    const orders = await Order.find({
      farmer: farmer._id,
    })
      .populate("customer", "user")
      .populate("items.product", "name images")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
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
// UPDATE ORDER STATUS
// FARMER
// ==========================================

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["processing", "readyForPickup"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status update",
      });
    }

    const farmer = await Farmer.findOne({
      user: req.user.userId,
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer profile not found",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      farmer: farmer._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled orders cannot be updated",
      });
    }

    if (order.status !== "processing") {
      return res.status(400).json({
        success: false,
        message: "This order cannot be updated by the farmer",
      });
    }

    order.status = status;

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
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
// GET ALL ORDERS
// ADMIN
// ==========================================

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer", "user")
      .populate("farmer", "user")
      .populate("farm", "name")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
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
// GET ORDERS BY CUSTOMER
// ADMIN
// ==========================================

export const getOrdersByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const orders = await Order.find({
      customer: customer._id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
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
// GET ORDERS BY FARMER
// ADMIN
// ==========================================

export const getOrdersByFarmer = async (req, res) => {
  try {
    const { farmerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(farmerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid farmer ID",
      });
    }

    const farmer = await Farmer.findById(farmerId);

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found",
      });
    }

    const orders = await Order.find({
      farmer: farmer._id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
