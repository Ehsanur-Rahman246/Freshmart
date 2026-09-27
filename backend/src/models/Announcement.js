import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    audience: {
      type: String,
      enum: ["customer", "farmer", "all"],
      required: true,
    },

    title: { type: String, required: true, trim: true, maxlength: 150 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },

    promoCode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PromoCode",
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;
