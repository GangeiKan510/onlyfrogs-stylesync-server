import { AnyDict } from '../types/generate-interfaces';
import prisma from './db';
import { Prisma, User } from '@prisma/client';

export const getUsers = async () => {
  const users = await prisma.user.findMany();
  return users;
};

export const createUser = async (body: AnyDict) => {
  try {
    const newUser = await prisma.user.create({
      data: {
        first_name: body.firstName,
        last_name: body.lastName,
        email: body.email,
        tokens: body.tokens ?? 0,
        birth_date: body.birthDate ?? null,
        gender: body.gender ?? null,
        height: body.height ?? null,
        skin_tone_classification: body.skinToneClassification ?? null,
        style_preferences: body.stylePreferences ?? [],
        favorite_color: body.favoriteColor ?? null,
        budget_preferences: body.budgetPreferences ?? {},
      },
    });

    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};
