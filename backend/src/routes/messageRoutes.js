import express from "express";
import userAuth from "../middlewares/userAuth.js";
import roleAuth from "../middlewares/roleAuth.js";
import {
  openFarmerThread,
  openAdminThread,
  getMyConversations,
  getMessages,
  sendMessage,
  deleteMessage,
  reportConversation,
  setConversationBlock,
  getReportedConversations,
  clearConversationReport,
  deleteConversationForUser,
} from "../controllers/messageControllers.js";

const messageRouter = express.Router();

messageRouter.use(userAuth);

messageRouter.get("/conversations", getMyConversations);
messageRouter.post(
  "/conversations/farmer/:farmId",
  roleAuth("customer"),
  openFarmerThread,
);
messageRouter.post(
  "/conversations/admin",
  roleAuth("customer", "farmer"),
  openAdminThread,
);

messageRouter.get("/conversations/:conversationId/messages", getMessages);
messageRouter.post("/conversations/:conversationId/messages", sendMessage);
messageRouter.post(
  "/conversations/:conversationId/report",
  roleAuth("customer", "farmer"),
  reportConversation,
);

messageRouter.patch(
  "/admin/conversations/:conversationId/clear-report",
  roleAuth("admin"),
  clearConversationReport,
);

messageRouter.delete("/messages/:messageId", deleteMessage);
messageRouter.delete("/conversations/:conversationId", deleteConversationForUser);

messageRouter.get(
  "/admin/reported",
  roleAuth("admin"),
  getReportedConversations,
);
messageRouter.patch(
  "/admin/conversations/:conversationId/block",
  roleAuth("admin"),
  setConversationBlock,
);

export default messageRouter;
