import mongoose from "mongoose";
import crypto from "crypto";
import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import Farmer from "../models/Farmer.js";
import Farm from "../models/Farm.js";
import Zone from "../models/Zone.js";
import generateOrderNumber from "../utils/generateOrderNumber.js";
import transporter from "../config/nodemailer.js";
import computeDeliveryEstimate from "../utils/computeDeliveryEstimate.js";
import {
  HOUR_IN_MS,
  DEMO_PROCESSING_HOURS,
  PAYMENT_WINDOW_HOURS,
} from "../config/time.js";
import notifyAdmin from "../utils/notifyAdmin.js";
import { tryAutoAssignDriver } from "./deliveryControllers.js";
import { cancelOrderCore } from "../utils/cancelOrderCore.js";
import { reserveStock, releaseStock } from "../utils/stock.js";
import { emitOrderStatusToCustomer } from "../utils/realtime.js";
import { notifyFarmer } from "../utils/notifyFarmer.js";
import { notifyCustomer } from "../utils/notifyCustomer.js";
import {
  validateAndComputePromo,
  claimPromoUsage,
  releasePromoUsage,
  recordPromoUsage,
  releasePromoCustomerUsage,
} from "../utils/promoCode.js";
import { openGroupPaymentIfReady } from "../utils/groupPayment.js";
import { round2 } from "../utils/money.js";
import {
  orderPlacedEmail,
  orderRejectedEmail,
  orderCancelledEmail,
  paymentInvoiceEmail,
} from "../utils/emailTemplates.js";

