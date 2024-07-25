import prisma from './db';
import { Prisma, User } from '@prisma/client';

export const getUsers = async () => {
  const users = await prisma.user.findMany();
  return users;
};

export const createUser = async (body: Prisma.UserCreateInput) => {
  try {
    const newUser = await prisma.user.create({
      data: {
        first_name: body.first_name || '',
        last_name: body.last_name || '',
        email: body.email || '',
        password: body.password || '',
        tokens: body.tokens ?? 0,
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
