import { UpdateUserProps, UserProps } from '../types/user';
import prisma from './db';
import { createChatSession } from './chat';
import { Prisma } from '@prisma/client';
import { createNotification } from './notification';

export const getUserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        closets: {
          include: {
            clothes: {
              include: {
                worn: true,
              },
            },
          },
        },
        notifications: true,
        prompt_settings: true,
        fits: true,
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
        closets: {
          include: {
            clothes: {
              include: {
                worn: true,
                occasions: true,
                seasons: true,
              },
            },
          },
        },
        style_preferences: true,
        favorite_colors: true,
        preferred_brands: true,
        skin_tone_complements: true,
        fits: true,
        chat_session: {
          include: {
            messages: true,
          },
        },
        prompt_settings: true,
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
        tokens: {
          create: {
            amount: body.tokens ?? 150,
          },
        },
        birth_date: body.birth_date ?? null,
        gender: body.gender ?? null,
        height: body.height_cm ?? null,
        weight: body.weight_kg ?? null,
        skin_tone_classification: body.skin_tone_classification ?? null,
        season: body.season ?? null,
        sub_season: body.sub_season ?? null,
        body_type: body.body_type ?? null,
        budget_min: body.budget_min ?? null,
        budget_max: body.budget_max ?? null,
        location: body.location
          ? {
              set: {
                lat: body.location.lat,
                lon: body.location.lon,
                name: body.location.name,
              },
            }
          : Prisma.DbNull,
      },
    });

    const promptSettings = await prisma.promptSettings.create({
      data: {
        user_id: newUser.id,
        consider_skin_tone: false,
        prioritize_preferences: false,
      },
    });

    const chatSessionResult = await createChatSession({ userId: newUser.id });

    if (chatSessionResult.status !== 201 && chatSessionResult.status !== 200) {
      throw new Error('Failed to create chat session for the new user');
    }

    await createNotification({
      user_id: newUser.id,
      type: 'INFO',
      content: `Welcome to StylSync, ${newUser.first_name}! We're excited to have you onboard.`,
    });

    return {
      ...newUser,
      chatSession: chatSessionResult.session,
      promptSettings,
    };
  } catch (error) {
    console.error('Error creating user or associated entries:', error);
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
              set: {
                lat: updates.location.lat,
                lon: updates.location.lon,
                name: updates.location.name,
              },
            }
          : undefined,

        skin_tone_classification: updates.skin_tone_classification ?? undefined,
        season: updates.season ?? undefined,
        sub_season: updates.sub_season ?? undefined,
        body_type: updates.body_type ?? undefined,
        budget_min: updates.budget_min ?? undefined,
        budget_max: updates.budget_max ?? undefined,

        skin_tone_complements: updates.skin_tone_complements
          ? {
              deleteMany: {},
              create: updates.skin_tone_complements.map((complement) => ({
                complement,
              })),
            }
          : undefined,
        style_preferences: updates.style_preferences
          ? {
              deleteMany: {},
              create: updates.style_preferences.map((style) => ({ style })),
            }
          : undefined,
        favorite_colors: updates.favorite_colors
          ? {
              deleteMany: {},
              create: updates.favorite_colors.map((color) => ({ color })),
            }
          : undefined,
        preferred_brands: updates.preferred_brands
          ? {
              deleteMany: {},
              create: updates.preferred_brands.map((brand) => ({ brand })),
            }
          : undefined,
        preferred_styles: updates.preferred_style
          ? {
              deleteMany: {},
              create: updates.preferred_style.map((style) => ({ style })),
            }
          : undefined,
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

export const updateConsiderSkinTone = async (
  userId: string,
  considerSkinTone: boolean
) => {
  try {
    const existingSettings = await prisma.promptSettings.findUnique({
      where: { user_id: userId },
    });

    if (!existingSettings) {
      return {
        status: 404,
        message: 'Prompt settings not found for the user.',
      };
    }

    const updatedSettings = await prisma.promptSettings.update({
      where: { user_id: userId },
      data: {
        consider_skin_tone: considerSkinTone,
      },
    });

    return {
      status: 200,
      message: 'Consider Skin Tone updated successfully.',
      settings: updatedSettings,
    };
  } catch (error: any) {
    console.error('Error updating consider_skin_tone:', error);
    return {
      status: 500,
      message: 'Internal Server Error',
      error: error.message,
    };
  }
};

export const updatePrioritizePreferences = async (
  userId: string,
  prioritizePreferences: boolean
) => {
  try {
    const existingSettings = await prisma.promptSettings.findUnique({
      where: { user_id: userId },
    });

    if (!existingSettings) {
      return {
        status: 404,
        message: 'Prompt settings not found for the user.',
      };
    }

    const updatedSettings = await prisma.promptSettings.update({
      where: { user_id: userId },
      data: {
        prioritize_preferences: prioritizePreferences,
      },
    });

    return {
      status: 200,
      message: 'Prioritize Preferences updated successfully.',
      settings: updatedSettings,
    };
  } catch (error: any) {
    console.error('Error updating prioritize_preferences:', error);
    return {
      status: 500,
      message: 'Internal Server Error',
      error: error.message,
    };
  }
};

export const updateSkinToneDetails = async (
  userId: string,
  skinToneClassification: string,
  complements: string[],
  season: string,
  subSeason: string
) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        skin_tone_classification: skinToneClassification,
        skin_tone_complements: {
          deleteMany: {},
          create: complements.map((complement) => ({ complement })),
        },
        season: season,
        sub_season: subSeason,
      },
    });

    return {
      status: 200,
      message: 'Skin tone analysis updated successfully',
      user: updatedUser,
    };
  } catch (error: any) {
    console.error('Error updating skin tone analysis:', error);
    return {
      status: 500,
      message: 'Internal Server Error',
      error: error.message,
    };
  }
};

export const updateUserPreferences = async (
  userId: string,
  brands: string[],
  budgetRange: { min: number; max: number },
  favoriteColors: string[],
  styles: string[]
) => {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        preferred_brands: {
          deleteMany: {},
          create: brands.map((brand) => ({ brand })),
        },
        budget_min: budgetRange.min,
        budget_max: budgetRange.max,
        favorite_colors: {
          deleteMany: {},
          create: favoriteColors.map((color) => ({ color })),
        },
        style_preferences: {
          deleteMany: {},
          create: styles.map((style) => ({ style })),
        },
      },
    });

    return {
      status: 200,
      message: 'User preferences updated successfully',
      user: updatedUser,
    };
  } catch (error: any) {
    console.error('Error updating user preferences:', error);
    return {
      status: 500,
      message: 'Internal Server Error',
      error: error.message,
    };
  }
};
