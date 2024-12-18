import firebaseAdmin from 'firebase-admin';

let firebaseAdminApp;

if (process.env.NODE_ENV !== 'test') {
  const firebaseAdminServiceAccount = require('../../../onlyfroggs-stylesync-firebase-adminsdk-jvryu-5c6e9d6852.json');

  firebaseAdminApp = firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(firebaseAdminServiceAccount),
  });
} else {
  firebaseAdminApp = {
    auth: jest.fn(() => ({
      verifyIdToken: jest.fn(),
    })),
  };
}

export { firebaseAdminApp };
