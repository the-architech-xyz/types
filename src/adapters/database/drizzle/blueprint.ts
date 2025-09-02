/**
 * Drizzle ORM Blueprint
 * 
 * Sets up Drizzle ORM with PostgreSQL and migrations
 */

import { Blueprint } from '../../../types/adapter.js';

export const drizzleBlueprint: Blueprint = {
  id: 'drizzle-setup',
  name: 'Drizzle ORM Setup',
  actions: [
    {
      type: 'RUN_COMMAND',
      command: 'npm install drizzle-orm postgres'
    },
    {
      type: 'RUN_COMMAND',
      command: 'npm install -D drizzle-kit @types/pg'
    },
    {
      type: 'ADD_CONTENT',
      target: 'src/lib/db/index.ts',
      content: `import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Database connection
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });

// Export schema for use in other files
export * from './schema';`
    },
    {
      type: 'ADD_CONTENT',
      target: 'src/lib/db/schema.ts',
      content: `import { pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Example user table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  emailVerified: boolean('email_verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Example posts table
export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content'),
  published: boolean('published').default(false),
  authorId: uuid('author_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));`
    },
    {
      type: 'ADD_CONTENT',
      target: 'drizzle.config.ts',
      content: `import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;`
    },
    {
      type: 'ADD_CONTENT',
      target: '.env.example',
      content: `# Database
DATABASE_URL="postgresql://username:password@localhost:5432/{{project.name}}"

# Add your environment variables here`
    },
    {
      type: 'ADD_CONTENT',
      target: 'package.json',
      content: `{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  }
}`
    }
  ]
};
