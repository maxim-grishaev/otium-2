import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DbModule } from '../db/db.module'; // Import DbModule

@Module({
  imports: [DbModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export UsersService for use in AuthModule
})
export class UsersModule {}
