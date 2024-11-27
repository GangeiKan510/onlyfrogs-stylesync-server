import firebaseAdmin from 'firebase-admin';

const firebaseCredentials = process.env.FIREBASE_CREDENTIALS;

if (!firebaseCredentials) {
  throw new Error('FIREBASE_CREDENTIALS environment variable is not set.');
}

const firebaseAdminServiceAccount = JSON.parse(
  Buffer.from(firebaseCredentials, 'base64').toString()
);

const firebaseAdminOptions = {
  credential: firebaseAdmin.credential.cert(firebaseAdminServiceAccount),
};

export const firebaseAdminApp = firebaseAdmin.initializeApp(
  firebaseAdminOptions,
  'onlyfroggs-stylesync'
);
