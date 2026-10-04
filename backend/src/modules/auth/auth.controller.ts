import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Res,
  Req,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(registerDto);
    this.authService.setAuthCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in with email and password' })
  @ApiResponse({ status: 200, description: 'User authenticated' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto);
    this.authService.setAuthCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  async refresh(
    @Req() req: Request,
    @Body() body: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Check both cookie and request body
    const token = req.cookies?.['refresh_token'] || body.refreshToken;
    const result = await this.authService.refreshTokens(token);
    this.authService.setAuthCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log out user and invalidate session' })
  @ApiResponse({ status: 200, description: 'User logged out' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    let userId: string | null = null;
    if ((req as any).user?.userId) {
      userId = (req as any).user.userId;
    }
    await this.authService.logout(userId || '');
    this.authService.clearAuthCookies(res);
    return { success: true, message: 'Logged out successfully' };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'User session verified' })
  async getMe(@CurrentUser('userId') userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) return null;
    const { passwordHash, refreshTokenHash, ...result } = user.toObject();
    return result;
  }
}
