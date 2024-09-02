import express, { Router } from 'express';
import { initializeApp } from 'firebase/app';
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from 'firebase/storage';
import multer from 'multer';
import axios from 'axios';
import firebaseConfig from '../../config/firebase.config';

const router: Router = express.Router();

initializeApp(firebaseConfig);

const storage = getStorage();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const dateTime = giveCurrentDateTime();
    const storageRef = ref(
      storage,
      `files/${req.file.originalname}_${dateTime}`
    );

    const metadata = {
      contentType: req.file.mimetype,
    };

    const snapshot = await uploadBytesResumable(
      storageRef,
      req.file.buffer,
      metadata
    );

    console.log('chore: test discord to github webhook integration');

    const downloadURL = await getDownloadURL(snapshot.ref);

    console.log('File successfully uploaded.');

    const formData = new URLSearchParams();
    formData.append('image_url', downloadURL);

    const backgroundRemovalResponse = await axios.post(
      'http://localhost:4269/remove-background/',
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return res.send({
      message: 'File uploaded to Firebase Storage and background removed',
      name: req.file.originalname,
      type: req.file.mimetype,
      downloadURL: downloadURL,
      backgroundRemovalResponse: backgroundRemovalResponse.data,
    });
  } catch (error: any) {
    console.error(
      'Error during file upload or background removal:',
      error.message
    );
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

const giveCurrentDateTime = () => {
  const today = new Date();
  const date =
    today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  const time =
    today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
  return date + ' ' + time;
};

export default router;