const populateOrderForEmail = (orderId) =>
  Order.findById(orderId)
    .populate("items.product", "images")
    .populate("farm", "name");

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
      .populate({
        path: "customer",
        select: "profileImage",
        populate: { path: "user", select: "name phone" },
      })
      .populate({
        path: "farmer",
        select: "profileImage",
        populate: { path: "user", select: "name phone" },
      })
      .populate("farm", "name location images")
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
    const {
      addressId,
      paymentMethod,
      pointsToRedeem = 0,
      promoCode,
    } = req.body;

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

      if (!farm.isActive) {
        return res.status(400).json({
          success: false,
          message: `${farm.name} is not accepting orders right now`,
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

    // ---- promo code: validate against the whole cart ----
    let promo = null;
    let promoDiscountTotal = 0;

    if (promoCode) {
      const promoResult = await validateAndComputePromo({
        code: promoCode,
        customerId: customer._id,
        itemsTotal: grandItemsTotal,
      });

      if (promoResult.error) {
        return res
          .status(400)
          .json({ success: false, message: promoResult.error });
      }

      promo = promoResult.promoCode;
      promoDiscountTotal = promoResult.discountAmount;
    }

    // ---- points: whole numbers, allocated with no loss ----
    let pointsToRedeemActual = Math.floor(
      Math.min(
        requestedPoints,
        customer.pointsBalance,
        grandItemsTotal - promoDiscountTotal,
      ),
    );

    const allocations = farmData.map((d) =>
      grandItemsTotal > 0
        ? Math.min(
            Math.floor((d.itemsTotal / grandItemsTotal) * pointsToRedeemActual),
            Math.floor(d.itemsTotal),
          )
        : 0,
    );

    let remainder =
      pointsToRedeemActual - allocations.reduce((a, b) => a + b, 0);

    for (let i = 0; i < allocations.length && remainder > 0; i++) {
      const room = Math.floor(farmData[i].itemsTotal) - allocations[i];
      const add = Math.min(room, remainder);
      allocations[i] += add;
      remainder -= add;
    }

    pointsToRedeemActual -= remainder; // anything unallocatable is simply not spent

    // ---- promo discount: same proportional allocation as points ----
    const promoAllocations = farmData.map((d) =>
      grandItemsTotal > 0
        ? Math.round(
            (d.itemsTotal / grandItemsTotal) * promoDiscountTotal * 100,
          ) / 100
        : 0,
    );

    let promoRemainder =
      Math.round(
        (promoDiscountTotal - promoAllocations.reduce((a, b) => a + b, 0)) *
          100,
      ) / 100;

    if (promoAllocations.length > 0 && promoRemainder !== 0) {
      promoAllocations[promoAllocations.length - 1] =
        Math.round(
          (promoAllocations[promoAllocations.length - 1] + promoRemainder) *
            100,
        ) / 100;
    }

    const debtToSettle = customer.debtBalance || 0;

    // ---- 1) reserve stock atomically (never oversell) ----
    const allItems = farmData.flatMap((d) => d.items);
    const reservation = await reserveStock(allItems);

    if (!reservation.ok) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${reservation.productName}`,
      });
    }

    const orderGroup = new mongoose.Types.ObjectId();

    // ---- 1.5) claim promo code usage atomically ----
    // ---- 1.5) claim promo usage + per-customer slot atomically ----
    if (promo) {
      const claimed = await claimPromoUsage(promo._id, promo.usageLimit);

      if (!claimed) {
        await releaseStock(allItems);
        return res.status(409).json({
          success: false,
          message: "This promo code just reached its usage limit",
        });
      }

      try {
        await recordPromoUsage({
          promoId: promo._id,
          customerId: customer._id,
          orderGroup,
          discountAmount: promoDiscountTotal,
          oncePerCustomer: promo.oncePerCustomer,
        });
      } catch (usageError) {
        await releasePromoUsage(promo._id);
        await releaseStock(allItems);

        if (usageError?.code === 11000) {
          return res.status(409).json({
            success: false,
            message: "You have already used this promo code",
          });
        }

        console.error("recordPromoUsage failed:", usageError);
        return res.status(500).json({
          success: false,
          message: "Could not apply promo code. Please try again.",
        });
      }
    }

    // ---- 2) debit points/debt atomically (fails if balances changed) ----
    const debit = await Customer.updateOne(
      {
        _id: customer._id,
        pointsBalance: { $gte: pointsToRedeemActual },
        debtBalance: debtToSettle,
        updatedAt: customer.updatedAt,
      },
      {
        $inc: { pointsBalance: -pointsToRedeemActual },
        $set: { debtBalance: 0 },
      },
    );

    if (debit.modifiedCount !== 1) {
      await releaseStock(allItems);
      if (promo) {
        await releasePromoUsage(promo._id);
        await releasePromoCustomerUsage({
          promoId: promo._id,
          customerId: customer._id,
        });
      }
      return res.status(409).json({
        success: false,
        message: "Your balance changed. Please review your checkout again.",
      });
    }

    // ---- 3) create orders; compensate on any failure ----
    const createdOrders = [];

    try {
      for (let i = 0; i < farmData.length; i++) {
        const data = farmData[i];
        const isLast = i === farmData.length - 1;

        const pointsForThisOrder = allocations[i];
        const promoForThisOrder = promoAllocations[i] || 0;
        const debtForThisOrder = isLast ? debtToSettle : 0;

        const { estimatedHours, deliveryCharge } = computeDeliveryEstimate(
          data.originZone,
          destinationZone,
        );

        const total =
          Math.round(
            (data.itemsTotal +
              deliveryCharge -
              pointsForThisOrder -
              promoForThisOrder +
              debtForThisOrder) *
              100,
          ) / 100;

        const isDemoFarmer = data.farmer.isDemo === true;
        const isOnline = paymentMethod === "online";

        const order = await Order.create({
          customer: customer._id,
          orderGroup,
          orderNumber: await generateOrderNumber(),
          farmer: data.farmer._id,
          farm: data.farm._id,
          items: data.orderItems,

          deliveryAddress: {
            name: selectedAddress.recipientName,
            phone: selectedAddress.phone,
            division: selectedAddress.division,
            district: selectedAddress.district,
            upazila: selectedAddress.upazila,
            village: selectedAddress.village,
            address: selectedAddress.address,
          },

          pricing: {
            itemsTotal: round2(data.itemsTotal),
            deliveryCharge,
            discount: data.discountAmount,
            pointsRedeemed: pointsForThisOrder,
            promoDiscount: promoForThisOrder,
            debtSettled: debtForThisOrder,
            total,
          },
          promoCode: promo ? promo._id : null,

          payment: { method: paymentMethod, status: "pending" },

          delivery: {
            originZone: data.originZone._id,
            destinationZone: destinationZone._id,
            estimatedHours,
            estimatedDeliveryAt: new Date(
              Date.now() + estimatedHours * HOUR_IN_MS,
            ),
          },

          status: isDemoFarmer
            ? isOnline
              ? "orderPlaced"
              : "processing"
            : "pendingAcceptance",
          isDemoOrder: isDemoFarmer,
          processingReadyAt:
            isDemoFarmer && !isOnline
              ? new Date(Date.now() + DEMO_PROCESSING_HOURS * HOUR_IN_MS)
              : null,
          paymentDueAt: null,
        });

        createdOrders.push(order);
      }
    } catch (creationError) {
      console.error(creationError);

      await Order.deleteMany({ _id: { $in: createdOrders.map((o) => o._id) } });
      await releaseStock(allItems);
      await Customer.updateOne(
        { _id: customer._id },
        {
          $inc: {
            pointsBalance: pointsToRedeemActual,
            debtBalance: debtToSettle,
          },
        },
      );
      if (promo) {
        await releasePromoUsage(promo._id);
        await releasePromoCustomerUsage({
          promoId: promo._id,
          customerId: customer._id,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Could not place your order. Nothing was charged.",
      });
    }

    await Customer.updateOne({ _id: customer._id }, { $set: { cart: [] } });

    // ---- 4) notifications (only after everything succeeded) ----
    for (let i = 0; i < createdOrders.length; i++) {
      const order = createdOrders[i];
      const data = farmData[i];

      await notifyFarmer(order.farmer, {
        type: "orderPlaced",
        title: "New Order Received",
        message: "You have received a new order from a customer.",
        relatedOrder: order._id,
      });

      await notifyAdmin({
        type: "orderPlaced",
        title: "New Order Placed",
        message: `Order ${order.orderNumber} was placed for ${data.farm.name}.`,
        relatedOrder: order._id,
      });

      if (data.farmer.isDemo === true) {
        await notifyCustomer(order.customer, {
          type: "orderAccepted",
          title: "Order Accepted",
          message: "The farmer has accepted your order and is preparing it.",
          relatedOrder: order._id,
        });
      }
    }

    if (paymentMethod === "online") await openGroupPaymentIfReady(orderGroup);

    const populatedOrders = await Order.find({
      _id: { $in: createdOrders.map((o) => o._id) },
    })
      .populate({
        path: "customer",
        select: "profileImage",
        populate: { path: "user", select: "name phone" },
      })
      .populate({
        path: "farmer",
        select: "profileImage",
        populate: { path: "user", select: "name phone" },
      })
      .populate("farm", "name location images")
      .populate("items.product", "name images")
      .populate("delivery.originZone")
      .populate("delivery.destinationZone")
      .populate("delivery.courier")
      .populate("delivery.driver.driverId");

    return res.status(201).json({
      success: true,
      message: "Orders placed successfully",
      orderGroup,
      pointsRedeemed: pointsToRedeemActual,
      promoDiscount: promoDiscountTotal,
      orders: populatedOrders,
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
      .populate("farm", "name location images")
      .populate({
        path: "farmer",
        select: "user",
        populate: { path: "user", select: "name" },
      })
      .populate("items.product", "name images")
      .populate("delivery.originZone")
      .populate("delivery.destinationZone")
      .populate("delivery.courier", "name courierCode")
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
    }).populate("user", "name email");

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

    const payable = orders.filter(
      (o) => !["rejected", "cancelled"].includes(o.status),
    );

    if (payable.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No orders in this group need payment",
      });
    }

    if (payable.some((o) => o.payment.method !== "online")) {
      return res.status(400).json({
        success: false,
        message:
          "This order group does not require online payment confirmation",
      });
    }

    if (payable.every((o) => o.payment.status === "paid")) {
      return res.status(400).json({
        success: false,
        message: "This order group has already been paid for",
      });
    }

    if (payable.some((o) => o.status !== "paymentPending")) {
      return res.status(400).json({
        success: false,
        message: "Payment opens once every farm in this order has responded",
      });
    }

    const transactionId = `TXN-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
    const paidOrderIds = [];

    for (const order of payable) {
      const updated = await Order.findOneAndUpdate(
        { _id: order._id, status: "paymentPending" },
        {
          $set: {
            "payment.status": "paid",
            "payment.transactionId": transactionId,
            status: "processing",
            paymentDueAt: null,
            ...(order.isDemoOrder
              ? {
                  processingReadyAt: new Date(
                    Date.now() + DEMO_PROCESSING_HOURS * HOUR_IN_MS,
                  ),
                }
              : {}),
          },
        },
        { returnDocument: "after" },
      );

      if (!updated) continue;
      await emitOrderStatusToCustomer(updated);

      await notifyCustomer(order.customer, {
        type: "paymentSuccess",
        title: "Payment Successful",
        message: "Your payment has been confirmed for this order.",
        relatedOrder: order._id,
      });

      paidOrderIds.push(updated._id);
    }

    if (paidOrderIds.length > 0 && !customer.isDemo && customer.user?.email) {
      const invoiceOrders = await Order.find({ _id: { $in: paidOrderIds } })
        .populate("items.product", "images")
        .populate("farm", "name");

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: customer.user.email,
          subject: `Payment Invoice — ${transactionId}`,
          html: paymentInvoiceEmail({
            orders: invoiceOrders,
            transactionId,
            customerName: customer.user.name,
          }),
        });
      } catch (emailError) {
        console.error("Failed to send payment invoice email:", emailError);
      }

      for (const invoiceOrder of invoiceOrders) {
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: customer.user.email,
            subject: `Order Placed — ${invoiceOrder.orderNumber}`,
            html: orderPlacedEmail({
              order: invoiceOrder,
              customerName: customer.user.name,
            }),
          });
        } catch (emailError) {
          console.error("Failed to send order-placed email:", emailError);
        }
      }
    }

    const refreshed = await Order.find({
      orderGroup: orderGroupId,
      customer: customer._id,
    });

    return res.status(200).json({
      success: true,
      message: "Payment confirmed successfully",
      orders: refreshed,
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

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order ID" });
    }

    const owned = await Order.findOne({
      _id: orderId,
      customer: customer._id,
    }).select("status");

    if (!owned) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const result = await cancelOrderCore(orderId);

    if (!result) {
      return res.status(400).json({
        success: false,
        message: ["outForDelivery", "delivered"].includes(owned.status)
          ? "This order can no longer be cancelled at this delivery stage"
          : "This order can no longer be cancelled",
      });
    }

    const { order } = result;
    await emitOrderStatusToCustomer(order);

    const farmer = await Farmer.findById(order.farmer).populate(
      "user",
      "name email",
    );
    if (farmer) {
      await notifyFarmer(order.farmer, {
        type: "orderCancelled",
        title: "Order Cancelled",
        message: `The customer has cancelled an order.
                  Order: ${order.orderNumber}`,
        relatedOrder: order._id,
      });

      if (!farmer.isDemo && farmer.user?.email) {
        try {
          const emailOrder = await populateOrderForEmail(order._id);
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: farmer.user.email,
            subject: `Order Cancelled — ${order.orderNumber}`,
            html: orderCancelledEmail({
              order: emailOrder,
              recipientName: farmer.user.name,
              recipientRole: "farmer",
              reason: "The customer cancelled this order.",
            }),
          });
        } catch (emailError) {
          console.error(
            "Failed to send order-cancelled email (farmer):",
            emailError,
          );
        }
      }
    }
    await notifyCustomer(order.customer, {
      type: "orderCancelled",
      title: "Order Cancelled",
      message: "Your order has been cancelled successfully.",
      relatedOrder: order._id,
    });
    await notifyAdmin({
      type: "orderCancelled",
      title: "Order Cancelled",
      message: `Order ${order.orderNumber} was cancelled by the customer.`,
      relatedOrder: order._id,
    });

    if (order.payment.method === "online") {
      await openGroupPaymentIfReady(order.orderGroup);
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
      .populate({
        path: "customer",
        select: "user",
        populate: { path: "user", select: "name" },
      })
      .populate("farm", "name location images")
      .populate("items.product", "name images")
      .populate("delivery.originZone")
      .populate("delivery.destinationZone")
      .populate("delivery.courier", "name courierCode")
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
      .populate({
        path: "customer",
        select: "user",
        populate: { path: "user", select: "name" },
      })
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

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order ID" });
    }

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

    const order = await Order.findOneAndUpdate(
      { _id: orderId, farmer: farmer._id, status: "processing" },
      { $set: { status: "readyForPickup" } },
      { returnDocument: "after" },
    );

    if (!order) {
      return res.status(400).json({
        success: false,
        message: "This order cannot be updated by the farmer",
      });
    }
    await emitOrderStatusToCustomer(order);

    const customer = await Customer.findById(order.customer).populate("user");

    let driverAutoAssigned = false;
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
        await notifyCustomer(order.customer, {
          type: notificationInfo.type,
          title: notificationInfo.title,
          message: notificationInfo.message,
          relatedOrder: order._id,
        });
      }

      if (customer.isDemo) {
        driverAutoAssigned = await tryAutoAssignDriver(order);

        if (!driverAutoAssigned) {
          await autoCancelOrder({
            order,
            customer,
            reason: "No driver was available for this order",
          });

          return res.status(200).json({
            success: true,
            message:
              "Order status updated, but was auto-cancelled — no driver was available",
            order,
          });
        }
      }
    }

    if (!driverAutoAssigned) {
      await notifyAdmin({
        type: "readyForPickup",
        title: "Order Ready for Pickup",
        message: `Order ${order.orderNumber} is ready for pickup and needs a driver assigned.`,
        relatedOrder: order._id,
      });
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

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order ID" });
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

    const isOnlineOrder = await Order.exists({
      _id: orderId,
      farmer: farmer._id,
      "payment.method": "online",
    });

    const order = await Order.findOneAndUpdate(
      { _id: orderId, farmer: farmer._id, status: "pendingAcceptance" },
      {
        $set: {
          status: isOnlineOrder ? "orderPlaced" : "processing",
          paymentDueAt: isOnlineOrder
            ? new Date(Date.now() + PAYMENT_WINDOW_HOURS * HOUR_IN_MS)
            : null,
        },
      },
      { returnDocument: "after" },
    );

    if (!order) {
      return res.status(400).json({
        success: false,
        message: "This order can no longer be accepted",
      });
    }

    await emitOrderStatusToCustomer(order);

    const customer = await Customer.findById(order.customer).populate("user");
    if (customer) {
      await notifyCustomer(order.customer, {
        type: "orderAccepted",
        title: "Order Accepted",
        message: "The farmer has accepted your order and is preparing it.",
        relatedOrder: order._id,
      });

      if (order.payment.method === "online") {
        await openGroupPaymentIfReady(order.orderGroup);
      } else if (!customer.isDemo && customer.user.email) {
        // COD goes straight to "processing" here. Online orders get this
        // email later, once confirmPayment moves them to "processing".
        try {
          const emailOrder = await populateOrderForEmail(order._id);
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: customer.user.email,
            subject: `Order Placed — ${order.orderNumber}`,
            html: orderPlacedEmail({
              order: emailOrder,
              customerName: customer.user.name,
            }),
          });
        } catch (emailError) {
          console.error("Failed to send order-placed email:", emailError);
        }
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

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order ID" });
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

    const order = await Order.findOneAndUpdate(
      { _id: orderId, farmer: farmer._id, status: "pendingAcceptance" },
      { $set: { status: "rejected" } },
      { returnDocument: "after" },
    );

    if (!order) {
      return res.status(400).json({
        success: false,
        message: "This order can no longer be rejected",
      });
    }
    await emitOrderStatusToCustomer(order);

    const { pointsRedeemed = 0, debtSettled = 0 } = order.pricing;

    if (pointsRedeemed > 0 || debtSettled > 0) {
      await Customer.updateOne(
        { _id: order.customer },
        { $inc: { pointsBalance: pointsRedeemed, debtBalance: debtSettled } },
      );
    }

    await releaseStock(
      order.items.map((i) => ({ product: i.product, quantity: i.quantity })),
    );

    const customer = await Customer.findById(order.customer).populate("user");
    if (customer) {
      await notifyCustomer(order.customer, {
        type: "orderRejected",
        title: "Order Rejected",
        message: reason
          ? `The farmer could not fulfill your order: ${reason}`
          : "The farmer was unable to fulfill your order.",
        relatedOrder: order._id,
      });

      if (!customer.isDemo && customer.user?.email) {
        try {
          const emailOrder = await populateOrderForEmail(order._id);
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: customer.user.email,
            subject: `Order Rejected — ${order.orderNumber}`,
            html: orderRejectedEmail({
              order: emailOrder,
              customerName: customer.user.name,
              reason,
            }),
          });
        } catch (emailError) {
          console.error("Failed to send order-rejected email:", emailError);
        }
      }
    }
    await notifyAdmin({
      type: "orderRejected",
      title: "Order Rejected",
      message: `Order ${order.orderNumber} was rejected by the farmer.`,
      relatedOrder: order._id,
    });

    if (order.payment.method === "online") {
      await openGroupPaymentIfReady(order.orderGroup);
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
    const limit = Math.min(Math.max(Number(req.query.limit) || 0, 0), 200);
    let query = Order.find()
      .populate({
        path: "customer",
        select: "profileImage",
        populate: { path: "user", select: "name" },
      })
      .populate({
        path: "farmer",
        select: "profileImage",
        populate: { path: "user", select: "name" },
      })
      .populate("farm", "name location images")
      .populate("items.product", "name images")
      .populate("delivery.originZone")
      .populate("delivery.destinationZone")
      .populate("delivery.courier", "name courierCode")
      .sort({
        createdAt: -1,
      });

    if (limit > 0) query = query.limit(limit);

    const orders = await query;

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

// By demo customer
export const placeDemoOrder = async ({ userId, addressId }) => {
  try {
    const customer = await Customer.findOne({
      user: userId,
    }).populate("cart.product");

    if (!customer) {
      return { success: false, message: "Customer profile not found" };
    }

    if (customer.cart.length === 0) {
      return { success: false, message: "Cart is empty" };
    }

    const selectedAddress = customer.addresses.id(addressId);

    if (!selectedAddress) {
      return { success: false, message: "Delivery address not found" };
    }

    const destinationZone = await Zone.findOne({
      districts: selectedAddress.district,
    });

    if (!destinationZone) {
      return {
        success: false,
        message: "Delivery zone not found for this district",
      };
    }

    const farmOrders = new Map();

    for (const cartItem of customer.cart) {
      const product = cartItem.product;

      if (!product) continue;
      if (product.status !== "active") continue;
      if (product.expiresAt && product.expiresAt <= new Date()) continue;
      if (product.stock < cartItem.quantity) continue;

      const farmId = product.farm.toString();

      if (!farmOrders.has(farmId)) {
        farmOrders.set(farmId, []);
      }

      farmOrders.get(farmId).push({
        product,
        quantity: cartItem.quantity,
      });
    }

    if (farmOrders.size === 0) {
      return { success: false, message: "No valid items in cart" };
    }

    const farmData = [];

    for (const [farmId, items] of farmOrders.entries()) {
      const farm = await Farm.findById(farmId);
      if (!farm || !farm.isActive) {
        const productIds = items.map((i) => i.product._id.toString());
        customer.cart = customer.cart.filter(
          (item) => !productIds.includes(item.product.toString()),
        );
        continue;
      }

      const farmer = await Farmer.findById(farm.farmer);
      if (!farmer) continue;

      const originZone = await Zone.findOne({
        districts: farm.location.district,
      });
      if (!originZone) continue;

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

    if (farmData.length === 0) {
      return {
        success: false,
        message: "No valid farm orders could be created",
      };
    }

    const orderGroup = new mongoose.Types.ObjectId();
    const createdOrders = [];

    for (const data of farmData) {
      const reservation = await reserveStock(data.items);
      if (!reservation.ok) continue;

      try {
        const { estimatedHours, deliveryCharge } = computeDeliveryEstimate(
          data.originZone,
          destinationZone,
        );

        const total = data.itemsTotal + deliveryCharge;
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
            division: selectedAddress.division,
            district: selectedAddress.district,
            upazila: selectedAddress.upazila,
            village: selectedAddress.village,
            address: selectedAddress.address,
          },

          pricing: {
            itemsTotal: round2(data.itemsTotal),
            deliveryCharge,
            discount: data.discountAmount,
            pointsRedeemed: 0,
            total,
          },

          payment: {
            method: "cashOnDelivery",
            status: "pending",
          },

          delivery: {
            originZone: data.originZone._id,
            destinationZone: destinationZone._id,
            estimatedHours,
            estimatedDeliveryAt,
          },

          status: isDemoFarmer ? "processing" : "pendingAcceptance",
          isDemoOrder: isDemoFarmer,
          processingReadyAt: isDemoFarmer
            ? new Date(Date.now() + DEMO_PROCESSING_HOURS * HOUR_IN_MS)
            : null,
        });

        await notifyFarmer(order.farmer, {
          type: "orderPlaced",
          title: "New Order Received",
          message: "You have received a new order from a customer.",
          relatedOrder: order._id,
        });

        await notifyAdmin({
          type: "orderPlaced",
          title: "New Order Placed",
          message: `Order ${order.orderNumber} was placed for ${data.farm.name}.`,
          relatedOrder: order._id,
        });

        if (isDemoFarmer) {
          await notifyCustomer(order.customer, {
            type: "orderAccepted",
            title: "Order Accepted",
            message: "The farmer has accepted your order and is preparing it.",
            relatedOrder: order._id,
          });
        }

        createdOrders.push(order);
      } catch (farmOrderError) {
        console.error(
          `placeDemoOrder: order creation failed for farm ${data.farm._id}:`,
          farmOrderError,
        );
        await releaseStock(data.items); // give back what reserveStock took
      }
    }

    if (createdOrders.length === 0) {
      await customer.save();
      return {
        success: false,
        message: "No orders could be placed — items are out of stock",
      };
    }

    customer.cart = [];
    await customer.save();

    return {
      success: true,
      message: "Demo order placed successfully",
      orderGroup,
      orders: createdOrders,
    };
  } catch (error) {
    console.error("placeDemoOrder error:", error);

    return { success: false, message: "Internal server error" };
  }
};

