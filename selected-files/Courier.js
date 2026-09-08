import mongoose from "mongoose";

const courierSchema = new mongoose.Schema(
  {
    courierCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    strength: {
      type: String,
      default: "",
      trim: true,
    },

    zonesCovered: [
      {
        type: String,
        enum: ["Zone 1", "Zone 2", "Zone 3", "Zone 4", "Zone 5"],
      },
    ],

    drivers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Driver",
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Courier = mongoose.model("Courier", courierSchema);

export default Courier;
