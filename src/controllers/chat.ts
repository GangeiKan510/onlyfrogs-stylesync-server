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

export const sendMessage = async (userId: string, userMessage: string) => {
  try {
    const chatSession = await prisma.chatSession.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!chatSession) {
      return {
        status: 404,
        message: 'Chat session not found. Please create a session first.',
      };
    }

    const userMessageRecord = await prisma.message.create({
      data: {
        chat_session_id: chatSession.id,
        role: 'user',
        content: userMessage,
      },
    });

    return {
      status: 200,
      message: 'Message saved to chat session successfully',
      userMessage: userMessageRecord,
    };
  } catch (error: any) {
    console.error('Error saving message:', error);
    return {
      status: 500,
      message: 'Internal Server Error',
      error: error.message,
    };
  }
};
