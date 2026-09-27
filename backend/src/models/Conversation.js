import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["customerFarmer", "userAdmin"],
      required: true,
    },

    // customerFarmer only
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farmer",
      default: null,
    },

    // userAdmin only — the non-admin party
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: ["open", "blocked"],
      default: "open",
    },

    reported: {
      type: Boolean,
      default: false,
    },

    reportReason: {
      type: String,
      default: null,
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reportedAt: {
      type: Date,
      default: null,
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

conversationSchema.index(
  { type: 1, customer: 1, farmer: 1 },
  { unique: true, partialFilterExpression: { type: "customerFarmer" } },
);
conversationSchema.index(
  { type: 1, user: 1 },
  { unique: true, partialFilterExpression: { type: "userAdmin" } },
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
