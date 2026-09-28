import mongoose from "mongoose";
import Order from "../models/Order.js";
import Courier from "../models/Courier.js";
import Driver from "../models/Driver.js";
import Customer from "../models/Customer.js";
import { HOUR_IN_MS, LOCAL_PICKUP_HOURS } from "../config/time.js";
import Zone from "../models/Zone.js";
import { emitOrderStatusToCustomer } from "../utils/realtime.js";
import { notifyCustomer } from "../utils/notifyCustomer.js";

const ONGOING_STATUSES = [
  "readyForPickup",
  "pickedUp",
  "toOriginCenter",
  "inTransit",
  "toDestinationCenter",
  "outForDelivery",
];

export const getOngoingDeliveries = async (req, res) => {
  try {
    const orders = await Order.find({ status: { $in: ONGOING_STATUSES } })
      .populate({
        path: "customer",
        select: "user",
        populate: { path: "user", select: "name" },
      })
      .populate({
        path: "farmer",
        select: "user",
        populate: { path: "user", select: "name" },
      })
      .populate("farm", "name location")
      .populate("delivery.originZone")
      .populate("delivery.destinationZone")
      .populate("delivery.courier", "name courierCode")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const tryAutoAssignDriver = async (order) => {
  try {
    if (order.status !== "readyForPickup" || order.delivery.courier) {
      return false;
    }

    const originZone = await Zone.findById(order.delivery.originZone);
    const destinationZone = await Zone.findById(order.delivery.destinationZone);

    if (!originZone || !destinationZone) {
      return false;
    }

    const originZoneId = originZone.zoneId;
    const destinationZoneId = destinationZone.zoneId;

    const couriers = await Courier.find({
      zonesCovered: { $all: [originZoneId, destinationZoneId] },
    });

    const courierIds = couriers.map((courier) => courier._id);

    const driver = await Driver.findOneAndUpdate(
      {
        courier: { $in: courierIds },
        currentZone: originZoneId,
        isAvailable: true,
      },
      { $set: { isAvailable: false } }, // atomic claim
      { returnDocument: "after" },
    );

    if (!driver) return false;

    const assigned = await Order.findOneAndUpdate(
      { _id: order._id, status: "readyForPickup", "delivery.courier": null },
      {
        $set: {
          status: "pickedUp",
          "delivery.courier": driver.courier,
          "delivery.driver": {
            driverId: driver._id,
            name: driver.name,
            phone: driver.phone,
          },
          "delivery.nextTransitionAt": new Date(
            Date.now() + LOCAL_PICKUP_HOURS * HOUR_IN_MS,
          ),
        },
      },
      { returnDocument: "after" },
    );

    if (!assigned) {
      await Driver.updateOne(
        { _id: driver._id },
        { $set: { isAvailable: true } },
      );
      return false;
    }

    // keep the caller's in-memory doc in sync
    order.set({
      status: assigned.status,
      delivery: assigned.toObject().delivery,
    });

    await emitOrderStatusToCustomer(order);

    const customer = await Customer.findById(order.customer).populate("user");
    if (customer) {
      await notifyCustomer(order.customer, {
        type: "driverAssigned",
        title: "Driver Assigned",
        message: "A driver has been assigned and picked up your order.",
        relatedOrder: order._id,
      });
    }

    return true;
  } catch (error) {
    console.error("tryAutoAssignDriver error:", error);

    return false;
  }
};

export const getOrdersAwaitingAssignment = async (req, res) => {
  try {
    const orders = await Order.find({
      status: "readyForPickup",
      "delivery.courier": null,
    })
      .populate({
        path: "customer",
        select: "user",
        populate: { path: "user", select: "name" },
      })
      .populate({
        path: "farmer",
        select: "user",
        populate: { path: "user", select: "name" },
      })
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
      "delivery.originZone delivery.destinationZone",
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const originZoneId = order.delivery.originZone.zoneId;
    const destinationZoneId = order.delivery.destinationZone.zoneId;

    const couriers = await Courier.find({
      zonesCovered: { $all: [originZoneId, destinationZoneId] },
    });

    const courierIds = couriers.map((courier) => courier._id);

    const drivers = await Driver.find({
      courier: { $in: courierIds },
      currentZone: originZoneId,
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

    const order = await Order.findById(orderId).populate("delivery.originZone");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.status !== "readyForPickup") {
      return res.status(400).json({
        success: false,
        message: "Order is not ready for driver assignment",
      });
    }

    if (order.payment.method === "online" && order.payment.status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment must be completed before this order can be picked up",
      });
    }

    if (order.delivery.courier) {
      return res.status(400).json({
        success: false,
        message: "A driver has already been assigned to this order",
      });
    }

    const driver = await Driver.findOneAndUpdate(
      {
        _id: driverId,
        isAvailable: true,
        currentZone: order.delivery.originZone.zoneId,
      },
      { $set: { isAvailable: false } },
      { returnDocument: "after" },
    );

    if (!driver) {
      const exists = await Driver.exists({ _id: driverId });
      return res.status(exists ? 400 : 404).json({
        success: false,
        message: exists
          ? "This driver is not currently available"
          : "Driver not found",
      });
    }

    const assigned = await Order.findOneAndUpdate(
      { _id: orderId, status: "readyForPickup", "delivery.courier": null },
      {
        $set: {
          status: "pickedUp",
          "delivery.courier": driver.courier,
          "delivery.driver": {
            driverId: driver._id,
            name: driver.name,
            phone: driver.phone,
          },
          "delivery.nextTransitionAt": new Date(
            Date.now() + LOCAL_PICKUP_HOURS * HOUR_IN_MS,
          ),
        },
      },
      { returnDocument: "after" },
    );

    if (!assigned) {
      await Driver.updateOne(
        { _id: driver._id },
        { $set: { isAvailable: true } },
      );
      return res.status(409).json({
        success: false,
        message: "This order is no longer awaiting a driver",
      });
    }

    order.set({
      status: assigned.status,
      delivery: assigned.toObject().delivery,
    });

    await emitOrderStatusToCustomer(order);

    const customer = await Customer.findById(order.customer).populate("user");
    if (customer) {
      await notifyCustomer(order.customer, {
        type: "driverAssigned",
        title: "Driver Assigned",
        message: "A driver has been assigned and picked up your order.",
        relatedOrder: order._id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Driver assigned successfully",
      order: assigned,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
