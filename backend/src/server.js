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


const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({credentials: true}));

app.get('/', (_, res) => res.send("Server working"));
app.use('/api/auth', authRouter);
app.use('/api/customer', customerRouter);
app.use('/api/farmer', farmerRouter);
app.use('/api/farm', farmRouter); 
app.use("/api/product", productRouter);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server started on PORT:", PORT);
    });
});
