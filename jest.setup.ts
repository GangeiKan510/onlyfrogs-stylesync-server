import { jest } from '@jest/globals';
import firebaseAdmin from 'firebase-admin';

jest.mock('firebase-admin', () => ({
  credential: {
    cert: jest.fn(),
  },
  initializeApp: jest.fn(() => ({
    auth: jest.fn(() => ({
      verifyIdToken: jest.fn(),
    })),
  })),
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
  })),
}));
