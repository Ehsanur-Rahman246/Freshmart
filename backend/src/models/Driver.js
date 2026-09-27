import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
  {
    courier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Courier",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    currentZone: {
      type: String,
      required: true,
      enum: ["Zone 1", "Zone 2", "Zone 3", "Zone 4", "Zone 5"],
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Driver = mongoose.model("Driver", driverSchema);

export default Driver;
