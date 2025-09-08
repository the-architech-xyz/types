import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db';
import { users, sessions, accounts, verificationTokens } from '@/lib/db/schema/auth';

export const drizzleAdapterConfig = drizzleAdapter(db, {
  users,
  sessions,
  accounts,
  verificationTokens,
});
