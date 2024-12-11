import { Request, Response, Router } from 'express';
import { validate } from '../../validators/validate';
import { FitSchema, DeleteFitSchema } from '../../validators/schemas/schemas';
import { createFit, deleteFit } from '../../controllers/fits';
import { initializeApp } from 'firebase/app';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import multer from 'multer';
import firebaseConfig from '../../config/firebase.config';

const router = Router();

initializeApp(firebaseConfig);
const storage = getStorage();

const upload = multer({ storage: multer.memoryStorage() });

router.post(
  '/create-fit',
  upload.single('thumbnail'),
  validate(FitSchema),
  async (req: Request, res: Response, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Thumbnail file is required.' });
      }

      const fitData = req.body;
      const dateTime = new Date().toISOString();
      const storageRef = ref(
        storage,
        `thumbnails/${req.file.originalname}_${dateTime}`
      );

      const metadata = { contentType: req.file.mimetype };

      const snapshot = await uploadBytesResumable(
        storageRef,
        req.file.buffer,
        metadata
      );
      const downloadURL = await getDownloadURL(snapshot.ref);

      fitData.thumbnail_url = downloadURL;

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
