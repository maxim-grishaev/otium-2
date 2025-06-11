import { Pool } from 'pg';
import * as schema from './schema';
import { drizzle } from 'drizzle-orm/node-postgres';

export const createDbClient = () =>
  drizzle(new Pool({ connectionString: `${process.env.DB_CONN}` }), { schema });
