import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardDto, CardResponseDto } from './dto';
import { UpdateCardDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CardService {
  private readonly logger = new Logger(CardService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new card in a specific deck
   */
  async createCard(
    deckId: number,
    createCardDto: CreateCardDto,
    userId: number,
  ): Promise<CardResponseDto> {
    this.logger.log(
      `Creating new card for deck ID: ${deckId} by user ID: ${userId}`,
    );

    // Check if deck exists and user has access
    await this.validateUserDeckAccess(deckId, userId);

    try {
      const card = await this.prisma.card.create({
        data: {
          question: createCardDto.question,
          answer: createCardDto.answer,
          notes: createCardDto.notes,
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

      this.logger.log(`Successfully created card with ID: ${card.id}`);

      return this.mapToCardResponse(card);
    } catch (error) {
      this.logger.error(`Failed to create card: ${error.message}`);
      throw new BadRequestException('Failed to create card');
    }
  }

  /**
   * Get all cards for a specific deck
   */
  async getCardsByDeck(
    deckId: number,
    userId: number,
  ): Promise<CardResponseDto[]> {
    this.logger.log(
      `Fetching cards for deck ID: ${deckId} by user ID: ${userId}`,
    );

    // Check if deck exists and user has access
    await this.validateUserDeckAccess(deckId, userId);

    const cards = await this.prisma.card.findMany({
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

    this.logger.log(`Found ${cards.length} cards for deck ID: ${deckId}`);

    return cards.map((card) => this.mapToCardResponse(card));
  }

  /**
   * Get a specific card by ID
   */
  async getCardById(cardId: number, userId: number): Promise<CardResponseDto> {
    this.logger.log(`Fetching card ID: ${cardId} by user ID: ${userId}`);

    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        deck: true,
      },
    });

    if (!card) {
      this.logger.warn(`Card with ID ${cardId} not found`);
      throw new NotFoundException(`Card with ID ${cardId} not found`);
    }

    // Check if user has access to the deck containing this card
    await this.validateUserDeckAccess(card.deckId, userId);

    return this.mapToCardResponse(card);
  }

  /**
   * Update a specific card
   */
  async updateCard(
    cardId: number,
    updateCardDto: UpdateCardDto,
    userId: number,
  ): Promise<CardResponseDto> {
    this.logger.log(`Updating card ID: ${cardId} by user ID: ${userId}`);

    // First, get the card to verify ownership and deck access
    const existingCard = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: {
        deck: true,
      },
    });

    if (!existingCard) {
      this.logger.warn(`Card with ID ${cardId} not found`);
      throw new NotFoundException(`Card with ID ${cardId} not found`);
    }

    // Check if user has access to the deck
    await this.validateUserDeckAccess(existingCard.deckId, userId);

    // Check if user is the creator or has admin access to the deck
    const userDeck = await this.prisma.userDeck.findFirst({
      where: {
        userId,
        deckId: existingCard.deckId,
      },
    });

    const canUpdate =
      existingCard.createdById === userId || userDeck?.role === 'admin';

    if (!canUpdate) {
      this.logger.warn(
        `User ${userId} does not have permission to update card ${cardId}`,
      );
      throw new ForbiddenException(
        'You can only update cards you created or if you are an admin of the deck',
      );
    }

    // If moving to a different deck, check access to the target deck
    if (updateCardDto.deckId && updateCardDto.deckId !== existingCard.deckId) {
      this.logger.log(
        `Moving card ${cardId} from deck ${existingCard.deckId} to deck ${updateCardDto.deckId}`,
      );

      // Validate access to the target deck
      await this.validateUserDeckAccess(updateCardDto.deckId, userId);

      // Check if user has permission to add cards to the target deck
      const targetUserDeck = await this.prisma.userDeck.findFirst({
        where: {
          userId,
          deckId: updateCardDto.deckId,
        },
      });

      // Users need at least member access to add cards to a deck
      if (!targetUserDeck) {
        this.logger.warn(
          `User ${userId} does not have access to target deck ${updateCardDto.deckId}`,
        );
        throw new ForbiddenException(
          'You do not have access to the target deck',
        );
      }
    }

    // Prepare update data - only include fields that are provided
    const updateData: any = {};
    if (updateCardDto.question !== undefined) {
      updateData.question = updateCardDto.question;
    }
    if (updateCardDto.answer !== undefined) {
      updateData.answer = updateCardDto.answer;
    }
    if (updateCardDto.notes !== undefined) {
      updateData.notes = updateCardDto.notes;
    }
    if (updateCardDto.deckId !== undefined) {
      updateData.deckId = updateCardDto.deckId;
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      this.logger.warn(`No valid fields provided for updating card ${cardId}`);
      throw new BadRequestException('No valid fields provided for update');
    }

    try {
      const updatedCard = await this.prisma.card.update({
        where: { id: cardId },
        data: updateData,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      this.logger.log(`Successfully updated card with ID: ${cardId}`);

      return this.mapToCardResponse(updatedCard);
    } catch (error) {
      this.logger.error(`Failed to update card: ${error.message}`);
      throw new BadRequestException('Failed to update card');
    }
  }

  /**
   * Delete a specific card
   */
  async deleteCard(cardId: number, userId: number): Promise<void> {
    this.logger.log(`Deleting card ID: ${cardId} by user ID: ${userId}`);

    // First, get the card to verify ownership and deck access
    const existingCard = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: {
        deck: true,
      },
    });

    if (!existingCard) {
      this.logger.warn(`Card with ID ${cardId} not found`);
      throw new NotFoundException(`Card with ID ${cardId} not found`);
    }

    // Check if user has access to the deck
    await this.validateUserDeckAccess(existingCard.deckId, userId);

    // Check if user is the creator or has admin access to the deck
    const userDeck = await this.prisma.userDeck.findFirst({
      where: {
        userId,
        deckId: existingCard.deckId,
      },
    });

    const canDelete =
      existingCard.createdById === userId || userDeck?.role === 'admin';

    if (!canDelete) {
      this.logger.warn(
        `User ${userId} does not have permission to delete card ${cardId}`,
      );
      throw new ForbiddenException(
        'You can only delete cards you created or if you are an admin of the deck',
      );
    }

    try {
      await this.prisma.card.delete({
        where: { id: cardId },
      });

      this.logger.log(`Successfully deleted card with ID: ${cardId}`);
    } catch (error) {
      this.logger.error(`Failed to delete card: ${error.message}`);
      throw new BadRequestException('Failed to delete card');
    }
  }

  /**
   * Validate that user has access to a deck
   */
  private async validateUserDeckAccess(
    deckId: number,
    userId: number,
  ): Promise<void> {
    const userDeck = await this.prisma.userDeck.findFirst({
      where: {
        userId,
        deckId,
      },
      include: {
        deck: true,
      },
    });

    if (!userDeck) {
      this.logger.warn(`User ${userId} does not have access to deck ${deckId}`);
      throw new ForbiddenException(
        'You do not have access to this deck or the deck does not exist',
      );
    }
  }

  /**
   * Map database card to response DTO
   */
  private mapToCardResponse(card: any): CardResponseDto {
    return {
      id: card.id,
      question: card.question,
      answer: card.answer,
      notes: card.notes || null,
      deckId: card.deckId,
      createdById: card.createdById,
      createdByName: card.createdBy?.name || null,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
    };
  }
}
