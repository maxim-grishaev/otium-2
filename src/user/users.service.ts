import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { DB_CONNECTION, type DbClient } from '../db/db.module';
import { type User, users, type UserFull } from '../db/schema';
import type { CreateUserDto } from '../dto/CreateUserDto';

@Injectable()
export class UsersService {
  constructor(@Inject(DB_CONNECTION) private db: DbClient) {}

  async registerUser(
    createUserDto: CreateUserDto,
  ): Promise<Omit<User, 'passwordHash'>> {
    const { email, password, firstName, lastName } = createUserDto;

    const existingUser = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      throw new ConflictException('Email already registered.');
    }

    const passwordHash = await bcrypt.hash(password, 10); // Hash password

    const newUser = await this.db
      .insert(users)
      .values({
        id: uuidv4(),
        email,
        passwordHash,
        firstName,
        lastName,
      })
      .returning()
      .execute();

    const { passwordHash: _, ...result } = newUser[0];
    return result;
  }

  async findUserByEmail(email: string): Promise<UserFull | undefined> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });
    return user;
  }

  async findUserById(id: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, id),
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    const { passwordHash, ...result } = user;
    return result;
  }
}
