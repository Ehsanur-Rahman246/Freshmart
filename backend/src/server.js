import "dotenv/config";
import express from "express";
import { connectDB } from "./config/db.js";
import cors from 'cors';
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoutes.js";


const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({credentials: true}));

app.get('/', (_, res) => res.send("Server working"));
app.use('/api/auth', authRouter);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server started on PORT:", PORT);
    });
});
