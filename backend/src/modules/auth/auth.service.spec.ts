import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: any;
  let jwtService: any;

  const mockUser: any = {
    _id: { toString: () => '507f1f77bcf86cd799439011' },
    email: 'hiker@example.com',
    name: 'Explorer Rishank',
    passwordHash: '',
    refreshTokenHash: '',
    toObject: function() {
      return {
        _id: this._id,
        email: this.email,
        name: this.name,
      };
    },
  };

  beforeEach(async () => {
    const salt = await bcrypt.genSalt(10);
    mockUser.passwordHash = await bcrypt.hash('CorrectPassword123', salt);
    mockUser.refreshTokenHash = await bcrypt.hash('valid_refresh_token', salt);

    usersService = {
      findByEmail: jest.fn().mockImplementation((email: string) => {
        if (email === 'hiker@example.com') return Promise.resolve(mockUser);
        return Promise.resolve(null);
      }),
      findById: jest.fn().mockResolvedValue(mockUser),
      create: jest.fn().mockResolvedValue(mockUser),
      setRefreshToken: jest.fn().mockResolvedValue(undefined),
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('jwt_token_sample'),
      verify: jest.fn().mockImplementation((token: string) => {
        if (token === 'valid_refresh_token') {
          return { sub: '507f1f77bcf86cd799439011', email: 'hiker@example.com' };
        }
        throw new Error('Invalid token');
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('super_secret_access_key'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should authenticate user and return access & refresh tokens', async () => {
      const result = await service.login({
        email: 'hiker@example.com',
        password: 'CorrectPassword123',
      });

      expect(result).toBeDefined();
      expect(result.accessToken).toBe('jwt_token_sample');
      expect(result.refreshToken).toBe('jwt_token_sample');
      expect(result.user.email).toBe('hiker@example.com');
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      await expect(
        service.login({
          email: 'hiker@example.com',
          password: 'WrongPassword!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should throw ConflictException if user already exists', async () => {
      await expect(
        service.register({
          email: 'hiker@example.com',
          password: 'Password123!',
          name: 'Existing',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should register a new user successfully', async () => {
      usersService.findByEmail.mockResolvedValueOnce(null);

      const result = await service.register({
        email: 'newhiker@example.com',
        password: 'Password123!',
        name: 'New Hiker',
      });

      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(usersService.create).toHaveBeenCalled();
    });
  });

  describe('token refresh', () => {
    it('should verify and rotate refresh token', async () => {
      const tokens = await service.refreshTokens('valid_refresh_token');
      expect(tokens).toBeDefined();
      expect(tokens.accessToken).toBe('jwt_token_sample');
      expect(usersService.setRefreshToken).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      await expect(service.refreshTokens('invalid_token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
