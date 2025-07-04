# Flashcards Backend

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">A modern flashcards learning API built with <a href="https://nestjs.com" target="_blank">NestJS</a></p>

<p align="center">
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
  <a href="https://github.com/nestjs/nest/blob/master/LICENSE" target="_blank"><img src="https://img.shields.io/badge/License-GPL--3.0-blue.svg" alt="License" /></a>
</p>

## About

This project is the backend API for the OpenFlashcards application, providing a robust and scalable server-side solution for managing flashcards, decks, users, and learning progress. Built with modern TypeScript and leveraging the power of the NestJS framework.

## Framework

This application is built using [**NestJS**](https://nestjs.com/), a progressive Node.js framework for building efficient and scalable server-side applications. NestJS provides:

- **TypeScript Support**: First-class TypeScript support with decorators and modern ES6+ features
- **Modular Architecture**: Highly testable, scalable, and maintainable application structure
- **Dependency Injection**: Powerful IoC container for managing dependencies
- **Decorator-based Design**: Clean and intuitive API design using decorators
- **Built-in Features**: Guards, interceptors, pipes, filters, and more out of the box

For more information about NestJS, visit the [official documentation](https://docs.nestjs.com).

## Features

- **Flashcard Management**: Create, read, update, and delete flashcards
- **Deck Organization**: Group flashcards into organized decks and categories
- **User Management**: User authentication and profile management
- **Learning Progress**: Track learning statistics and spaced repetition algorithms
- **REST API**: Clean and well-documented RESTful API endpoints
- **Type Safety**: Full TypeScript support with strict typing
- **Database Integration**: PostgreSQL database with robust data persistence
- **Testing**: Comprehensive unit and integration tests
- **Docker Support**: Containerized development environment

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **Docker** and **Docker Compose** (for database)
- **Git** for version control

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd flashcards-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Development Database Setup

This project uses PostgreSQL as the database. For development, we provide a Docker Compose configuration that sets up a local PostgreSQL instance.

#### Starting the Development Database

Navigate to the database compose directory and start the PostgreSQL container:

```bash
cd compose/postgres
docker-compose up -d
```

This will start a PostgreSQL 16 container with the following configuration:

- **Database Name**: `flashcards`
- **Username**: `flashcards`
- **Password**: `flashcards`
- **Port**: `5432`
- **Container Name**: `postgres-flashcards-dev`

The database data is persisted in a Docker volume named `flashcards_postgres_dev`, so your data will be preserved between container restarts.

#### Stopping the Development Database

To stop the database container:

```bash
cd compose/postgres
docker-compose down
```

#### Database Configuration

The PostgreSQL container is configured with:

- **Image**: `postgres:16` (Latest stable PostgreSQL version)
- **Environment Variables**:
  - `POSTGRES_DB=flashcards`
  - `POSTGRES_USER=flashcards`
  - `POSTGRES_PASSWORD=flashcards`
- **Port Mapping**: Host port `5432` → Container port `5432`
- **Volume**: Persistent data storage in `flashcards_postgres_dev` volume
- **Restart Policy**: `unless-stopped` (automatically restarts on system boot)

#### Connection String

For connecting to the development database, use:

```env
postgresql://flashcards:flashcards@localhost:5432/flashcards
```

## Development

### Running the Application

```bash
# development mode
npm run start

# development with file watching (recommended for development)
npm run start:dev

# debug mode with file watching
npm run start:debug

# production mode
npm run start:prod
```

The application will start on `http://localhost:3000` by default.

## Testing

This project includes comprehensive testing support with Jest:

```bash
# run all unit tests
npm run test

# run tests in watch mode (for development)
npm run test:watch

# run end-to-end tests
npm run test:e2e

# generate test coverage report
npm run test:cov

# debug tests
npm run test:debug
```

### Code Quality and Formatting

```bash
# run ESLint for code linting
npm run lint

# format code with Prettier
npm run format

# build the project
npm run build
```

## Project Structure

```plaintext
src/
├── app.controller.spec.ts    # App controller tests
├── app.controller.ts         # App controller
├── app.module.ts            # Root application module
├── app.service.ts           # App service
└── main.ts                  # Application entry point

test/
├── app.e2e-spec.ts          # End-to-end tests
└── jest-e2e.json           # E2E test configuration

compose/
└── postgres/
    └── compose.yml          # PostgreSQL Docker Compose configuration

agents/
├── AGENTS.md               # Agent documentation
└── scripts/
    └── install.sh          # Installation scripts
```

## API Documentation

Once the application is running, you can access the API documentation at:

- **Swagger UI**: `http://localhost:3000/api` (if configured)
- **API Base URL**: `http://localhost:3000`

## Environment Configuration

Create a `.env` file in the root directory with the following configuration:

```env
# Database Configuration
DATABASE_URL=postgresql://flashcards:flashcards@localhost:5432/flashcards
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=flashcards
DATABASE_PASSWORD=flashcards
DATABASE_NAME=flashcards

# Application Configuration
PORT=3000
NODE_ENV=development

# Add other environment variables as needed
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [NestJS deployment documentation](https://docs.nestjs.com/deployment) for more information.

### Production Build

```bash
npm run build
npm run start:prod
```

### Docker Deployment

For containerized deployment, you can create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/

EXPOSE 3000

CMD ["node", "dist/main"]
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Write tests for new features and bug fixes
- Update documentation for any API changes
- Ensure all tests pass before submitting a PR
- Use conventional commit messages

## NestJS Resources

Check out these helpful resources for working with NestJS:

- Visit the [**NestJS Documentation**](https://docs.nestjs.com) to learn more about the framework
- For questions and support, visit the [NestJS Discord channel](https://discord.gg/G7Qnnhy)
- Check out official [NestJS video courses](https://courses.nestjs.com/)
- Explore [NestJS Devtools](https://devtools.nestjs.com) for application visualization
- For enterprise support, visit [NestJS Enterprise](https://enterprise.nestjs.com)

### Key NestJS Documentation Sections

- [**Controllers**](https://docs.nestjs.com/controllers) - Request handling and routing
- [**Providers**](https://docs.nestjs.com/providers) - Dependency injection and services
- [**Modules**](https://docs.nestjs.com/modules) - Application organization
- [**Middleware**](https://docs.nestjs.com/middleware) - Request/response processing
- [**Guards**](https://docs.nestjs.com/guards) - Authentication and authorization
- [**Interceptors**](https://docs.nestjs.com/interceptors) - Request/response transformation
- [**Pipes**](https://docs.nestjs.com/pipes) - Data validation and transformation
- [**Database**](https://docs.nestjs.com/techniques/database) - Database integration
- [**Testing**](https://docs.nestjs.com/fundamentals/testing) - Unit and integration testing
- [**Security**](https://docs.nestjs.com/security/authentication) - Authentication and security

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Ensure PostgreSQL container is running: `docker-compose ps`
   - Check database connectivity: `docker-compose logs postgres`
   - Verify connection string in environment variables

2. **Port Already in Use**
   - Check if port 3000 is already in use: `lsof -i :3000`
   - Change the port in your environment configuration

3. **Module Import Errors**
   - Ensure all dependencies are installed: `npm install`
   - Check TypeScript compilation: `npm run build`

### Getting Help

If you encounter issues:

1. Check the [NestJS documentation](https://docs.nestjs.com)
2. Search existing issues in the project repository
3. Join the [NestJS Discord community](https://discord.gg/G7Qnnhy)
4. Create a new issue with detailed information about the problem

## License

This project is licensed under the **GNU General Public License v3.0** - see the [LICENSE](LICENSE) file for details.

The GPL-3.0 license ensures that:

- You can freely use, modify, and distribute this software
- Any derivative works must also be open source under GPL-3.0
- The software comes with no warranty
- You must include the original copyright notice and license

### Third-Party Licenses

This project uses NestJS, which is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

## Support the Project

If this project helps you, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs and issues
- 💡 Suggesting new features
- 🤝 Contributing code improvements
- 📖 Improving documentation

## Contact

For questions, suggestions, or collaboration opportunities, please:

- Open an issue in the repository
- Join our community discussions
- Follow the project for updates

---

**Built with ❤️ using [NestJS](https://nestjs.com)**
