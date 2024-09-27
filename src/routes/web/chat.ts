import { Request, Response, Router } from 'express';
import { validate } from '../../validators/validate';
import { ChatSessionSchema } from '../../validators/schemas/schemas';
import { createChatSession } from '../../controllers/chat';
import axios from 'axios';
import OpenAI from 'openai';

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

router.post('/prompt-gpt', async (req, res) => {
  const { userId, userMessage } = req.body;

  if (!userMessage) {
    return res.status(400).json({ error: 'User message is required' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a virtual stylist assistant.' },
        { role: 'user', content: userMessage },
      ],
    });

    const gptResponse = response.choices[0].message.content;
    return res.status(200).json({ userId, message: gptResponse });
  } catch (error) {
    console.error('Error connecting to OpenAI:', error);
    return res.status(500).json({ error: 'Error connecting to OpenAI' });
  }
});

export default router;
