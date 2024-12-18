import request from 'supertest';
import app from '../../src/index';
import prisma from '../../src/controllers/db';

jest.mock('firebase-admin', () => ({
  credential: { cert: jest.fn() },
  initializeApp: jest.fn(() => ({
    auth: jest.fn(() => ({
      verifyIdToken: jest.fn((token: string) => {
        if (token === 'valid-token') {
          return Promise.resolve({ uid: '123', email: 'test@example.com' });
        }
        return Promise.reject(new Error('Unauthorized'));
      }),
    })),
  })),
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn((token: string) => {
      if (token === 'valid-token') {
        return Promise.resolve({ uid: '123', email: 'test@example.com' });
      }
      return Promise.reject(new Error('Unauthorized'));
    }),
  })),
}));

jest.mock('../../src/controllers/db', () => ({
  chatSession: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
  message: {
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
  $disconnect: jest.fn(), // Mock Prisma's disconnect method
}));

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Chat Endpoints', () => {
  const mockUserId = 'user-123';
  const mockChatSession = { id: 'chat-session-123', userId: mockUserId };
  const mockMessage = {
    id: 'message-123',
    chat_session_id: mockChatSession.id,
    role: 'user',
    content: 'Hello, assistant!',
  };

  describe('POST /chat/create-session', () => {
    it('should create a new chat session', async () => {
      (prisma.chatSession.create as jest.Mock).mockResolvedValue(
        mockChatSession
      );

      const response = await request(app)
        .post('/web/chat/create-session')
        .send({ userId: mockUserId });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty(
        'message',
        'New chat session created'
      );
      expect(response.body.session).toEqual(mockChatSession);
    });

    it('should handle errors when creating a chat session', async () => {
      (prisma.chatSession.create as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app)
        .post('/web/chat/create-session')
        .send({ userId: mockUserId });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Internal Server Error');
    });
  });

  describe('POST /chat/send-message', () => {
    it('should send a message in an existing chat session', async () => {
      (prisma.chatSession.findUnique as jest.Mock).mockResolvedValue(
        mockChatSession
      );
      (prisma.message.create as jest.Mock).mockResolvedValue(mockMessage);

      const response = await request(app).post('/web/chat/send-message').send({
        userId: mockUserId,
        messageContent: 'Hello, assistant!',
        role: 'user',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        'message',
        'Message saved to chat session successfully'
      );
      expect(response.body.savedMessage).toEqual(mockMessage);
    });

    it('should return 404 if the chat session does not exist', async () => {
      (prisma.chatSession.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app).post('/web/chat/send-message').send({
        userId: mockUserId,
        messageContent: 'Hello, assistant!',
        role: 'user',
      });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty(
        'message',
        'Chat session not found. Please create a session first.'
      );
    });
  });

  describe('POST /chat/retrieve-user-sessions', () => {
    it('should retrieve a user’s chat session and messages', async () => {
      const mockSessionWithMessages = {
        ...mockChatSession,
        messages: [mockMessage],
      };

      (prisma.chatSession.findUnique as jest.Mock).mockResolvedValue(
        mockSessionWithMessages
      );

      const response = await request(app)
        .post('/web/chat/retrieve-user-sessions')
        .send({ userId: mockUserId });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        'message',
        'Chat session retrieved successfully'
      );
      expect(response.body.session).toEqual(mockSessionWithMessages);
    });

    it('should return 404 if the user’s chat session is not found', async () => {
      (prisma.chatSession.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/web/chat/retrieve-user-sessions')
        .send({ userId: mockUserId });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty(
        'message',
        'Chat session not found.'
      );
    });
  });

  describe('DELETE /chat/delete-chat-session-messages', () => {
    it('should delete all messages in a user’s chat session', async () => {
      (prisma.chatSession.findUnique as jest.Mock).mockResolvedValue(
        mockChatSession
      );
      (prisma.message.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      const response = await request(app)
        .delete('/web/chat/delete-chat-session-messages')
        .send({ userId: mockUserId });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        'message',
        'All messages in the chat session deleted successfully.'
      );
    });

    it('should return 404 if the chat session is not found', async () => {
      (prisma.chatSession.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .delete('/web/chat/delete-chat-session-messages')
        .send({ userId: mockUserId });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty(
        'message',
        'Chat session not found for this user.'
      );
    });
  });
});
