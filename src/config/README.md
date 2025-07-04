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
- `LOG_LEVEL`: Application log level (default: "info")

### CORS Configuration

The application supports comprehensive CORS configuration through environment variables:

- `CORS_ORIGIN`: Allowed origins for CORS requests (default: "*")
  - Examples:
    - `"*"` - Allow all origins
    - `"http://localhost:3000"` - Allow single origin
    - `"http://localhost:3000,https://myapp.com"` - Allow multiple origins
    - `"true"` - Allow any origin with credentials
    - `"false"` - Disable CORS
- `CORS_METHODS`: Allowed HTTP methods (default: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS")
- `CORS_ALLOWED_HEADERS`: Allowed request headers (default: "Origin,X-Requested-With,Content-Type,Accept,Authorization")
- `CORS_CREDENTIALS`: Whether to allow credentials (default: "false")
- `CORS_OPTIONS_SUCCESS_STATUS`: Status code for successful OPTIONS requests (default: "200")
- `CORS_MAX_AGE`: How long browsers can cache preflight requests in seconds (default: "86400" = 24 hours)

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
- `corsOrigin`: string - CORS origin setting (backward compatibility)
- `corsConfig`: CorsConfig - Complete CORS configuration object
- `logLevel`: string - Log level
- `isDevelopment`: boolean - True if NODE_ENV is 'development'
- `isProduction`: boolean - True if NODE_ENV is 'production'
- `isTest`: boolean - True if NODE_ENV is 'test'

### CORS Configuration Object

The `corsConfig` property returns a complete CORS configuration object that can be used directly with NestJS's `enableCors()` method:

```typescript
interface CorsConfig {
  origin: string | string[] | boolean;
  methods: string[];
  allowedHeaders: string[];
  credentials: boolean;
  optionsSuccessStatus: number;
  maxAge: number;
}
```

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
LOG_LEVEL=debug

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Origin,X-Requested-With,Content-Type,Accept,Authorization
CORS_CREDENTIALS=true
CORS_OPTIONS_SUCCESS_STATUS=200
CORS_MAX_AGE=86400
```

## CORS Configuration Examples

### Development Environment

For local development with a frontend running on different ports:

```bash
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS
```

### Production Environment

For production with specific allowed origins:

```bash
CORS_ORIGIN=https://myapp.com,https://www.myapp.com
CORS_CREDENTIALS=true
CORS_MAX_AGE=86400
CORS_METHODS=GET,POST,PUT,DELETE
```

### Public API

For public APIs that allow all origins:

```bash
CORS_ORIGIN=*
CORS_CREDENTIALS=false
CORS_METHODS=GET,POST
```

### Secure Environment

For maximum security with limited access:

```bash
CORS_ORIGIN=https://trusted-app.com
CORS_CREDENTIALS=true
CORS_ALLOWED_HEADERS=Content-Type,Authorization
CORS_METHODS=GET,POST
CORS_MAX_AGE=3600
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
