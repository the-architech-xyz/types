/**
 * Auth Agent - Authentication Package Generator
 * 
 * Sets up the packages/auth authentication layer with:
 * - Better Auth configuration
 * - Database integration with Drizzle
 * - Social login providers
 * - Session management utilities
 */

import chalk from 'chalk';
import ora from 'ora';
import fsExtra from 'fs-extra';
import path from 'path';

const { writeFile, writeJSON, ensureDir } = fsExtra;

export class AuthAgent {
  async execute(config, runner) {
    const spinner = ora({
      text: chalk.blue('🔐 Setting up authentication package with Better Auth...'),
      color: 'blue'
    }).start();

    try {
      const projectPath = path.resolve(process.cwd(), config.projectName);
      const authPackagePath = path.join(projectPath, 'packages', 'auth');
      
      // Update package.json with dependencies
      await this.updatePackageJson(authPackagePath, config);
      
      // Create ESLint config
      await this.createESLintConfig(authPackagePath);
      
      // Create Better Auth configuration
      await this.createAuthConfig(authPackagePath, config);
      
      // Create auth utilities
      await this.createAuthUtils(authPackagePath);
      
      // Create middleware and components
      await this.createAuthMiddleware(authPackagePath);
      
      // Create index exports
      await this.createIndex(authPackagePath);
      
      // Update environment configuration
      await this.updateEnvConfig(projectPath);
      
      spinner.succeed(chalk.green('✅ Authentication package configured'));
      
      // Display setup instructions
      this.displayAuthSetupInstructions();
      
    } catch (error) {
      spinner.fail(chalk.red('❌ Failed to configure auth package'));
      throw error;
    }
  }

  async updatePackageJson(authPackagePath, config) {
    const packageJson = {
      name: `@${config.projectName}/auth`,
      version: "0.1.0",
      private: true,
      description: "Authentication layer with Better Auth",
      main: "index.ts",
      types: "index.ts",
      scripts: {
        "build": "tsc",
        "dev": "tsc --watch",
        "lint": "eslint . --ext .ts",
        "type-check": "tsc --noEmit"
      },
      dependencies: {
        "better-auth": "^1.2.12",
        "@better-auth/utils": "^0.2.6",
        "jose": "^6.0.11",
        "bcryptjs": "^2.4.3",
        "zod": "^3.24.1"
      },
      devDependencies: {
        "@types/bcryptjs": "^2.4.6",
        "typescript": "^5.2.2"
      },
      peerDependencies: {
        "react": "^18.0.0",
        "next": "^14.0.0"
      }
    };

    await writeJSON(path.join(authPackagePath, 'package.json'), packageJson, { spaces: 2 });
  }

  async createESLintConfig(authPackagePath) {
    const eslintConfig = {
      extends: ["../../.eslintrc.json"]
    };

    await writeJSON(path.join(authPackagePath, '.eslintrc.json'), eslintConfig, { spaces: 2 });
  }

  async createAuthConfig(authPackagePath, config) {
    const authConfigContent = `import { betterAuth } from "better-auth";
import { db } from "@${config.projectName}/db";

export const auth = betterAuth({
  database: {
    type: "postgresql",
    url: process.env.DATABASE_URL!,
  },
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
    cookieName: "better-auth.session_token",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: process.env.NODE_ENV === "production" ? process.env.AUTH_DOMAIN : undefined,
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.User;`;

    await writeFile(path.join(authPackagePath, 'auth.ts'), authConfigContent);
  }

  async createAuthUtils(authPackagePath) {
    const clientUtilsContent = `"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  getSession,
} = authClient;`;

    await writeFile(path.join(authPackagePath, 'client.ts'), clientUtilsContent);

    const serverUtilsContent = `import { auth } from "./auth";
import { headers } from "next/headers";
import { cache } from "react";

export const getServerSession = cache(async () => {
  const headersList = headers();
  
  return await auth.api.getSession({
    headers: headersList,
  });
});

export const requireAuth = async () => {
  const session = await getServerSession();
  
  if (!session) {
    throw new Error("Authentication required");
  }
  
  return session;
};`;

    await writeFile(path.join(authPackagePath, 'server.ts'), serverUtilsContent);
  }

