import { Blueprint } from '../../types/adapter.js';

export const blueprint: Blueprint = {
  id: 'better-auth-drizzle-integration',
  name: 'Better Auth Drizzle Integration',
  description: 'Complete Drizzle ORM integration for Better Auth',
  version: '1.0.0',
  actions: [
    // Drizzle Adapter - only create if it doesn't exist
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

    // Auth Schema - only create if it doesn't exist
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
      modifier: 'drizzle-config-merger',
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