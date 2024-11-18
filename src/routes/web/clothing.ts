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
import axios from 'axios';

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
    const validateImage = async (url: string) => {
      try {
        const response = await axios.head(url);
        return (
          response.status === 200 &&
          response.headers['content-type'].includes('image')
        );
      } catch (error) {
        return false;
      }
    };

    const isValidImage = await validateImage(imageUrl);
    if (!isValidImage) {
      return res
        .status(400)
        .json({ error: 'Invalid or inaccessible image URL.' });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `
                Analyze the image at the following URL and return the following structured data:
                {
                  "category": {
                      "name": "Tops", // Example categories: Tops, Pants, Outerwear, etc.
                      "type": "T-Shirts" // Example subcategories: T-Shirts, Jackets, etc.
                  },
                  "material": "Cotton", // Valid options: Cotton, Polyester, etc. Default: "Other Materials"
                  "occasion": ["Casual", "Travel"], // Use valid options. Default: []
                  "pattern": "Solid", // Use valid options. Default: "Other Patterns"
                  "season": ["Summer", "Spring"] // Use valid options. Default: []
                  "color": "Blue" // Use a single valid value. Default: null.
                }

                Use the following predefined options:
                - **Season:** Spring, Summer, Autumn, Winter
                - **Occasion:** Daily, Work, Date, Formal, Travel, Home, Party, Sport, Casual, Beach, Others
                - **Categories and Types:** {list provided in your original example}
                - **Materials:** Cotton, Polyester, Nylon, etc.
                - **Patterns:** Solid, Floral, Striped, etc.
                - **Colors:** White, Cream, Beige, Light-Gray, Dark-Gray, Black, Light-Pink, Yellow, Light-Green, Torquoise, Light-Blue, Light-Purple, Silver, Pink, Coral, Orange, Green, Blue, Purple, Red, Camel, Brown, Khaki, Navy, Wine, Gold

                Only output the JSON object, and default unrecognized fields to "Other Materials" or "Other Patterns."
              `,
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl, detail: 'high' },
            },
          ],
        },
      ],
    });

    const gptResponse = response.choices[0]?.message?.content || null;

    if (!gptResponse) {
      return res
        .status(500)
        .json({ error: 'No valid response from OpenAI Vision API.' });
    }

    const cleanedResponse = gptResponse
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    let analyzedTags;
    try {
      analyzedTags = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error(
        'Failed to parse GPT response:',
        cleanedResponse,
        parseError
      );
      return res.status(500).json({
        error: 'Failed to parse the response from OpenAI Vision API.',
      });
    }

    analyzedTags = {
      category: analyzedTags.category || { name: 'Unknown', type: 'Unknown' },
      material: analyzedTags.material || 'Other Materials',
      occasion: Array.isArray(analyzedTags.occasion)
        ? analyzedTags.occasion
        : [],
      pattern: analyzedTags.pattern || 'Other Patterns',
      season: Array.isArray(analyzedTags.season) ? analyzedTags.season : [],
      color: typeof analyzedTags.color === 'string' ? analyzedTags.color : null,
    };

    return res.status(200).json({ tags: analyzedTags });
  } catch (error: any) {
    if (error.message?.includes('Timeout')) {
      console.error('Image URL timed out:', imageUrl);
      return res.status(400).json({
        error: 'Image URL timed out. Please try again with a different image.',
      });
    }

    console.error('Error processing image with OpenAI Vision API:', error);
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
