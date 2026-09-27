import mongoose from "mongoose";

const priceLedgerSchema = new mongoose.Schema(
  {
    // set for per-product price changes (e.g. a range update clamping this product)
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
      index: true,
    },

    // always set — lets an entry display/group even when `product` is null
    // (a "rangeDeleted" event isn't tied to one specific product)
    productName: { type: String, required: true, trim: true },

    // null only for "rangeDeleted", which has no price to show
    oldPrice: { type: Number, default: null },
    newPrice: { type: Number, default: null },

    rangeMin: { type: Number, default: null },
    rangeMax: { type: Number, default: null },

    reason: {
      type: String,
      enum: ["adminRangeClamp", "rangeDeleted", "rangeCreated", "rangeUpdated"],
      required: true,
    },
  },
  { timestamps: true },
);

const PriceLedger = mongoose.model("PriceLedger", priceLedgerSchema);

export default PriceLedger;
