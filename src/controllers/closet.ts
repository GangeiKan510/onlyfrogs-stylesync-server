import { ClosetProps } from '../types/closet';
import prisma from './db';

export const createCloset = async (body: ClosetProps) => {
  try {
    const newCloset = await prisma.closet.create({
      data: {
        name: body.name,
        description: body.description,
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
