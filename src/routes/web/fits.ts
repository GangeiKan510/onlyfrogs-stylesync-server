import { Request, Response, Router } from 'express';
import { validate } from '../../validators/validate';
import { FitSchema, DeleteFitSchema } from '../../validators/schemas/schemas';
import { createFit, deleteFit } from '../../controllers/fits';

const router = Router();

router.post(
  '/create-fit',
  validate(FitSchema),
  async (req: Request, res: Response, next) => {
    try {
      const fitData = req.body;

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

router.get('/', (req: Request, res: Response) => {
  res.send('Fits API');
});

export default router;
