import { Request, Response } from 'express';
import Clothing from '../models/Clothing';

export const createClothing = async (req: Request, res: Response) => {
  const { name, color, type, imageUrl } = req.body;

  try {
    const newClothing = await Clothing.create({
      name,
      color,
      type,
      imageUrl,
    });

    res.status(201).json(newClothing);
  } catch (error) {
    console.error('Error creating clothing:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
