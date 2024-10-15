import prisma from './db';
import { ClothingProps, UpdateClothingDetailsProps } from '../types/clothing';

export const createClothing = async (body: ClothingProps) => {
  try {
    const newClothing = await prisma.clothing.create({
      data: {
        image_url: body.image_url,
        category: body.category,
        tags: body.tags,
        user_id: body.user_id,
        closet_id: body.closet_id,
        worn: {
          create: {
            last_worn: null,
          },
        },
      },
      include: {
        worn: true,
      },
    });

    return newClothing;
  } catch (error) {
    console.error('Error creating clothing:', error);
    throw error;
  }
};

export const updateClothing = async (
  clothingId: string,
  updates: Partial<UpdateClothingDetailsProps>
) => {
  try {
    const updatedClothing = await prisma.clothing.update({
      where: {
        id: clothingId,
      },
      data: {
        image_url: updates.image_url ?? undefined,
        category: updates.category ?? undefined,
        tags: updates.tags ?? undefined,
        user_id: updates.user_id ?? undefined,
        closet_id: updates.closet_id ?? undefined,
        season: updates.season ?? undefined,
        occasion: updates.occasion ?? undefined,
        material: updates.material ?? undefined,
        pattern: updates.pattern ?? undefined,
        brand: updates.brand ?? undefined,
        color: updates.color ?? undefined,
        name: updates.name ?? undefined,
      },
    });

    return updatedClothing;
  } catch (error) {
    console.error('Error updating clothing:', error);
    throw error;
  }
};

export const deleteClothing = async (clothingId: string) => {
  try {
    const deletedClothing = await prisma.clothing.delete({
      where: {
        id: clothingId,
      },
    });

    return deletedClothing;
  } catch (error) {
    console.error('Error deleting clothing:', error);
    throw error;
  }
};
