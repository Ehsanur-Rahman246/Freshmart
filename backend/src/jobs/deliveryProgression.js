import cron from "node-cron";
import Order from "../models/Order.js";
import Driver from "../models/Driver.js";
import Customer from "../models/Customer.js";
import Farmer from "../models/Farmer.js";
import Zone from "../models/Zone.js";
import createNotification from "../utils/createNotification.js";
import { recordSaleRevenue } from "../utils/recordRevenue.js";
import transporter from "../config/nodemailer.js";
import {
  HOUR_IN_MS,
  CRON_INTERVAL,
  DISPATCH_HOURS,
  DESTINATION_PROCESSING_HOURS,
  LOCAL_DELIVERY_HOURS,
  SAME_ZONE_TRANSIT_HOURS,
} from "../config/time.js";

const ACTIVE_STATUSES = [
  "pickedUp",
  "toOriginCenter",
  "inTransit",
  "toDestinationCenter",
  "outForDelivery",
];

const randomInRange = (min, max) => Math.random() * (max - min) + min;

const advanceOrder = async (order) => {
  const now = new Date();

  switch (order.status) {
    case "pickedUp": {
      order.status = "toOriginCenter";
      order.delivery.nextTransitionAt = new Date(
        now.getTime() + DISPATCH_HOURS * HOUR_IN_MS,
      );

      const farmer = await Farmer.findById(order.farmer).populate("user");
      if (farmer) {
        await createNotification({
          recipient: farmer.user._id,
          recipientRole: "farmer",
          type: "toOriginCenter",
          title: "Order En Route to Origin Center",
          message:
            "The order has left the farm and is heading to the origin zone center.",
          relatedOrder: order._id,
        });
      }
      break;
    }

    case "toOriginCenter": {
      order.status = "inTransit";

      const originZone = await Zone.findById(order.delivery.originZone);
      const destinationZone = await Zone.findById(
        order.delivery.destinationZone,
      );

      let hours;

      if (
        originZone &&
        destinationZone &&
        originZone._id.toString() === destinationZone._id.toString()
      ) {
        hours = randomInRange(
          SAME_ZONE_TRANSIT_HOURS.min,
          SAME_ZONE_TRANSIT_HOURS.max,
        );
      } else {
        const route = originZone?.routes.find(
          (r) => r.toZone === destinationZone?.zoneId,
        );

        hours = route
          ? randomInRange(route.minHours, route.maxHours)
          : randomInRange(
              SAME_ZONE_TRANSIT_HOURS.min,
              SAME_ZONE_TRANSIT_HOURS.max,
            );
      }

      order.delivery.nextTransitionAt = new Date(
        now.getTime() + hours * HOUR_IN_MS,
      );

      const customer = await Customer.findById(order.customer).populate("user");
      if (customer) {
        await createNotification({
          recipient: customer.user._id,
          recipientRole: "customer",
          type: "inTransit",
          title: "Order In Transit",
          message: "Your order is now in transit to your delivery zone.",
          relatedOrder: order._id,
        });
      }
      break;
    }

    case "inTransit": {
      order.status = "toDestinationCenter";
      order.delivery.nextTransitionAt = new Date(
        now.getTime() + DESTINATION_PROCESSING_HOURS * HOUR_IN_MS,
      );

      // Driver's currentZone updates now, on arrival at the destination
      // zone center.
      if (order.delivery.driver?.driverId) {
        const destinationZone = await Zone.findById(
          order.delivery.destinationZone,
        );
        if (destinationZone) {
          await Driver.updateOne(
            { _id: order.delivery.driver.driverId },
            { $set: { currentZone: destinationZone.zoneId } },
          );
        }
      }

      const customer = await Customer.findById(order.customer).populate("user");
      if (customer) {
        await createNotification({
          recipient: customer.user._id,
          recipientRole: "customer",
          type: "toDestinationCenter",
          title: "Order Arrived at Destination Center",
          message: "Your order has arrived at the destination zone center.",
          relatedOrder: order._id,
        });
      }
      break;
    }

    case "toDestinationCenter": {
      order.status = "outForDelivery";
      order.delivery.nextTransitionAt = new Date(
        now.getTime() + LOCAL_DELIVERY_HOURS * HOUR_IN_MS,
      );

      const customer = await Customer.findById(order.customer).populate("user");
      if (customer) {
        await createNotification({
          recipient: customer.user._id,
          recipientRole: "customer",
          type: "outForDelivery",
          title: "Out for Delivery",
          message: "Your order is out for delivery and will arrive soon.",
          relatedOrder: order._id,
        });
      }
      break;
    }

    case "outForDelivery": {
      order.status = "delivered";
      order.delivery.nextTransitionAt = null;

      if (order.payment.method === "cashOnDelivery") {
        order.payment.status = "paid";
      }

      if (order.delivery.driver?.driverId) {
        await Driver.updateOne(
          { _id: order.delivery.driver.driverId },
          { $set: { isAvailable: true } },
        );
      }

      const customer = await Customer.findById(order.customer).populate("user");
      if (customer) {
        await createNotification({
          recipient: customer.user._id,
          recipientRole: "customer",
          type: "delivered",
          title: "Order Delivered",
          message: "Your order has been delivered successfully.",
          relatedOrder: order._id,
        });

        if (customer.user.email) {
          try {
            await transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: customer.user.email,
              subject: "Your FreshMart Order Has Been Delivered",
              html: `
                <h2>Order Delivered</h2>
                <p>Hello ${customer.user.name || "Customer"},</p>
                <p>Your order <strong>${order.orderNumber}</strong> has been delivered successfully.</p>
                <p>Thank you for shopping with FreshMart!</p>
              `,
            });
          } catch (emailError) {
            console.error(
              "Failed to send order-delivered email (customer):",
              emailError,
            );
          }
        }
      }

      const farmer = await Farmer.findById(order.farmer).populate("user");
      if (farmer) {
        await createNotification({
          recipient: farmer.user._id,
          recipientRole: "farmer",
          type: "delivered",
          title: "Order Delivered",
          message:
            "An order from your farm has been delivered to the customer.",
          relatedOrder: order._id,
        });

        if (!order.isDemoOrder && farmer.user.email) {
          try {
            await transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: farmer.user.email,
              subject: "An Order From Your Farm Has Been Delivered",
              html: `
                <h2>Order Delivered</h2>
                <p>Hello ${farmer.user.name || "Farmer"},</p>
                <p>Order <strong>${order.orderNumber}</strong> has been delivered to the customer.</p>
                <p>Thank you for being part of FreshMart!</p>
              `,
            });
          } catch (emailError) {
            console.error(
              "Failed to send order-delivered email (farmer):",
              emailError,
            );
          }
        }
      }

      await recordSaleRevenue(order);

      break;
    }

    default:
      return;
  }

  await order.save();
};

export const startDeliveryScheduler = () => {
  cron.schedule(CRON_INTERVAL, async () => {
    try {
      const dueOrders = await Order.find({
        status: { $in: ACTIVE_STATUSES },
        "delivery.nextTransitionAt": { $lte: new Date() },
      });

      for (const order of dueOrders) {
        await advanceOrder(order);
      }
    } catch (error) {
      console.error("Delivery scheduler error:", error);
    }
  });

  console.log("Delivery scheduler started");
};
