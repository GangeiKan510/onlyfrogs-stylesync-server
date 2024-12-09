import prisma from './db';

interface NotificationProps {
  user_id: string;
  type: string; // Type of notification: "INFO", "WARNING", "SUCCESS", "ERROR"
  content: string;
}

export const createNotification = async (body: NotificationProps) => {
  try {
    const newNotification = await prisma.notification.create({
      data: {
        user_id: body.user_id,
        type: body.type,
        content: body.content,
      },
    });

    return newNotification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};
