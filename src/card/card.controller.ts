import {
  Controller,
  Get,
  Post,
  Patch,
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
import { CardService } from './card.service';
import { CreateCardDto, CardResponseDto, ErrorResponseDto } from './dto';
import { UpdateCardDto } from './dto';
import {
  NotFoundErrorResponseDto,
  ValidationErrorResponseDto,
  ForbiddenErrorResponseDto,
  UnauthorizedErrorResponseDto,
} from '../common';

@ApiTags('Cards')
@ApiBearerAuth('JWT-auth')
@Controller('cards')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post('deck/:deckId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new card in a deck',
    description:
      'Creates a new flashcard in the specified deck. The authenticated user must have access to the deck to create cards.',
  })
  @ApiParam({
    name: 'deckId',
    description: 'The ID of the deck to add the card to',
    type: 'integer',
    example: 1,
  })
  @ApiBody({
    type: CreateCardDto,
    description: 'Card data to create',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Card successfully created',
    type: CardResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or card creation failed',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have access to the specified deck',
    type: ForbiddenErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Deck not found',
    type: NotFoundErrorResponseDto,
  })
  async createCard(
    @Param('deckId', ParseIntPipe) deckId: number,
    @Body() createCardDto: CreateCardDto,
    @CurrentUser() user: any,
  ): Promise<CardResponseDto> {
    return this.cardService.createCard(deckId, createCardDto, user.id);
  }

  @Get('deck/:deckId')
  @ApiOperation({
    summary: 'Get all cards from a deck',
    description:
      'Retrieves all flashcards from the specified deck. The authenticated user must have access to the deck.',
  })
  @ApiParam({
    name: 'deckId',
    description: 'The ID of the deck to get cards from',
    type: 'integer',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cards successfully retrieved',
    type: [CardResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have access to the specified deck',
    type: ForbiddenErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Deck not found',
    type: NotFoundErrorResponseDto,
  })
  async getCardsByDeck(
    @Param('deckId', ParseIntPipe) deckId: number,
    @CurrentUser() user: any,
  ): Promise<CardResponseDto[]> {
    return this.cardService.getCardsByDeck(deckId, user.id);
  }

  @Get(':cardId')
  @ApiOperation({
    summary: 'Get a specific card by ID',
    description:
      'Retrieves a specific flashcard by its ID. The authenticated user must have access to the deck containing the card.',
  })
  @ApiParam({
    name: 'cardId',
    description: 'The ID of the card to retrieve',
    type: 'integer',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Card successfully retrieved',
    type: CardResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have access to the deck containing this card',
    type: ForbiddenErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Card not found',
    type: NotFoundErrorResponseDto,
  })
  async getCardById(
    @Param('cardId', ParseIntPipe) cardId: number,
    @CurrentUser() user: any,
  ): Promise<CardResponseDto> {
    return this.cardService.getCardById(cardId, user.id);
  }

  @Patch(':cardId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a specific card',
    description:
      'Updates a specific flashcard by its ID. Only the creator of the card or deck admins can update cards. Fields that are not provided will remain unchanged. You can also move the card to a different deck by providing a deckId - you must have access to the target deck.',
  })
  @ApiParam({
    name: 'cardId',
    description: 'The ID of the card to update',
    type: 'integer',
    example: 1,
  })
  @ApiBody({
    type: UpdateCardDto,
    description: 'Card data to update (only provide fields you want to change)',
    examples: {
      'Update question only': {
        value: {
          question: 'What is the capital city of France?',
        },
      },
      'Update answer and notes': {
        value: {
          answer: 'Paris, the City of Light',
          notes:
            'Paris is known for its cultural heritage and iconic landmarks.',
        },
      },
      'Update all fields': {
        value: {
          question: 'What is the capital and largest city of France?',
          answer: 'Paris',
          notes:
            'Paris is located in northern central France and is the political, economic, and cultural center of the country.',
        },
      },
      'Move card to different deck': {
        value: {
          deckId: 2,
        },
      },
      'Update and move card': {
        value: {
          question: 'What is the capital of France?',
          answer: 'Paris',
          deckId: 3,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Card successfully updated',
    type: CardResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Invalid input data, no fields to update, or card update failed',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'User does not have permission to update this card or access to the target deck',
    type: ForbiddenErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Card not found or target deck not found',
    type: NotFoundErrorResponseDto,
  })
  async updateCard(
    @Param('cardId', ParseIntPipe) cardId: number,
    @Body() updateCardDto: UpdateCardDto,
    @CurrentUser() user: any,
  ): Promise<CardResponseDto> {
    return this.cardService.updateCard(cardId, updateCardDto, user.id);
  }

  @Delete(':cardId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a specific card',
    description:
      'Deletes a specific flashcard. Only the creator of the card or deck admins can delete cards.',
  })
  @ApiParam({
    name: 'cardId',
    description: 'The ID of the card to delete',
    type: 'integer',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Card successfully deleted',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have permission to delete this card',
    type: ForbiddenErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Card not found',
    type: NotFoundErrorResponseDto,
  })
  async deleteCard(
    @Param('cardId', ParseIntPipe) cardId: number,
    @CurrentUser() user: any,
  ): Promise<void> {
    return this.cardService.deleteCard(cardId, user.id);
  }
}
