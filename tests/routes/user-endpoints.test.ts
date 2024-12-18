import request from 'supertest';
import app from '../../src/index';
import admin from 'firebase-admin';
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

jest.mock('../../src/controllers/user.ts', () => ({
  getUserByEmail: jest.fn().mockResolvedValue({
    id: '123',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
  }),
  createUser: jest.fn().mockResolvedValue({
    id: '124',
    email: 'new@example.com',
    first_name: 'New',
    last_name: 'User',
  }),
  updateUser: jest.fn().mockResolvedValue({
    id: '123',
    email: 'test@example.com',
    first_name: 'Updated',
    last_name: 'User',
    birth_date: '2000-01-01',
  }),
}));

afterAll(async () => {
  await prisma.$disconnect();
});

describe('User Endpoints', () => {
  const mockToken = 'valid-token';

  beforeAll(() => {
    (admin.auth().verifyIdToken as jest.Mock).mockImplementation((token) => {
      if (token === mockToken) {
        return Promise.resolve({ uid: '123', email: 'test@example.com' });
      }
      throw { code: 'auth/invalid-token', message: 'Invalid token' };
    });
  });

  it('should fetch user details with a valid token', async () => {
    const response = await request(app)
      .post('/web/users/get-me')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ email: 'test@example.com' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('email', 'test@example.com');
  });

  it('should create a new user', async () => {
    const response = await request(app)
      .post('/web/users/create-user')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        email: 'new@example.com',
        first_name: 'New',
        last_name: 'User',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('email', 'new@example.com');
  });

  it('should update a user', async () => {
    const response = await request(app)
      .post('/web/users/update-user')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        id: '123',
        first_name: 'Updated',
        last_name: 'User',
        birth_date: '2000-01-01',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('first_name', 'Updated');
  });
  it('should return 400 when email is missing in get-me', async () => {
    const response = await request(app)
      .post('/web/users/get-me')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Email is required');
  });
});
