import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existing = await this.usersService.findByEmail(registerDto.email);
    if (existing) {
      throw new ConflictException('An account with this email address already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(registerDto.password, salt);

    const user = await this.usersService.create({
      email: registerDto.email,
      name: registerDto.name,
      passwordHash,
      fitnessLevel: registerDto.fitnessLevel,
    });

    const tokens = await this.generateTokens(user);
    await this.updateRefreshTokenHash(user._id.toString(), tokens.refreshToken);

    const { passwordHash: _, refreshTokenHash: __, ...userResponse } = user.toObject();

    return {
      user: userResponse,
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user);
    await this.updateRefreshTokenHash(user._id.toString(), tokens.refreshToken);

    const { passwordHash: _, refreshTokenHash: __, ...userResponse } = user.toObject();

    return {
      user: userResponse,
      ...tokens,
    };
  }

  async validateUser(email: string, pass: string): Promise<UserDocument | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      return null;
    }

    return user;
  }

  async refreshTokens(refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    try {
      const refreshSecret =
        this.configService.get<string>('jwt.refreshSecret') ||
        'super_secret_refresh_key_change_in_production_hiking_2026';

      const payload = this.jwtService.verify(refreshToken, {
        secret: refreshSecret,
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.refreshTokenHash) {
        throw new UnauthorizedException('Access Denied');
      }

      const isTokenMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash);
      if (!isTokenMatch) {
        // Potential reuse attack: clear user refresh token
        await this.usersService.setRefreshToken(user._id.toString(), null);
        throw new UnauthorizedException('Invalid or expired refresh token. Please log in again.');
      }

      const tokens = await this.generateTokens(user);
      await this.updateRefreshTokenHash(user._id.toString(), tokens.refreshToken);

      return tokens;
    } catch (err: any) {
      this.logger.warn(`Refresh token error: ${err.message}`);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string) {
    if (userId) {
      await this.usersService.setRefreshToken(userId, null);
    }
    return { success: true, message: 'Logged out successfully' };
  }

  async generateTokens(user: UserDocument) {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    const accessSecret =
      this.configService.get<string>('jwt.accessSecret') ||
      'super_secret_access_key_change_in_production_hiking_2026';
    const refreshSecret =
      this.configService.get<string>('jwt.refreshSecret') ||
      'super_secret_refresh_key_change_in_production_hiking_2026';
    const accessExpiration = this.configService.get<string>('jwt.accessExpiration') || '15m';
    const refreshExpiration = this.configService.get<string>('jwt.refreshExpiration') || '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpiration as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiration as any,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }

  private async updateRefreshTokenHash(userId: string, refreshToken: string) {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(refreshToken, salt);
    await this.usersService.setRefreshToken(userId, hashed);
  }

  setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });
  }

  clearAuthCookies(res: Response) {
    const isProduction = process.env.NODE_ENV === 'production';

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
    });
  }
}
