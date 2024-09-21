import { UserProps } from '../types/user';
import prisma from './db';

export const getUserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      include: {
        closets: true,
        clothes: true,
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
        weight: body.weight ?? null,
        skin_tone_classification: body.skin_tone_classification ?? null,
        season: body.season ?? null,
        sub_season: body.sub_season ?? null,
        skin_tone_complements: body.skin_tone_complements ?? [],
        body_type: body.body_type ?? null,
        style_preferences: body.style_preferences ?? [],
        favorite_colors: body.favorite_colors ?? [],
        preferred_brands: body.preferred_brands ?? [],
        budget_min: body.budget_min ?? null,
        budget_max: body.budget_max ?? null,
        location: body.location ?? null,
      },
    });

    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (
  userId: string,
  updates: Partial<UserProps>
) => {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        first_name: updates.first_name ?? undefined,
        last_name: updates.last_name ?? undefined,
        birth_date: updates.birth_date ?? undefined,
        gender: updates.gender ?? undefined,
        height: updates.height ?? undefined,
        weight: updates.weight ?? undefined,
        skin_tone_classification: updates.skin_tone_classification ?? undefined,
        season: updates.season ?? undefined,
        sub_season: updates.sub_season ?? undefined,
        skin_tone_complements: updates.skin_tone_complements ?? undefined,
        body_type: updates.body_type ?? undefined,
        style_preferences: updates.style_preferences ?? undefined,
        favorite_colors: updates.favorite_colors ?? undefined,
        preferred_brands: updates.preferred_brands ?? undefined,
        budget_min: updates.budget_min ?? undefined,
        budget_max: updates.budget_max ?? undefined,
        location: updates.location ?? undefined,
      },
    });

    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};
