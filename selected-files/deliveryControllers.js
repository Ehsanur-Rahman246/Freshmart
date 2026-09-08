import mongoose from "mongoose";
import Order from "../models/Order.js";
import Courier from "../models/Courier.js";
import Driver from "../models/Driver.js";
import Customer from "../models/Customer.js";
import Farmer from "../models/Farmer.js";
import createNotification from "../utils/createNotification.js";

export const getOrdersAwaitingAssignment = async (req, res) => {
  try {
    const orders = await Order.find({
      status: "readyForPickup",
      "delivery.courier": null,
    })
      .populate("customer", "user")
      .populate("farmer", "user")
      .populate("farm", "name location")
      .populate("delivery.originZone")
      .populate("delivery.destinationZone")
      .sort({ createdAt: 1 });

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

export const getAvailableDriversForOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(orderId).populate(
      "delivery.destinationZone",
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const destinationZoneId = order.delivery.destinationZone.zoneId;

    const couriers = await Courier.find({
      zonesCovered: destinationZoneId,
    });

    const courierIds = couriers.map((courier) => courier._id);

    const drivers = await Driver.find({
      courier: { $in: courierIds },
      currentZone: destinationZoneId,
      isAvailable: true,
    }).populate("courier", "name courierCode");

    return res.status(200).json({
      success: true,
      count: drivers.length,
      drivers,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const assignDriverToOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { driverId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(orderId) ||
      !mongoose.Types.ObjectId.isValid(driverId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order or driver ID",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status !== "readyForPickup") {
      return res.status(400).json({
        success: false,
        message: "Order is not ready for driver assignment",
      });
    }

    if (order.delivery.courier) {
      return res.status(400).json({
        success: false,
        message: "A driver has already been assigned to this order",
      });
    }

    const driver = await Driver.findById(driverId);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    if (!driver.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "This driver is not currently available",
      });
    }

    order.delivery.courier = driver.courier;
    order.delivery.driver = {
      driverId: driver._id,
      name: driver.name,
      phone: driver.phone,
    };
    order.status = "pickedUp";

    await order.save();

    driver.isAvailable = false;
    await driver.save();

    const customer = await Customer.findById(order.customer).populate("user");
    if (customer) {
      await createNotification({
        recipient: customer.user._id,
        recipientRole: "customer",
        type: "driverAssigned",
        title: "Driver Assigned",
        message: "A driver has been assigned and picked up your order.",
        relatedOrder: order._id,
      });
    }

    const farmer = await Farmer.findById(order.farmer).populate("user");
    if (farmer) {
      await createNotification({
        recipient: farmer.user._id,
        recipientRole: "farmer",
        type: "pickedUp",
        title: "Order Picked Up",
        message: "Your order has been picked up by the assigned driver.",
        relatedOrder: order._id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Driver assigned successfully",
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
