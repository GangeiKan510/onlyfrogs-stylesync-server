import { Router, Request, Response, NextFunction } from 'express';
import { validate } from '../../validators/validate';
import { markNotificationAsRead } from '../../controllers/notification';
import { ReadNotificationSchema } from '../../validators/schemas/schemas';

const router = Router();

router.post(
  '/read-notification',
  validate(ReadNotificationSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { notificationId } = req.body;

      if (!notificationId) {
        return res.status(400).json({ error: 'Notification ID is required' });
      }

      const updatedNotification = await markNotificationAsRead(notificationId);

      res.status(200).json({
        message: 'Notification marked as read successfully',
        data: updatedNotification,
      });
    } catch (error) {
      console.error('Error in /read-notification route:', error);
      next(error);
    }
  }
);

router.get('/', (req: Request, res: Response) => {
  res.send('Notification API');
});

export default router;
