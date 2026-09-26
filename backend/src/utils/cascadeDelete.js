import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Farm from "../models/Farm.js";
import Customer from "../models/Customer.js";
import { deleteFromCloudinary } from "./uploadToCloudinary.js";
import {
  TERMINAL_STATUSES,
  ACTIVE_COMPANY_SALE_STAGES,
} from "./refundPolicy.js";

export const farmHasActiveWork = async (farmId) => {
  const [order, product] = await Promise.all([
    Order.exists({ farm: farmId, status: { $nin: TERMINAL_STATUSES } }),
    Product.exists({
      farm: farmId,
      companySaleStage: { $in: ACTIVE_COMPANY_SALE_STAGES },
    }),
  ]);

  return Boolean(order || product);
};

export const deleteFarmCascade = async (farm) => {
  const products = await Product.find({ farm: farm._id }).select("_id images");
  const productIds = products.map((p) => p._id);

  await Promise.all([
    ...products.flatMap((p) =>
      p.images.map((img) => deleteFromCloudinary(img.publicId)),
    ),
    ...(farm.images || []).map((img) => deleteFromCloudinary(img.publicId)),
  ]);

  if (productIds.length > 0) {
    await Product.deleteMany({ _id: { $in: productIds } });
    await Customer.updateMany(
      {},
      {
        $pull: {
          cart: { product: { $in: productIds } },
          wishlist: { $in: productIds },
        },
      },
    );
  }

  await Farm.findByIdAndDelete(farm._id);
};
