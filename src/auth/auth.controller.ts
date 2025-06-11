import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Request,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import type { LoginUserDto } from '../dto/LoginUserDto';
import type { User, UserFull } from '../db/schema';

() => console.log(AuthService);

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @UseGuards(AuthGuard('jwt')) // Protect this route with JWT strategy
  @Get('profile')
  getProfile(@Request() req: { user: UserFull }): User {
    // req.user will contain the validated user object from JwtStrategy
    // Ensure to remove passwordHash if it wasn't already removed in validate method
    const { passwordHash, ...userWithoutPassword } = req.user;
    return userWithoutPassword;
  }
}
