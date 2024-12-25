import prisma from '../../src/controllers/db';
import {
  createClothing,
  updateClothing,
  deleteClothing,
  updateWornDate,
} from '../../src/controllers/clothing';

jest.mock('../../src/controllers/db', () => ({
  clothing: {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  worn: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

describe('Clothing Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createClothing', () => {
    it('should create a new clothing item successfully', async () => {
      const mockClothingData = {
        id: 'clothing-123',
        image_url: 'http://example.com/image.jpg',
        category: JSON.stringify({ type: 'Tops', name: 'T-Shirts' }),
        tags: ['casual', 'summer'],
        user_id: 'user-123',
        closet_id: 'closet-123',
        worn: [{ last_worn: null }],
      };

      (prisma.clothing.create as jest.Mock).mockResolvedValue(mockClothingData);

      const result = await createClothing(mockClothingData);
      expect(prisma.clothing.create).toHaveBeenCalledWith({
        data: {
          image_url: mockClothingData.image_url,
          category: mockClothingData.category,
          tags: mockClothingData.tags,
          user_id: mockClothingData.user_id,
          closet_id: mockClothingData.closet_id,
          worn: { create: { last_worn: null } },
        },
        include: { worn: true },
      });
      expect(result).toEqual(mockClothingData);
    });

    it('should throw an error when creation fails', async () => {
      (prisma.clothing.create as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(createClothing({} as any)).rejects.toThrow('Database error');
    });
  });

  describe('updateClothing', () => {
    it('should update a clothing item successfully', async () => {
      const clothingId = 'clothing-123';
      const updates = {
        category: JSON.stringify({ type: 'Outerwear', name: 'Jackets' }),
        tags: ['winter', 'formal'],
      };

      const mockUpdatedClothing = {
        id: clothingId,
        category: updates.category,
        tags: updates.tags,
      };

      (prisma.clothing.update as jest.Mock).mockResolvedValue(
        mockUpdatedClothing
      );

      const result = await updateClothing(clothingId, updates);

      expect(prisma.clothing.update).toHaveBeenCalledWith({
        where: { id: clothingId },
        data: {
          category: updates.category,
          tags: updates.tags,
        },
      });
      expect(result).toEqual(mockUpdatedClothing);
    });
  });
  describe('deleteClothing', () => {
    it('should delete a clothing item successfully', async () => {
      const mockDeletedClothing = {
        id: 'clothing-123',
      };

      (prisma.clothing.delete as jest.Mock).mockResolvedValue(
        mockDeletedClothing
      );

      const result = await deleteClothing('clothing-123');
      expect(prisma.clothing.delete).toHaveBeenCalledWith({
        where: { id: 'clothing-123' },
      });
      expect(result).toEqual(mockDeletedClothing);
    });

    it('should throw an error when deletion fails', async () => {
      (prisma.clothing.delete as jest.Mock).mockRejectedValue(
        new Error('Delete failed')
      );

      await expect(deleteClothing('invalid-id')).rejects.toThrow(
        'Delete failed'
      );
    });
  });

  describe('updateWornDate', () => {
    it('should create a new worn record if none exists', async () => {
      const mockNewWorn = {
        id: 'worn-123',
        last_worn: new Date(),
        count: 1,
      };

      (prisma.worn.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.worn.create as jest.Mock).mockResolvedValue(mockNewWorn);

      const result = await updateWornDate('clothing-123');
      expect(prisma.worn.findFirst).toHaveBeenCalledWith({
        where: { clothing_id: 'clothing-123' },
      });
      expect(prisma.worn.create).toHaveBeenCalledWith({
        data: {
          clothing: { connect: { id: 'clothing-123' } },
          last_worn: expect.any(Date),
          count: 1,
        },
      });
      expect(result).toEqual(mockNewWorn);
    });

    it('should update the worn record if it exists', async () => {
      const mockWornRecord = {
        id: 'worn-123',
      };
      const mockUpdatedWorn = {
        id: 'worn-123',
        last_worn: new Date(),
        count: 2,
      };

      (prisma.worn.findFirst as jest.Mock).mockResolvedValue(mockWornRecord);
      (prisma.worn.update as jest.Mock).mockResolvedValue(mockUpdatedWorn);

      const result = await updateWornDate('clothing-123');
      expect(prisma.worn.update).toHaveBeenCalledWith({
        where: { id: 'worn-123' },
        data: {
          last_worn: expect.any(Date),
          count: { increment: 1 },
        },
      });
      expect(result).toEqual(mockUpdatedWorn);
    });

    it('should throw an error when updating worn date fails', async () => {
      (prisma.worn.findFirst as jest.Mock).mockRejectedValue(
        new Error('Worn update failed')
      );

      await expect(updateWornDate('invalid-id')).rejects.toThrow(
        'Worn update failed'
      );
    });
  });
});
