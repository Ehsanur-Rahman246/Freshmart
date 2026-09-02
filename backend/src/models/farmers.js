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
      type: String,
      default: null,
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
