import { notificationService } from "../services/notifications.js";
import { BaseOperationHandler } from "./base.js";

export const fetchNotificationsByUserId = async (req, res) => {
  return await BaseOperationHandler(req, res, async (req) => {
    const userId = req.userId;
    const notifications =
      await notificationService.fetchNotificationsByUserId(userId);
    return notifications;
  });
};

export const markNotificationAsRead = async (req, res) => {
  return await BaseOperationHandler(req, res, async (req) => {
    const { notificationId } = req.params;
    const notification =
      await notificationService.markNotificationAsRead(notificationId);

    if (!notification) {
      const error = new Error("Notification not found");
      error.statusCode = 404;
      throw error;
    }

    return notification;
  });
};

export const createNotification = async (req, res) => {
  return await BaseOperationHandler(req, res, async (req) => {
    const notificationData = req.body;
    const notification =
      await notificationService.createNotification(notificationData);
    return notification;
  });
};

export const deleteNotification = async (req, res) => {
  return await BaseOperationHandler(req, res, async (req) => {
    const { notificationId } = req.params;
    const notification =
      await notificationService.deleteNotification(notificationId);

    if (!notification) {
      const error = new Error("Notification not found");
      error.statusCode = 404;
      throw error;
    }

    return notification;
  });
};
