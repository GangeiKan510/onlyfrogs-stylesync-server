import { Request, Response, Router } from 'express';
import { validate } from '../../validators/validate';
import { ChatSessionSchema } from '../../validators/schemas/schemas';
import { createChatSession } from '../../controllers/chat';

const router = Router();

router.post(
  '/create-session',
  validate(ChatSessionSchema),
  async (req: Request, res: Response, next) => {
    try {
      const chatSessionData = req.body;
      const result = await createChatSession(chatSessionData);

      if (result.status === 201) {
        res.status(201).json(result);
      } else if (result.status === 200) {
        res.status(200).json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Error creating chat session:', error);
      next(error);
    }
  }
);

export default router;