  async createAuthMiddleware(authPackagePath) {
    const middlewareContent = `import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./auth";

export async function authMiddleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // Protected routes
  const protectedRoutes = ["/dashboard", "/profile", "/admin"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // Redirect authenticated users away from auth pages
  const authRoutes = ["/auth/signin", "/auth/signup"];
  const isAuthRoute = authRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};`;

    await writeFile(path.join(authPackagePath, 'middleware.ts'), middlewareContent);

    // Create React components
    await ensureDir(path.join(authPackagePath, 'components'));
    
    const authProviderContent = `"use client";

import { ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <>{children}</>;
}`;

    await writeFile(path.join(authPackagePath, 'components', 'auth-provider.tsx'), authProviderContent);

    const signInButtonContent = `"use client";

import { signIn, signOut, useSession } from "../client";

export function SignInButton() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <p>Welcome, {session.user.name}!</p>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => signIn.social({ provider: "github" })}
        className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
      >
        Sign in with GitHub
      </button>
      <button
        onClick={() => signIn.social({ provider: "google" })}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Sign in with Google
      </button>
    </div>
  );
}`;

    await writeFile(path.join(authPackagePath, 'components', 'sign-in-button.tsx'), signInButtonContent);
  }

  async updateEnvConfig(projectPath) {
    const authEnvContent = `
# Authentication Configuration
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# OAuth Providers (optional)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Production
AUTH_DOMAIN=""  # Your production domain for cross-subdomain cookies`;

    // Append to existing .env.example
    const envExamplePath = path.join(projectPath, '.env.example');
    
    try {
      const existingEnv = await fsExtra.readFile(envExamplePath, 'utf8');
      await writeFile(envExamplePath, existingEnv + authEnvContent);
    } catch (error) {
      await writeFile(envExamplePath, authEnvContent);
    }
  }

  async createIndex(authPackagePath) {
    const indexContent = `export { auth } from "./auth";
export { authClient, signIn, signOut, signUp, useSession, getSession } from "./client";
export { getServerSession, requireAuth } from "./server";
export { AuthProvider } from "./components/auth-provider";
export { SignInButton } from "./components/sign-in-button";
export { authMiddleware } from "./middleware";

export type { Session, User } from "./auth";`;

    await writeFile(path.join(authPackagePath, 'index.ts'), indexContent);
  }

  displayAuthSetupInstructions() {
    console.log(chalk.blue.bold('\n🔐 AUTHENTICATION SETUP INSTRUCTIONS'));
    console.log(chalk.gray('─'.repeat(50)));
    
    console.log(chalk.yellow('🔧 Required Environment Variables:'));
    console.log(chalk.gray('1. Generate a secret: openssl rand -base64 32'));
    console.log(chalk.gray('2. Add BETTER_AUTH_SECRET to .env.local'));
    console.log(chalk.gray('3. Set BETTER_AUTH_URL (http://localhost:3000 for dev)'));
    
    console.log(chalk.yellow('\n🌐 OAuth Setup (Optional):'));
    console.log(chalk.gray('GitHub: https://github.com/settings/developers'));
    console.log(chalk.gray('Google: https://console.cloud.google.com/apis/credentials'));
    
    console.log(chalk.yellow('\n📋 Integration Steps:'));
    console.log(chalk.gray('1. Add auth schema to your database package'));
    console.log(chalk.gray('2. Run database migrations'));
    console.log(chalk.gray('3. Wrap your app with AuthProvider'));
    console.log(chalk.gray('4. Use SignInButton component or auth hooks'));
    
    console.log(chalk.blue.bold('\n💡 Authentication Features:'));
    console.log(chalk.green('✅ Email/password authentication'));
    console.log(chalk.green('✅ Social login (GitHub, Google)'));
    console.log(chalk.green('✅ Email verification'));
    console.log(chalk.green('✅ Session management'));
    console.log(chalk.green('✅ Type-safe auth hooks'));
    console.log(chalk.green('✅ Server-side auth utilities'));
    console.log(chalk.green('✅ Route protection middleware'));
  }
} 