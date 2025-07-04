import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { ConfigService } from './config/config.service';

describe('PrismaService', () => {
  let service: PrismaService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
      ],
      providers: [PrismaService, ConfigService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(async () => {
    await service.$disconnect();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should use database URL from config service', () => {
    expect(configService.databaseUrl).toBeDefined();
  });

  it('should connect to database', async () => {
    await expect(service.$connect()).resolves.not.toThrow();
  });

  describe('executeTransaction', () => {
    it('should execute transaction successfully', async () => {
      const result = await service.executeTransaction(async () => {
        // This is a simple test that doesn't require actual database tables
        return 'test result';
      });

      expect(result).toBe('test result');
    });
  });

  describe('cleanDatabase', () => {
    it('should throw error in non-test environment', async () => {
      // Mock the config service to return false for isTest
      jest.spyOn(configService, 'isTest', 'get').mockReturnValue(false);

      await expect(service.cleanDatabase()).rejects.toThrow(
        'cleanDatabase can only be called in test environment',
      );
    });

    it('should not throw error in test environment', async () => {
      // Mock the config service to return true for isTest
      jest.spyOn(configService, 'isTest', 'get').mockReturnValue(true);

      // Mock the database query methods
      jest.spyOn(service, '$queryRaw').mockResolvedValue([]);
      jest.spyOn(service, '$executeRawUnsafe').mockResolvedValue({} as any);

      await expect(service.cleanDatabase()).resolves.not.toThrow();
    });
  });
});
