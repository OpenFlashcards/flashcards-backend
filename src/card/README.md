# Card Module

The Card module provides comprehensive functionality for managing flashcards within decks. This module handles creating, reading, and deleting cards.

## Features

- **Create Cards**: Add new flashcards to existing decks
- **Read Cards**: Retrieve cards from decks or individual cards by ID
- **Delete Cards**: Remove flashcards (creator or deck admin only)

## Endpoints

### POST `/cards/deck/:deckId`

Creates a new card in the specified deck.

**Required Body:**

```json
{
  "question": "What is the capital of France?",
  "answer": "Paris"
}
```

### GET `/cards/deck/:deckId`

Retrieves all cards from the specified deck.

### GET `/cards/:cardId`

Retrieves a specific card by its ID.

### DELETE `/cards/:cardId`

Deletes a specific card. Only the creator or deck admins can delete cards.

## Permissions

- **Create Cards**: Any user with access to the deck can create cards
- **Read Cards**: Any user with access to the deck can read cards
- **Delete Cards**: Only the card creator or deck admins can delete cards

## Validation

- **Question**: Required, 1-2000 characters
- **Answer**: Required, 1-2000 characters

## Authentication

All endpoints require JWT authentication via the `Authorization: Bearer <token>` header.

## Error Handling

The module provides comprehensive error handling with appropriate HTTP status codes:

- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Card or deck not found
- `500 Internal Server Error`: Unexpected server errors

## Swagger Documentation

All endpoints are fully documented with Swagger/OpenAPI annotations, including:

- Request/response schemas
- Parameter descriptions
- Example values
- Error response formats
