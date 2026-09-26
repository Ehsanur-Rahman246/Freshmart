import mongoose from "mongoose";

const announcementStatusSchema = new mongoose.Schema(
  {
    announcement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Announcement",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    isRead: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

announcementStatusSchema.index({ announcement: 1, user: 1 }, { unique: true });

const AnnouncementStatus = mongoose.model(
  "AnnouncementStatus",
  announcementStatusSchema,
);

export default AnnouncementStatus;
