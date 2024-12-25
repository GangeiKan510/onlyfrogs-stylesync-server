import prisma from '../../src/controllers/db';
import {
  createNotification,
  markNotificationAsRead,
  deleteAllNotifications,
} from '../../src/controllers/notification';

jest.mock('../../src/controllers/db', () => ({
  notification: {
    create: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
  },
}));

describe('Notifications Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createNotification', () => {
    it('should create a new notification successfully', async () => {
      const mockNotificationData = {
        id: 'notification-123',
        user_id: 'user-123',
        type: 'INFO',
        content: 'This is a test notification',
      };

      (prisma.notification.create as jest.Mock).mockResolvedValue(
        mockNotificationData
      );

      const result = await createNotification({
        user_id: 'user-123',
        type: 'INFO',
        content: 'This is a test notification',
      });

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          user_id: 'user-123',
          type: 'INFO',
          content: 'This is a test notification',
        },
      });

      expect(result).toEqual(mockNotificationData);
    });

    it('should throw an error when creation fails', async () => {
      (prisma.notification.create as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(
        createNotification({
          user_id: 'user-123',
          type: 'INFO',
          content: 'This is a test notification',
        })
      ).rejects.toThrow('Database error');
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark a notification as read successfully', async () => {
      const mockUpdatedNotification = {
        id: 'notification-123',
        isRead: true,
      };

      (prisma.notification.update as jest.Mock).mockResolvedValue(
        mockUpdatedNotification
      );

      const result = await markNotificationAsRead('notification-123');

      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: {
          id: 'notification-123',
        },
        data: {
          isRead: true,
        },
      });

      expect(result).toEqual(mockUpdatedNotification);
    });

    it('should throw an error when marking notification fails', async () => {
      (prisma.notification.update as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(markNotificationAsRead('notification-123')).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('deleteAllNotifications', () => {
    it('should delete all notifications for a user successfully', async () => {
      const mockDeletedNotifications = { count: 3 };

      (prisma.notification.deleteMany as jest.Mock).mockResolvedValue(
        mockDeletedNotifications
      );

      const result = await deleteAllNotifications('user-123');

      expect(prisma.notification.deleteMany).toHaveBeenCalledWith({
        where: {
          user_id: 'user-123',
        },
      });

      expect(result).toEqual(mockDeletedNotifications);
    });

    it('should throw an error when deleting notifications fails', async () => {
      (prisma.notification.deleteMany as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(deleteAllNotifications('user-123')).rejects.toThrow(
        'Database error'
      );
    });
  });
});
