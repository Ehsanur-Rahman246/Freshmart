import express from "express";
import userAuth from "../middlewares/userAuth.js";
import roleAuth from "../middlewares/roleAuth.js";
import {
  createAnnouncement,
  getAnnouncementHistory,
  getMyAnnouncements,
  markAnnouncementRead,
  deleteMyAnnouncement,
  sendAdminEmail,
  getEmailLog,
} from "../controllers/announcementControllers.js";

const announcementRouter = express.Router();

announcementRouter.use(userAuth);

announcementRouter.get("/", roleAuth("customer", "farmer"), getMyAnnouncements);
announcementRouter.patch(
  "/:statusId/read",
  roleAuth("customer", "farmer"),
  markAnnouncementRead,
);
announcementRouter.delete(
  "/:statusId",
  roleAuth("customer", "farmer"),
  deleteMyAnnouncement,
);

announcementRouter.post("/admin", roleAuth("admin"), createAnnouncement);
announcementRouter.get(
  "/admin/history",
  roleAuth("admin"),
  getAnnouncementHistory,
);
announcementRouter.post("/admin/email", roleAuth("admin"), sendAdminEmail);
announcementRouter.get("/admin/email-log", roleAuth("admin"), getEmailLog);

export default announcementRouter;
