import { z } from 'zod';

export const CreateClothingRequestBodySchema = z.object({
  name: z.string().nonempty({ message: 'Name is required' }),
  color: z.string().nonempty({ message: 'Color is required' }),
  type: z.string().nonempty({ message: 'Type is required' }),
  imageUrl: z.string().url({ message: 'Image URL must be a valid URL' }),
});

export const UpdateUserNameSchema = z.object({
  id: z.string().nonempty({ message: 'User ID is required' }),
  first_name: z.string().nonempty({ message: 'First name is required' }),
  last_name: z.string().nonempty({ message: 'Last name is required' }),
});

export const UpdateClothingRequestBodySchema = z.object({
  id: z.string().nonempty({ message: 'Clothing ID is required' }),

  name: z.string().optional(),
  color: z.string().optional(),
  type: z.string().optional(),
  imageUrl: z
    .string()
    .url({ message: 'Image URL must be a valid URL' })
    .optional(),

  season: z.array(z.string()).optional(),
  occasion: z.array(z.string()).optional(),

  category: z
    .object({
      name: z.string().nonempty({ message: 'Category name is required' }),
      type: z.string().nonempty({ message: 'Category type is required' }),
    })
    .optional(),

  material: z.string().optional(),
  pattern: z.string().optional(),
  brand: z.string().optional(),
});

export const UpdateWornDateSchema = z.object({
  clothing_id: z.string().nonempty({ message: 'Clothing ID is required' }),
});

export const CreateUserSchema = z.object({
  first_name: z.string().nonempty({ message: 'First name is required' }),
  last_name: z.string().nonempty({ message: 'Last name is required' }),
  email: z.string().email({ message: 'Email must be a valid email address' }),
});

export const UpdateUserSchema = z.object({
  id: z.string().nonempty({ message: 'User ID is required' }),

  birth_date: z
    .string()
    .optional()
    .refine((date) => !isNaN(Date.parse(date as string)), {
      message: 'Invalid date format, expected ISO format',
    }),
  gender: z.string().optional(),
  height_cm: z
    .number()
    .min(0, { message: 'Height must be a positive number' })
    .optional(),
  weight_kg: z
    .number()
    .min(0, { message: 'Weight must be a positive number' })
    .optional(),

  location: z
    .object({
      lat: z.string().nonempty({ message: 'Latitude is required' }),
      lon: z.string().nonempty({ message: 'Longitude is required' }),
      name: z.string().nonempty({ message: 'Location name is required' }),
    })
    .optional(),

  skin_tone_classification: z.string().optional(),
  season: z.string().optional(),
  sub_season: z.string().optional(),
  skin_tone_complements: z.array(z.string()).optional(),
  body_type: z.string().optional(),
  preferred_style: z.array(z.string()).optional(),
  favourite_colors: z.array(z.string()).optional(),
  preferred_brands: z.array(z.string()).optional(),

  budget_min: z
    .number()
    .min(0, { message: 'Budget minimum must be a positive number' })
    .optional(),
  budget_max: z
    .number()
    .min(0, { message: 'Budget maximum must be a positive number' })
    .optional(),
});

export const UpdateUserBodyType = z.object({
  id: z.string().nonempty({ message: 'User ID is required' }),
  body_type: z.string().nonempty({ message: 'Body type is required' }),
});

export const UpdatePersonalInformationSchema = z.object({
  id: z.string().nonempty({ message: 'User ID is required' }),

  birth_date: z
    .string()
    .optional()
    .refine((date) => !isNaN(Date.parse(date as string)), {
      message: 'Invalid date format, expected ISO format',
    }),

  gender: z
    .string()
    .optional()
    .refine(
      (value) =>
        value === undefined ||
        ['Male', 'Female', 'Other', 'Prefer not to say'].includes(value),
      {
        message:
          'Gender must be one of: Male, Female, Other, Prefer not to say',
      }
    ),

  height: z
    .number()
    .min(0, { message: 'Height must be a positive number' })
    .optional(),

  weight: z
    .number()
    .min(0, { message: 'Weight must be a positive number' })
    .optional(),
});

export const ClosetSchema = z.object({
  name: z.string().nonempty({ message: 'Closet name is required' }),
  description: z.string().nonempty({ message: 'Description name is required' }),
  user_id: z.string().nonempty({ message: 'User ID is required' }),
});

export const GetClosetesByIdRequestBodySchema = z.object({
  user_id: z.string(),
});

export const ChatSessionSchema = z.object({
  userId: z.string().uuid('User ID must be a valid UUID'),
});
