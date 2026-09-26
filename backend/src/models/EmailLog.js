import mongoose from "mongoose";

const emailLogSchema = new mongoose.Schema(
  {
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    recipientScope: {
      type: String,
      enum: ["single", "allCustomers", "allFarmers", "all"],
      required: true,
    },

    recipientUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

const EmailLog = mongoose.model("EmailLog", emailLogSchema);

export default EmailLog;
