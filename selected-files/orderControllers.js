import mongoose from "mongoose";
import crypto from "crypto";
import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import Product from "../models/Product.js";
import Farmer from "../models/Farmer.js";
import Farm from "../models/Farm.js";
import Zone from "../models/Zone.js";
import generateOrderNumber from "../utils/generateOrderNumber.js";
import createNotification from "../utils/createNotification.js";
import transporter from "../config/nodemailer.js";
import computeDeliveryEstimate from "../utils/computeDeliveryEstimate.js";
import { HOUR_IN_MS, DEMO_PROCESSING_HOURS } from "../config/time.js";

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
      .populate("delivery.driver.driverId");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (req.user.role === "admin") {
      return res.status(200).json({
        success: true,
        order,
      });
    }

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

// CUSTOMER

export const createOrder = async (req, res) => {
  try {
    const { addressId, paymentMethod, pointsToRedeem = 0 } = req.body;

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

    const requestedPoints = Number(pointsToRedeem) || 0;

    if (requestedPoints < 0) {
      return res.status(400).json({
        success: false,
        message: "Points to redeem cannot be negative",
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

      if (product.status !== "active") {
        return res.status(400).json({
          success: false,
          message: `${product.name} is currently unavailable`,
        });
      }

      if (product.expiresAt && product.expiresAt <= new Date()) {
        return res.status(400).json({
          success: false,
          message: `${product.name} has expired`,
        });
      }

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

    // Pass 1: resolve farm/farmer/zone and compute discounted totals per farm
    const farmData = [];
    let grandItemsTotal = 0;

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
      let discountAmount = 0;

      for (const item of items) {
        const originalUnitPrice = item.product.price;
        const discountPct = item.product.discountPercentage || 0;

        const effectiveUnitPrice =
          Math.round(originalUnitPrice * (1 - discountPct / 100) * 100) / 100;

        const subtotal =
          Math.round(effectiveUnitPrice * item.quantity * 100) / 100;

        const originalSubtotal = originalUnitPrice * item.quantity;

        discountAmount += originalSubtotal - subtotal;
        itemsTotal += subtotal;

        orderItems.push({
          product: item.product._id,
          name: item.product.name,
          price: effectiveUnitPrice,
          quantity: item.quantity,
          unit: item.product.unit,
          subtotal,
        });
      }

      grandItemsTotal += itemsTotal;

      farmData.push({
        farm,
        farmer,
        originZone,
        orderItems,
        itemsTotal,
        discountAmount,
        items,
      });
    }

    // Points redemption: 1 point = 1 taka, capped by balance and by cart value
    const pointsToRedeemActual = Math.min(
      requestedPoints,
      customer.pointsBalance,
      grandItemsTotal,
    );

    if (pointsToRedeemActual > 0) {
      customer.pointsBalance -= pointsToRedeemActual;
    }

    const orderGroup = new mongoose.Types.ObjectId();
    const createdOrders = [];
    let pointsAllocatedSoFar = 0;

    for (let i = 0; i < farmData.length; i++) {
      const data = farmData[i];
      const isLast = i === farmData.length - 1;

      let pointsForThisOrder = 0;

      if (pointsToRedeemActual > 0) {
        pointsForThisOrder = isLast
          ? pointsToRedeemActual - pointsAllocatedSoFar
          : Math.round(
              (data.itemsTotal / grandItemsTotal) * pointsToRedeemActual,
            );

        pointsForThisOrder = Math.min(pointsForThisOrder, data.itemsTotal);
        pointsAllocatedSoFar += pointsForThisOrder;
      }

      const { estimatedHours, deliveryCharge } = computeDeliveryEstimate(
        data.originZone,
        destinationZone,
      );

      const total = data.itemsTotal + deliveryCharge - pointsForThisOrder;

      const estimatedDeliveryAt = new Date(
        Date.now() + estimatedHours * 60 * 60 * 1000,
      );

      const isDemoFarmer = data.farmer.isDemo === true;
      const orderNumber = await generateOrderNumber();

      const order = await Order.create({
        customer: customer._id,
        orderGroup,
        orderNumber,
        farmer: data.farmer._id,
        farm: data.farm._id,
        items: data.orderItems,

        deliveryAddress: {
          name: selectedAddress.recipientName,
          phone: selectedAddress.phone,
          district: selectedAddress.district,
          upazila: selectedAddress.upazila,
          village: selectedAddress.village,
          address: selectedAddress.address,
        },

        pricing: {
          itemsTotal: data.itemsTotal,
          deliveryCharge,
          discount: data.discountAmount,
          pointsRedeemed: pointsForThisOrder,
          total,
        },

        payment: {
          method: paymentMethod,
          status: "pending",
        },

        delivery: {
          originZone: data.originZone._id,
          destinationZone: destinationZone._id,
          estimatedHours,
          estimatedDeliveryAt,
        },

        status: isDemoFarmer
          ? paymentMethod === "online"
            ? "paymentPending"
            : "processing"
          : "pendingAcceptance",
        isDemoOrder: isDemoFarmer,
        processingReadyAt:
          isDemoFarmer && paymentMethod !== "online"
            ? new Date(Date.now() + DEMO_PROCESSING_HOURS * HOUR_IN_MS)
            : null,
      });

      await createNotification({
        recipient: data.farmer.user,
        recipientRole: "farmer",
        type: "orderPlaced",
        title: "New Order Received",
        message: "You have received a new order from a customer.",
        relatedOrder: order._id,
      });

      // Demo farmers skip the manual accept step, so the customer-facing
      // acceptance/payment notifications fire immediately here instead of
      // waiting on acceptOrder().
      if (isDemoFarmer) {
        await createNotification({
          recipient: customer.user,
          recipientRole: "customer",
          type: "orderAccepted",
          title: "Order Accepted",
          message: "The farmer has accepted your order and is preparing it.",
          relatedOrder: order._id,
        });

        if (paymentMethod === "online") {
          await createNotification({
            recipient: customer.user,
            recipientRole: "customer",
            type: "paymentRequired",
            title: "Payment Required",
            message:
              "Please complete your online payment before this order is picked up.",
            relatedOrder: order._id,
          });
        }
      }

      createdOrders.push(order);

      for (const item of data.items) {
        await Product.updateOne(
          { _id: item.product._id },
          { $inc: { stock: -item.quantity } },
        );
      }
    }

    customer.cart = [];
    await customer.save();

    return res.status(201).json({
      success: true,
      message: "Orders placed successfully",
      orderGroup,
      pointsRedeemed: pointsToRedeemActual,
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

export const confirmPayment = async (req, res) => {
  try {
    const { orderGroupId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderGroupId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order group ID",
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

    const orders = await Order.find({
      orderGroup: orderGroupId,
      customer: customer._id,
    });

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order group not found",
      });
    }

    const nonOnlineOrder = orders.find(
      (order) => order.payment.method !== "online",
    );

    if (nonOnlineOrder) {
      return res.status(400).json({
        success: false,
        message:
          "This order group does not require online payment confirmation",
      });
    }

    if (orders.every((order) => order.payment.status === "paid")) {
      return res.status(400).json({
        success: false,
        message: "This order group has already been paid for",
      });
    }

    // ---- everything below this point is the new piece ----

    const invalidStatusOrder = orders.find(
      (order) => order.status !== "paymentPending",
    );

    if (invalidStatusOrder) {
      return res.status(400).json({
        success: false,
        message:
          "Payment can only be confirmed while the order is awaiting payment",
      });
    }

    const transactionId = `TXN-${crypto
      .randomBytes(6)
      .toString("hex")
      .toUpperCase()}`;

    for (const order of orders) {
      order.payment.status = "paid";
      order.payment.transactionId = transactionId;
      order.status = "processing";

      if (order.isDemoOrder) {
        order.processingReadyAt = new Date(
          Date.now() + DEMO_PROCESSING_HOURS * HOUR_IN_MS,
        );
      }

      await order.save();

      await createNotification({
        recipient: req.user.userId,
        recipientRole: "customer",
        type: "paymentSuccess",
        title: "Payment Successful",
        message: "Your payment has been confirmed for this order.",
        relatedOrder: order._id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment confirmed successfully",
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

    const REFUND_TIERS = {
      pendingAcceptance: 100,
      processing: 100,
      readyForPickup: 100,
      pickedUp: 70,
      toOriginCenter: 40,
      inTransit: 40,
      toDestinationCenter: 40,
    };

    if (!(order.status in REFUND_TIERS)) {
      return res.status(400).json({
        success: false,
        message:
          order.status === "outForDelivery" || order.status === "delivered"
            ? "This order can no longer be cancelled at this delivery stage"
            : "This order can no longer be cancelled",
      });
    }

    const refundPercentage = REFUND_TIERS[order.status];
    const wasPrePickup = [
      "pendingAcceptance",
      "processing",
      "readyForPickup",
    ].includes(order.status);

    order.status = "cancelled";
    order.cancelledAt = new Date();

    if (order.pricing.pointsRedeemed > 0) {
      customer.pointsBalance += order.pricing.pointsRedeemed;
    }

    const refundAmount = Math.round(
      order.pricing.total * (refundPercentage / 100),
    );

    if (order.payment.method === "online") {
      if (order.payment.status === "paid") {
        customer.pointsBalance += refundAmount;
        order.payment.status = "refunded";
      }
    } else if (order.payment.method === "cashOnDelivery") {
      const forfeitedPercentage = 100 - refundPercentage;

      if (forfeitedPercentage > 0) {
        customer.debtBalance += Math.round(
          order.pricing.total * (forfeitedPercentage / 100),
        );
      }
    }

    order.refund = {
      percentage: refundPercentage,
      amount: refundAmount,
    };

    await order.save();
    await customer.save();

    if (wasPrePickup) {
      for (const item of order.items) {
        await Product.updateOne(
          { _id: item.product },
          { $inc: { stock: item.quantity } },
        );
      }
    }

    const farmer = await Farmer.findById(order.farmer);
    if (farmer) {
      await createNotification({
        recipient: farmer.user,
        recipientRole: "farmer",
        type: "orderCancelled",
        title: "Order Cancelled",
        message: "A customer has cancelled an order.",
        relatedOrder: order._id,
      });
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

export const getFarmOrders = async (req, res) => {
  try {
    const { farmId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid farm ID",
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

    const farm = await Farm.findOne({
      _id: farmId,
      farmer: farmer._id,
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found or you do not own this farm",
      });
    }

    const orders = await Order.find({
      farm: farm._id,
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

// FARMER

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (status !== "readyForPickup") {
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

    order.status = "readyForPickup";

    await order.save();

    const customer = await Customer.findById(order.customer).populate("user");
    if (customer) {
      const notificationData = {
        readyForPickup: {
          type: "readyForPickup",
          title: "Order Ready for Pickup",
          message: "Your order has been prepared and is ready for pickup.",
        },
      };

      const notificationInfo = notificationData[status];

      if (notificationInfo) {
        await createNotification({
          recipient: customer.user._id,
          recipientRole: "customer",
          type: notificationInfo.type,
          title: notificationInfo.title,
          message: notificationInfo.message,
          relatedOrder: order._id,
        });
      }
    }

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

export const acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

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

    if (order.status !== "pendingAcceptance") {
      return res.status(400).json({
        success: false,
        message: "This order can no longer be accepted",
      });
    }

    order.status =
      order.payment.method === "online" ? "paymentPending" : "processing";

    await order.save();

    const customer = await Customer.findById(order.customer).populate("user");
    if (customer) {
      await createNotification({
        recipient: customer.user._id,
        recipientRole: "customer",
        type: "orderAccepted",
        title: "Order Accepted",
        message: "The farmer has accepted your order and is preparing it.",
        relatedOrder: order._id,
      });

      if (order.payment.method === "online") {
        await createNotification({
          recipient: customer.user._id,
          recipientRole: "customer",
          type: "paymentRequired",
          title: "Payment Required",
          message:
            "Please complete your online payment before this order is picked up.",
          relatedOrder: order._id,
        });
      }
    }

    if (customer.user.email) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: customer.user.email,
          subject: "Your FreshMart Order Has Been Accepted",
          html: `
              <h2>Order Accepted</h2>

              <p>Hello ${customer.user.name || "Customer"},</p>

              <p>
                Good news! The farmer has accepted your order
                and is now preparing it.
              </p>

              <p>
                <strong>Order ID:</strong> ${order.orderNumber}
              </p>

              <p>
                You can check your order status from your FreshMart account.
              </p>

              <p>
                Thank you for shopping with FreshMart!
              </p>
            `,
        });
      } catch (emailError) {
        console.error("Failed to send order acceptance email:", emailError);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Order accepted successfully",
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

export const rejectOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

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

    if (order.status !== "pendingAcceptance") {
      return res.status(400).json({
        success: false,
        message: "This order can no longer be rejected",
      });
    }

    order.status = "rejected";

    await order.save();

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

    const customer = await Customer.findById(order.customer).populate("user");
    if (customer) {
      await createNotification({
        recipient: customer.user._id,
        recipientRole: "customer",
        type: "orderRejected",
        title: "Order Rejected",
        message: reason
          ? `The farmer could not fulfill your order: ${reason}`
          : "The farmer was unable to fulfill your order.",
        relatedOrder: order._id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order rejected successfully",
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

// ADMIN

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

export const getOrdersByFarm = async (req, res) => {
  try {
    const { farmId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid farm ID",
      });
    }

    const farm = await Farm.findById(farmId);

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }

    const orders = await Order.find({
      farm: farm._id,
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
