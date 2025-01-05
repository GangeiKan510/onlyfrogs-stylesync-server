import prisma from './db';
import { ClothingProps, UpdateClothingDetailsProps } from '../types/clothing';

export const createClothing = async (body: ClothingProps) => {
  try {
    const newClothing = await prisma.clothing.create({
      data: {
        image_url: body.image_url,
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
      where: { id: clothingId },
      data: {
        image_url: updates.image_url ?? undefined,
        closet_id: updates.closet_id ?? undefined,
        material: updates.material ?? undefined,
        pattern: updates.pattern ?? undefined,
        brand: updates.brand ?? undefined,
        color: updates.color ?? undefined,
        name: updates.name ?? undefined,
        seasons: updates.season
          ? {
              deleteMany: {},
              create: updates.season.map((season: string) => ({ season })),
            }
          : undefined,
        occasions: updates.occasion
          ? {
              deleteMany: {},
              create: updates.occasion.map((occasion: string) => ({
                occasion,
              })),
            }
          : undefined,
        categories: updates.category
          ? {
              deleteMany: {},
              create: [
                {
                  category: updates.category.name,
                  type: updates.category.type,
                },
              ],
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
    await prisma.fitClothing.deleteMany({
      where: { clothing_id: clothingId },
    });

    await prisma.clothingSeason.deleteMany({
      where: { clothing_id: clothingId },
    });

    await prisma.clothingTag.deleteMany({
      where: { clothing_id: clothingId },
    });

    await prisma.clothingCategory.deleteMany({
      where: { clothing_id: clothingId },
    });

    await prisma.clothingOccasion.deleteMany({
      where: { clothing_id: clothingId },
    });

    await prisma.worn.deleteMany({
      where: { clothing_id: clothingId },
    });

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

export const getSelectedClothingDetails = async (clothingIds: string[]) => {
  try {
    const clothes = await prisma.clothing.findMany({
      where: { id: { in: clothingIds } },
      include: {
        tags: true,
        categories: true,
        seasons: true,
        occasions: true,
        worn: true,
      },
    });
    return clothes;
  } catch (error) {
    console.error('Error fetching selected clothing details:', error);
    throw error;
  }
};

export const getUserClosetClothes = async (userId: string) => {
  try {
    const closetClothes = await prisma.clothing.findMany({
      where: { closet: { user_id: userId } },
      include: {
        tags: true,
        categories: true,
        seasons: true,
        occasions: true,
        worn: true,
      },
    });
    return closetClothes;
  } catch (error) {
    console.error('Error fetching user closet clothes:', error);
    throw error;
  }
};
