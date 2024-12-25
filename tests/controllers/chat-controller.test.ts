import prisma from '../../src/controllers/db';
import {
  createChatSession,
  sendMessage,
  retrieveSessionChat,
  deleteChatSessionMessages,
  deductTokens,
} from '../../src/controllers/chat';

jest.mock('../../src/controllers/db', () => ({
  chatSession: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
  message: {
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}));

describe('Chat Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createChatSession', () => {
    it('should create a new chat session successfully', async () => {
      const mockSession = {
        id: 'chat-session-123',
        userId: 'user-123',
      };

      (prisma.chatSession.create as jest.Mock).mockResolvedValue(mockSession);

      const result = await createChatSession({ userId: 'user-123' });
      expect(prisma.chatSession.create).toHaveBeenCalledWith({
        data: { user: { connect: { id: 'user-123' } } },
      });
      expect(result).toEqual({
        status: 201,
        message: 'New chat session created',
        session: mockSession,
      });
    });

    it('should handle errors when creating a chat session', async () => {
      (prisma.chatSession.create as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const result = await createChatSession({ userId: 'user-123' });
      expect(result).toEqual({
        status: 500,
        message: 'Internal Server Error',
        error: 'Database error',
      });
    });
  });

  describe('sendMessage', () => {
    it('should save a message successfully', async () => {
      const mockChatSession = { id: 'chat-session-123' };
      const mockMessage = {
        id: 'message-123',
        content: 'Hello',
        role: 'user',
      };

      (prisma.chatSession.findUnique as jest.Mock).mockResolvedValue(
        mockChatSession
      );
      (prisma.message.create as jest.Mock).mockResolvedValue(mockMessage);

      const result = await sendMessage('user-123', 'Hello', 'user');
      expect(prisma.chatSession.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
      expect(prisma.message.create).toHaveBeenCalledWith({
        data: {
          chat_session_id: 'chat-session-123',
          role: 'user',
          content: 'Hello',
        },
      });
      expect(result).toEqual({
        status: 200,
        message: 'Message saved to chat session successfully',
        savedMessage: mockMessage,
      });
    });

    it('should return 404 if chat session is not found', async () => {
      (prisma.chatSession.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await sendMessage('user-123', 'Hello', 'user');
      expect(result).toEqual({
        status: 404,
        message: 'Chat session not found. Please create a session first.',
      });
    });

    it('should handle errors when saving a message', async () => {
      const mockChatSession = { id: 'chat-session-123' };

      (prisma.chatSession.findUnique as jest.Mock).mockResolvedValue(
        mockChatSession
      );
      (prisma.message.create as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const result = await sendMessage('user-123', 'Hello', 'user');
      expect(result).toEqual({
        status: 500,
        message: 'Internal Server Error',
        error: 'Database error',
      });
    });
  });

  describe('retrieveSessionChat', () => {
    it('should retrieve a chat session successfully', async () => {
      const mockChatSession = {
        id: 'chat-session-123',
        messages: [{ id: 'message-123', content: 'Hello', role: 'user' }],
      };

      (prisma.chatSession.findUnique as jest.Mock).mockResolvedValue(
        mockChatSession
      );

      const result = await retrieveSessionChat('user-123');
      expect(prisma.chatSession.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        include: { messages: true },
      });
      expect(result).toEqual({
        status: 200,
        message: 'Chat session retrieved successfully',
        session: mockChatSession,
      });
    });

    it('should return 404 if chat session is not found', async () => {
      (prisma.chatSession.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await retrieveSessionChat('user-123');
      expect(result).toEqual({
        status: 404,
        message: 'Chat session not found.',
      });
    });

    it('should handle errors when retrieving a chat session', async () => {
      (prisma.chatSession.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const result = await retrieveSessionChat('user-123');
      expect(result).toEqual({
        status: 500,
        message: 'Internal Server Error',
        error: 'Database error',
      });
    });
  });

  describe('deleteChatSessionMessages', () => {
    it('should delete all messages successfully', async () => {
      const mockChatSession = { id: 'chat-session-123' };

      (prisma.chatSession.findUnique as jest.Mock).mockResolvedValue(
        mockChatSession
      );
      (prisma.message.deleteMany as jest.Mock).mockResolvedValue({ count: 5 });

      const result = await deleteChatSessionMessages('user-123');
      expect(prisma.chatSession.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
      expect(prisma.message.deleteMany).toHaveBeenCalledWith({
        where: { chat_session_id: 'chat-session-123' },
      });
      expect(result).toEqual({
        status: 200,
        message: 'All messages in the chat session deleted successfully.',
      });
    });

    it('should return 404 if chat session is not found', async () => {
      (prisma.chatSession.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await deleteChatSessionMessages('user-123');
      expect(result).toEqual({
        status: 404,
        message: 'Chat session not found for this user.',
      });
    });

    it('should handle errors when deleting messages', async () => {
      const mockChatSession = { id: 'chat-session-123' };

      (prisma.chatSession.findUnique as jest.Mock).mockResolvedValue(
        mockChatSession
      );
      (prisma.message.deleteMany as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const result = await deleteChatSessionMessages('user-123');
      expect(result).toEqual({
        status: 500,
        message: 'Internal Server Error',
        error: 'Database error',
      });
    });
  });

  describe('deductTokens', () => {
    it('should deduct tokens successfully', async () => {
      const mockUser = { id: 'user-123', tokens: 100, role: 1 };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user-123',
        tokens: 85,
      });

      const result = await deductTokens('user-123', 15);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { tokens: { decrement: 15 } },
      });
      expect(result).toEqual({
        status: 200,
        message: '15 tokens deducted successfully',
        user: { id: 'user-123', tokens: 85 },
      });
    });

    it('should return 404 if user is not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await deductTokens('user-123', 15);
      expect(result).toEqual({
        status: 404,
        message: 'User not found',
      });
    });

    it('should return 400 if user has insufficient tokens', async () => {
      const mockUser = { id: 'user-123', tokens: 10, role: 1 };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await deductTokens('user-123', 15);
      expect(result).toEqual({
        status: 400,
        message:
          'Insufficient tokens. User has 10 tokens, but 15 are required.',
      });
    });
  });
});
