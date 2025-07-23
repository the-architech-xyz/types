/**
 * NextAuth Code Generator
 * 
 * Handles all code generation for NextAuth authentication integration.
 * Based on: https://next-auth.js.org/configuration
 */

import { AuthPluginConfig } from '../../../../types/plugins.js';
import { AUTH_PROVIDERS, AuthProvider, AuthFeature } from '../../../../types/core.js';

export interface GeneratedFile {
    path: string;
    content: string;
}

export class NextAuthGenerator {
  
  generateAllFiles(config: AuthPluginConfig): GeneratedFile[] {
    return [
      this.generateAuthConfig(config),
      this.generateAuthUtils(),
      this.generateAuthComponents(),
      this.generateUnifiedIndex(),
      this.generateDatabaseSchema(),
      this.generatePrismaSchema()
    ];
  }

  generateAuthConfig(config: AuthPluginConfig): GeneratedFile {
    const providers = config.providers || [];
    const sessionDuration = 30 * 24 * 60 * 60; // Default 30 days
    const sessionStrategy = config.session === 'database' ? 'database' : 'jwt';
    
    const content = `import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "${sessionStrategy}",
    maxAge: ${sessionDuration},
  },
  providers: [
    ${providers.map(provider => {
      switch (provider) {
        case AUTH_PROVIDERS.EMAIL:
          return `CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      }
    })`;
        case AUTH_PROVIDERS.GOOGLE:
          return `GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })`;
        case AUTH_PROVIDERS.GITHUB:
          return `GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    })`;
        default:
          return `// Provider: ${provider} - Add configuration here`;
      }
    }).join(',\n    ')}
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
    error: "/auth/error",
  },
  ${(config.features as any).enableRateLimiting ? `
  // Rate limiting configuration
  // You can implement rate limiting using middleware or external packages
  ` : ''}
  ${(config.features as any).enableAuditLogs ? `
  // Audit logging configuration
  // You can implement audit logging using middleware or external packages
  ` : ''}
};

export default NextAuth(authOptions);
`;
    return { path: 'auth/auth.ts', content };
  }

  generateAuthUtils(): GeneratedFile {
    const content = `import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

export async function requireRole(role: string) {
  const user = await requireAuth();
  if (user.role !== role) {
    throw new Error("Insufficient permissions");
  }
  return user;
}

export async function hasPermission(permission: string) {
  const user = await getCurrentUser();
  if (!user) return false;
  
  // Add your permission logic here
  return true;
}

// Client-side utilities
export { signIn, signOut, useSession } from "next-auth/react";
`;
    return { path: 'auth/auth-utils.ts', content };
  }

  generateAuthComponents(): GeneratedFile {
      const content = `"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        
        <div className="mt-4 space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn("google")}
          >
            Continue with Google
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn("github")}
          >
            Continue with GitHub
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function SignOutButton() {
  return (
    <Button variant="outline" onClick={() => signOut()}>
      Sign Out
    </Button>
  );
}

export function UserProfile() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session?.user) {
    return <div>Not signed in</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><strong>Email:</strong> {session.user.email}</p>
          <p><strong>Name:</strong> {session.user.name}</p>
          {session.user.role && (
            <p><strong>Role:</strong> {session.user.role}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
`;
      return { path: 'auth/auth-components.tsx', content };
  }

  generateUnifiedIndex(): GeneratedFile {
      const content = `/**
 * Unified Auth Interface - NextAuth Implementation
 * 
 * This file provides a unified interface for authentication
 * that works with NextAuth. It abstracts away NextAuth-specific
 * details and provides a clean API for auth operations.
 * 
 * Based on: https://next-auth.js.org/configuration
 */

// ============================================================================
// CORE AUTH EXPORTS
// ============================================================================

export { default as auth, authOptions } from './auth.js';
export { getCurrentUser, requireAuth, requireRole, hasPermission, signIn, signOut, useSession } from './auth-utils.js';

// ============================================================================
// COMPONENT EXPORTS
// ============================================================================

export { SignInForm, SignOutButton, UserProfile, SessionProvider } from './auth-components.js';

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { Session, User } from 'next-auth';

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  auth,
  signIn,
  signOut,
  useSession,
  getCurrentUser,
  requireAuth,
  requireRole,
  hasPermission,
  SignInForm,
  SignOutButton,
  UserProfile,
  SessionProvider
};
`;
      return { path: 'auth/index.ts', content };
  }

  generateDatabaseSchema(): GeneratedFile {
      const content = `-- NextAuth Database Schema
-- This file contains the database schema for NextAuth

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified TIMESTAMP,
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS accounts (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type VARCHAR(255),
  scope VARCHAR(255),
  id_token TEXT,
  session_state VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(255) PRIMARY KEY,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  expires TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (identifier, token)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_provider ON accounts(provider);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);
`;
      return { path: 'auth/schema.sql', content };
  }

  generatePrismaSchema(): GeneratedFile {
      const content = `// NextAuth Prisma Schema
// This file contains the Prisma schema for NextAuth

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@id([identifier, token])
}
`;
      return { path: 'prisma/schema.prisma', content };
  }

  generateEnvConfig(config: AuthPluginConfig): Record<string, string> {
    const envVars: Record<string, string> = {};
    const providers = config.providers || [];
    
    envVars['NEXTAUTH_SECRET'] = Math.random().toString(36).substring(2, 15);
    envVars['NEXTAUTH_URL'] = "http://localhost:3000";
    envVars['DATABASE_URL'] = (config as any).databaseUrl; // Placeholder

    if (providers.includes(AUTH_PROVIDERS.GOOGLE)) {
        envVars['GOOGLE_CLIENT_ID'] = "your-google-client-id";
        envVars['GOOGLE_CLIENT_SECRET'] = "your-google-client-secret";
    }
    if (providers.includes(AUTH_PROVIDERS.GITHUB)) {
        envVars['GITHUB_CLIENT_ID'] = "your-github-client-id";
        envVars['GITHUB_CLIENT_SECRET'] = "your-github-client-secret";
    }
    
    return envVars;
  }
} 