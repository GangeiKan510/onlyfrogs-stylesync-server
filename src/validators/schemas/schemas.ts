import { z } from 'zod';

export const CreateClothingRequestBodySchema = z.object({
  name: z.string().nonempty({ message: 'Name is required' }),
  color: z.string().nonempty({ message: 'Color is required' }),
  type: z.string().nonempty({ message: 'Type is required' }),
  imageUrl: z.string().url({ message: 'Image URL must be a valid URL' }),
});

export const UserSchema = z.object({
  first_name: z.string().nonempty({ message: 'First name is required' }),
  last_name: z.string().nonempty({ message: 'Last name is required' }),
  email: z.string().email({ message: 'Email must be a valid email address' }),
});

export const ClosetSchema = z.object({
  name: z.string().nonempty({ message: 'Closet name is required' }),
  description: z.string().nonempty({ message: 'Description name is required' }),
  user_id: z.string().nonempty({ message: 'User ID is required' }),
});

export const GetClosetesByIdRequestBodySchema = z.object({
  user_id: z.string(),
});