// demo customer cancels if no driver found
export const autoCancelOrder = async ({ order, customer, reason }) => {
  try {
    const result = await cancelOrderCore(order._id);

    if (!result) {
      return {
        success: false,
        message: "This order can no longer be cancelled",
      };
    }

    order.status = "cancelled";
    order.refund = result.order.refund;

    await emitOrderStatusToCustomer(order);

    const farmer = await Farmer.findById(order.farmer).populate("user");
    if (farmer) {
      await notifyFarmer(order.farmer, {
        type: "orderCancelled",
        title: "Order Cancelled",
        message: reason
          ? `Order ${order.orderNumber} was cancelled: ${reason}`
          : "An order has been cancelled.",
        relatedOrder: order._id,
      });

      if (!farmer.isDemo && farmer.user?.email) {
        try {
          const emailOrder = await populateOrderForEmail(order._id);
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: farmer.user.email,
            subject: `Order Cancelled — ${order.orderNumber}`,
            html: orderCancelledEmail({
              order: emailOrder,
              recipientName: farmer.user.name,
              recipientRole: "farmer",
              reason,
            }),
          });
        } catch (emailError) {
          console.error("Failed to send order-cancelled email:", emailError);
        }
      }
    }

    if (reason) {
      await notifyCustomer(order.customer, {
        type: "orderCancelled",
        title: "Order Cancelled",
        message: reason,
        relatedOrder: order._id,
      });
    }

    if (customer && !customer.isDemo && customer.user?.email) {
      try {
        const emailOrder = await populateOrderForEmail(order._id);
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: customer.user.email,
          subject: `Order Cancelled — ${order.orderNumber}`,
          html: orderCancelledEmail({
            order: emailOrder,
            recipientName: customer.user.name,
            reason,
          }),
        });
      } catch (emailError) {
        console.error("Failed to send order-cancelled email:", emailError);
      }
    }

    await notifyAdmin({
      type: "orderCancelled",
      title: "Order Cancelled",
      message: reason
        ? `Order ${order.orderNumber} was auto-cancelled: ${reason}`
        : `Order ${order.orderNumber} was cancelled.`,
      relatedOrder: order._id,
    });

    return { success: true, message: "Order cancelled successfully", order };
  } catch (error) {
    console.error("autoCancelOrder error:", error);

    return { success: false, message: "Internal server error" };
  }
};

