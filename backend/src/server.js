import "dotenv/config";
import dns from "dns";
import express from "express";
import { connectDB } from "./config/db.js";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoutes.js";
import customerRouter from "./routes/customerRoutes.js";
import farmerRouter from "./routes/farmerRoutes.js";
import farmRouter from "./routes/farmRoutes.js";
import productRouter from "./routes/productRoutes.js";
import cartRouter from "./routes/cartRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import reviewRouter from "./routes/reviewRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import deliveryRouter from "./routes/deliveryRoutes.js";
import { startDeliveryScheduler } from "./jobs/deliveryProgression.js";
import { startDemoFarmerScheduler } from "./jobs/demoFarmerAutomation.js";
import { startDemoCustomerScheduler } from "./jobs/demoCustomerAutomation.js";
import { multerErrorHandling } from "./middlewares/multerError.middleware.js";
import { startRestockProcessingScheduler } from "./jobs/restockProcessing.js";
import { startDriverShuffleScheduler } from "./jobs/driverShuffle.js";
import { globalRateLimit } from "./middlewares/rateLimit.middleware.js";
import { startPaymentExpiryScheduler } from "./jobs/paymentExpiry.js";
import zoneRouter from "./routes/zoneRoutes.js";
import { createServer } from "http";
import { initSocket } from "./config/socket.js";
import messageRouter from "./routes/messageRoutes.js";
import announcementRouter from "./routes/announcementRoutes.js";
import pricingRouter from "./routes/pricingRoutes.js";
import promoCodeRouter from "./routes/promoCodeRoutes.js";

dns.lookup("smtp.gmail.com", { all: true }, (err, addresses) => {
  console.log("GMAIL DNS:", err || addresses);
});

const app = express();
const __dirname = path.resolve();

const PORT = process.env.PORT || 5000;
const allowedOrigins = process.env.CLIENT_URL?.split(",") || [];

app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(globalRateLimit);

if (process.env.NODE_ENV !== "production") {
  app.get("/", (_, res) => res.send("Server working"));
}

app.use("/api/auth", authRouter);
app.use("/api/customer", customerRouter);
app.use("/api/farmer", farmerRouter);
app.use("/api/farm", farmRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/admin", adminRouter);
app.use("/api/delivery", deliveryRouter);
app.use("/api/zones", zoneRouter);
app.use("/api/messages", messageRouter);
app.use("/api/announcements", announcementRouter);
app.use("/api/pricing", pricingRouter);
app.use("/api/promo-codes", promoCodeRouter);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("/{*splat}", (_, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

app.use((_, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(multerErrorHandling);
app.use((err, _, res, __) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const httpServer = createServer(app);
initSocket(httpServer);

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log("Server started on PORT:", PORT);
    startDeliveryScheduler();
    startDemoFarmerScheduler();
    startDemoCustomerScheduler();
    startRestockProcessingScheduler();
    startDriverShuffleScheduler();
    startPaymentExpiryScheduler();
  });
});
