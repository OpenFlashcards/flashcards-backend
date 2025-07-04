# Authentication Module

This module provides JWT-based authentication for the OpenFlashcards API.

## Features

- **JWT Authentication**: Secure token-based authentication using JSON Web Tokens
- **Email/Password Login**: Traditional email and password authentication
- **Password Hashing**: Secure password storage using crypto with configurable salt
- **Passport.js Integration**: Local and JWT strategies for authentication
- **Swagger Documentation**: Comprehensive API documentation with examples
- **Guard System**: Automatic route protection with opt-in public routes
- **Token Verification**: Endpoint for verifying JWT token validity

## API Endpoints

### Authentication

#### POST /auth/login

Authenticate user with email and password and receive a JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 604800,
  "user": {
    "id": "clm1234567890",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### GET /auth/profile

Get the profile information of the currently authenticated user.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "id": "clm1234567890",
  "email": "user@example.com",
  "name": "John Doe"
}
```

#### POST /auth/verify

Verify if the provided JWT token is valid.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "valid": true,
  "user": {
    "id": "clm1234567890",
    "email": "user@example.com"
  },
  "expiresAt": 1720192200
}
```

## Usage

### Making Authenticated Requests

1. **Login** to get a JWT token:

   ```bash
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "user@example.com",
       "password": "password123"
     }'
   ```

2. **Use the token** in subsequent requests:

   ```bash
   curl -X GET http://localhost:3000/auth/profile \
     -H "Authorization: Bearer <your_jwt_token>"
   ```

### Creating Public Endpoints

By default, all routes are protected. To make a route public, use the `@Public()` decorator:

```typescript
import { Public } from '../auth/decorators';

@Controller('example')
export class ExampleController {
  @Public()
  @Get('public-endpoint')
  getPublicData() {
    return { message: 'This endpoint is publicly accessible' };
  }

  @Get('protected-endpoint')
  getProtectedData(@CurrentUser() user: any) {
    return { message: 'This endpoint requires authentication', user };
  }
}
```

### Getting Current User Information

Use the `@CurrentUser()` decorator to get the authenticated user's information:

```typescript
import { CurrentUser } from '../auth/decorators';

@Controller('example')
export class ExampleController {
  @Get('my-data')
  getMyData(@CurrentUser() user: any) {
    // user contains: { id: string, email: string }
    return { userId: user.id, userEmail: user.email };
  }
}
```

## Configuration

The auth module uses the following environment variables from the ConfigService:

- `JWT_SECRET`: Secret key for signing JWT tokens (required in production)
- `JWT_EXPIRES_IN`: Token expiration time (default: '7d')
- `PASSWORD_SALT`: Salt for password hashing (default: 'default-salt-change-in-production')

### Development vs Production

**Development:**

- JWT_SECRET is optional (uses default value with warning)
- Password validation is more lenient

**Production:**

- JWT_SECRET is required (application fails to start without it)
- Stronger security measures are enforced

## Security Features

1. **Password Hashing**: Passwords are hashed using crypto with configurable salt
2. **JWT Security**: Tokens are signed with a secret key and have expiration times
3. **Guard Protection**: All routes are protected by default
4. **Token Validation**: Comprehensive token validation with proper error handling
5. **CORS Configuration**: Configurable CORS settings from environment variables

## Error Handling

The module provides comprehensive error responses:

- **400 Bad Request**: Invalid request body or validation errors
- **401 Unauthorized**: Invalid credentials or missing/invalid JWT token
- **500 Internal Server Error**: Server-side errors

All error responses follow a consistent format:

```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized",
  "timestamp": "2025-07-05T10:30:00.000Z",
  "path": "/auth/login"
}
```

## Integration with Other Modules

The AuthModule integrates seamlessly with:

1. **UserModule**: For user validation and profile information
2. **ConfigModule**: For JWT and security configuration
3. **PrismaModule**: For database operations (through UserService)

## Testing

You can test the authentication endpoints using:

1. **Swagger UI**: Available at `/docs` when the application is running
2. **Postman/Insomnia**: Import the API endpoints and test manually
3. **curl**: Use command-line requests as shown in the examples above

## Architecture

The module follows NestJS best practices:

- **Services**: Business logic in `AuthService`
- **Controllers**: HTTP endpoints in `AuthController`
- **Guards**: Route protection with `JwtAuthGuard` and `LocalAuthGuard`
- **Strategies**: Passport strategies for local and JWT authentication
- **DTOs**: Data transfer objects with validation
- **Decorators**: Utility decorators for common operations

This modular architecture ensures maintainability, testability, and scalability.
