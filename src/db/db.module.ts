import { Module, Global } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { createDbClient } from './createDbClient';

dotenv.config(); // Load environment variables
export const DB_CONNECTION = 'DB_CONNECTION'; // Generic connection token

@Global()
@Module({
  providers: [
    {
      provide: DB_CONNECTION,
      useValue: createDbClient(),
    },
  ],
  exports: [DB_CONNECTION],
})
export class DbModule {}

export type DbClient = ReturnType<typeof createDbClient>;
