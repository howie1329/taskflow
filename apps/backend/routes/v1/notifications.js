import express from "express";
import {
  fetchNotificationsByUserId,
  markNotificationAsRead,
  createNotification,
  deleteNotification,
} from "../../controllers/notifications.js";
import { validate } from "../../middleware/validation.js";
import {
  createNotificationSchema,
  notificationParamsSchema,
} from "../../validation/schemas.js";

const router = express.Router();

router.get("/user", fetchNotificationsByUserId);
router.patch("/:notificationId", validate(notificationParamsSchema), markNotificationAsRead);
router.post("/create", validate(createNotificationSchema), createNotification);
router.delete("/:notificationId", validate(notificationParamsSchema), deleteNotification);

export default router;
