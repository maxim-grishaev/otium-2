import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../user/users.service';
import type { LoginUserDto } from '../dto/LoginUserDto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(UsersService)
    private usersService: UsersService,
    @Inject(JwtService)
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      return null;
    }
    const isValidPassword = await bcrypt.compare(pass, user.passwordHash);
    if (!isValidPassword) {
      return null;
    }
    return user;
  }

  async login(loginUserDto: LoginUserDto): Promise<{ accessToken: string }> {
    const user = await this.validateUser(
      loginUserDto.email,
      loginUserDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      accessToken: this.jwtService.sign({ email: user.email, id: user.id }),
    };
  }
}
