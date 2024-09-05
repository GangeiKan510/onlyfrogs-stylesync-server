import prisma from './db';
import { ClothingProps } from '../types/clothing';

export const createClothing = async (body: ClothingProps) => {
  try {
    const newClothing = await prisma.clothing.create({
      data: {
        image_url: body.image_url,
        category: body.category,
        tags: body.tags,
        user_id: body.user_id,
        closet_id: body.closet_id,
      },
    });

    return newClothing;
  } catch (error) {
    console.error('Error creating clothing:', error);
    throw error;
  }
};
