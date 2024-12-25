import prisma from '../../src/controllers/db';
import {
  getUserByEmail,
  getUserById,
  createUser,
  updateUser,
  updateSkinToneDetails,
  updateUserPreferences,
} from '../../src/controllers/user';

jest.mock('../../src/controllers/db', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  promptSettings: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('../../src/controllers/chat', () => ({
  createChatSession: jest
    .fn()
    .mockResolvedValue({ status: 201, session: { id: 'chat-123' } }),
}));

jest.mock('../../src/controllers/notification', () => ({
  createNotification: jest.fn().mockResolvedValue(true),
}));

describe('User Controller', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    skin_tone_classification: null,
    skin_tone_complements: [],
    season: null,
    sub_season: null,
  };

  describe('getUserByEmail', () => {
    it('should return user details for a valid email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const user = await getUserByEmail('test@example.com');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: expect.any(Object),
      });
      expect(user).toEqual(mockUser);
    });

    it('should throw an error if the user is not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getUserByEmail('nonexistent@example.com')).rejects.toThrow(
        'User not found'
      );
    });
  });

  describe('getUserById', () => {
    it('should return user details for a valid user ID', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await getUserById('user-123');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        include: expect.any(Object),
      });
      expect(result).toEqual({ status: 200, user: mockUser });
    });

    it('should return 404 if the user is not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getUserById('nonexistent-id');
      expect(result).toEqual({
        status: 404,
        message: 'User not found',
      });
    });
  });

  describe('createUser', () => {
    it('should create a new user with default values', async () => {
      const mockCreatedUser = { ...mockUser, id: 'new-user-123' };
      const mockPromptSettings = {
        user_id: 'new-user-123',
        consider_skin_tone: false,
      };
      const mockChatSession = { session: { id: 'chat-123' }, status: 201 };

      (prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);
      (prisma.promptSettings.create as jest.Mock).mockResolvedValue(
        mockPromptSettings
      );
      jest.mock('../../src/controllers/chat', () => ({
        createChatSession: jest.fn().mockResolvedValue(mockChatSession),
      }));

      const newUser = await createUser({
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane@example.com',
      });

      expect(prisma.user.create).toHaveBeenCalled();
      expect(newUser).toEqual({
        ...mockCreatedUser,
        chatSession: mockChatSession.session,
        promptSettings: mockPromptSettings,
      });
    });

    it('should throw an error if user creation fails', async () => {
      (prisma.user.create as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(
        createUser({
          first_name: 'Jane',
          last_name: 'Doe',
          email: 'jane@example.com',
        })
      ).rejects.toThrow('Database error');
    });
  });

  describe('updateUser', () => {
    it('should update user details successfully', async () => {
      const updatedUser = { ...mockUser, height: 180, weight: 75 };

      (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await updateUser('user-123', {
        height_cm: 180,
        weight_kg: 75,
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { height: 180, weight: 75 },
      });
      expect(result).toEqual(updatedUser);
    });

    it('should throw an error if update fails', async () => {
      (prisma.user.update as jest.Mock).mockRejectedValue(
        new Error('Update failed')
      );

      await expect(
        updateUser('user-123', { height_cm: 180, weight_kg: 75 })
      ).rejects.toThrow('Update failed');
    });
  });

  describe('updateSkinToneDetails', () => {
    it('should update skin tone details successfully', async () => {
      const updatedUser = {
        ...mockUser,
        skin_tone_classification: 'Warm',
        skin_tone_complements: ['red', 'orange'],
        season: 'Spring',
        sub_season: 'Early Spring',
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await updateSkinToneDetails(
        'user-123',
        'Warm',
        ['red', 'orange'],
        'Spring',
        'Early Spring'
      );

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          skin_tone_classification: 'Warm',
          skin_tone_complements: ['red', 'orange'],
          season: 'Spring',
          sub_season: 'Early Spring',
        },
      });
      expect(result).toEqual({
        status: 200,
        message: 'Skin tone analysis updated successfully',
        user: updatedUser,
      });
    });

    it('should return 500 if update fails', async () => {
      (prisma.user.update as jest.Mock).mockRejectedValue(
        new Error('Update failed')
      );

      const result = await updateSkinToneDetails(
        'user-123',
        'Warm',
        ['red', 'orange'],
        'Spring',
        'Early Spring'
      );

      expect(result).toEqual({
        status: 500,
        message: 'Internal Server Error',
        error: 'Update failed',
      });
    });
  });

  describe('updateUserPreferences', () => {
    it('should update user preferences successfully', async () => {
      const updatedUser = {
        ...mockUser,
        preferred_brands: ['Brand A', 'Brand B'],
        budget_min: 100,
        budget_max: 500,
        favorite_colors: ['red', 'blue'],
        preferred_style: ['casual', 'formal'],
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await updateUserPreferences(
        'user-123',
        ['Brand A', 'Brand B'],
        { min: 100, max: 500 },
        ['red', 'blue'],
        ['casual', 'formal']
      );

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          preferred_brands: ['Brand A', 'Brand B'],
          budget_min: 100,
          budget_max: 500,
          favorite_colors: ['red', 'blue'],
          preferred_style: ['casual', 'formal'],
        },
      });
      expect(result).toEqual({
        status: 200,
        message: 'User preferences updated successfully',
        user: updatedUser,
      });
    });

    it('should return 500 if update fails', async () => {
      (prisma.user.update as jest.Mock).mockRejectedValue(
        new Error('Update failed')
      );

      const result = await updateUserPreferences(
        'user-123',
        ['Brand A', 'Brand B'],
        { min: 100, max: 500 },
        ['red', 'blue'],
        ['casual', 'formal']
      );

      expect(result).toEqual({
        status: 500,
        message: 'Internal Server Error',
        error: 'Update failed',
      });
    });
  });
});
