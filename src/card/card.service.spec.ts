import { Test, TestingModule } from '@nestjs/testing';
import {
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CardService } from './card.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardDto } from './dto';

describe('CardService', () => {
  let service: CardService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    card: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    userDeck: {
      findFirst: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CardService>(CardService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCard', () => {
    const createCardDto: CreateCardDto = {
      question: 'What is the capital of France?',
      answer: 'Paris',
    };

    it('should create a card successfully', async () => {
      const deckId = 1;
      const userId = 1;
      const expectedCard = {
        id: 1,
        question: createCardDto.question,
        answer: createCardDto.answer,
        deckId,
        createdById: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: { id: userId, name: 'John Doe' },
      };

      mockPrismaService.userDeck.findFirst.mockResolvedValue({
        userId,
        deckId,
        role: 'member',
      });
      mockPrismaService.card.create.mockResolvedValue(expectedCard);

      const result = await service.createCard(deckId, createCardDto, userId);

      expect(result).toEqual({
        id: expectedCard.id,
        question: expectedCard.question,
        answer: expectedCard.answer,
        deckId: expectedCard.deckId,
        createdById: expectedCard.createdById,
        createdByName: expectedCard.createdBy.name,
        createdAt: expectedCard.createdAt,
        updatedAt: expectedCard.updatedAt,
      });
      expect(mockPrismaService.card.create).toHaveBeenCalledWith({
        data: {
          question: createCardDto.question,
          answer: createCardDto.answer,
          deckId,
          createdById: userId,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });

    it('should throw ForbiddenException when user has no deck access', async () => {
      const deckId = 1;
      const userId = 1;

      mockPrismaService.userDeck.findFirst.mockResolvedValue(null);

      await expect(
        service.createCard(deckId, createCardDto, userId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getCardsByDeck', () => {
    it('should return cards for a deck', async () => {
      const deckId = 1;
      const userId = 1;
      const mockCards = [
        {
          id: 1,
          question: 'Question 1',
          answer: 'Answer 1',
          deckId,
          createdById: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: { id: userId, name: 'John Doe' },
        },
      ];

      mockPrismaService.userDeck.findFirst.mockResolvedValue({
        userId,
        deckId,
        role: 'member',
      });
      mockPrismaService.card.findMany.mockResolvedValue(mockCards);

      const result = await service.getCardsByDeck(deckId, userId);

      expect(result).toHaveLength(1);
      expect(result[0].question).toBe('Question 1');
      expect(mockPrismaService.card.findMany).toHaveBeenCalledWith({
        where: { deckId },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });

  describe('getCardById', () => {
    it('should return a card by ID', async () => {
      const cardId = 1;
      const userId = 1;
      const deckId = 1;
      const mockCard = {
        id: cardId,
        question: 'Question 1',
        answer: 'Answer 1',
        deckId,
        createdById: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: { id: userId, name: 'John Doe' },
        deck: { id: deckId },
      };

      mockPrismaService.card.findUnique.mockResolvedValue(mockCard);
      mockPrismaService.userDeck.findFirst.mockResolvedValue({
        userId,
        deckId,
        role: 'member',
      });

      const result = await service.getCardById(cardId, userId);

      expect(result.id).toBe(cardId);
      expect(result.question).toBe('Question 1');
    });

    it('should throw NotFoundException when card does not exist', async () => {
      const cardId = 999;
      const userId = 1;

      mockPrismaService.card.findUnique.mockResolvedValue(null);

      await expect(service.getCardById(cardId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteCard', () => {
    it('should delete a card when user is the creator', async () => {
      const cardId = 1;
      const userId = 1;
      const deckId = 1;
      const existingCard = {
        id: cardId,
        deckId,
        createdById: userId,
        deck: { id: deckId },
      };

      mockPrismaService.card.findUnique.mockResolvedValue(existingCard);
      mockPrismaService.userDeck.findFirst.mockResolvedValue({
        userId,
        deckId,
        role: 'member',
      });
      mockPrismaService.card.delete.mockResolvedValue(existingCard);

      await service.deleteCard(cardId, userId);

      expect(mockPrismaService.card.delete).toHaveBeenCalledWith({
        where: { id: cardId },
      });
    });

    it('should throw NotFoundException when card does not exist', async () => {
      const cardId = 999;
      const userId = 1;

      mockPrismaService.card.findUnique.mockResolvedValue(null);

      await expect(service.deleteCard(cardId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
