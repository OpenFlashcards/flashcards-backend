import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { DeckService } from './deck.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeckDto, AddUserToDeckDto, UserRole } from './dto';

describe('DeckService', () => {
  let service: DeckService;

  const mockPrismaService = {
    userDeck: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    deck: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeckService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DeckService>(DeckService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserDecks', () => {
    it('should return user decks successfully', async () => {
      const userId = 1;
      const mockUserDecks = [
        {
          deck: {
            id: 1,
            name: 'Test Deck',
            description: 'Test Description',
            isPublic: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            parentDeckId: null,
            userDecks: [
              {
                id: 1,
                userId: 1,
                deckId: 1,
                role: 'admin',
                user: {
                  id: 1,
                  email: 'test@example.com',
                  name: 'Test User',
                },
              },
            ],
            subDecks: [],
            parentDeck: null,
          },
        },
      ];

      mockPrismaService.userDeck.findMany.mockResolvedValue(mockUserDecks);

      const result = await service.getUserDecks(userId);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Test Deck');
      expect(mockPrismaService.userDeck.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: {
          deck: {
            include: {
              userDecks: {
                include: {
                  user: {
                    select: {
                      id: true,
                      email: true,
                      name: true,
                    },
                  },
                },
              },
              subDecks: true,
              parentDeck: true,
            },
          },
        },
        orderBy: {
          deck: {
            createdAt: 'desc',
          },
        },
      });
    });
  });

  describe('createDeck', () => {
    it('should create a deck successfully', async () => {
      const userId = 1;
      const createDeckDto: CreateDeckDto = {
        name: 'New Deck',
        description: 'New Description',
        isPublic: false,
      };

      const mockCreatedDeck = {
        id: 1,
        name: 'New Deck',
        description: 'New Description',
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        parentDeckId: null,
        userDecks: [
          {
            id: 1,
            userId: 1,
            deckId: 1,
            role: 'admin',
            user: {
              id: 1,
              email: 'test@example.com',
              name: 'Test User',
            },
          },
        ],
        subDecks: [],
        parentDeck: null,
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockPrismaService);
      });

      mockPrismaService.deck.create.mockResolvedValue({ id: 1 });
      mockPrismaService.userDeck.create.mockResolvedValue({});
      mockPrismaService.deck.findUnique.mockResolvedValue(mockCreatedDeck);

      const result = await service.createDeck(userId, createDeckDto);

      expect(result.name).toBe('New Deck');
      expect(result.userDecks[0].role).toBe('admin');
    });
  });

  describe('addUserToDeck', () => {
    it('should add user to deck successfully', async () => {
      const requestingUserId = 1;
      const deckId = 1;
      const addUserDto: AddUserToDeckDto = {
        email: 'newuser@example.com',
        role: UserRole.MEMBER,
      };

      // Mock user has admin access
      mockPrismaService.userDeck.findUnique
        .mockResolvedValueOnce({ role: 'admin' }) // For access check
        .mockResolvedValueOnce(null); // For duplicate check

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 2,
        email: 'newuser@example.com',
      });

      mockPrismaService.userDeck.create.mockResolvedValue({});

      await service.addUserToDeck(requestingUserId, deckId, addUserDto);

      expect(mockPrismaService.userDeck.create).toHaveBeenCalledWith({
        data: {
          userId: 2,
          deckId,
          role: UserRole.MEMBER,
        },
      });
    });

    it('should throw ForbiddenException for insufficient permissions', async () => {
      const requestingUserId = 1;
      const deckId = 1;
      const addUserDto: AddUserToDeckDto = {
        email: 'newuser@example.com',
        role: UserRole.MEMBER,
      };

      // Mock user has only member access
      mockPrismaService.userDeck.findUnique.mockResolvedValue({
        role: 'member',
      });

      await expect(
        service.addUserToDeck(requestingUserId, deckId, addUserDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      const requestingUserId = 1;
      const deckId = 1;
      const addUserDto: AddUserToDeckDto = {
        email: 'nonexistent@example.com',
        role: UserRole.MEMBER,
      };

      // Mock user has admin access
      mockPrismaService.userDeck.findUnique.mockResolvedValue({
        role: 'admin',
      });
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.addUserToDeck(requestingUserId, deckId, addUserDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException for duplicate user', async () => {
      const requestingUserId = 1;
      const deckId = 1;
      const addUserDto: AddUserToDeckDto = {
        email: 'existing@example.com',
        role: UserRole.MEMBER,
      };

      // Mock user has admin access
      mockPrismaService.userDeck.findUnique
        .mockResolvedValueOnce({ role: 'admin' }) // For access check
        .mockResolvedValueOnce({ id: 1 }); // For duplicate check

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 2,
        email: 'existing@example.com',
      });

      await expect(
        service.addUserToDeck(requestingUserId, deckId, addUserDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getDeckById', () => {
    it('should return deck by ID successfully', async () => {
      const userId = 1;
      const deckId = 1;

      const mockDeck = {
        id: 1,
        name: 'Test Deck',
        description: 'Test Description',
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        parentDeckId: null,
        userDecks: [],
        subDecks: [],
        parentDeck: null,
      };

      // Mock user has access
      mockPrismaService.userDeck.findUnique.mockResolvedValue({
        role: 'member',
      });
      mockPrismaService.deck.findUnique.mockResolvedValue(mockDeck);

      const result = await service.getDeckById(userId, deckId);

      expect(result.name).toBe('Test Deck');
    });

    it('should throw NotFoundException for non-existent deck', async () => {
      const userId = 1;
      const deckId = 999;

      // Mock user has access
      mockPrismaService.userDeck.findUnique.mockResolvedValue({
        role: 'member',
      });
      mockPrismaService.deck.findUnique.mockResolvedValue(null);

      await expect(service.getDeckById(userId, deckId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException for no access', async () => {
      const userId = 1;
      const deckId = 1;

      // Mock user has no access
      mockPrismaService.userDeck.findUnique.mockResolvedValue(null);

      await expect(service.getDeckById(userId, deckId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeUserFromDeck', () => {
    it('should remove user from deck successfully', async () => {
      const requestingUserId = 1;
      const deckId = 1;
      const userIdToRemove = 2;

      // Mock requesting user has admin access
      mockPrismaService.userDeck.findUnique
        .mockResolvedValueOnce({
          role: 'admin',
        }) // For access check
        .mockResolvedValueOnce({
          id: 2,
          userId: userIdToRemove,
          deckId,
          role: 'member',
        }); // For user to remove check

      mockPrismaService.userDeck.delete.mockResolvedValue({});

      await service.removeUserFromDeck(
        requestingUserId,
        deckId,
        userIdToRemove,
      );

      expect(mockPrismaService.userDeck.delete).toHaveBeenCalledWith({
        where: {
          userId_deckId: {
            userId: userIdToRemove,
            deckId,
          },
        },
      });
    });

    it('should throw BadRequestException when user tries to remove themselves', async () => {
      const requestingUserId = 1;
      const deckId = 1;
      const userIdToRemove = 1; // Same as requesting user

      // Mock requesting user has admin access
      mockPrismaService.userDeck.findUnique
        .mockResolvedValueOnce({
          role: 'admin',
        }) // For access check
        .mockResolvedValueOnce({
          id: 1,
          userId: userIdToRemove,
          deckId,
          role: 'admin',
        }); // User to remove (themselves)

      await expect(
        service.removeUserFromDeck(requestingUserId, deckId, userIdToRemove),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when user is not in deck', async () => {
      const requestingUserId = 1;
      const deckId = 1;
      const userIdToRemove = 2;

      // Mock requesting user has admin access
      mockPrismaService.userDeck.findUnique
        .mockResolvedValueOnce({
          role: 'admin',
        }) // For access check
        .mockResolvedValueOnce(null); // User to remove not found

      await expect(
        service.removeUserFromDeck(requestingUserId, deckId, userIdToRemove),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow admin to remove another admin', async () => {
      const requestingUserId = 1;
      const deckId = 1;
      const userIdToRemove = 2;

      // Mock requesting user has admin access
      mockPrismaService.userDeck.findUnique
        .mockResolvedValueOnce({
          role: 'admin',
        }) // For access check
        .mockResolvedValueOnce({
          id: 2,
          userId: userIdToRemove,
          deckId,
          role: 'admin',
        }) // User to remove is admin
        .mockResolvedValueOnce({
          role: 'admin',
        }); // Requesting user role check

      mockPrismaService.userDeck.delete.mockResolvedValue({});

      await service.removeUserFromDeck(
        requestingUserId,
        deckId,
        userIdToRemove,
      );

      expect(mockPrismaService.userDeck.delete).toHaveBeenCalledWith({
        where: {
          userId_deckId: {
            userId: userIdToRemove,
            deckId,
          },
        },
      });
    });
  });

  describe('leaveDeck', () => {
    it('should allow user to leave deck successfully', async () => {
      const userId = 1;
      const deckId = 1;

      // Mock user in deck
      mockPrismaService.userDeck.findUnique.mockResolvedValue({
        id: 1,
        userId,
        deckId,
        role: 'member',
      });

      // Mock transaction
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockPrisma = {
          userDeck: {
            findMany: jest.fn().mockResolvedValue([
              { userId: 1, role: 'member' },
              { userId: 2, role: 'admin' },
            ]),
            delete: jest.fn(),
          },
        };
        return callback(mockPrisma);
      });

      const result = await service.leaveDeck(userId, deckId);

      expect(result.deckDeleted).toBe(false);
      expect(result.message).toBe('Successfully left the deck');
      expect(result.newAdminId).toBeUndefined();
    });

    it('should promote new admin when last admin leaves', async () => {
      const userId = 1;
      const deckId = 1;

      // Mock user in deck (admin leaving)
      mockPrismaService.userDeck.findUnique.mockResolvedValue({
        id: 1,
        userId,
        deckId,
        role: 'admin',
      });

      // Mock transaction
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockPrisma = {
          userDeck: {
            findMany: jest.fn().mockResolvedValue([
              { userId: 1, role: 'admin' },
              { userId: 2, role: 'member' },
            ]),
            delete: jest.fn(),
            update: jest.fn(),
          },
        };
        return callback(mockPrisma);
      });

      const result = await service.leaveDeck(userId, deckId);

      expect(result.deckDeleted).toBe(false);
      expect(result.message).toBe('Left deck and user 2 was promoted to admin');
      expect(result.newAdminId).toBe(2);
    });

    it('should delete deck when last user leaves', async () => {
      const userId = 1;
      const deckId = 1;

      // Mock user in deck (only user)
      mockPrismaService.userDeck.findUnique.mockResolvedValue({
        id: 1,
        userId,
        deckId,
        role: 'admin',
      });

      // Mock transaction
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockPrisma = {
          userDeck: {
            findMany: jest
              .fn()
              .mockResolvedValue([{ userId: 1, role: 'admin' }]),
            delete: jest.fn(),
          },
          deck: {
            delete: jest.fn(),
          },
        };
        return callback(mockPrisma);
      });

      const result = await service.leaveDeck(userId, deckId);

      expect(result.deckDeleted).toBe(true);
      expect(result.message).toBe(
        'Left deck and deck was deleted as no users remained',
      );
    });

    it('should throw NotFoundException when user is not in deck', async () => {
      const userId = 1;
      const deckId = 1;

      mockPrismaService.userDeck.findUnique.mockResolvedValue(null);

      await expect(service.leaveDeck(userId, deckId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
