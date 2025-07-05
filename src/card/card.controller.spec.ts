import { Test, TestingModule } from '@nestjs/testing';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { CreateCardDto, CardResponseDto } from './dto';

describe('CardController', () => {
  let controller: CardController;
  let cardService: CardService;

  const mockCardService = {
    createCard: jest.fn(),
    getCardsByDeck: jest.fn(),
    getCardById: jest.fn(),
    deleteCard: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardController],
      providers: [
        {
          provide: CardService,
          useValue: mockCardService,
        },
      ],
    }).compile();

    controller = module.get<CardController>(CardController);
    cardService = module.get<CardService>(CardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCard', () => {
    it('should create a card', async () => {
      const deckId = 1;
      const user = { id: 1 };
      const createCardDto: CreateCardDto = {
        question: 'What is the capital of France?',
        answer: 'Paris',
      };
      const expectedResult: CardResponseDto = {
        id: 1,
        question: createCardDto.question,
        answer: createCardDto.answer,
        deckId,
        createdById: user.id,
        createdByName: 'John Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCardService.createCard.mockResolvedValue(expectedResult);

      const result = await controller.createCard(deckId, createCardDto, user);

      expect(result).toBe(expectedResult);
      expect(mockCardService.createCard).toHaveBeenCalledWith(
        deckId,
        createCardDto,
        user.id,
      );
    });
  });

  describe('getCardsByDeck', () => {
    it('should return cards for a deck', async () => {
      const deckId = 1;
      const user = { id: 1 };
      const expectedResult: CardResponseDto[] = [
        {
          id: 1,
          question: 'Question 1',
          answer: 'Answer 1',
          deckId,
          createdById: user.id,
          createdByName: 'John Doe',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockCardService.getCardsByDeck.mockResolvedValue(expectedResult);

      const result = await controller.getCardsByDeck(deckId, user);

      expect(result).toBe(expectedResult);
      expect(mockCardService.getCardsByDeck).toHaveBeenCalledWith(
        deckId,
        user.id,
      );
    });
  });

  describe('getCardById', () => {
    it('should return a card by ID', async () => {
      const cardId = 1;
      const user = { id: 1 };
      const expectedResult: CardResponseDto = {
        id: cardId,
        question: 'Question 1',
        answer: 'Answer 1',
        deckId: 1,
        createdById: user.id,
        createdByName: 'John Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCardService.getCardById.mockResolvedValue(expectedResult);

      const result = await controller.getCardById(cardId, user);

      expect(result).toBe(expectedResult);
      expect(mockCardService.getCardById).toHaveBeenCalledWith(cardId, user.id);
    });
  });

  describe('deleteCard', () => {
    it('should delete a card', async () => {
      const cardId = 1;
      const user = { id: 1 };

      mockCardService.deleteCard.mockResolvedValue(undefined);

      await controller.deleteCard(cardId, user);

      expect(mockCardService.deleteCard).toHaveBeenCalledWith(cardId, user.id);
    });
  });
});
