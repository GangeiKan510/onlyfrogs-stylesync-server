import prisma from '../../src/controllers/db';
import {
  createCloset,
  getAllClosetsByUser,
  deleteCloset,
  updateClosetDetails,
} from '../../src/controllers/closet';

jest.mock('../../src/controllers/db', () => ({
  closet: {
    create: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
  clothing: {
    deleteMany: jest.fn(),
  },
}));

describe('Closet Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCloset', () => {
    it('should create a new closet successfully', async () => {
      const mockClosetData = {
        id: 'closet-123',
        name: 'Summer Closet',
        description: 'Clothes for summer',
        user_id: 'user-123',
      };

      (prisma.closet.create as jest.Mock).mockResolvedValue(mockClosetData);

      const result = await createCloset(mockClosetData);
      expect(prisma.closet.create).toHaveBeenCalledWith({
        data: {
          name: mockClosetData.name,
          description: mockClosetData.description,
          user_id: mockClosetData.user_id,
        },
      });
      expect(result).toEqual(mockClosetData);
    });

    it('should throw an error when closet creation fails', async () => {
      (prisma.closet.create as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(createCloset({} as any)).rejects.toThrow('Database error');
    });
  });

  describe('getAllClosetsByUser', () => {
    it('should retrieve all closets for a user successfully', async () => {
      const mockClosets = [
        { id: 'closet-123', name: 'Summer Closet', description: '' },
        { id: 'closet-124', name: 'Winter Closet', description: '' },
      ];

      (prisma.closet.findMany as jest.Mock).mockResolvedValue(mockClosets);

      const result = await getAllClosetsByUser('user-123');
      expect(prisma.closet.findMany).toHaveBeenCalledWith({
        where: { user_id: 'user-123' },
      });
      expect(result).toEqual(mockClosets);
    });

    it('should throw an error when retrieval fails', async () => {
      (prisma.closet.findMany as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(getAllClosetsByUser('user-123')).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('deleteCloset', () => {
    it('should delete a closet and its clothing successfully', async () => {
      const mockDeletedCloset = { id: 'closet-123', name: 'Summer Closet' };

      (prisma.clothing.deleteMany as jest.Mock).mockResolvedValue({ count: 5 });
      (prisma.closet.delete as jest.Mock).mockResolvedValue(mockDeletedCloset);

      const result = await deleteCloset('closet-123');
      expect(prisma.clothing.deleteMany).toHaveBeenCalledWith({
        where: { closet_id: 'closet-123' },
      });
      expect(prisma.closet.delete).toHaveBeenCalledWith({
        where: { id: 'closet-123' },
      });
      expect(result).toEqual(mockDeletedCloset);
    });

    it('should throw an error when deletion fails', async () => {
      (prisma.closet.delete as jest.Mock).mockRejectedValue(
        new Error('Delete failed')
      );

      await expect(deleteCloset('closet-123')).rejects.toThrow('Delete failed');
    });
  });

  describe('updateClosetDetails', () => {
    it('should update closet details successfully', async () => {
      const mockUpdatedCloset = {
        id: 'closet-123',
        name: 'Updated Closet Name',
        description: 'Updated Description',
      };

      (prisma.closet.update as jest.Mock).mockResolvedValue(mockUpdatedCloset);

      const result = await updateClosetDetails(
        'closet-123',
        'Updated Closet Name',
        'Updated Description'
      );
      expect(prisma.closet.update).toHaveBeenCalledWith({
        where: { id: 'closet-123' },
        data: {
          name: 'Updated Closet Name',
          description: 'Updated Description',
        },
      });
      expect(result).toEqual(mockUpdatedCloset);
    });

    it('should throw an error when update fails', async () => {
      (prisma.closet.update as jest.Mock).mockRejectedValue(
        new Error('Update failed')
      );

      await expect(
        updateClosetDetails(
          'closet-123',
          'Updated Closet Name',
          'Updated Description'
        )
      ).rejects.toThrow('Update failed');
    });
  });
});
