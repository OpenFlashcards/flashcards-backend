import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators';
import { DeckService } from './deck.service';
import {
  CreateDeckDto,
  AddUserToDeckDto,
  DeckResponseDto,
  LeaveDeckResponseDto,
} from './dto';
import {
  NotFoundErrorResponseDto,
  ConflictErrorResponseDto,
  ValidationErrorResponseDto,
  ForbiddenErrorResponseDto,
  UnauthorizedErrorResponseDto,
} from '../common';

@ApiTags('Decks')
@ApiBearerAuth('JWT-auth')
@Controller('decks')
export class DeckController {
  constructor(private readonly deckService: DeckService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all decks for the current user',
    description:
      'Retrieves all decks that the authenticated user has access to, including their role in each deck and associated users.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved user decks',
    type: [DeckResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
    type: UnauthorizedErrorResponseDto,
  })
  async getUserDecks(@CurrentUser() user: any): Promise<DeckResponseDto[]> {
    return this.deckService.getUserDecks(user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a specific deck by ID',
    description:
      'Retrieves a specific deck by its ID. The user must have access to the deck.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the deck',
    type: 'integer',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved deck',
    type: DeckResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Deck not found or access denied',
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
    type: UnauthorizedErrorResponseDto,
  })
  async getDeckById(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) deckId: number,
  ): Promise<DeckResponseDto> {
    return this.deckService.getDeckById(user.id, deckId);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new deck',
    description:
      'Creates a new deck with the authenticated user as the admin. Optionally can be created as a subdeck of an existing deck.',
  })
  @ApiBody({
    type: CreateDeckDto,
    description: 'Deck creation data',
    examples: {
      basicDeck: {
        summary: 'Basic Deck',
        description: 'Create a simple deck',
        value: {
          name: 'Spanish Vocabulary',
          description:
            'A comprehensive deck for learning basic Spanish vocabulary',
          isPublic: false,
        },
      },
      subdeck: {
        summary: 'Subdeck',
        description: 'Create a subdeck under an existing deck',
        value: {
          name: 'Spanish Verbs',
          description: 'Spanish verb conjugations',
          isPublic: false,
          parentDeckId: 1,
        },
      },
      publicDeck: {
        summary: 'Public Deck',
        description: 'Create a public deck visible to all users',
        value: {
          name: 'Common English Phrases',
          description: 'Useful English phrases for daily conversation',
          isPublic: true,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Successfully created deck',
    type: DeckResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Deck with this name already exists',
    type: ConflictErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions for parent deck',
    type: ForbiddenErrorResponseDto,
  })
  @HttpCode(HttpStatus.CREATED)
  async createDeck(
    @CurrentUser() user: any,
    @Body() createDeckDto: CreateDeckDto,
  ): Promise<DeckResponseDto> {
    return this.deckService.createDeck(user.id, createDeckDto);
  }

  @Post(':id/users')
  @ApiOperation({
    summary: 'Add a user to a deck',
    description:
      'Adds an existing user to a deck with a specified role. Requires admin permissions on the deck.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the deck',
    type: 'integer',
    example: 1,
  })
  @ApiBody({
    type: AddUserToDeckDto,
    description: 'User addition data',
    examples: {
      addMember: {
        summary: 'Add Member',
        description: 'Add a user as a member',
        value: {
          email: 'newuser@example.com',
          role: 'member',
        },
      },
      addAdmin: {
        summary: 'Add Admin',
        description: 'Add a user as an admin',
        value: {
          email: 'admin@example.com',
          role: 'admin',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Successfully added user to deck',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Deck or user not found',
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User is already a member of this deck',
    type: ConflictErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions to add users',
    type: ForbiddenErrorResponseDto,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async addUserToDeck(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) deckId: number,
    @Body() addUserDto: AddUserToDeckDto,
  ): Promise<void> {
    return this.deckService.addUserToDeck(user.id, deckId, addUserDto);
  }

  @Delete(':id/users/:userId')
  @ApiOperation({
    summary: 'Remove a user from a deck',
    description:
      'Removes a user from a deck. Requires admin permissions. Admins can remove any user.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the deck',
    type: 'integer',
    example: 1,
  })
  @ApiParam({
    name: 'userId',
    description: 'Unique identifier of the user to remove',
    type: 'integer',
    example: 2,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Successfully removed user from deck',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot remove yourself using this endpoint',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Deck or user not found in deck',
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions to remove users',
    type: ForbiddenErrorResponseDto,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeUserFromDeck(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) deckId: number,
    @Param('userId', ParseIntPipe) userIdToRemove: number,
  ): Promise<void> {
    return this.deckService.removeUserFromDeck(user.id, deckId, userIdToRemove);
  }

  @Delete(':id/leave')
  @ApiOperation({
    summary: 'Leave a deck',
    description:
      'Removes the authenticated user from the deck. If the user is the last admin, promotes another user to admin. If no users remain, deletes the deck.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the deck to leave',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully left the deck',
    type: LeaveDeckResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User is not a member of the deck',
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiBearerAuth()
  async leaveDeck(
    @Param('id', ParseIntPipe) deckId: number,
    @CurrentUser() user: any,
  ): Promise<LeaveDeckResponseDto> {
    return this.deckService.leaveDeck(user.id, deckId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a deck',
    description:
      'Deletes a deck and all its child decks recursively. Requires admin permissions on the deck. This action cannot be undone.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the deck to delete',
    type: 'integer',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Successfully deleted deck and all child decks',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Deck not found or access denied',
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions to delete deck',
    type: ForbiddenErrorResponseDto,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDeck(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) deckId: number,
  ): Promise<void> {
    return this.deckService.deleteDeck(user.id, deckId);
  }
}
