import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let authService: AuthService;
  let authController: AuthController;

  const jwtToken = 'jwtToken';

  const mockAuthService = {
    signUp: jest.fn().mockResolvedValue(jwtToken),
    login: jest.fn().mockResolvedValue(jwtToken),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    authController = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('signUp', () => {
    const signUpDto = {
      name: 'rltjd',
      email: 'rltjd8714@gmail.com',
      password: 'password',
      role: [],
    };

    const loginDto = {
      email: 'rltjd8714@gmail.com',
      password: 'password',
    };

    it('회원가입', async () => {
      const result = await authController.signUp(signUpDto);

      expect(authService.signUp).toHaveBeenCalledWith(signUpDto);
      expect(result).toEqual(jwtToken);
    });

    it('로그인', async () => {
      const result = await authController.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(jwtToken);
    });
  });
});
