import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { drizzleAdapterConfig } from './drizzle-adapter';
import { users, sessions, accounts, verificationTokens } from '@/lib/db/schema/auth';

// Database connection
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client);

// Export schema for use in Better Auth config
export { users, sessions, accounts, verificationTokens };

// Export the adapter configuration
export { drizzleAdapterConfig };
