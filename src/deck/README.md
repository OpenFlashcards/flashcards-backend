# Deck Module

The Deck module provides comprehensive deck management functionality for the flashcards application. It allows users to create, manage, and share flashcard decks with other users.

## Features

- **Create Decks**: Users can create new flashcard decks with names, descriptions, and privacy settings
- **Deck Hierarchy**: Support for parent-child deck relationships (subdecks)
- **User Management**: Add users to decks with different roles (admin, member)
- **Access Control**: Role-based permissions for deck operations
- **Deck Retrieval**: Get all user's decks or specific deck by ID

## API Endpoints

### GET /decks
Retrieve all decks for the authenticated user.

**Response**: Array of `DeckResponseDto`

### GET /decks/:id
Retrieve a specific deck by ID.

**Parameters**:
- `id` (number): Deck ID

**Response**: `DeckResponseDto`

### POST /decks
Create a new deck.

**Body**: `CreateDeckDto`
```json
{
  "name": "Spanish Vocabulary",
  "description": "A comprehensive deck for learning basic Spanish vocabulary",
  "isPublic": false,
  "parentDeckId": 1
}
```

**Response**: `DeckResponseDto`

### POST /decks/:id/users
Add a user to a deck with a specific role.

**Parameters**:
- `id` (number): Deck ID

**Body**: `AddUserToDeckDto`
```json
{
  "email": "user@example.com",
  "role": "member"
}
```

**Response**: No content (204)

### DELETE /decks/:id/users/:userId
Remove a user from a deck.

**Parameters**:
- `id` (number): Deck ID
- `userId` (number): User ID to remove

**Response**: No content (204)

### DELETE /decks/:id/leave

Leave a deck. If you are the last admin, another user will be promoted to admin. If no users remain, the deck will be deleted.

**Headers**: Authorization: Bearer JWT_TOKEN

**Response**: 200 OK

```json
{
  "deckDeleted": false,
  "message": "Successfully left the deck",
  "newAdminId": 2
}
```

**Response**: No content (204)

## User Roles

- **Admin**: Full control over the deck, can delete deck and manage all users
- **Member**: Can view and study the deck content

## Data Transfer Objects (DTOs)

### CreateDeckDto
- `name` (string, required): Name of the deck
- `description` (string, optional): Description of the deck
- `isPublic` (boolean, optional): Whether the deck is public (default: false)
- `parentDeckId` (number, optional): ID of parent deck for subdecks

### AddUserToDeckDto
- `email` (string, required): Email of the user to add
- `role` (UserRole, required): Role to assign (admin, member)

### DeckResponseDto
- `id` (number): Unique deck identifier
- `name` (string): Deck name
- `description` (string | null): Deck description
- `isPublic` (boolean): Public visibility flag
- `createdAt` (Date): Creation timestamp
- `updatedAt` (Date): Last update timestamp
- `parentDeckId` (number | null): Parent deck ID if subdeck
- `userDecks` (UserDeckResponseDto[]): User-deck relationships
- `subDecks` (DeckResponseDto[]): Child decks
- `parentDeck` (DeckResponseDto): Parent deck information

### LeaveDeckResponseDto

- `deckDeleted` (boolean): Whether the deck was deleted after leaving
- `message` (string): Description of what happened
- `newAdminId` (number, optional): ID of the new admin if one was promoted

## Error Handling

The module provides comprehensive error handling with specific HTTP status codes:

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Deck or user not found
- **409 Conflict**: Resource already exists (e.g., user already in deck)

## Security

- All endpoints require JWT authentication
- Role-based access control for sensitive operations
- Users can only access decks they are members of
- Admin permissions required for user management

## Database Schema

The module works with the following Prisma models:

- `Deck`: Core deck information
- `User`: User information
- `UserDeck`: Junction table for user-deck relationships with roles

## Testing

The module includes comprehensive unit tests for both the service and controller layers, covering:

- Successful operations
- Error scenarios
- Permission validation
- Input validation
