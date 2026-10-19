import express from "express";
import { chat, suggestions } from "../controllers/chatbot.controller.js";

const chatbotRouter = express.Router();

chatbotRouter.post("/chat", chat);
chatbotRouter.get("/suggestions", suggestions);

export default chatbotRouter;