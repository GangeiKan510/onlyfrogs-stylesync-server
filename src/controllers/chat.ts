import { ChatSession } from '@prisma/client';
import prisma from './db';

export const createChatSession = async (body: ChatSession) => {
  try {
    const existingSession = await prisma.chatSession.findUnique({
      where: {
        userId: body.userId,
      },
    });

    if (existingSession) {
      return {
        status: 200,
        message: 'Chat session already exists',
        session: existingSession,
      };
    }

    const newSession = await prisma.chatSession.create({
      data: {
        user: {
          connect: { id: body.userId },
        },
      },
    });

    return {
      status: 201,
      message: 'New chat session created',
      session: newSession,
    };
  } catch (error: any) {
    console.error('Error creating chat session:', error);
    return {
      status: 500,
      message: 'Internal Server Error',
      error: error.message,
    };
  }
};
