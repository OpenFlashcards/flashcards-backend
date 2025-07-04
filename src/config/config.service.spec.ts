import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(async () => {
    // Set required environment variables for testing
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        NestConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
      providers: [ConfigService],
    }).compile();

    service = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.DATABASE_URL;
    delete process.env.JWT_SECRET;
    delete process.env.JWT_EXPIRES_IN;
    delete process.env.PORT;
    delete process.env.CORS_ORIGIN;
    delete process.env.LOG_LEVEL;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return correct database URL', () => {
    expect(service.databaseUrl).toBe(
      'postgresql://test:test@localhost:5432/test_db',
    );
  });

  it('should return correct JWT secret', () => {
    expect(service.jwtSecret).toBeUndefined(); // No JWT_SECRET set in test
  });

  it('should return correct port as number', () => {
    expect(service.port).toBe(3000); // Default value
  });

  it('should return default values for optional variables', () => {
    expect(service.jwtExpiresIn).toBe('7d');
    expect(service.corsOrigin).toBe('*');
    expect(service.logLevel).toBe('info');
  });
});
