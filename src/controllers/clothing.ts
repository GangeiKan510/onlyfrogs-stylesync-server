import prisma from './db';
import { ClothingProps, UpdateClothingDetailsProps } from '../types/clothing';

export const createClothing = async (body: ClothingProps) => {
  try {
    const newClothing = await prisma.clothing.create({
      data: {
        image_url: body.image_url,
        category: body.category,
        closet_id: body.closet_id,
        tags: {
          create: body.tags?.map((tag) => ({ tag })),
        },
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
        closet_id: updates.closet_id ?? undefined,
        material: updates.material ?? undefined,
        pattern: updates.pattern ?? undefined,
        brand: updates.brand ?? undefined,
        color: updates.color ?? undefined,
        name: updates.name ?? undefined,
        seasons: updates.season
          ? {
              deleteMany: {},
              create: updates.season.map((season) => ({ season })),
            }
          : undefined,
        occasions: updates.occasion
          ? {
              deleteMany: {},
              create: updates.occasion.map((occasion) => ({ occasion })),
            }
          : undefined,
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

export const updateWornDate = async (clothingId: string) => {
  try {
    const wornRecord = await prisma.worn.findFirst({
      where: {
        clothing_id: clothingId,
      },
    });

    if (!wornRecord) {
      const newWorn = await prisma.worn.create({
        data: {
          clothing: {
            connect: { id: clothingId },
          },
          last_worn: new Date(),
          count: 1,
        },
      });
      return newWorn;
    }

    const updatedWorn = await prisma.worn.update({
      where: {
        id: wornRecord.id,
      },
      data: {
        last_worn: new Date(),
        count: {
          increment: 1,
        },
      },
    });

    return updatedWorn;
  } catch (error) {
    console.error('Error updating worn date:', error);
    throw error;
  }
};
