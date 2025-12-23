import express from "express";
import {
  fetchNotificationsByUserId,
  markNotificationAsRead,
  createNotification,
  deleteNotification,
} from "../../controllers/notifications.js";

const router = express.Router();

router.get("/user", fetchNotificationsByUserId);
router.patch("/:notificationId", markNotificationAsRead);
router.post("/create", createNotification);
router.delete("/:notificationId", deleteNotification);

export default router;
