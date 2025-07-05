# Card Move Feature - Usage Examples

## Overview
The PATCH `/cards/:cardId` endpoint now supports moving cards between decks by including a `deckId` field in the request body.

## API Examples

### 1. Update card content only
```http
PATCH /cards/123
Content-Type: application/json
Authorization: Bearer <token>

{
  "question": "What is the capital of Germany?",
  "answer": "Berlin",
  "notes": "Berlin became the capital in 1990 after reunification."
}
```

### 2. Move card to a different deck
```http
PATCH /cards/123
Content-Type: application/json
Authorization: Bearer <token>

{
  "deckId": 456
}
```

### 3. Update content and move to different deck
```http
PATCH /cards/123
Content-Type: application/json
Authorization: Bearer <token>

{
  "question": "What is the capital of Germany?",
  "answer": "Berlin",
  "deckId": 456
}
```

## Authorization Requirements

### For updating card content:
- User must be the creator of the card OR
- User must be an admin of the deck containing the card

### For moving cards between decks:
- User must have access to the source deck (same as above)
- User must have at least member access to the target deck

## Error Responses

### 403 Forbidden - No access to source deck
```json
{
  "statusCode": 403,
  "message": "You can only update cards you created or if you are an admin of the deck"
}
```

### 403 Forbidden - No access to target deck
```json
{
  "statusCode": 403,
  "message": "You do not have access to the target deck"
}
```

### 404 Not Found - Card doesn't exist
```json
{
  "statusCode": 404,
  "message": "Card with ID 123 not found"
}
```

### 400 Bad Request - No fields to update
```json
{
  "statusCode": 400,
  "message": "No valid fields provided for update"
}
```

## Security Features

1. **Source Deck Access**: The user must have permission to modify the card in its current deck
2. **Target Deck Access**: When moving to a different deck, the user must have access to the target deck
3. **Deck Validation**: The system validates that the target deck exists and is accessible
4. **Creator/Admin Check**: Only card creators or deck admins can modify cards

## Use Cases

1. **Organizing Content**: Move cards between subject-specific decks
2. **Deck Restructuring**: Reorganize cards when splitting or merging study topics
3. **Collaborative Editing**: Team members can move cards between shared decks
4. **Content Migration**: Transfer cards from personal to team decks or vice versa
