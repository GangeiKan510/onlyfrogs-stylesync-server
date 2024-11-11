import { Request, Response, Router } from 'express';
import {
  createUser,
  getUserByEmail,
  updateUser,
  updateName,
  updatePersonalInformation,
  updateBodyType,
  updatePrioritizePreferences,
  updateConsiderSkinTone,
} from '../../controllers/user';
import {
  CreateUserSchema,
  UpdatePersonalInformationSchema,
  UpdateUserBodyType,
  UpdateUserNameSchema,
  UpdateUserSchema,
} from '../../validators/schemas/schemas';
import { validate } from '../../validators/validate';

const router = Router();

router.post('/get-me', async (req: Request, res: Response, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await getUserByEmail(email);

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    next(error);
  }
});

router.post(
  '/create-user',
  validate(CreateUserSchema),
  async (req: Request, res: Response, next) => {
    try {
      const userData = req.body;

      const newUser = await createUser(userData);

      res.status(201).json(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      next(error);
    }
  }
);

router.post(
  '/update-user',
  validate(UpdateUserSchema),
  async (req: Request, res: Response, next) => {
    try {
      const { id, ...updates } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const updatedUser = await updateUser(id, updates);

      res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      next(error);
    }
  }
);

router.post(
  '/update-name',
  validate(UpdateUserNameSchema),
  async (req: Request, res: Response, next) => {
    try {
      const { id, first_name, last_name } = req.body;

      if (!id || !first_name || !last_name) {
        return res
          .status(400)
          .json({ error: 'User ID, first name, and last name are required' });
      }

      const updatedUser = await updateName(id, first_name, last_name);

      if (updatedUser.status === 200) {
        res.status(200).json(updatedUser);
      } else {
        res.status(updatedUser.status).json({ message: updatedUser.message });
      }
    } catch (error) {
      console.error('Error updating user name:', error);
      next(error);
    }
  }
);

router.post(
  '/update-personal-information',
  validate(UpdatePersonalInformationSchema),
  async (req: Request, res: Response, next) => {
    try {
      const { id, birth_date, gender, height, weight } = req.body;

      const updatedUser = await updatePersonalInformation(
        id,
        birth_date,
        gender,
        height,
        weight
      );

      res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Error updating personal information:', error);
      next(error);
    }
  }
);

router.post(
  '/update-body-type',
  validate(UpdateUserBodyType),
  async (req: Request, res: Response, next) => {
    try {
      const { id, body_type } = req.body;

      const updatedUserBodyType = await updateBodyType(id, body_type);

      res.status(200).json(updatedUserBodyType);
    } catch (error) {
      console.error('Error updating personal information:', error);
      next(error);
    }
  }
);

router.post(
  '/update-consider-skin-tone',
  async (req: Request, res: Response, next) => {
    try {
      const { id, consider_skin_tone } = req.body;

      if (typeof consider_skin_tone !== 'boolean') {
        return res
          .status(400)
          .json({ error: '"consider_skin_tone" must be a boolean value' });
      }

      const updatedSettings = await updateConsiderSkinTone(
        id,
        consider_skin_tone
      );

      res.status(updatedSettings.status).json({
        message: updatedSettings.message,
        settings: updatedSettings.settings,
      });
    } catch (error) {
      console.error('Error updating "Consider Skin Tone":', error);
      next(error);
    }
  }
);

router.post(
  '/update-prioritize-preferences',
  async (req: Request, res: Response, next) => {
    try {
      const { id, prioritize_preferences } = req.body;

      if (typeof prioritize_preferences !== 'boolean') {
        return res
          .status(400)
          .json({ error: '"prioritize_preferences" must be a boolean value' });
      }

      const updatedSettings = await updatePrioritizePreferences(
        id,
        prioritize_preferences
      );

      res.status(updatedSettings.status).json({
        message: updatedSettings.message,
        settings: updatedSettings.settings,
      });
    } catch (error) {
      console.error('Error updating "Prioritize Preferences":', error);
      next(error);
    }
  }
);

router.get('/', (req: Request, res: Response) => {
  res.send('Web file router');
});

export default router;
