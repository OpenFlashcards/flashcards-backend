# Configuration Service

The ConfigService is responsible for validating and managing environment variables in the flashcards-backend application.

## Features

- **Environment Variable Validation**: Checks that all required environment variables are present at application startup
- **Logging**: Logs missing optional variables as warnings and missing required variables as errors
- **Fail-Fast**: Application fails to start if required environment variables are missing
- **Type Safety**: Provides strongly typed access to configuration values
- **Default Values**: Provides sensible defaults for optional configuration

## Required Environment Variables

The following environment variables **must** be set or the application will fail to start:

- `DATABASE_URL`: PostgreSQL database connection string

## Optional Environment Variables

The following environment variables are optional and will use default values if not provided:

- `JWT_SECRET`: Secret key for JWT token signing (default: undefined)
- `JWT_EXPIRES_IN`: JWT token expiration time (default: "7d")
- `PORT`: Port number for the application to listen on (default: 3000)
- `CORS_ORIGIN`: CORS origin setting (default: "*")
- `LOG_LEVEL`: Application log level (default: "info")

## Usage

### In a Service or Controller

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config';

@Injectable()
export class ExampleService {
  constructor(private configService: ConfigService) {}

  someMethod() {
    const databaseUrl = this.configService.databaseUrl;
    const port = this.configService.port;
    const isProduction = this.configService.isProduction;
    
    // Use the configuration values...
  }
}
```

### Available Methods

- `databaseUrl`: string - Database connection URL
- `jwtSecret`: string | undefined - JWT secret key (if configured)
- `port`: number - Application port (converted to number, default: 3000)
- `jwtExpiresIn`: string - JWT expiration time
- `corsOrigin`: string - CORS origin setting
- `logLevel`: string - Log level
- `isDevelopment`: boolean - True if NODE_ENV is 'development'
- `isProduction`: boolean - True if NODE_ENV is 'production'
- `isTest`: boolean - True if NODE_ENV is 'test'

## Environment File Setup

Create a `.env` file in the project root based on `.env.example`:

```bash
cp .env.example .env
```

Then edit the `.env` file with your actual values:

```bash
# Required
DATABASE_URL="postgresql://username:password@localhost:5432/flashcards_db"

# Optional  
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN=7d
PORT=3000
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
```

## Error Handling

If required environment variables are missing, the application will:

1. Log error messages indicating which variables are missing
2. Throw an error with details about the missing variables
3. Fail to start (process will exit)

Example error output:

```text
[ConfigService] Missing required environment variables: DATABASE_URL
[ConfigService] Application cannot start without these variables
Error: Missing required environment variables: DATABASE_URL
```

For optional variables, warnings will be logged but the application will continue:

```text
[ConfigService] Missing optional environment variables: JWT_SECRET, PORT
[ConfigService] Application will continue with default values for these variables
```

## Testing

The ConfigService includes comprehensive tests. Run them with:

```bash
npm test src/config/config.service.spec.ts
```

The tests verify:

- Proper loading of environment variables
- Default value assignment for optional variables
- Type conversion (e.g., string to number for port)
