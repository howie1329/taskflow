import { notificationOps } from '../db/operations/notifications.js';

export const notificationService = {
  async createNotification(notificationData) {
    return await notificationOps.create(notificationData);
  },

  async fetchNotificationsByUserId(userId) {
    return await notificationOps.findByUserId(userId);
  },

  async markNotificationAsRead(notificationId) {
    return await notificationOps.markAsRead(notificationId);
  },

  async deleteNotification(notificationId) {
    return await notificationOps.delete(notificationId);
  },

  async deleteNotificationIfRead() {
    return await notificationOps.deleteIfRead();
  }
};

