import { Request, Response, Router } from 'express';
import { validate } from '../../validators/validate';
import { CreateClothingRequestBodySchema } from '../../validators/schemas/schemas';
import { createClothing } from '../../controllers/clothing';

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

router.get('/', (req: Request, res: Response) => {
  res.send('Web file router');
});

export default router;
