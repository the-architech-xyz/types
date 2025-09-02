/**
 * Better Auth Blueprint
 * 
 * Sets up Better Auth with OAuth providers and JWT sessions
 */

import { Blueprint } from '../../../types/adapter.js';

export const betterAuthBlueprint: Blueprint = {
  id: 'better-auth-setup',
  name: 'Better Auth Setup',
  actions: [
    {
      type: 'RUN_COMMAND',
      command: 'npm install better-auth'
    },
    {
      type: 'ADD_CONTENT',
      target: 'src/lib/auth/config.ts',
      content: `import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

// Import database connection and schema
// Note: Make sure to run the database module first
let db: any;
let schema: any;

try {
  db = require("../db").db;
  schema = require("../db/schema");
} catch (error) {
  console.warn("Database not found. Please run the database module first.");
  // Fallback to in-memory database for development
  db = null;
  schema = null;
}

export const auth = betterAuth({
  database: db && schema ? drizzleAdapter(db, {
    provider: "pg",
    schema: {
      users: schema.users,
      sessions: schema.sessions,
      accounts: schema.accounts,
      verification: schema.verification,
    },
  }) : undefined,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  trustedOrigins: [
    process.env.NEXTAUTH_URL || "http://localhost:3000",
  ],
});

export type Session = typeof auth.$Infer.Session;`
    },
    {
      type: 'ADD_CONTENT',
      target: 'src/lib/auth/api.ts',
      content: `import { auth } from "./config";

export const { GET, POST } = auth.handler;`
    },
    {
      type: 'ADD_CONTENT',
      target: 'src/lib/auth/client.ts',
      content: `import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;`
    },
    {
      type: 'ADD_CONTENT',
      target: 'src/app/api/auth/[...all]/route.ts',
      content: `import { GET, POST } from "../../../../lib/auth/api";

export { GET, POST };`
    },
    {
      type: 'ADD_CONTENT',
      target: '.env.example',
      content: `# Better Auth
AUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# OAuth Providers
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Database (if using Drizzle)
DATABASE_URL="postgresql://username:password@localhost:5432/{{project.name}}"`
    }
  ]
};
