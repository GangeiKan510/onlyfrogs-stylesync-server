import { ChatSession } from '@prisma/client';
import prisma from './db';

export const createChatSession = async ({ userId }: { userId: string }) => {
  try {
    const newSession = await prisma.chatSession.create({
      data: {
        user: {
          connect: { id: userId },
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

export const sendMessage = async (
  userId: string,
  messageContent: string,
  role: 'user' | 'assistant'
) => {
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

    const messageRecord = await prisma.message.create({
      data: {
        chat_session_id: chatSession.id,
        role: role,
        content: messageContent,
      },
    });

    return {
      status: 200,
      message: 'Message saved to chat session successfully',
      savedMessage: messageRecord,
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

export const retrieveSessionChat = async (userId: string) => {
  try {
    const chatSession = await prisma.chatSession.findUnique({
      where: {
        userId: userId,
      },
      include: {
        messages: true,
      },
    });

    if (!chatSession) {
      return {
        status: 404,
        message: 'Chat session not found.',
      };
    }

    return {
      status: 200,
      message: 'Chat session retrieved successfully',
      session: chatSession,
    };
  } catch (error: any) {
    console.error('Error retrieving chat session:', error);
    return {
      status: 500,
      message: 'Internal Server Error',
      error: error.message,
    };
  }
};

export const deleteChatSessionMessages = async (userId: string) => {
  try {
    const chatSession = await prisma.chatSession.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!chatSession) {
      return {
        status: 404,
        message: 'Chat session not found for this user.',
      };
    }

    await prisma.message.deleteMany({
      where: {
        chat_session_id: chatSession.id,
      },
    });

    return {
      status: 200,
      message: 'All messages in the chat session deleted successfully.',
    };
  } catch (error: any) {
    console.error('Error deleting messages from chat session:', error);
    return {
      status: 500,
      message: 'Internal Server Error',
      error: error.message,
    };
  }
};

export const deductTokens = async (userId: string, amount: number = 15) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        status: 404,
        message: 'User not found',
      };
    }

    if (user.role !== 1) {
      return {
        status: 200,
        message: 'No tokens deducted. User role does not require deduction.',
      };
    }

    if (user.tokens < amount) {
      return {
        status: 400,
        message: `Insufficient tokens. User has ${user.tokens} tokens, but ${amount} are required.`,
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        tokens: {
          decrement: amount,
        },
      },
    });

    return {
      status: 200,
      message: `${amount} tokens deducted successfully`,
      user: updatedUser,
    };
  } catch (error: any) {
    console.error('Error deducting tokens:', error.message);
    return {
      status: 500,
      message: 'Internal Server Error',
      error: error.message,
    };
  }
};
