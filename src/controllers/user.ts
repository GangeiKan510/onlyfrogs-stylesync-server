import { UpdateUserProps, UserProps } from '../types/user';
import prisma from './db';
import { createChatSession } from './chat';
import { Prisma } from '@prisma/client';

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

export const getUserById = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        closets: true,
        clothes: true,
        fits: true,
        chat_ession: {
          include: {
            messages: true,
          },
        },
      },
    });

    if (!user) {
      return {
        status: 404,
        message: 'User not found',
      };
    }

    return {
      status: 200,
      user,
    };
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return {
      status: 500,
      message: 'Internal Server Error',
      error: error.message,
    };
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
        height: body.height_cm ?? null,
        weight: body.weight_kg ?? null,
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
        location: body.location
          ? {
              lat: body.location.lat,
              lon: body.location.lon,
              name: body.location.name,
            }
          : Prisma.DbNull,
      },
    });

    const chatSessionResult = await createChatSession({ userId: newUser.id });

    if (chatSessionResult.status !== 201 && chatSessionResult.status !== 200) {
      throw new Error('Failed to create chat session for the new user');
    }

    return {
      ...newUser,
      chatSession: chatSessionResult.session,
    };
  } catch (error) {
    console.error('Error creating user or chat session:', error);
    throw error;
  }
};

export const updateUser = async (
  userId: string,
  updates: Partial<UpdateUserProps>
) => {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        birth_date: updates.birth_date ?? undefined,
        gender: updates.gender ?? undefined,
        height: updates.height_cm ?? undefined,
        weight: updates.weight_kg ?? undefined,
        location: updates.location
          ? {
              lat: updates.location.lat,
              lon: updates.location.lon,
              name: updates.location.name,
            }
          : undefined,

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
      },
    });

    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const updateName = async (
  userId: string,
  firstName: string,
  lastName: string
) => {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    });

    return {
      status: 200,
      message: 'User name updated successfully',
      user: updatedUser,
    };
  } catch (error: any) {
    console.error('Error updating user name:', error);
    return {
      status: 500,
      message: 'Internal Server Error',
      error: error.message,
    };
  }
};

export const updatePersonalInformation = async (
  userId: string,
  birth_date: string,
  gender: string,
  height: number,
  weight: number
) => {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        birth_date: birth_date ? new Date(birth_date) : undefined,
        gender: gender,
        height: height,
        weight: weight,
      },
    });

    return {
      status: 200,
      message: 'Personal information updated successfully',
      user: updatedUser,
    };
  } catch (error: any) {
    console.error('Error updating personal information:', error);
    return {
      status: 500,
      message: 'Internal Server Error',
      error: error.message,
    };
  }
};

export const updateBodyType = async (userId: string, body_type: string) => {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        body_type: body_type,
      },
    });

    return {
      status: 200,
      message: 'Body type updated successfully',
      user: updatedUser,
    };
  } catch (error: any) {
    console.error('Error updating body type:', error);
    return {
      status: 500,
      message: 'Internal Server Error',
      error: error.message,
    };
  }
};

export const updateProfileUrl = async (userId: string, profileUrl: string) => {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        profile_url: profileUrl,
      },
    });

    return {
      status: 200,
      message: 'Profile URL updated successfully',
      user: updatedUser,
    };
  } catch (error: any) {
    console.error('Error updating profile URL:', error);
    return {
      status: 500,
      message: 'Internal Server Error',
      error: error.message,
    };
  }
};
