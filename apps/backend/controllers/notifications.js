import { notificationService } from "../services/notifications.js";

export const fetchNotificationsByUserId = async (req, res) => {
  try {
    const userId = req.userId;
    const notifications = await notificationService.fetchNotificationsByUserId(
      userId
    );

    return res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      data: notifications,
    });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await notificationService.markNotificationAsRead(
      notificationId
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    console.error("Mark notification read error:", error);
    return res
      .status(500)
      .json({ error: "Failed to mark notification as read" });
  }
};

export const createNotification = async (req, res) => {
  try {
    const notificationData = req.body;
    const notification = await notificationService.createNotification(
      notificationData
    );

    return res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: notification,
    });
  } catch (error) {
    console.error("Create notification error:", error);
    return res.status(500).json({ error: "Failed to create notification" });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await notificationService.deleteNotification(
      notificationId
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
      data: notification,
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    return res.status(500).json({ error: "Failed to delete notification" });
  }
};
