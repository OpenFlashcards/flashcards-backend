import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    createUser: jest.fn(),
  };

  const mockUserResponse: UserResponseDto = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    appleId: null,
    googleId: null,
    provider: 'email',
    createdAt: new Date('2025-07-04T21:00:00.000Z'),
    updatedAt: new Date('2025-07-04T21:00:00.000Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      provider: 'email',
    };

    it('should create a user successfully', async () => {
      mockUserService.createUser.mockResolvedValue(mockUserResponse);

      const result = await controller.createUser(createUserDto);

      expect(result).toEqual(mockUserResponse);
      expect(userService.createUser).toHaveBeenCalledWith(createUserDto);
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      mockUserService.createUser.mockRejectedValue(error);

      await expect(controller.createUser(createUserDto)).rejects.toThrow(error);
    });
  });
});
