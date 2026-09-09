import "dotenv/config";
import express from "express";
import { connectDB } from "./config/db.js";
import cors from 'cors';
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoutes.js";
import customerRouter from "./routes/customerRoutes.js";
import farmerRouter from "./routes/farmerRoutes.js";
import farmRouter from "./routes/farmRoutes.js";
import productRouter from "./routes/productRoutes.js";
import cartRouter from "./routes/cartRoutes.js";
import orderRouter from "./routes/orderRoutes.js";


const app = express();

const PORT = process.env.PORT || 5000;
const allowedOrigins = process.env.CLIENT_URL?.split(",") || [];

app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowedOrigins, credentials: true}));

app.get('/', (_, res) => res.send("Server working"));
app.use('/api/auth', authRouter);
app.use('/api/customer', customerRouter);
app.use('/api/farmer', farmerRouter);
app.use('/api/farm', farmRouter); 
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server started on PORT:", PORT);
    });
});
