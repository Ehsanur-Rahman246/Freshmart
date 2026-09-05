import OrderCounter from "../models/OrderCounter.js";

const generateOrderNumber = async () => {
  const counter = await OrderCounter.findOneAndUpdate(
    { name: "order" },
    { $inc: { sequence: 1 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  return `FM-${String(counter.sequence).padStart(8, "0")}`;
};

export default generateOrderNumber;