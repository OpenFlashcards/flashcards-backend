import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateDeckDto,
  AddUserToDeckDto,
  DeckResponseDto,
  LeaveDeckResponseDto,
} from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class DeckService {
  private readonly logger = new Logger(DeckService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get all decks for a specific user
   */
  async getUserDecks(userId: number): Promise<DeckResponseDto[]> {
    this.logger.log(`Fetching all decks for user ID: ${userId}`);

    const userDecks = await this.prisma.userDeck.findMany({
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

    return userDecks.map((userDeck) => ({
      id: userDeck.deck.id,
      name: userDeck.deck.name,
      description: userDeck.deck.description,
      isPublic: userDeck.deck.isPublic,
      createdAt: userDeck.deck.createdAt,
      updatedAt: userDeck.deck.updatedAt,
      parentDeckId: userDeck.deck.parentDeckId,
      userDecks: userDeck.deck.userDecks.map((ud) => ({
        id: ud.id,
        userId: ud.userId,
        deckId: ud.deckId,
        role: ud.role,
        user: ud.user,
      })),
      subDecks: userDeck.deck.subDecks,
      parentDeck: userDeck.deck.parentDeck,
    }));
  }

  /**
   * Create a new deck
   */
  async createDeck(
    userId: number,
    createDeckDto: CreateDeckDto,
  ): Promise<DeckResponseDto> {
    this.logger.log(`Creating new deck for user ID: ${userId}`);

    // If parentDeckId is provided, check if the parent deck exists and user has access
    if (createDeckDto.parentDeckId) {
      await this.validateUserDeckAccess(userId, createDeckDto.parentDeckId, [
        'admin',
      ]);
    }

    try {
      const result = await this.prisma.$transaction(async (prisma) => {
        // Create the deck
        const deck = await prisma.deck.create({
          data: {
            name: createDeckDto.name,
            description: createDeckDto.description,
            isPublic: createDeckDto.isPublic ?? false,
            parentDeckId: createDeckDto.parentDeckId,
          },
        });

        // Add the creating user as the admin
        await prisma.userDeck.create({
          data: {
            userId,
            deckId: deck.id,
            role: 'admin',
          },
        });

        // Fetch the complete deck with relationships
        return await prisma.deck.findUnique({
          where: { id: deck.id },
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
        });
      });

      if (!result) {
        throw new Error('Failed to create deck');
      }

      return {
        id: result.id,
        name: result.name,
        description: result.description,
        isPublic: result.isPublic,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        parentDeckId: result.parentDeckId,
        userDecks: result.userDecks.map((ud) => ({
          id: ud.id,
          userId: ud.userId,
          deckId: ud.deckId,
          role: ud.role,
          user: ud.user,
        })),
        subDecks: result.subDecks,
        parentDeck: result.parentDeck,
      };
    } catch (error) {
      this.logger.error(`Failed to create deck: ${error.message}`);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('A deck with this name already exists');
        }
        if (error.code === 'P2003') {
          throw new BadRequestException('Invalid parent deck ID');
        }
      }
      throw error;
    }
  }

  /**
   * Add a user to an existing deck
   */
  async addUserToDeck(
    requestingUserId: number,
    deckId: number,
    addUserDto: AddUserToDeckDto,
  ): Promise<void> {
    this.logger.log(
      `Adding user ${addUserDto.email} to deck ID: ${deckId} by user ID: ${requestingUserId}`,
    );

    // Check if requesting user has admin permissions
    await this.validateUserDeckAccess(requestingUserId, deckId, ['admin']);

    // Find the user to add by email
    const userToAdd = await this.prisma.user.findUnique({
      where: { email: addUserDto.email },
    });

    if (!userToAdd) {
      throw new NotFoundException(
        `User with email ${addUserDto.email} not found`,
      );
    }

    // Check if user is already in the deck
    const existingUserDeck = await this.prisma.userDeck.findUnique({
      where: {
        userId_deckId: {
          userId: userToAdd.id,
          deckId,
        },
      },
    });

    if (existingUserDeck) {
      throw new ConflictException('User is already a member of this deck');
    }

    try {
      await this.prisma.userDeck.create({
        data: {
          userId: userToAdd.id,
          deckId,
          role: addUserDto.role,
        },
      });

      this.logger.log(
        `Successfully added user ${addUserDto.email} to deck ID: ${deckId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to add user to deck: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get a specific deck by ID (if user has access)
   */
  async getDeckById(userId: number, deckId: number): Promise<DeckResponseDto> {
    this.logger.log(`Fetching deck ID: ${deckId} for user ID: ${userId}`);

    // Check if user has access to this deck
    await this.validateUserDeckAccess(userId, deckId);

    const deck = await this.prisma.deck.findUnique({
      where: { id: deckId },
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
    });

    if (!deck) {
      throw new NotFoundException('Deck not found');
    }

    return {
      id: deck.id,
      name: deck.name,
      description: deck.description,
      isPublic: deck.isPublic,
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt,
      parentDeckId: deck.parentDeckId,
      userDecks: deck.userDecks.map((ud) => ({
        id: ud.id,
        userId: ud.userId,
        deckId: ud.deckId,
        role: ud.role,
        user: ud.user,
      })),
      subDecks: deck.subDecks,
      parentDeck: deck.parentDeck,
    };
  }

  /**
   * Remove a user from a deck
   */
  async removeUserFromDeck(
    requestingUserId: number,
    deckId: number,
    userIdToRemove: number,
  ): Promise<void> {
    this.logger.log(
      `Removing user ID: ${userIdToRemove} from deck ID: ${deckId} by user ID: ${requestingUserId}`,
    );

    // Check if requesting user has admin permissions
    await this.validateUserDeckAccess(requestingUserId, deckId, ['admin']);

    // Check if the user to remove exists in the deck
    const userDeckToRemove = await this.prisma.userDeck.findUnique({
      where: {
        userId_deckId: {
          userId: userIdToRemove,
          deckId,
        },
      },
    });

    if (!userDeckToRemove) {
      throw new NotFoundException('User is not a member of this deck');
    }

    // Prevent users from removing themselves (use different endpoint for leaving)
    if (requestingUserId === userIdToRemove) {
      throw new BadRequestException(
        'Use leave deck endpoint to remove yourself from a deck',
      );
    }

    try {
      await this.prisma.userDeck.delete({
        where: {
          userId_deckId: {
            userId: userIdToRemove,
            deckId,
          },
        },
      });

      this.logger.log(
        `Successfully removed user ID: ${userIdToRemove} from deck ID: ${deckId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to remove user from deck: ${error.message}`);
      throw error;
    }
  }

  /**
   * Leave a deck - removes the user from the deck
   * If the leaving user is the last admin, promotes another user to admin
   * If no users remain, deletes the deck
   */
  async leaveDeck(
    userId: number,
    deckId: number,
  ): Promise<LeaveDeckResponseDto> {
    this.logger.log(`User ID: ${userId} leaving deck ID: ${deckId}`);

    // Check if user is in the deck
    const userDeck = await this.prisma.userDeck.findUnique({
      where: {
        userId_deckId: {
          userId,
          deckId,
        },
      },
    });

    if (!userDeck) {
      throw new NotFoundException('User is not a member of this deck');
    }

    try {
      return await this.prisma.$transaction(async (prisma) => {
        // Get all users in the deck
        const allUserDecks = await prisma.userDeck.findMany({
          where: { deckId },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        });

        // Remove the leaving user
        await prisma.userDeck.delete({
          where: {
            userId_deckId: {
              userId,
              deckId,
            },
          },
        });

        const remainingUsers = allUserDecks.filter(
          (ud) => ud.userId !== userId,
        );

        // If no users remain, delete the deck
        if (remainingUsers.length === 0) {
          await prisma.deck.delete({
            where: { id: deckId },
          });

          this.logger.log(`Deck ID: ${deckId} deleted as no users remain`);
          return {
            deckDeleted: true,
            message: 'Left deck and deck was deleted as no users remained',
          };
        }

        // Check if we need to promote a new admin
        let newAdminId: number | undefined;
        const hasAdmin = remainingUsers.some((ud) => ud.role === 'admin');

        if (!hasAdmin) {
          // Promote the first remaining user to admin
          const userToPromote = remainingUsers[0];
          await prisma.userDeck.update({
            where: {
              userId_deckId: {
                userId: userToPromote.userId,
                deckId,
              },
            },
            data: {
              role: 'admin',
            },
          });

          newAdminId = userToPromote.userId;
          this.logger.log(
            `Promoted user ID: ${userToPromote.userId} to admin of deck ID: ${deckId}`,
          );
        }

        this.logger.log(
          `User ID: ${userId} successfully left deck ID: ${deckId}`,
        );

        return {
          deckDeleted: false,
          message: newAdminId
            ? `Left deck and user ${newAdminId} was promoted to admin`
            : 'Successfully left the deck',
          newAdminId,
        };
      });
    } catch (error) {
      this.logger.error(`Failed to leave deck: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate if user has access to a deck with specific roles
   */
  private async validateUserDeckAccess(
    userId: number,
    deckId: number,
    requiredRoles: string[] = ['admin', 'member'],
  ): Promise<void> {
    const userDeck = await this.prisma.userDeck.findUnique({
      where: {
        userId_deckId: {
          userId,
          deckId,
        },
      },
    });

    if (!userDeck) {
      throw new NotFoundException('Deck not found or access denied');
    }

    if (!requiredRoles.includes(userDeck.role)) {
      throw new ForbiddenException(
        'Insufficient permissions to perform this action',
      );
    }
  }
}
