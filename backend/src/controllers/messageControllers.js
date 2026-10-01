import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Customer from "../models/Customer.js";
import Farmer from "../models/Farmer.js";
import Farm from "../models/Farm.js";
import { notifyFarmer } from "../utils/notifyFarmer.js";
import { notifyCustomer } from "../utils/notifyCustomer.js";
import notifyAdmin from "../utils/notifyAdmin.js";
import { emitToUser, emitToAdmins } from "../utils/realtime.js";

const asCustomer = (req) => Customer.findOne({ user: req.user.userId });
const asFarmer = (req) => Farmer.findOne({ user: req.user.userId });

// CUSTOMER -> open/get thread with a farmer (via a farm), optionally tag an order
export const openFarmerThread = async (req, res) => {
  try {
    const { farmId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid farm ID" });
    }

    const customer = await asCustomer(req);
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer profile not found" });
    }

    const farm = await Farm.findById(farmId).select("farmer");
    if (!farm) {
      return res
        .status(404)
        .json({ success: false, message: "Farm not found" });
    }

    const conversation = await Conversation.findOneAndUpdate(
      { type: "customerFarmer", customer: customer._id, farmer: farm.farmer },
      {
        $setOnInsert: {
          type: "customerFarmer",
          customer: customer._id,
          farmer: farm.farmer,
        },
      },
      { upsert: true, returnDocument: "after" },
    );

    return res.status(200).json({ success: true, conversation });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// CUSTOMER or FARMER or ADMIN -> open/get my thread with admin
export const openAdminThread = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "Admins reply within a user's thread, not open their own",
      });
    }

    const conversation = await Conversation.findOneAndUpdate(
      { type: "userAdmin", user: req.user.userId },
      { $setOnInsert: { type: "userAdmin", user: req.user.userId } },
      { upsert: true, returnDocument: "after" },
    );

    return res.status(200).json({ success: true, conversation });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// list my conversations (customer/farmer: their own; admin: all userAdmin threads)
