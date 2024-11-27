import firebaseAdmin from 'firebase-admin';
import { readFileSync } from 'fs';

const data = readFileSync(
  './onlyfroggs-stylesync-firebase-adminsdk-jvryu-5c6e9d6852.json'
);
const firebaseAdminServiceAccount = JSON.parse(data.toString());
const firebaseAdminOptions = {
  credential: firebaseAdmin.credential.cert(firebaseAdminServiceAccount),
};
export const firebaseAdminApp = firebaseAdmin.initializeApp(
  firebaseAdminOptions,
  'onlyfroggs-stylesync'
);
