import { Request, Response, Router } from 'express';
import { validate } from '../../validators/validate';
import {
  FitSchema,
  DeleteFitSchema,
  RenameFitSchema,
} from '../../validators/schemas/schemas';
import { createFit, deleteFit, renameFit } from '../../controllers/fits';
import { initializeApp } from 'firebase/app';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import multer from 'multer';
import firebaseConfig from '../../config/firebase.config';
import {
  getSelectedClothingDetails,
  getUserClosetClothes,
} from '../../controllers/clothing';
import OpenAI from 'openai';

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

initializeApp(firebaseConfig);
const storage = getStorage();

const upload = multer({ storage: multer.memoryStorage() });

router.post(
  '/create-fit',
  upload.single('thumbnail'),
  async (req: Request, res: Response, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Thumbnail file is required.' });
      }

      const { name, user_id, piece_ids } = req.body;

      console.log('Received body:', req.body);

      if (!name || !user_id || !piece_ids) {
        return res.status(400).json({ error: 'Missing required fields.' });
      }

      const dateTime = new Date().toISOString();
      const storageRef = ref(
        storage,
        `thumbnails/${req.file.originalname}_${dateTime}`
      );

      const metadata = { contentType: req.file.mimetype };

      console.log('Uploading to Firebase Storage...');
      const snapshot = await uploadBytesResumable(
        storageRef,
        req.file.buffer,
        metadata
      );
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('File uploaded. URL:', downloadURL);

      const fitData = {
        name,
        user_id,
        piece_ids: Array.isArray(piece_ids)
          ? piece_ids
          : String(piece_ids).split(','),
        thumbnail_url: downloadURL,
      };

      console.log('Creating fit with data:', fitData);

      const newFit = await createFit(fitData);

      res.status(201).json({
        message: 'Fit created successfully',
        data: newFit,
      });
    } catch (error) {
      console.error('Error creating fit:', error);
      next(error);
    }
  }
);

router.post(
  '/rename-fit',
  validate(RenameFitSchema),
  async (req: Request, res: Response, next) => {
    try {
      const { fitId, newName } = req.body;

      if (!fitId || !newName) {
        return res
          .status(400)
          .json({ error: 'Fit ID and new name are required' });
      }

      const renamedFit = await renameFit(fitId, newName);

      res.status(200).json({
        message: 'Fit renamed successfully',
        data: renamedFit,
      });
    } catch (error) {
      console.error('Error renaming fit:', error);
      next(error);
    }
  }
);

router.post(
  '/delete-fit',
  validate(DeleteFitSchema),
  async (req: Request, res: Response, next) => {
    try {
      const { fitId } = req.body;

      if (!fitId) {
        return res.status(400).json({ error: 'Fit ID is required' });
      }

      const deletedFit = await deleteFit(fitId);

      res.status(200).json({
        message: 'Fit deleted successfully',
        data: deletedFit,
      });
    } catch (error) {
      console.error('Error deleting fit:', error);
      next(error);
    }
  }
);

router.post('/complete-outfit', async (req: Request, res: Response) => {
  const { userId, clothingIds } = req.body;

  if (!userId || !clothingIds || !Array.isArray(clothingIds)) {
    return res
      .status(400)
      .json({ error: 'userId and clothingIds are required' });
  }

  try {
    const [selectedClothes, userCloset] = await Promise.all([
      getSelectedClothingDetails(clothingIds),
      getUserClosetClothes(userId),
    ]);

    if (selectedClothes.length === 0) {
      return res
        .status(404)
        .json({ error: 'No selected clothing items found' });
    }

    if (userCloset.length === 0) {
      return res.status(404).json({ error: 'No clothes found in user closet' });
    }

    const availableCloset = userCloset.filter(
      (clothing) => !clothingIds.includes(clothing.id)
    );

    const prompt = `
You are a fashion stylist. The user has selected the following clothing items:
${JSON.stringify(selectedClothes, null, 2)}

The user's closet contains the following clothing items (excluding the selected items):
${JSON.stringify(availableCloset, null, 2)}

Suggest a complete outfit by pairing items from the user's closet with the selected items. If there are not enough items to form a complete outfit, respond with an error message stating "Not enough clothes to complete an outfit." Otherwise, return only an array of clothing IDs representing the suggested outfit.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    const gptResponse = response.choices[0]?.message?.content || null;

    if (!gptResponse) {
      return res.status(500).json({ error: 'No valid response from OpenAI' });
    }

    if (gptResponse.includes('Not enough clothes')) {
      return res
        .status(400)
        .json({ error: 'Not enough clothes to complete an outfit' });
    }

    let suggestedOutfitIds;

    try {
      const jsonMatch = gptResponse.match(/\[([\s\S]*?)\]/);
      if (jsonMatch) {
        suggestedOutfitIds = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON array found in GPT response');
      }

      suggestedOutfitIds = suggestedOutfitIds.filter(
        (id: string) => !clothingIds.includes(id)
      );
    } catch (error) {
      console.error('Error parsing GPT response:', error);
      return res.status(500).json({ error: 'Failed to parse GPT response' });
    }

    return res.status(200).json({ suggestedOutfit: suggestedOutfitIds });
  } catch (error) {
    console.error('Error completing outfit:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', (req: Request, res: Response) => {
  res.send('Fits API');
});

export default router;
