import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '../config/config.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Prisma } from '@prisma/client';

describe('UserService', () => {
  let service: UserService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockConfigService = {
    passwordSalt: 'test-salt',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      provider: 'email',
    };

    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      appleId: null,
      googleId: null,
      provider: 'email',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a user successfully', async () => {
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.createUser(createUserDto);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: createUserDto.email,
          name: createUserDto.name,
          provider: createUserDto.provider,
          password: expect.any(String), // Hashed password
        }),
        select: {
          id: true,
          email: true,
          name: true,
          appleId: true,
          googleId: true,
          provider: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should throw BadRequestException when no password or external ID provided', async () => {
      const invalidDto = {
        email: 'test@example.com',
        name: 'Test User',
        provider: 'email' as any,
      };

      await expect(service.createUser(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException when email already exists', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '4.0.0',
          meta: { target: ['email'] },
        },
      );

      mockPrismaService.user.create.mockRejectedValue(prismaError);

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create user with Apple ID', async () => {
      const appleUserDto = {
        email: 'apple@example.com',
        appleId: 'apple123',
        name: 'Apple User',
        provider: 'apple',
      };

      const mockAppleUser = {
        ...mockUser,
        email: 'apple@example.com',
        appleId: 'apple123',
        provider: 'apple',
      };

      mockPrismaService.user.create.mockResolvedValue(mockAppleUser);

      const result = await service.createUser(appleUserDto);

      expect(result).toEqual(mockAppleUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: appleUserDto.email,
          appleId: appleUserDto.appleId,
          provider: appleUserDto.provider,
          password: undefined,
        }),
        select: expect.any(Object),
      });
    });
  });

  describe('findUserByEmail', () => {
    const email = 'test@example.com';
    const mockUser = {
      id: 1,
      email,
      name: 'Test User',
      appleId: null,
      googleId: null,
      provider: 'email',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should find user by email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findUserByEmail(email);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          appleId: true,
          googleId: true,
          provider: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should return null when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findUserByEmail(email);

      expect(result).toBeNull();
    });
  });

  describe('findUserById', () => {
    const userId = 1;
    const mockUser = {
      id: userId,
      email: 'test@example.com',
      name: 'Test User',
      appleId: null,
      googleId: null,
      provider: 'email',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should find user by ID', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findUserById(userId);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          appleId: true,
          googleId: true,
          provider: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should return null when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findUserById(userId);

      expect(result).toBeNull();
    });
  });

  describe('hashPassword', () => {
    it('should hash password with salt', () => {
      const password = 'testpassword123';
      const hashedPassword = service.hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(typeof hashedPassword).toBe('string');
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBe(64); // SHA-256 hex string length
    });

    it('should produce consistent hashes for same password', () => {
      const password = 'testpassword123';
      const hash1 = service.hashPassword(password);
      const hash2 = service.hashPassword(password);

      expect(hash1).toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', () => {
      const password = 'testpassword123';
      const hashedPassword = service.hashPassword(password);

      const isValid = service.verifyPassword(password, hashedPassword);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', () => {
      const correctPassword = 'testpassword123';
      const wrongPassword = 'wrongpassword';
      const hashedPassword = service.hashPassword(correctPassword);

      const isValid = service.verifyPassword(wrongPassword, hashedPassword);

      expect(isValid).toBe(false);
    });

    it('should handle verification errors gracefully', () => {
      const isValid = service.verifyPassword('password', 'invalid-hash');

      expect(isValid).toBe(false);
    });
  });
});
