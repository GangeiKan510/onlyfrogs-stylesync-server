import prisma from './db';
import { Prisma, User } from '@prisma/client';

export const getUsers = async () => {
  const users = await prisma.user.findMany();
  return users;
};

export const createUser = async (body: Partial<User>) => {
  try {
    const newUser = await prisma.user.create({
      data: {
        first_name: body.first_name || '',
        last_name: body.last_name || '',
        email: body.email || '',
        password: body.password || '',
        tokens: body.tokens ?? 0,
        birth_date: body.birth_date ?? (null as string | null),
        gender: body.gender ?? (null as string | null),
        height: body.height ?? (null as string | null),
        skin_tone_classification:
          body.skin_tone_classification ?? (null as string | null),
        style_preferences: body.style_preferences ?? [],
        favorite_color: body.favorite_color ?? (null as string | null),
        budget_preferences: body.budget_preferences ?? {},
      },
    });

    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};
