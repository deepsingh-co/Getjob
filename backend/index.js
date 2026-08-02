import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/connectDB.js"
dotenv.config();
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js"

    
const app = express();
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

const PORT = process.env.PORT || 6000;

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);

app.listen(PORT , () =>{
    console.log(`Server is running on port ${PORT}`);
    connectDB();
})