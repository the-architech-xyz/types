/**
 * Better Auth Code Generator
 * 
 * Handles all code generation for Better Auth authentication integration.
 * Based on: https://better-auth.com/docs
 */

import { BetterAuthConfig } from './BetterAuthSchema.js';

export class BetterAuthGenerator {
  
  static generateAuthConfig(config: BetterAuthConfig): string {
    const providers = config.providers || ['credentials', 'google', 'github'];
    const sessionDuration = config.sessionDuration || 30 * 24 * 60 * 60;
    
    return `import { BetterAuth } from "better-auth";
import { DrizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@/lib/db";

export const auth = new BetterAuth({
  adapter: DrizzleAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: ${sessionDuration},
  },
  providers: [
    ${providers.map(provider => {
      switch (provider) {
        case 'credentials':
          return `{
      id: "credentials",
      type: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Add your credentials logic here
        return null;
      }
    }`;
        case 'google':
          return `{
      id: "google",
      type: "oauth",
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }`;
        case 'github':
          return `{
      id: "github",
      type: "oauth",
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }`;
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
  ${config.enableRateLimiting ? `
  rateLimit: {
    max: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },` : ''}
  ${config.enableAuditLogs ? `
  auditLogs: {
    enabled: true,
    events: ["login", "logout", "signup", "password_reset"],
  },` : ''}
});
`;
  }

  static generateAuthUtils(): string {
    return `import { auth } from "./auth";

export const { handlers, signIn, signOut, getSession } = auth;

export async function getCurrentUser() {
  const session = await getSession();
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
`;
  }

  static generateAuthComponents(): string {
    return `"use client";

import { signIn, signOut, getSession } from "@/lib/auth";
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
  const [user, setUser] = useState<any>(null);

  // Add user fetching logic here
  
  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}
`;
  }

  static generateUnifiedIndex(): string {
    return `/**
 * Unified Auth Interface - Better Auth Implementation
 * 
 * This file provides a unified interface for authentication
 * that works with Better Auth. It abstracts away Better Auth-specific
 * details and provides a clean API for auth operations.
 * 
 * Based on: https://better-auth.com/docs
 */

// ============================================================================
// CORE AUTH EXPORTS
// ============================================================================

export { auth, handlers, signIn, signOut, getSession } from './auth.js';
export { getCurrentUser, requireAuth, requireRole, hasPermission } from './auth-utils.js';

// ============================================================================
// COMPONENT EXPORTS
// ============================================================================

export { SignInForm, SignOutButton, UserProfile } from './auth-components.js';

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { Session, User } from 'better-auth';

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  auth,
  signIn,
  signOut,
  getSession,
  getCurrentUser,
  requireAuth,
  requireRole,
  hasPermission,
  SignInForm,
  SignOutButton,
  UserProfile
};
`;
  }

  static generateEnvConfig(config: BetterAuthConfig): string {
    const providers = config.providers || ['credentials', 'google', 'github'];
    
    return `# Better Auth Configuration
BETTER_AUTH_SECRET="${Math.random().toString(36).substring(2, 15)}"
BETTER_AUTH_URL="http://localhost:3000"

# Database
DATABASE_URL="${config.databaseUrl}"

# OAuth Providers
${providers.includes('google') ? `
# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"` : ''}

${providers.includes('github') ? `
# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"` : ''}

# Session Configuration
SESSION_MAX_AGE="${config.sessionDuration}"
REQUIRE_EMAIL_VERIFICATION="${config.requireEmailVerification ? 'true' : 'false'}"

# Features
ENABLE_OAUTH="${config.enableOAuth ? 'true' : 'false'}"
ENABLE_CREDENTIALS="${config.enableCredentials ? 'true' : 'false'}"
ENABLE_MAGIC_LINKS="${config.enableMagicLinks ? 'true' : 'false'}"
ENABLE_TWO_FACTOR="${config.enableTwoFactor ? 'true' : 'false'}"
ENABLE_WEBAUTHN="${config.enableWebAuthn ? 'true' : 'false'}"
ENABLE_RATE_LIMITING="${config.enableRateLimiting ? 'true' : 'false'}"
ENABLE_AUDIT_LOGS="${config.enableAuditLogs ? 'true' : 'false'}"
`;
  }

  static generateDatabaseSchema(): string {
    return `-- Better Auth Database Schema
-- This file contains the database schema for Better Auth

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  image VARCHAR(255),
  email_verified TIMESTAMP,
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
  }
} 