export const getMyConversations = async (req, res) => {
  try {
    let filter;

    if (req.user.role === "admin") {
      filter = { type: "userAdmin" };
    } else if (req.user.role === "customer") {
      const customer = await asCustomer(req);
      if (!customer)
        return res
          .status(404)
          .json({ success: false, message: "Customer profile not found" });
      filter = {
        $or: [
          { type: "customerFarmer", customer: customer._id },
          { type: "userAdmin", user: req.user.userId },
        ],
      };
    } else {
      const farmer = await asFarmer(req);
      if (!farmer)
        return res
          .status(404)
          .json({ success: false, message: "Farmer profile not found" });
      filter = {
        $or: [
          { type: "customerFarmer", farmer: farmer._id },
          { type: "userAdmin", user: req.user.userId },
        ],
      };
    }

    const conversations = await Conversation.find(filter)
      .populate({
        path: "customer",
        select: "user profileImage",
        populate: { path: "user", select: "name" },
      })
      .populate({
        path: "farmer",
        select: "user profileImage",
        populate: { path: "user", select: "name" },
      })
      .populate("user", "name role")
      .sort({ lastMessageAt: -1 });

    const unreadCounts = await Message.aggregate([
      {
        $match: {
          conversation: { $in: conversations.map((c) => c._id) },
          sender: { $ne: new mongoose.Types.ObjectId(req.user.userId) },
          readAt: null,
        },
      },
      { $group: { _id: "$conversation", count: { $sum: 1 } } },
    ]);

    const unreadMap = new Map(
      unreadCounts.map((r) => [r._id.toString(), r.count]),
    );

    return res.status(200).json({
      success: true,
      conversations: conversations.map((c) => ({
        ...c.toObject(),
        unreadCount: unreadMap.get(c._id.toString()) || 0,
      })),
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const notifyReadReceipt = async (conversation, reader) => {
  const payload = { conversationId: conversation._id.toString() };

  if (conversation.type === "userAdmin") {
    if (reader.role === "admin") {
      emitToUser(conversation.user, "message:read", payload);
    } else {
      emitToAdmins("message:read", payload);
    }
    return;
  }

  if (reader.role === "customer") {
    const farmer = await Farmer.findById(conversation.farmer).select("user");
    emitToUser(farmer?.user, "message:read", payload);
  } else {
    const customer = await Customer.findById(conversation.customer).select(
      "user",
    );
    emitToUser(customer?.user, "message:read", payload);
  }
};

const canAccessConversation = async (req, conversation) => {
  if (req.user.role === "admin") {
    return conversation.type === "userAdmin" || conversation.reported === true;
  }

  if (conversation.type === "userAdmin") {
    return conversation.user.toString() === req.user.userId;
  }

  if (req.user.role === "customer") {
    const customer = await asCustomer(req);
    return (
      customer && conversation.customer.toString() === customer._id.toString()
    );
  }

  if (req.user.role === "farmer") {
    const farmer = await asFarmer(req);
    return farmer && conversation.farmer.toString() === farmer._id.toString();
  }

  return false;
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid conversation ID" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }

    if (!(await canAccessConversation(req, conversation))) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const messages = await Message.find({
      conversation: conversationId,
      deletedFor: { $ne: req.user.userId },
    })
      .populate("sender", "name role")
      .populate("relatedOrder", "orderNumber")
      .sort({ createdAt: 1 });

    const shouldMarkRead =
      req.user.role !== "admin" || conversation.type === "userAdmin";

    if (shouldMarkRead) {
      const result = await Message.updateMany(
        {
          conversation: conversationId,
          sender: { $ne: req.user.userId },
          readAt: null,
        },
        { $set: { readAt: new Date() } },
      );

      if (result.modifiedCount > 0) {
        await notifyReadReceipt(conversation, req.user);
      }
    }
    return res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text, relatedOrder } = req.body;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid conversation ID" });
    }

    const textValue = String(text ?? "").trim();

    if (!text || !textValue) {
      return res
        .status(400)
        .json({ success: false, message: "Message text is required" });
    }

    if (relatedOrder && !mongoose.Types.ObjectId.isValid(relatedOrder)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order ID" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }

    if (!(await canAccessConversation(req, conversation))) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    if (conversation.type === "customerFarmer" && req.user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admins cannot post directly in customer-farmer conversations",
      });
    }

    if (conversation.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "This conversation has been blocked",
      });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user.userId,
      senderRole: req.user.role,
      text: text.trim(),
      relatedOrder: relatedOrder || null,
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

    const populated = await message.populate("sender", "name role");

    // notify + realtime push to the other side(s)
    if (conversation.type === "userAdmin") {
      if (req.user.role === "admin") {
        emitToUser(conversation.user, "message:new", populated);
        // no Notification model entry per-message spam; one generic "unread messages" ping
        emitToUser(conversation.user, "notification:new", {
          title: "New message",
          message: "You have unread messages",
        });
      } else {
        emitToAdmins("message:new", populated);
        await notifyAdmin({
          type: "newMessage",
          title: "New message",
          message: "You have unread messages",
        });
      }
    } else {
      // customerFarmer
      if (req.user.role === "customer") {
        const farmer = await Farmer.findById(conversation.farmer).select(
          "user",
        );
        emitToUser(farmer?.user, "message:new", populated);
        await notifyFarmer(conversation.farmer, {
          type: "newMessage",
          title: "New message",
          message: "You have unread messages",
        });
      } else {
        const customer = await Customer.findById(conversation.customer).select(
          "user",
        );
        emitToUser(customer?.user, "message:new", populated);
        await notifyCustomer(conversation.customer, {
          type: "newMessage",
          title: "New message",
          message: "You have unread messages",
        });
      }
    }

    return res.status(201).json({ success: true, message: populated });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid message ID" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    const conversation = await Conversation.findById(message.conversation);
    if (!conversation || !(await canAccessConversation(req, conversation))) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const isAuthor = message.sender.toString() === req.user.userId;
    const isAdmin = req.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages",
      });
    }

    await Message.findByIdAndDelete(messageId);

    const payload = {
      conversationId: conversation._id.toString(),
      messageId,
    };

    if (conversation.type === "userAdmin") {
      if (req.user.role === "admin") {
        emitToUser(conversation.user, "message:deleted", payload);
      } else {
        emitToAdmins("message:deleted", payload);
      }
    } else if (isAuthor) {
      if (req.user.role === "customer") {
        const farmer = await Farmer.findById(conversation.farmer).select(
          "user",
        );
        emitToUser(farmer?.user, "message:deleted", payload);
      } else if (req.user.role === "farmer") {
        const customer = await Customer.findById(conversation.customer).select(
          "user",
        );
        emitToUser(customer?.user, "message:deleted", payload);
      }
    }

    return res.status(200).json({ success: true, message: "Message deleted" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// customer or farmer reports a customerFarmer conversation to admin
export const reportConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid conversation ID" });
    }

    if (!reason || !reason.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "A reason is required" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || conversation.type !== "customerFarmer") {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }

    if (!(await canAccessConversation(req, conversation))) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    conversation.reported = true;
    conversation.reportReason = reason.trim().slice(0, 300);
    conversation.reportedBy = req.user.userId;
    conversation.reportedAt = new Date();
    await conversation.save();

    await notifyAdmin({
      type: "conversationReported",
      title: "Conversation Reported",
      message: `A ${req.user.role} reported a conversation: ${reason.trim().slice(0, 300)}`,
    });

    return res
      .status(200)
      .json({ success: true, message: "Reported to admin" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// ADMIN — block/unblock a customerFarmer conversation
export const setConversationBlock = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { blocked } = req.body;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid conversation ID" });
    }

    if (typeof blocked !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "blocked (true or false) is required",
      });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || conversation.type !== "customerFarmer") {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }

    conversation.status = blocked ? "blocked" : "open";
    await conversation.save();

    return res.status(200).json({
      success: true,
      message: blocked ? "Conversation blocked" : "Conversation unblocked",
      conversation,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// ADMIN — list reported conversations
export const getReportedConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      $or: [{ reported: true }, { status: "blocked" }],
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
      .populate("reportedBy", "name role")
      .sort({ updatedAt: -1 });

    return res.status(200).json({ success: true, conversations });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// messageControllers.js
export const clearConversationReport = async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid conversation ID" });
    }

    const conversation = await Conversation.findOneAndUpdate(
      { _id: conversationId, type: "customerFarmer" },
      {
        $set: { reported: false },
        $unset: { reportReason: "", reportedBy: "", reportedAt: "" },
      },
      { returnDocument: "after" },
    );

    if (!conversation) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Report cleared", conversation });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// delete an entire conversation from the caller's own view (soft, per-user)
export const deleteConversationForUser = async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid conversation ID" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }

    if (!(await canAccessConversation(req, conversation))) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    await Message.updateMany(
      {
        conversation: conversationId,
        deletedFor: { $ne: req.user.userId },
      },
      { $push: { deletedFor: req.user.userId } },
    );

    return res
      .status(200)
      .json({ success: true, message: "Conversation deleted" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
