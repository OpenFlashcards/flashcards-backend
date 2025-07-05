import { Test, TestingModule } from '@nestjs/testing';
import { DeckController } from './deck.controller';
import { DeckService } from './deck.service';
import { CreateDeckDto, AddUserToDeckDto, UserRole } from './dto';

describe('DeckController', () => {
  let controller: DeckController;

  const mockDeckService = {
    getUserDecks: jest.fn(),
    createDeck: jest.fn(),
    addUserToDeck: jest.fn(),
    getDeckById: jest.fn(),
    removeUserFromDeck: jest.fn(),
    leaveDeck: jest.fn(),
    deleteDeck: jest.fn(),
  };

  const mockUser = {
    id: 1,
    email: 'test@example.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeckController],
      providers: [
        {
          provide: DeckService,
          useValue: mockDeckService,
        },
      ],
    }).compile();

    controller = module.get<DeckController>(DeckController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserDecks', () => {
    it('should return user decks', async () => {
      const mockDecks = [
        {
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
        },
      ];

      mockDeckService.getUserDecks.mockResolvedValue(mockDecks);

      const result = await controller.getUserDecks(mockUser);

      expect(result).toEqual(mockDecks);
      expect(mockDeckService.getUserDecks).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('getDeckById', () => {
    it('should return specific deck', async () => {
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

      mockDeckService.getDeckById.mockResolvedValue(mockDeck);

      const result = await controller.getDeckById(mockUser, deckId);

      expect(result).toEqual(mockDeck);
      expect(mockDeckService.getDeckById).toHaveBeenCalledWith(
        mockUser.id,
        deckId,
      );
    });
  });

  describe('createDeck', () => {
    it('should create a new deck', async () => {
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
        userDecks: [],
        subDecks: [],
        parentDeck: null,
      };

      mockDeckService.createDeck.mockResolvedValue(mockCreatedDeck);

      const result = await controller.createDeck(mockUser, createDeckDto);

      expect(result).toEqual(mockCreatedDeck);
      expect(mockDeckService.createDeck).toHaveBeenCalledWith(
        mockUser.id,
        createDeckDto,
      );
    });
  });

  describe('addUserToDeck', () => {
    it('should add user to deck', async () => {
      const deckId = 1;
      const addUserDto: AddUserToDeckDto = {
        email: 'newuser@example.com',
        role: UserRole.MEMBER,
      };

      mockDeckService.addUserToDeck.mockResolvedValue(undefined);

      await controller.addUserToDeck(mockUser, deckId, addUserDto);

      expect(mockDeckService.addUserToDeck).toHaveBeenCalledWith(
        mockUser.id,
        deckId,
        addUserDto,
      );
    });
  });

  describe('removeUserFromDeck', () => {
    it('should remove user from deck', async () => {
      const deckId = 1;
      const userIdToRemove = 2;

      mockDeckService.removeUserFromDeck.mockResolvedValue(undefined);

      await controller.removeUserFromDeck(mockUser, deckId, userIdToRemove);

      expect(mockDeckService.removeUserFromDeck).toHaveBeenCalledWith(
        mockUser.id,
        deckId,
        userIdToRemove,
      );
    });
  });

  describe('leaveDeck', () => {
    it('should leave deck successfully', async () => {
      const deckId = 1;
      const mockResult = {
        deckDeleted: false,
        message: 'Successfully left the deck',
      };

      jest.spyOn(mockDeckService, 'leaveDeck').mockResolvedValue(mockResult);

      const result = await controller.leaveDeck(deckId, mockUser);

      expect(result).toEqual(mockResult);
      expect(mockDeckService.leaveDeck).toHaveBeenCalledWith(
        mockUser.id,
        deckId,
      );
    });
  });

  describe('deleteDeck', () => {
    it('should delete a deck successfully', async () => {
      const deckId = 1;
      mockDeckService.deleteDeck = jest.fn().mockResolvedValue(undefined);

      await controller.deleteDeck(mockUser, deckId);

      expect(mockDeckService.deleteDeck).toHaveBeenCalledWith(
        mockUser.id,
        deckId,
      );
    });
  });
});
