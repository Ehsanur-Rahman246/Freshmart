import mongoose from "mongoose";

const zoneSchema = new mongoose.Schema(
  {
    zoneId: {
      type: String,
      required: true,
      unique: true,
      enum: ["Zone 1", "Zone 2", "Zone 3", "Zone 4", "Zone 5"],
    },

    label: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    districts: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],

    routes: [
      {
        toZone: {
          type: String,
          required: true,
          enum: ["Zone 1", "Zone 2", "Zone 3", "Zone 4", "Zone 5"],
        },

        minHours: {
          type: Number,
          required: true,
          min: 0,
        },

        maxHours: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Zone = mongoose.model("Zone", zoneSchema);

export default Zone;