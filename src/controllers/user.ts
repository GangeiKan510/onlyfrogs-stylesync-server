import prisma from './db';
import { Prisma, User } from '@prisma/client';

export const getUsers = async () => {
  const users = await prisma.user.findMany();
  return users;
};

export const createUser = async (body: User) => {};
