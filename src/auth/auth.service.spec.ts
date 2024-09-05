import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from './auth.service';
import { User } from './schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let model: Model<User>;

  const mockUser = {
    _id: '66d4a3ac7acc954a2259528e',
    name: 'rltjd',
    email: 'rltjd8714@gmail.com',
  };
  const token = 'jwtToken';

  const mockBookService = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        {
          provide: getModelToken(User.name),
          useValue: mockBookService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    model = module.get<Model<User>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signUp', () => {
    const signUpDto = {
      name: 'rltjd',
      email: 'rltjd8714@gmail.com',
      password: 'password',
      role: [],
    };

    it('should register the new user', async () => {
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
      jest.spyOn(model, 'create').mockImplementationOnce(() => Promise.resolve(mockUser as any));

      jest.spyOn(jwtService, 'sign').mockReturnValue('jwtToken');

      const result = await authService.signUp(signUpDto);
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(result).toEqual({ token });
    });

    it('should throw Duplicated Email', async () => {
      jest.spyOn(model, 'create').mockImplementationOnce(() => Promise.reject({ code: 11000 }));

      await expect(authService.signUp(signUpDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'rltjd8714@gmail.com',
      password: 'password',
    };

    it('should login user and return token', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(jwtService, 'sign').mockReturnValue(token);

      const result = await authService.login(loginDto);
      expect(result).toEqual({ token });
    });

    it('should throw invalid email error', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw invaild password error', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
