import { ClosetProps } from '../types/closet';
import prisma from './db';

export const createCloset = async (body: ClosetProps) => {
  try {
    const newCloset = await prisma.closet.create({
      data: {
        name: body.name || '',
        description: body.description || '',
        user_id: body.user_id,
      },
    });

    return newCloset;
  } catch (error) {
    console.error('Error creating closet:', error);
    throw error;
  }
};

export const getAllClosetsByUser = async (userId: string) => {
  try {
    const closets = await prisma.closet.findMany({
      where: {
        user_id: userId,
      },
    });

    return closets;
  } catch (error) {
    console.error('Error retrieving closets for user:', error);
    throw error;
  }
};

export const deleteCloset = async (closetId: string) => {
  try {
    await prisma.clothing.deleteMany({
      where: {
        closet_id: closetId,
      },
    });

    const deletedCloset = await prisma.closet.delete({
      where: {
        id: closetId,
      },
    });

    return deletedCloset;
  } catch (error) {
    console.error('Error deleting closet:', error);
    throw error;
  }
};

export const updateClosetDetails = async (
  closetId: string,
  name: string,
  description: string
) => {
  try {
    const updatedCloset = await prisma.closet.update({
      where: { id: closetId },
      data: { name, description },
    });

    return updatedCloset;
  } catch (error) {
    console.error('Error updating closet details:', error);
    throw error;
  }
};