// CUSTOMER preview of payment
export const getCheckoutPreview = async (req, res) => {
  try {
    const { addressId, pointsToRedeem = 0, promoCode } = req.body;

    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: "Delivery address is required",
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

    const farmOrders = new Map();
    const issues = [];

    for (const cartItem of customer.cart) {
      const product = cartItem.product;

      if (!product) {
        issues.push("An item in your cart no longer exists");
        continue;
      }
      if (product.status !== "active") {
        issues.push(`${product.name} is currently unavailable`);
        continue;
      }
      if (product.expiresAt && product.expiresAt <= new Date()) {
        issues.push(`${product.name} has expired`);
        continue;
      }
      if (product.stock < cartItem.quantity) {
        issues.push(`Insufficient stock for ${product.name}`);
        continue;
      }

      const farmId = product.farm.toString();
      if (!farmOrders.has(farmId)) farmOrders.set(farmId, []);

      farmOrders.get(farmId).push({
        product,
        quantity: cartItem.quantity,
      });
    }

    let itemsTotal = 0;
    let discountAmount = 0;
    let deliveryCharge = 0;

    for (const [farmId, items] of farmOrders.entries()) {
      const farm = await Farm.findById(farmId);
      if (!farm) {
        issues.push("A farm in your cart no longer exists");
        continue;
      }
      if (!farm.isActive) {
        issues.push(`${farm.name} is not accepting orders right now`);
        continue;
      }

      const originZone = await Zone.findOne({
        districts: farm.location.district,
      });
      if (!originZone) {
        issues.push(`Delivery zone not found for ${farm.location.district}`);
        continue;
      }

      let farmItemsTotal = 0;

      for (const item of items) {
        const originalUnitPrice = item.product.price;
        const discountPct = item.product.discountPercentage || 0;
        const effectiveUnitPrice =
          Math.round(originalUnitPrice * (1 - discountPct / 100) * 100) / 100;
        const subtotal =
          Math.round(effectiveUnitPrice * item.quantity * 100) / 100;

        discountAmount += originalUnitPrice * item.quantity - subtotal;
        farmItemsTotal += subtotal;
      }

      itemsTotal += farmItemsTotal;

      const { deliveryCharge: farmDeliveryCharge } = computeDeliveryEstimate(
        originZone,
        destinationZone,
      );

      deliveryCharge += farmDeliveryCharge;
    }

    let promoDiscount = 0;
    let promoError = null;

    if (promoCode) {
      const promoResult = await validateAndComputePromo({
        code: promoCode,
        customerId: customer._id,
        itemsTotal,
      });

      if (promoResult.error) {
        promoError = promoResult.error;
      } else {
        promoDiscount = promoResult.discountAmount;
      }
    }

    const requestedPoints = Number(pointsToRedeem) || 0;
    const pointsRedeemed = Math.floor(
      Math.max(
        0,
        Math.min(requestedPoints, customer.pointsBalance, itemsTotal),
      ),
    );

    const debtBalance = customer.debtBalance || 0;

    const total =
      Math.round(
        (itemsTotal +
          deliveryCharge -
          pointsRedeemed -
          promoDiscount +
          debtBalance) *
          100,
      ) / 100;

    return res.status(200).json({
      success: true,
      preview: {
        itemsTotal: round2(itemsTotal),
        discountAmount: Math.round(discountAmount * 100) / 100,
        deliveryCharge,
        pointsAvailable: customer.pointsBalance,
        pointsRedeemed,
        promoDiscount,
        promoError,
        debtBalance,
        total,
        issues,
        canCheckout: issues.length === 0,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ADMIN — cancel a real (non-demo) order stuck at readyForPickup (no driver available)
export const adminCancelNoDriver = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order ID" });
    }

    const result = await cancelOrderCore(orderId, {
      extraFilter: { status: "readyForPickup", isDemoOrder: false },
      finalStatus: "rejected",
    });

    if (!result) {
      return res.status(400).json({
        success: false,
        message:
          "Only real orders currently at readyForPickup can be cancelled this way",
      });
    }

    const { order } = result;
    await emitOrderStatusToCustomer(order);

    const customer = await Customer.findById(order.customer).populate("user");
    if (customer) {
      await notifyCustomer(order.customer, {
        type: "orderRejected",
        title: "Order Cancelled",
        message:
          "Your order was cancelled as no driver was available. You've been fully refunded.",
        relatedOrder: order._id,
      });

      if (!customer.isDemo && customer.user?.email) {
        try {
          const emailOrder = await populateOrderForEmail(order._id);
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: customer.user.email,
            subject: `Order Cancelled — ${order.orderNumber}`,
            html: orderCancelledEmail({
              order: emailOrder,
              recipientName: customer.user.name,
              reason: "No driver was available for this order",
            }),
          });
        } catch (emailError) {
          console.error("Failed to send order-cancelled email:", emailError);
        }
      }
    }

    const farmer = await Farmer.findById(order.farmer).populate("user");
    if (farmer) {
      await notifyFarmer(order.farmer, {
        type: "orderRejected",
        title: "Order Cancelled by Admin",
        message: `Order ${order.orderNumber} was cancelled — no driver was available.`,
        relatedOrder: order._id,
      });

      if (!farmer.isDemo && farmer.user?.email) {
        try {
          const emailOrder = await populateOrderForEmail(order._id);
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: farmer.user.email,
            subject: `Order Cancelled — ${order.orderNumber}`,
            html: orderCancelledEmail({
              order: emailOrder,
              recipientName: farmer.user.name,
              recipientRole: "farmer",
              reason: "No driver was available for this order",
            }),
          });
        } catch (emailError) {
          console.error(
            "Failed to send order-cancelled email (farmer):",
            emailError,
          );
        }
      }
    }

    await notifyAdmin({
      type: "orderRejected",
      title: "Order Cancelled — No Driver",
      message: `Order ${order.orderNumber} was cancelled by admin (no driver available).`,
      relatedOrder: order._id,
    });

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getOrderGroup = async (req, res) => {
  try {
    const { orderGroupId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderGroupId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order group ID" });
    }

    const customer = await Customer.findOne({ user: req.user.userId });
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer profile not found" });
    }

    const orders = await Order.find({
      orderGroup: orderGroupId,
      customer: customer._id,
    })
      .populate({
        path: "customer",
        select: "profileImage",
        populate: { path: "user", select: "name phone" },
      })
      .populate({
        path: "farmer",
        select: "profileImage",
        populate: { path: "user", select: "name phone" },
      })
      .populate("farm", "name location images")
      .populate("items.product", "name images")
      .populate("delivery.originZone")
      .populate("delivery.destinationZone")
      .populate("delivery.courier")
      .populate("delivery.driver.driverId")
      .sort({ createdAt: 1 });

    if (orders.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Order group not found" });
    }

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
