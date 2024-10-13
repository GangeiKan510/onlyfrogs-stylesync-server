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
import { createClothing } from '../../controllers/clothing';

const router: Router = express.Router();

initializeApp(firebaseConfig);

const storage = getStorage();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file || !req.body.user_id || !req.body.closet_id) {
      return res
        .status(400)
        .json({ error: 'File, user_id, and closet_id are required.' });
    }

    const { user_id, closet_id, category, tags } = req.body;

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

    const downloadURL = await getDownloadURL(snapshot.ref);

    console.log('File successfully uploaded.');

    const formData = new URLSearchParams();
    formData.append('image_url', downloadURL);

    const backgroundRemovalResponse = await axios.post(
      `${process.env.RENDER_ML_SERVER_API}/remove-background/`,
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const processedImageUrl = backgroundRemovalResponse.data.file_url;

    const clothingData = {
      image_url: processedImageUrl,
      category: category || 'default-category',
      tags: tags ? tags.split(',') : [],
      user_id,
      closet_id,
    };

    const clothingItem = await createClothing(clothingData);

    return res.send({
      message:
        'File uploaded to Firebase Storage, background removed, and clothing created',
      name: req.file.originalname,
      type: req.file.mimetype,
      downloadURL: downloadURL,
      backgroundRemovalResponse: backgroundRemovalResponse.data,
      clothingItem: clothingItem,
    });
  } catch (error: any) {
    console.error(
      'Error during file upload, background removal, or clothing creation:',
      error.message
    );
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/upload-image-url', async (req, res) => {
  try {
    const { image_url, user_id, closet_id, category, tags } = req.body;

    if (!image_url || !user_id || !closet_id) {
      return res
        .status(400)
        .json({ error: 'image_url, user_id, and closet_id are required.' });
    }

    const formData = new URLSearchParams();
    formData.append('image_url', image_url);

    const backgroundRemovalResponse = await axios.post(
      `${process.env.RENDER_ML_SERVER_API}/remove-background/`,
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const processedImageUrl = backgroundRemovalResponse.data.file_url;

    const dateTime = giveCurrentDateTime();
    const storageRef = ref(storage, `files/${processedImageUrl}_${dateTime}`);

    const response = await axios.get(processedImageUrl, {
      responseType: 'arraybuffer',
    });

    const metadata = {
      contentType: 'image/jpeg',
    };

    const snapshot = await uploadBytesResumable(
      storageRef,
      Buffer.from(response.data, 'binary'),
      metadata
    );

    const firebaseUrl = await getDownloadURL(snapshot.ref);

    const clothingData = {
      image_url: firebaseUrl,
      category: category || 'default-category',
      tags: tags ? tags.split(',') : [],
      user_id,
      closet_id,
    };

    const clothingItem = await createClothing(clothingData);

    return res.send({
      message:
        'Image processed, background removed, uploaded to Firebase, and clothing item created',
      originalImageUrl: image_url,
      processedImageUrl: firebaseUrl,
      clothingItem,
    });
  } catch (error: any) {
    console.error(
      'Error during image processing, background removal, or clothing creation:',
      error.message
    );
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/analyze-skin-tone', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File is required.' });
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

    const downloadURL = await getDownloadURL(snapshot.ref);

    console.log('File successfully uploaded to Firebase Storage.');

    const formData = new URLSearchParams();
    formData.append('image_url', downloadURL);

    const analyzeResponse = await axios.post(
      `${process.env.RENDER_ML_SERVER_API}/analyze-skin-tone/`,
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    // Only include the skin tone analysis in the response
    return res.send({
      skinToneAnalysis: analyzeResponse.data,
    });
  } catch (error: any) {
    console.error(
      'Error during file upload and skin tone analysis:',
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
