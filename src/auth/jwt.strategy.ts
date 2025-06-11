import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { eq } from 'drizzle-orm';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { DB_CONNECTION, type DbClient } from '../db/db.module';
import { users, type User } from '../db/schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(DB_CONNECTION) private db: DbClient) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: `${process.env.JWT_SECRET}`,
    });
  }

  async validate(payload: {
    id: string;
    email: string;
  }): Promise<User> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, payload.id),
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const { passwordHash, ...result } = user;
    return result;
  }
}
