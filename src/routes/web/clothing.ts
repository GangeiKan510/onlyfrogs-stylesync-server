import { Request, Response, Router } from 'express';
import { validate } from '../../validators/validate';
import {
  CreateClothingRequestBodySchema,
  UpdateClothingRequestBodySchema,
  UpdateWornDateSchema,
} from '../../validators/schemas/schemas';
import {
  createClothing,
  deleteClothing,
  updateClothing,
  updateWornDate,
} from '../../controllers/clothing';
import OpenAI from 'openai';

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.get('/get-clothes', (req, res) => {
  res.send("You're trying to get clothes!");
});

router.post(
  '/create-clothing',
  validate(CreateClothingRequestBodySchema),
  async (req: Request, res: Response) => {
    try {
      const { image_url, category, tags, user_id, closet_id } = req.body;

      const clothingItem = await createClothing({
        image_url,
        category,
        tags,
        user_id,
        closet_id,
      });

      res.status(201).json({
        message: 'Clothing item created successfully',
        clothingItem,
      });
    } catch (error: any) {
      console.error('Error creating clothing:', error.message);
      res.status(500).json({ error: 'Failed to create clothing item' });
    }
  }
);

router.post(
  '/update-clothing',
  validate(UpdateClothingRequestBodySchema),
  async (req: Request, res: Response) => {
    try {
      const { id, ...updateFields } = req.body;

      const updatedClothing = await updateClothing(id, updateFields);

      if (!updatedClothing) {
        return res.status(404).json({ error: 'Clothing item not found' });
      }

      res.status(200).json({
        message: 'Clothing item updated successfully',
        updatedClothing,
      });
    } catch (error: any) {
      console.error('Error updating clothing:', error.message);
      res.status(500).json({ error: 'Failed to update clothing item' });
    }
  }
);

router.delete('/delete-clothing', async (req: Request, res: Response) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Clothing ID is required.' });
  }

  try {
    const deletedClothing = await deleteClothing(id);

    if (!deletedClothing) {
      return res.status(404).json({ error: 'Clothing item not found' });
    }

    res.status(200).json({
      message: 'Clothing item deleted successfully',
      deletedClothing,
    });
  } catch (error: any) {
    console.error('Error deleting clothing:', error.message);
    res.status(500).json({ error: 'Failed to delete clothing item' });
  }
});

router.post('/analyze-item', async (req: Request, res: Response) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: 'Image URL is required' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'user',
          content: `
            Analyze the provided image at the URL: ${imageUrl}. 
            If it contains clothing or accessories, return a structured JSON object for each identified item with the following fields:

            {
              "category": {
                  "name": "Tops", // Example categories: Tops, Pants, Outerwear, etc.
                  "type": "T-Shirts" // Example types: T-Shirts, Jackets, etc.
              },
              "material": "Cotton", // Example materials: Cotton, Polyester, etc. Use "Other Materials" if unknown.
              "name": "Cardigan", // General name for the item
              "occasion": ["Daily", "Travel"], // Can include multiple values: Daily, Work, Travel, etc.
              "pattern": "Solid", // Example patterns: Solid, Floral, Striped, etc. Use "Other Patterns" if unknown.
              "season": ["Spring", "Winter", "Summer"] // Can include multiple values: Spring, Summer, Autumn, Winter
            }

            If any field (e.g., material, pattern) is not recognized, default to "Other Materials" or "Other Patterns". 

            Only return the tags in JSON format without any additional explanation or text.
          `,
        },
      ],
    });

    const gptResponse = response.choices[0]?.message?.content || null;

    if (!gptResponse) {
      return res.status(500).json({ error: 'No valid response from GPT' });
    }

    const cleanedResponse = gptResponse.replace(/```json|```/g, '').trim();

    let analyzedTags;
    try {
      analyzedTags = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse GPT response as JSON:', parseError);
      console.error('Raw GPT response:', cleanedResponse);
      return res
        .status(500)
        .json({ error: 'Failed to parse the response from GPT.' });
    }

    analyzedTags.material =
      analyzedTags.material === 'Unknown'
        ? 'Other Materials'
        : analyzedTags.material;
    analyzedTags.pattern =
      analyzedTags.pattern === 'Unknown'
        ? 'Other Patterns'
        : analyzedTags.pattern;

    if (
      !analyzedTags ||
      typeof analyzedTags !== 'object' ||
      !analyzedTags.category ||
      !analyzedTags.material ||
      !Array.isArray(analyzedTags.occasion) ||
      !Array.isArray(analyzedTags.season)
    ) {
      return res
        .status(500)
        .json({ error: 'Invalid response format from GPT.' });
    }

    return res.status(200).json({ tags: analyzedTags });
  } catch (error) {
    console.error('Error analyzing image:', error);
    return res.status(500).json({ error: 'Failed to process the image.' });
  }
});

router.post(
  '/update-worn-date',
  validate(UpdateWornDateSchema),
  async (req: Request, res: Response) => {
    const { clothing_id } = req.body;

    if (!clothing_id) {
      return res.status(400).json({ error: 'Clothing ID is required.' });
    }

    try {
      const updatedWorn = await updateWornDate(clothing_id);

      if (!updatedWorn) {
        return res
          .status(404)
          .json({ error: 'No worn record found for the given clothing item.' });
      }

      res.status(200).json({
        message: 'Worn date updated successfully.',
        updatedWorn,
      });
    } catch (error: any) {
      console.error('Error updating worn date:', error.message);
      res.status(500).json({ error: 'Failed to update worn date' });
    }
  }
);

router.get('/', (req: Request, res: Response) => {
  res.send('Web file router');
});

export default router;
