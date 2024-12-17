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
import { updateProfileUrl } from '../../controllers/user';
import OpenAI from 'openai';
import sharp from 'sharp';
import FormData from 'form-data';

const router: Router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    const prompt = `
      You are tasked with determining whether the image at the provided URL depicts a clear and presentable clothing item that is commonly stored in a closet. Also consider accessories as items that we can store in the closet.

      Clothing items include:
      - Tops (e.g., shirts, blouses, t-shirts, jackets, coats)
      - Bottoms (e.g., pants, jeans, shorts, skirts)
      - Dresses
      - Outerwear (e.g., sweaters, hoodies)
      - Footwear (e.g., shoes, boots)
     
       **Accessories include:**
      - Headwear (e.g., hats, caps, beanies)
      - Neckwear (e.g., scarves, ties, necklaces, chokers)
      - Belts and waist accessories
      - Bags (e.g., handbags, backpacks, clutches)
      - Jewelry (e.g., rings, bracelets, watches, earrings)
      - Eyewear (e.g., sunglasses, glasses)
      - Gloves and hand accessories
      - Other presentable accessories stored in closets.

      Criteria:
      1. The clothing item must be **clear and visually identifiable** in the image.
      2. The clothing item must be **presentable** (not damaged, incomplete, or too ambiguous to determine).
      3. Non-clothing objects or unclear visuals should result in 'false'.

      Analyze the image and respond only with the following structured JSON:
      {
        "isClothing": true // if the image contains a clear and presentable clothing item,
        "isClothing": false // if the image does not contain a clothing item or is ambiguous
      }

      URL: ${processedImageUrl}

      Ensure your response is valid JSON. Do not include any additional text or comments.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: { url: processedImageUrl, detail: 'high' },
            },
          ],
        },
      ],
    });

    const gptResponse = response.choices[0]?.message?.content || null;

    if (!gptResponse) {
      return res
        .status(500)
        .json({ error: 'No valid response from OpenAI API.' });
    }

    const cleanedResponse = gptResponse
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Failed to parse GPT response:', cleanedResponse, error);
      return res
        .status(500)
        .json({ error: 'Failed to parse the response from OpenAI API.' });
    }

    if (!parsedResponse.isClothing) {
      return res
        .status(400)
        .json({ error: 'The uploaded image is not a valid clothing item.' });
    }

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

    const imageResponse = await axios.get(image_url, {
      responseType: 'arraybuffer',
    });

    const convertedImageBuffer = await sharp(imageResponse.data)
      .resize(512, 512, { fit: 'inside' })
      .png()
      .toBuffer();

    const dateTime = new Date().toISOString();
    const storageRef = ref(storage, `processed_images/${dateTime}.png`);

    const metadata = { contentType: 'image/png' };
    const snapshot = await uploadBytesResumable(
      storageRef,
      convertedImageBuffer,
      metadata
    );

    const processedImageUrl = await getDownloadURL(snapshot.ref);

    const formData = new FormData();
    formData.append('image_url', processedImageUrl);

    const backgroundRemovalResponse = await axios.post(
      `${process.env.RENDER_ML_SERVER_API}/remove-background/`,
      formData,
      { headers: formData.getHeaders() }
    );

    const finalProcessedUrl = backgroundRemovalResponse.data.file_url;

    const prompt = `
      You are tasked with determining whether the image at the provided URL depicts a clear and presentable clothing item that is commonly stored in a closet. Also consider accessories as items that we can store in the closet.

      Clothing items include:
      - Tops (e.g., shirts, blouses, t-shirts, jackets, coats)
      - Bottoms (e.g., pants, jeans, shorts, skirts)
      - Dresses
      - Outerwear (e.g., sweaters, hoodies)
      - Footwear (e.g., shoes, boots)
      
      **Accessories include:**
      - Headwear (e.g., hats, caps, beanies)
      - Neckwear (e.g., scarves, ties, necklaces, chokers)
      - Belts and waist accessories
      - Bags (e.g., handbags, backpacks, clutches)
      - Jewelry (e.g., rings, bracelets, watches, earrings)
      - Eyewear (e.g., sunglasses, glasses)
      - Gloves and hand accessories
      - Other presentable accessories stored in closets.

      Criteria:
      1. The clothing item must be **clear and visually identifiable** in the image.
      2. The clothing item must be **presentable** (not damaged, incomplete, or too ambiguous to determine).
      3. Non-clothing objects or unclear visuals should result in 'false'.

      Analyze the image and respond only with the following structured JSON:
      {
        "isClothing": true // if the image contains a clear and presentable clothing item,
        "isClothing": false // if the image does not contain a clothing item or is ambiguous
      }

      URL: ${finalProcessedUrl}

      Ensure your response is valid JSON. Do not include any additional text or comments.
    `;

    const verificationResponse = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: { url: finalProcessedUrl, detail: 'high' },
            },
          ],
        },
      ],
    });

    const gptResponse =
      verificationResponse.choices[0]?.message?.content || null;

    if (!gptResponse) {
      return res
        .status(500)
        .json({ error: 'No valid response from OpenAI API.' });
    }

    const cleanedResponse = gptResponse
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsedResponse = JSON.parse(cleanedResponse);

    if (!parsedResponse.isClothing) {
      return res
        .status(400)
        .json({ error: 'The uploaded image is not a valid clothing item.' });
    }

    const clothingData = {
      image_url: finalProcessedUrl,
      category: category || 'default-category',
      tags: tags ? tags.split(',') : [],
      user_id,
      closet_id,
    };

    const clothingItem = await createClothing(clothingData);
    console.log('SUCCESS NEGRO!');
    return res.json({
      message:
        'Image processed, background removed, and clothing item created.',
      originalImageUrl: image_url,
      processedImageUrl: finalProcessedUrl,
      clothingItem,
    });
  } catch (error: any) {
    console.error('Error during image upload:', error.message);
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

router.post(
  '/upload-profile-picture',
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file || !req.body.user_id) {
        return res
          .status(400)
          .json({ error: 'File and user_id are required.' });
      }

      const { user_id } = req.body;

      const dateTime = giveCurrentDateTime();
      const storageRef = ref(
        storage,
        `profile_pics/${req.file.originalname}_${dateTime}`
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

      const result = await updateProfileUrl(user_id, downloadURL);

      if (result.status === 200) {
        return res.status(200).json({
          message:
            'Profile picture uploaded and profile URL updated successfully.',
          profileUrl: downloadURL,
          user: result.user,
        });
      } else {
        return res.status(result.status).json({ message: result.message });
      }
    } catch (error: any) {
      console.error(
        'Error during file upload or updating profile URL:',
        error.message
      );
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

const giveCurrentDateTime = () => {
  const today = new Date();
  const date =
    today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  const time =
    today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
  return date + ' ' + time;
};

export default router;
