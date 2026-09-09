import mongoose from "mongoose";

const orderCounterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },

  sequence: {
    type: Number,
    default: 0,
  },
});

const OrderCounter = mongoose.model("OrderCounter", orderCounterSchema);

export default OrderCounter;