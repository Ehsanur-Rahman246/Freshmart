import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    // Required for every review
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    // Filled for product reviews
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    // Filled for farm reviews
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      default: null,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  },
);

// One customer can review one product once per order
reviewSchema.index(
  {
    customer: 1,
    order: 1,
    product: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      product: {
        $exists: true,
        $ne: null,
      },
    },
  },
);

// One customer can review one farm once per order
reviewSchema.index(
  {
    customer: 1,
    order: 1,
    farm: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      farm: {
        $exists: true,
        $ne: null,
      },
    },
  },
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;
