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
          content: [
            {
              type: 'text',
              text: `
              Analyze the provided image and determine if it contains clothing or accessories. 
              If it does, return a structured list of tags for each identified item, with separate categories for clothing and accessories.

              For clothing, provide:
              - Type (e.g., shirt, pants, jacket).
              - Material (e.g., cotton, denim).
              - Color(s).
              - Pattern (e.g., striped, plain, floral).
              - Occasion (e.g., casual, formal, sports).
              - Season (e.g., summer, winter, all-season).

              For accessories, provide:
              - Type (e.g., watch, necklace, handbag).
              - Material (e.g., leather, metal).
              - Color(s).
              - Purpose (e.g., fashion, utility, both).

              Only return the tags in JSON format, structured as:
              {
                "clothing": [
                  { "type": "", "material": "", "colors": [], "pattern": "", "occasion": "", "season": "" }
                ],
                "accessories": [
                  { "type": "", "material": "", "colors": [], "purpose": "" }
                ]
              }
              Do not include explanations or additional text.`,
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
      return res.status(500).json({ error: 'No valid response from GPT' });
    }

    const cleanedResponse = gptResponse.replace(/```json|```/g, '').trim();

    let tags;
    try {
      tags = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse GPT response as JSON:', parseError);
      console.error('Raw GPT response:', cleanedResponse);
      return res
        .status(500)
        .json({ error: 'Failed to parse the response from GPT.' });
    }

    if (
      !tags ||
      typeof tags !== 'object' ||
      !tags.clothing ||
      !tags.accessories
    ) {
      return res.status(500).json({ error: 'Invalid tags format from GPT.' });
    }

    return res.status(200).json({ tags });
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
