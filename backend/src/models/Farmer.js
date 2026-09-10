import mongoose from "mongoose";

const farmerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    profileImage: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },

    isDemo: {
      type: Boolean,
      default: false,
    },

    farms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Farm",
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Farmer = mongoose.model("Farmer", farmerSchema);

export default Farmer;
