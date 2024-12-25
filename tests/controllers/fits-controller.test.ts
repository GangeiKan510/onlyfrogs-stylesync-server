import prisma from '../../src/controllers/db';
import { createFit, renameFit, deleteFit } from '../../src/controllers/fits';

jest.mock('../../src/controllers/db', () => ({
  fit: {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('Fit Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createFit', () => {
    it('should create a new fit successfully', async () => {
      const mockFitData = {
        id: 'fit-123',
        name: 'Casual Outfit',
        thumbnail_url: 'http://example.com/image.jpg',
        user_id: 'user-123',
        piece_ids: ['clothing-1', 'clothing-2'],
        clothes: [
          { id: 'clothing-1', name: 'Shirt' },
          { id: 'clothing-2', name: 'Jeans' },
        ],
      };

      (prisma.fit.create as jest.Mock).mockResolvedValue({
        id: mockFitData.id,
        name: mockFitData.name,
        thumbnail_url: mockFitData.thumbnail_url,
        user_id: mockFitData.user_id,
        clothes: mockFitData.clothes,
      });

      const result = await createFit(mockFitData);
      expect(prisma.fit.create).toHaveBeenCalledWith({
        data: {
          name: mockFitData.name,
          thumbnail_url: mockFitData.thumbnail_url,
          user_id: mockFitData.user_id,
          clothes: {
            connect: mockFitData.piece_ids.map((id) => ({ id })),
          },
        },
        include: {
          clothes: true,
        },
      });
      expect(result).toEqual({
        id: 'fit-123',
        name: 'Casual Outfit',
        thumbnail_url: 'http://example.com/image.jpg',
        user_id: 'user-123',
        clothes: [
          { id: 'clothing-1', name: 'Shirt' },
          { id: 'clothing-2', name: 'Jeans' },
        ],
      });
    });

    it('should throw an error when fit creation fails', async () => {
      (prisma.fit.create as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(
        createFit({
          name: 'Casual Outfit',
          thumbnail_url: undefined,
          user_id: 'user-123',
          piece_ids: [],
        })
      ).rejects.toThrow('Database error');
    });
  });

  describe('renameFit', () => {
    it('should rename a fit successfully', async () => {
      const fitId = 'fit-123';
      const newName = 'Updated Outfit';

      const mockUpdatedFit = {
        id: fitId,
        name: newName,
      };

      (prisma.fit.update as jest.Mock).mockResolvedValue(mockUpdatedFit);

      const result = await renameFit(fitId, newName);

      expect(prisma.fit.update).toHaveBeenCalledWith({
        where: { id: fitId },
        data: { name: newName },
      });
      expect(result).toEqual(mockUpdatedFit);
    });

    it('should throw an error when renaming fails', async () => {
      (prisma.fit.update as jest.Mock).mockRejectedValue(
        new Error('Rename failed')
      );

      await expect(renameFit('fit-123', 'New Name')).rejects.toThrow(
        'Rename failed'
      );
    });
  });

  describe('deleteFit', () => {
    it('should delete a fit successfully', async () => {
      const mockDeletedFit = {
        id: 'fit-123',
      };

      (prisma.fit.delete as jest.Mock).mockResolvedValue(mockDeletedFit);

      const result = await deleteFit('fit-123');
      expect(prisma.fit.delete).toHaveBeenCalledWith({
        where: { id: 'fit-123' },
      });
      expect(result).toEqual(mockDeletedFit);
    });

    it('should throw an error when deletion fails', async () => {
      (prisma.fit.delete as jest.Mock).mockRejectedValue(
        new Error('Delete failed')
      );

      await expect(deleteFit('fit-123')).rejects.toThrow('Delete failed');
    });
  });
});
