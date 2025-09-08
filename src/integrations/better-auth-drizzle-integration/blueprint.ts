import { Blueprint } from '../../types/adapter.js';

export const blueprint: Blueprint = {
  id: 'better-auth-drizzle-integration',
  name: 'Better Auth Drizzle Integration',
  description: 'Complete Drizzle ORM integration for Better Auth',
  version: '1.0.0',
  actions: [
    // Drizzle Adapter
    {
      type: 'CREATE_FILE',
      path: 'src/lib/auth/drizzle-adapter.ts',
      content: `import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db';
import { users, sessions, accounts, verificationTokens } from '@/lib/db/schema/auth';

export const drizzleAdapterConfig = drizzleAdapter(db, {
  users,
  sessions,
  accounts,
  verificationTokens,
});
`,
      condition: '{{#if integration.features.adapterLogic}}'
    },

    // Auth Schema
    {
      type: 'CREATE_FILE',
      path: 'src/lib/db/schema/auth.ts',
      content: `import { pgTable, text, timestamp, boolean, integer, primaryKey } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  role: text('role').notNull().default('user'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const accounts = pgTable('accounts', {
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (account) => ({
  pk: primaryKey({ columns: [account.provider, account.providerAccountId] }),
}));

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  sessionToken: text('session_token').notNull().unique(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires').notNull(),
}, (vt) => ({
  pk: primaryKey({ columns: [vt.identifier, vt.token] }),
}));

// Indexes for better performance
export const usersEmailIndex = pgIndex('users_email_idx').on(users.email);
export const sessionsTokenIndex = pgIndex('sessions_token_idx').on(sessions.sessionToken);
export const accountsUserIdIndex = pgIndex('accounts_user_id_idx').on(accounts.userId);
export const verificationTokensTokenIndex = pgIndex('verification_tokens_token_idx').on(verificationTokens.token);
`,
      condition: '{{#if integration.features.userSchema}}'
    },

    // Database Migrations
    {
      type: 'CREATE_FILE',
      path: 'src/lib/db/migrations/auth.sql',
      content: `-- Better Auth Database Schema Migration
-- Run this migration to set up the authentication tables

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  image TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  PRIMARY KEY (provider, provider_account_id)
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_token TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create verification_tokens table
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires TIMESTAMP NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS sessions_token_idx ON sessions(session_token);
CREATE INDEX IF NOT EXISTS accounts_user_id_idx ON accounts(user_id);
CREATE INDEX IF NOT EXISTS verification_tokens_token_idx ON verification_tokens(token);
`,
      condition: '{{#if integration.features.migrations}}'
    },

    // Database Connection
    {
      type: 'CREATE_FILE',
      path: 'src/lib/auth/database.ts',
      content: `import { drizzle } from 'drizzle-orm/postgres-js';
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
`,
      condition: '{{#if integration.features.adapterLogic}}'
    },

    // Seed Data
    {
      type: 'CREATE_FILE',
      path: 'src/lib/db/seeds/auth.ts',
      content: `import { db } from '@/lib/db';
import { users, sessions, accounts } from '@/lib/db/schema/auth';
import { createId } from '@paralleldrive/cuid2';

export async function seedAuthData() {
  console.log('Seeding auth data...');

  // Create a test user
  const testUser = await db.insert(users).values({
    id: createId(),
    name: 'Test User',
    email: 'test@example.com',
    emailVerified: true,
    role: 'user',
  }).returning();

  console.log('Created test user:', testUser[0]);

  // Create a test session
  const testSession = await db.insert(sessions).values({
    id: createId(),
    sessionToken: 'test-session-token',
    userId: testUser[0].id,
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  }).returning();

  console.log('Created test session:', testSession[0]);

  // Create a test account
  const testAccount = await db.insert(accounts).values({
    userId: testUser[0].id,
    type: 'oauth',
    provider: 'google',
    providerAccountId: 'google-123456',
    access_token: 'test-access-token',
    token_type: 'Bearer',
    expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour
  }).returning();

  console.log('Created test account:', testAccount[0]);

  console.log('Auth data seeded successfully!');
}

// Run seed if this file is executed directly
if (require.main === module) {
  seedAuthData().catch(console.error);
}
`,
      condition: '{{#if integration.features.seedData}}'
    },

    // Add Drizzle import to auth config
    {
      type: 'ADD_TS_IMPORT',
      path: 'src/lib/auth/config.ts',
      imports: [
        {
          moduleSpecifier: './drizzle-adapter',
          namedImports: ['drizzleAdapterConfig']
        }
      ],
      condition: '{{#if integration.features.adapterLogic}}'
    },

    // Merge database configuration into auth config
    {
      type: 'ENHANCE_FILE',
      path: 'src/lib/auth/config.ts',
      modifier: 'drizzle-config-merge',
      params: {
        configObjectName: 'auth',
        payload: {
          database: 'drizzleAdapterConfig',
          emailAndPassword: {
            enabled: true,
            requireEmailVerification: true,
          },
          socialProviders: {
            google: {
              clientId: 'process.env.GOOGLE_CLIENT_ID!',
              clientSecret: 'process.env.GOOGLE_CLIENT_SECRET!',
            },
            github: {
              clientId: 'process.env.GITHUB_CLIENT_ID!',
              clientSecret: 'process.env.GITHUB_CLIENT_SECRET!',
            },
          },
          session: {
            expiresIn: '60 * 60 * 24 * 7', // 7 days
            updateAge: '60 * 60 * 24', // 1 day
          },
          user: {
            additionalFields: {
              role: {
                type: 'string',
                required: false,
                defaultValue: 'user',
              },
            },
          },
        }
      },
      condition: '{{#if integration.features.adapterLogic}}'
    },

    // Add auth schema to Drizzle schema
    {
      type: 'ENHANCE_FILE',
      path: 'src/lib/db/schema.ts',
      modifier: 'drizzle-schema-adder',
      params: {
        schemaDefinitions: [
          `export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  role: text('role').notNull().default('user'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});`,
          `export const sessions = pgTable('sessions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  sessionToken: text('session_token').notNull().unique(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});`,
          `export const accounts = pgTable('accounts', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (account) => ({
  pk: primaryKey({ columns: [account.provider, account.providerAccountId] }),
}));`,
          `export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires').notNull(),
}, (vt) => ({
  pk: primaryKey({ columns: [vt.identifier, vt.token] }),
}));`
        ],
        imports: ['pgTable', 'text', 'timestamp', 'boolean', 'integer', 'primaryKey', 'createId']
      },
      condition: '{{#if integration.features.userSchema}}'
    }
  ]
};
