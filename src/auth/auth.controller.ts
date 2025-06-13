import {
  Inject,
  Controller,
  Post,
  Body,
  HttpCode,
  Request,
  Get,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import type { LoginUserDto } from '../dto/LoginUserDto';
import { getUser } from '../lib/getUser';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService)
    private authService: AuthService,
  ) {}

  @Post('login')
  async login(
    @Body()
    loginUserDto: LoginUserDto,
  ) {
    return this.authService.login(loginUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req: Request) {
    return getUser(req);
  }
}
