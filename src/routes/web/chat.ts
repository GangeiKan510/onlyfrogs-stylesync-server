import { Request, Response, Router } from 'express';
import { validate } from '../../validators/validate';
import { ChatSessionSchema } from '../../validators/schemas/schemas';
import { createChatSession, retrieveSessionChat } from '../../controllers/chat';
import OpenAI from 'openai';
import { sendMessage } from '../../controllers/chat';
import { getUserById } from '../../controllers/user';

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

router.post('/prompt-gpt', async (req: Request, res: Response) => {
  const { userId, userMessage } = req.body;

  if (!userMessage) {
    return res.status(400).json({ error: 'User message is required' });
  }

  try {
    const userResult = await getUserById(userId);

    if (userResult.status !== 200) {
      return res.status(userResult.status).json(userResult);
    }

    const user = userResult.user;

    const saveUserMessageResult = await sendMessage(
      userId,
      userMessage,
      'user'
    );

    if (saveUserMessageResult.status !== 200) {
      return res
        .status(saveUserMessageResult.status)
        .json(saveUserMessageResult);
    }

    const previousMessages =
      user?.chat_ession?.messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })) ?? [];

    console.log(user);

    const systemMessageContent = `
      You are a virtual stylist assistant named Ali.
      Always suggest clothes from user's closet and based on their preference:
      - Style preferences: ${user?.style_preferences.join(', ')}
      - Favorite colors: ${user?.favorite_colors.join(', ')}
      - Preferred brands: ${user?.preferred_brands.join(', ')}
      - Body type: ${user?.body_type}
      - Season: ${user?.season}
      - Budget: ${user?.budget_min} - ${user?.budget_max}
      The user has the following clothing items:
      ${user?.clothes.map((clothing) => clothing.name).join(', ')}
    `;
    const fullConversation = [
      { role: 'system', content: systemMessageContent },
      ...previousMessages,
      { role: 'user', content: userMessage },
    ];

    const openaiResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: fullConversation,
    });

    const gptResponse = openaiResponse.choices[0]?.message?.content || null;

    if (!gptResponse) {
      return res.status(500).json({ error: 'No valid response from GPT' });
    }

    const saveAssistantMessageResult = await sendMessage(
      userId,
      gptResponse,
      'assistant'
    );

    if (saveAssistantMessageResult.status !== 200) {
      return res
        .status(saveAssistantMessageResult.status)
        .json(saveAssistantMessageResult);
    }

    return res.status(200).json({ userId, message: gptResponse });
  } catch (error) {
    console.error('Error connecting to OpenAI:', error);
    return res.status(500).json({ error: 'Error connecting to OpenAI' });
  }
});

router.post('/retrieve-user-sessions', async (req: Request, res: Response) => {
  const { userId } = req.body;

  const result = await retrieveSessionChat(userId);

  return res.status(result.status).json(result);
});

export default router;
