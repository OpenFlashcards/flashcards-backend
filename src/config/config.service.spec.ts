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
    delete process.env.CORS_METHODS;
    delete process.env.CORS_ALLOWED_HEADERS;
    delete process.env.CORS_CREDENTIALS;
    delete process.env.CORS_OPTIONS_SUCCESS_STATUS;
    delete process.env.CORS_MAX_AGE;
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

  describe('CORS Configuration', () => {
    it('should return default CORS configuration', () => {
      const corsConfig = service.corsConfig;

      expect(corsConfig.origin).toBe('*');
      expect(corsConfig.methods).toEqual([
        'GET',
        'HEAD',
        'PUT',
        'PATCH',
        'POST',
        'DELETE',
        'OPTIONS',
      ]);
      expect(corsConfig.allowedHeaders).toEqual([
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
      ]);
      expect(corsConfig.credentials).toBe(false);
      expect(corsConfig.optionsSuccessStatus).toBe(200);
      expect(corsConfig.maxAge).toBe(86400);
    });

    it('should parse single origin correctly', async () => {
      process.env.CORS_ORIGIN = 'http://localhost:3000';

      // Recreate service to pick up new env vars
      const module = await Test.createTestingModule({
        imports: [NestConfigModule.forRoot({ isGlobal: true })],
        providers: [ConfigService],
      }).compile();

      const newService = module.get<ConfigService>(ConfigService);

      expect(newService.corsConfig.origin).toBe('http://localhost:3000');
    });

    it('should parse multiple origins correctly', async () => {
      process.env.CORS_ORIGIN =
        'http://localhost:3000,https://myapp.com,https://www.myapp.com';

      const module = await Test.createTestingModule({
        imports: [NestConfigModule.forRoot({ isGlobal: true })],
        providers: [ConfigService],
      }).compile();

      const newService = module.get<ConfigService>(ConfigService);
      const corsConfig = newService.corsConfig;
      expect(corsConfig.origin).toEqual([
        'http://localhost:3000',
        'https://myapp.com',
        'https://www.myapp.com',
      ]);
    });

    it('should parse boolean origins correctly', async () => {
      process.env.CORS_ORIGIN = 'true';
      let module = await Test.createTestingModule({
        imports: [NestConfigModule.forRoot({ isGlobal: true })],
        providers: [ConfigService],
      }).compile();
      let newService = module.get<ConfigService>(ConfigService);
      let corsConfig = newService.corsConfig;
      expect(corsConfig.origin).toBe(true);

      process.env.CORS_ORIGIN = 'false';
      module = await Test.createTestingModule({
        imports: [NestConfigModule.forRoot({ isGlobal: true })],
        providers: [ConfigService],
      }).compile();
      newService = module.get<ConfigService>(ConfigService);
      corsConfig = newService.corsConfig;
      expect(corsConfig.origin).toBe(false);
    });

    it('should parse custom methods correctly', async () => {
      process.env.CORS_METHODS = 'GET,POST,PUT';

      const module = await Test.createTestingModule({
        imports: [NestConfigModule.forRoot({ isGlobal: true })],
        providers: [ConfigService],
      }).compile();

      const newService = module.get<ConfigService>(ConfigService);
      const corsConfig = newService.corsConfig;
      expect(corsConfig.methods).toEqual(['GET', 'POST', 'PUT']);
    });

    it('should parse custom headers correctly', async () => {
      process.env.CORS_ALLOWED_HEADERS = 'Content-Type,Authorization';

      const module = await Test.createTestingModule({
        imports: [NestConfigModule.forRoot({ isGlobal: true })],
        providers: [ConfigService],
      }).compile();

      const newService = module.get<ConfigService>(ConfigService);
      const corsConfig = newService.corsConfig;
      expect(corsConfig.allowedHeaders).toEqual([
        'Content-Type',
        'Authorization',
      ]);
    });

    it('should parse credentials correctly', async () => {
      process.env.CORS_CREDENTIALS = 'true';
      let module = await Test.createTestingModule({
        imports: [NestConfigModule.forRoot({ isGlobal: true })],
        providers: [ConfigService],
      }).compile();
      let newService = module.get<ConfigService>(ConfigService);
      expect(newService.corsConfig.credentials).toBe(true);

      process.env.CORS_CREDENTIALS = 'false';
      module = await Test.createTestingModule({
        imports: [NestConfigModule.forRoot({ isGlobal: true })],
        providers: [ConfigService],
      }).compile();
      newService = module.get<ConfigService>(ConfigService);
      expect(newService.corsConfig.credentials).toBe(false);
    });

    it('should parse numeric values correctly', async () => {
      process.env.CORS_OPTIONS_SUCCESS_STATUS = '204';
      process.env.CORS_MAX_AGE = '3600';

      const module = await Test.createTestingModule({
        imports: [NestConfigModule.forRoot({ isGlobal: true })],
        providers: [ConfigService],
      }).compile();

      const newService = module.get<ConfigService>(ConfigService);
      const corsConfig = newService.corsConfig;
      expect(corsConfig.optionsSuccessStatus).toBe(204);
      expect(corsConfig.maxAge).toBe(3600);
    });
  });
});
