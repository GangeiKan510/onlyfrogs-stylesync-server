import { UserProps } from '../types/user';
import prisma from './db';

export const getUserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const createUser = async (body: UserProps) => {
  try {
    const newUser = await prisma.user.create({
      data: {
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        tokens: body.tokens ?? 150,
        birth_date: body.birth_date ?? null,
        gender: body.gender ?? null,
        height: body.height ?? null,
        skin_tone_classification: body.skin_tone_classification ?? null,
        style_preferences: body.style_preferences ?? [],
        favorite_color: body.favorite_color ?? null,
        budget_preferences: body.budget_preferences ?? {},
      },
    });

    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};
