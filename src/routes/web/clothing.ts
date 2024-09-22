import { Request, Response, Router } from 'express';
import { validate } from '../../validators/validate';
import {
  CreateClothingRequestBodySchema,
  UpdateClothingRequestBodySchema,
} from '../../validators/schemas/schemas';
import { createClothing, updateClothing } from '../../controllers/clothing';

const router = Router();

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

router.get('/', (req: Request, res: Response) => {
  res.send('Web file router');
});

export default router;
