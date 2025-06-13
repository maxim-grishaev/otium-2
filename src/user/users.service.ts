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
import { users } from '../db/schema';
import type { CreateUserDto } from '../dto/CreateUserDto';
import { UserDto } from 'src/dto/UserDto';
import type { PgColumn } from 'drizzle-orm/pg-core';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DB_CONNECTION)
    private db: DbClient,
  ) {}

  async registerUser(createUserDto: CreateUserDto) {
    const { email, password, firstName, lastName } = createUserDto;

    const existingUser = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      throw new ConflictException('Email already registered.');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUsers = await this.db
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

    return new UserDto(newUsers[0]);
  }

  async findFirstUserBy(col: PgColumn, val: string) {
    return await this.db.query.users.findFirst({ where: eq(col, val) });
  }
  async findUserByEmail(email: string) {
    const user = await this.findFirstUserBy(users.email, email);
    return !user ? null : new UserDto(user);
  }

  async findUserById(id: string) {
    const user = await this.findFirstUserBy(users.id, id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    return new UserDto(user);
  }
}
