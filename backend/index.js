import express from "express"
import path from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv"
import connectDB from "./config/connectDB.js"
dotenv.config();
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js"
import userRouter from "./routes/user.routes.js"
import jobRouter from "./routes/job.route.js"
import hiringRouter from "./routes/hiring.route.js"
import statsRouter from "./routes/stats.route.js"
import workRouter from "./routes/work.route.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url));

    
const app = express();
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));


app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/hiring", hiringRouter);
app.use("/api/stats", statsRouter);
app.use("/api/works", workRouter);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 6000;
connectDB().finally(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on the port ${PORT}`);
    });
});