import prisma from './db';
import { FitProps } from '../types/fits';

export const createFit = async (body: FitProps) => {
  try {
    const newFit = await prisma.fit.create({
      data: {
        name: body.name || '',
        thumbnail_url: body.thumbnail_url || null,
        user_id: body.user_id,
      },
    });

    await prisma.fitClothing.createMany({
      data: body.piece_ids.map((id: string) => ({
        fit_id: newFit.id,
        clothing_id: id,
      })),
    });

    const fitWithClothes = await prisma.fit.findUnique({
      where: { id: newFit.id },
      include: { clothes: true },
    });

    return fitWithClothes;
  } catch (error) {
    console.error('Error creating fit:', error);
    throw error;
  }
};
export const renameFit = async (fitId: string, newName: string) => {
  try {
    const updatedFit = await prisma.fit.update({
      where: { id: fitId },
      data: { name: newName },
    });

    return updatedFit;
  } catch (error) {
    console.error('Error renaming fit:', error);
    throw error;
  }
};

export const deleteFit = async (fitId: string) => {
  try {
    await prisma.fitClothing.deleteMany({
      where: { fit_id: fitId },
    });

    const deletedFit = await prisma.fit.delete({
      where: { id: fitId },
    });

    return deletedFit;
  } catch (error) {
    console.error('Error deleting fit:', error);
    throw error;
  }
};
