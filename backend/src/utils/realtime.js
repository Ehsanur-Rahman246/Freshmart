import { getIO } from "../config/socket.js";
import Customer from "../models/Customer.js";
import Farmer from "../models/Farmer.js";

export const emitToUser = (userId, event, payload) => {
  const io = getIO();
  if (!io || !userId) return;
  console.log("emitToUser ->", `user:${userId}`, event);
  io.to(`user:${userId}`).emit(event, payload);
};

export const emitToAdmins = (event, payload) => {
  const io = getIO();
  if (!io) return;
  io.to("admins").emit(event, payload);
};

export const emitOrderStatusToCustomer = async (order) => {
  const payload = {
    orderId: order._id.toString(),
    newStatus: order.status,
    nextTransitionAt: order.delivery?.nextTransitionAt ?? null,
  };

  const customer = await Customer.findById(order.customer).select("user");
  if (customer) {
    emitToUser(customer.user, "order:statusChanged", payload);
  }

  const farmer = await Farmer.findById(order.farmer).select("user");
  if (farmer) {
    emitToUser(farmer.user, "order:statusChanged", payload);
  }

  emitToAdmins("order:statusChanged", payload);
};
