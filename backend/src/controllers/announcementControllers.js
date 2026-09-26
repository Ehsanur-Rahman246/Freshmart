import mongoose from "mongoose";
import Announcement from "../models/Announcement.js";
import AnnouncementStatus from "../models/AnnouncementStatus.js";
import EmailLog from "../models/EmailLog.js";
import User from "../models/User.js";
import transporter from "../config/nodemailer.js";
import { emitToUser } from "../utils/realtime.js";
import pLimit from "p-limit";
import { announcementEmail } from "../utils/emailTemplates.js";
import PromoCode from "../models/PromoCode.js";

const scopeToRoleFilter = (audience) => {
  if (audience === "customer") return { role: "customer", isActive: true };
  if (audience === "farmer") return { role: "farmer", isActive: true };
  return { role: { $in: ["customer", "farmer"] }, isActive: true };
};

// ADMIN — create + broadcast
export const createAnnouncement = async (req, res) => {
  try {
    const { audience, title, message, promoCodeId } = req.body;

    if (!["customer", "farmer", "all"].includes(audience)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid audience" });
    }
    if (!title?.trim() || !message?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Title and message are required" });
    }

    let promoCode = null;

    if (promoCodeId) {
      if (!mongoose.Types.ObjectId.isValid(promoCodeId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid promo code" });
      }

      promoCode = await PromoCode.findById(promoCodeId).select("_id");

      if (!promoCode) {
        return res
          .status(404)
          .json({ success: false, message: "Promo code not found" });
      }
    }

    const announcement = await Announcement.create({
      audience,
      title: title.trim(),
      message: message.trim(),
      createdBy: req.user.userId,
      promoCode: promoCode ? promoCode._id : null,
    });

    await announcement.populate("promoCode", "code discountType discountValue");

    const recipients = await User.find(scopeToRoleFilter(audience)).select(
      "_id",
    );

    if (recipients.length > 0) {
      await AnnouncementStatus.insertMany(
        recipients.map((u) => ({
          announcement: announcement._id,
          user: u._id,
        })),
        { ordered: false },
      );
    }

    for (const u of recipients) {
      emitToUser(u._id, "announcement:new", announcement);
      emitToUser(u._id, "notification:new", {
        title: "New announcement",
        message: announcement.title,
      });
    }

    return res
      .status(201)
      .json({ success: true, message: "Announcement sent", announcement });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// ADMIN — history
export const getAnnouncementHistory = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate("createdBy", "name")
      .populate("promoCode", "code discountType discountValue")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, announcements });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// CUSTOMER/FARMER — my announcements (not deleted)
export const getMyAnnouncements = async (req, res) => {
  try {
    const statuses = await AnnouncementStatus.find({
      user: req.user.userId,
      isDeleted: false,
    })
      .populate({
        path: "announcement",
        populate: {
          path: "promoCode",
          select: "code discountType discountValue",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      announcements: statuses
        .filter((s) => s.announcement) // guard against a hard-deleted announcement doc
        .map((s) => ({
          statusId: s._id,
          isRead: s.isRead,
          ...s.announcement.toObject(),
        })),
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const markAnnouncementRead = async (req, res) => {
  try {
    const { statusId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(statusId)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const status = await AnnouncementStatus.findOneAndUpdate(
      { _id: statusId, user: req.user.userId },
      { $set: { isRead: true } },
      { returnDocument: "after" },
    );

    if (!status) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    return res.status(200).json({ success: true, message: "Marked as read" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const deleteMyAnnouncement = async (req, res) => {
  try {
    const { statusId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(statusId)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const status = await AnnouncementStatus.findOneAndUpdate(
      { _id: statusId, user: req.user.userId },
      { $set: { isDeleted: true } },
      { returnDocument: "after" },
    );

    if (!status) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    return res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// ADMIN — ad-hoc email (no in-app notification, just log + send)
export const sendAdminEmail = async (req, res) => {
  try {
    const { recipientScope, recipientUserId, subject, message } = req.body;

    if (
      !["single", "allCustomers", "allFarmers", "all"].includes(recipientScope)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid recipient scope" });
    }
    if (!subject?.trim() || !message?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Subject and message are required" });
    }

    let recipients = [];

    if (recipientScope === "single") {
      if (
        !recipientUserId ||
        !mongoose.Types.ObjectId.isValid(recipientUserId)
      ) {
        return res
          .status(400)
          .json({ success: false, message: "A valid recipient is required" });
      }
      const user = await User.findById(recipientUserId).select(
        "email name isActive",
      );
      if (!user || !user.isActive) {
        return res
          .status(404)
          .json({ success: false, message: "Recipient not found" });
      }
      recipients = [user];
    } else {
      const roleFilter =
        recipientScope === "allCustomers"
          ? { role: "customer" }
          : recipientScope === "allFarmers"
            ? { role: "farmer" }
            : { role: { $in: ["customer", "farmer"] } };

      recipients = await User.find({ ...roleFilter, isActive: true }).select(
        "email name",
      );
    }

    const limit = pLimit(10);

    const results = await Promise.allSettled(
      recipients.map((recipient) =>
        limit(() =>
          transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: recipient.email,
            subject: subject.trim(),
            html: announcementEmail({
              name: recipient.name,
              title: subject.trim(),
              message: message.trim(),
            }),
          }),
        ),
      ),
    );

    const sentCount = results.filter((r) => r.status === "fulfilled").length;

    results.forEach((r, i) => {
      if (r.status === "rejected") {
        console.error(
          `Failed to send admin email to ${recipients[i].email}:`,
          r.reason?.message,
        );
      }
    });

    await EmailLog.create({
      sentBy: req.user.userId,
      recipientScope,
      recipientUser: recipientScope === "single" ? recipients[0]._id : null,
      subject: subject.trim(),
      message: message.trim(),
    });

    return res.status(200).json({
      success: true,
      message: `Email sent to ${sentCount} recipient(s)`,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getEmailLog = async (req, res) => {
  try {
    const logs = await EmailLog.find()
      .populate("sentBy", "name")
      .populate("recipientUser", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, logs });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
