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
