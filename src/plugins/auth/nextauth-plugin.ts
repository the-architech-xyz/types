/**
 * NextAuth.js Plugin - Pure Technology Implementation
 * 
 * Provides NextAuth.js authentication integration with multiple providers.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */

import { IPlugin, PluginMetadata, PluginArtifact, ValidationResult, PluginCategory, PluginContext, PluginResult, TargetPlatform, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../types/plugin.js';
import { TemplateService, templateService } from '../../core/templates/template-service.js';
import { CommandRunner } from '../../core/cli/command-runner.js';
import { ValidationError } from '../../types/agent.js';
import { 
  AUTH_PROVIDERS, 
  SESSION_STRATEGIES, 
  AuthProvider, 
  SessionStrategy 
} from '../../types/shared-config.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { structureService, StructureInfo } from '../../core/project/structure-service.js';

interface AuthConfig {
  providers: AuthProvider[];
  database?: 'postgresql' | 'mysql' | 'sqlite' | 'mongodb';
  sessionStrategy: SessionStrategy;
  secret: string;
}

export class NextAuthPlugin implements IPlugin {
  private templateService: TemplateService;
  private runner: CommandRunner;

  constructor() {
    this.templateService = templateService;
    this.runner = new CommandRunner();
  }

  // ============================================================================
  // PLUGIN METADATA
  // ============================================================================

  getMetadata(): PluginMetadata {
    return {
      id: 'nextauth',
      name: 'NextAuth.js',
      version: '1.0.0',
      description: 'Complete authentication solution for Next.js applications',
      author: 'The Architech Team',
      category: PluginCategory.AUTHENTICATION,
      tags: ['authentication', 'oauth', 'session', 'nextjs', 'typescript'],
      license: 'ISC',
      repository: 'https://github.com/nextauthjs/next-auth',
      homepage: 'https://next-auth.js.org',
      documentation: 'https://next-auth.js.org/getting-started/introduction'
    };
  }

  // ============================================================================
  // PLUGIN LIFECYCLE - Pure Technology Implementation
  // ============================================================================

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      const { projectName, projectPath, pluginConfig } = context;
      
      context.logger.info('Installing NextAuth.js authentication...');

      // Step 1: Install dependencies
      await this.installDependencies(context);

      // Step 2: Create authentication configuration
      await this.createAuthConfiguration(context);

      // Step 3: Create API routes
      await this.createAPIRoutes(context);

      // Step 4: Create authentication components
      await this.createAuthComponents(context);

      // Step 5: Generate unified interface files
      await this.generateUnifiedInterfaceFiles(context);

      const duration = Date.now() - startTime;

      return {
        success: true,
        artifacts: [
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'auth', 'index.ts')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'auth', 'config.ts')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'auth', 'types.ts')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'app', 'api', 'auth', '[...nextauth]', 'route.ts')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'components', 'auth', 'auth-provider.tsx')
          }
        ],
        dependencies: [
          {
            name: 'next-auth',
            version: '^4.24.0',
            type: 'production',
            category: PluginCategory.AUTHENTICATION
          },
          {
            name: '@auth/prisma-adapter',
            version: '^1.0.0',
            type: 'production',
            category: PluginCategory.AUTHENTICATION
          }
        ],
        scripts: [
          {
            name: 'auth:generate',
            command: 'npx next-auth generate',
            description: 'Generate NextAuth.js types',
            category: 'dev'
          }
        ],
        configs: [
          {
            file: '.env',
            content: this.generateEnvConfig(pluginConfig),
            mergeStrategy: 'append'
          }
        ],
        errors: [],
        warnings: [],
        duration
      };

    } catch (error) {
      return this.createErrorResult(
        'Failed to install NextAuth.js',
        startTime,
        [],
        error
      );
    }
  }

  async uninstall(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      const { projectPath } = context;
      
      context.logger.info('Uninstalling NextAuth.js...');

      // Remove NextAuth files
      const filesToRemove = [
        path.join(projectPath, 'src', 'lib', 'auth'),
        path.join(projectPath, 'src', 'app', 'api', 'auth'),
        path.join(projectPath, 'src', 'components', 'auth')
      ];

      for (const file of filesToRemove) {
        if (await fsExtra.pathExists(file)) {
          await fsExtra.remove(file);
        }
      }

      const duration = Date.now() - startTime;

      return {
        success: true,
        artifacts: [],
        dependencies: [],
        scripts: [],
        configs: [],
        errors: [],
        warnings: ['NextAuth.js files removed. You may need to manually remove dependencies from package.json'],
        duration
      };

    } catch (error) {
      return this.createErrorResult(
        'Failed to uninstall NextAuth.js',
        startTime,
        [],
        error
      );
    }
  }

  async update(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      context.logger.info('Updating NextAuth.js...');

      // Update dependencies
      await this.runner.execCommand(['npm', 'update', 'next-auth', '@auth/prisma-adapter']);

      const duration = Date.now() - startTime;

      return {
        success: true,
        artifacts: [],
        dependencies: [],
        scripts: [],
        configs: [],
        errors: [],
        warnings: [],
        duration
      };

    } catch (error) {
      return this.createErrorResult(
        'Failed to update NextAuth.js',
        startTime,
        [],
        error
      );
    }
  }

  async validate(context: PluginContext): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    try {
      // Check if NextAuth is properly installed
      const authConfigPath = path.join(context.projectPath, 'src', 'lib', 'auth', 'config.ts');
      if (!await fsExtra.pathExists(authConfigPath)) {
        errors.push({
          field: 'auth.config',
          message: 'NextAuth configuration file not found',
          code: 'MISSING_CONFIG',
          severity: 'error'
        });
      }

      // Check if API route exists
      const apiRoutePath = path.join(context.projectPath, 'src', 'app', 'api', 'auth', '[...nextauth]', 'route.ts');
      if (!await fsExtra.pathExists(apiRoutePath)) {
        errors.push({
          field: 'auth.api',
          message: 'NextAuth API route not found',
          code: 'MISSING_API_ROUTE',
          severity: 'error'
        });
      }

      // Validate environment variables
      const envPath = path.join(context.projectPath, '.env');
      if (await fsExtra.pathExists(envPath)) {
        const envContent = await fsExtra.readFile(envPath, 'utf-8');
        if (!envContent.includes('NEXTAUTH_SECRET')) {
          warnings.push('NEXTAUTH_SECRET not found in .env file');
        }
        if (!envContent.includes('NEXTAUTH_URL')) {
          warnings.push('NEXTAUTH_URL not found in .env file');
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      return {
        valid: false,
        errors: [{
          field: 'validation',
          message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          code: 'VALIDATION_ERROR',
          severity: 'error'
        }],
        warnings: []
      };
    }
  }

  getCompatibility(): CompatibilityMatrix {
    return {
      frameworks: ['nextjs', 'react'],
      platforms: [TargetPlatform.WEB, TargetPlatform.SERVER],
      nodeVersions: ['>=16.0.0'],
      packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
      databases: ['postgresql', 'mysql', 'sqlite', 'mongodb'],
      conflicts: ['better-auth', 'clerk']
    };
  }

  getDependencies(): string[] {
    return ['next-auth', '@auth/prisma-adapter'];
  }

  getConflicts(): string[] {
    return ['better-auth', 'clerk', 'supabase-auth'];
  }

  getRequirements(): PluginRequirement[] {
    return [
      {
        type: 'package',
        name: 'next-auth',
        description: 'NextAuth.js core library',
        version: '^4.24.0'
      },
      {
        type: 'package',
        name: '@auth/prisma-adapter',
        description: 'Prisma adapter for NextAuth.js',
        version: '^1.0.0'
      },
      {
        type: 'config',
        name: 'NEXTAUTH_SECRET',
        description: 'Secret key for NextAuth.js',
        optional: false
      },
      {
        type: 'config',
        name: 'NEXTAUTH_URL',
        description: 'Base URL for NextAuth.js',
        optional: false
      }
    ];
  }

  getDefaultConfig(): Record<string, any> {
    return {
      providers: ['github', 'google'],
      sessionStrategy: 'jwt',
      secret: 'your-secret-key-here',
      features: {
        emailProvider: false,
        databaseAdapter: true,
        callbacks: true
      }
    };
  }

  getConfigSchema(): ConfigSchema {
    return {
      type: 'object',
      properties: {
        providers: {
          type: 'array',
          description: 'Authentication providers to enable',
          items: {
            type: 'string',
            description: 'OAuth provider name',
            enum: Object.values(AUTH_PROVIDERS)
          },
          default: [AUTH_PROVIDERS.GITHUB, AUTH_PROVIDERS.GOOGLE]
        },
        sessionStrategy: {
          type: 'string',
          description: 'Session strategy to use',
          enum: Object.values(SESSION_STRATEGIES),
          default: SESSION_STRATEGIES.JWT
        },
        secret: {
          type: 'string',
          description: 'Secret key for NextAuth.js',
          minLength: 32
        },
        features: {
          type: 'object',
          description: 'NextAuth.js features to enable',
          properties: {
            emailProvider: {
              type: 'boolean',
              description: 'Enable email provider',
              default: false
            },
            databaseAdapter: {
              type: 'boolean',
              description: 'Enable database adapter',
              default: true
            },
            callbacks: {
              type: 'boolean',
              description: 'Enable custom callbacks',
              default: true
            }
          }
        }
      },
      required: ['providers', 'secret']
    };
  }

  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================

  private async installDependencies(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Installing NextAuth.js dependencies...');

    const dependencies = [
      'next-auth@^4.24.0',
      '@auth/prisma-adapter@^1.0.0'
    ];

    await this.runner.execCommand(['npm', 'install', ...dependencies], { cwd: projectPath });
  }

  private async createAuthConfiguration(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    context.logger.info('Creating NextAuth.js configuration...');

    // Create auth lib directory
    const authLibDir = path.join(projectPath, 'src', 'lib', 'auth');
    await fsExtra.ensureDir(authLibDir);

    // Generate auth configuration
    const configContent = this.generateAuthConfig(pluginConfig);
    await fsExtra.writeFile(
      path.join(authLibDir, 'config.ts'),
      configContent
    );

    // Generate auth types
    const typesContent = this.generateAuthTypes();
    await fsExtra.writeFile(
      path.join(authLibDir, 'types.ts'),
      typesContent
    );
  }

  private async createAPIRoutes(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Creating NextAuth.js API routes...');

    // Create API route directory
    const apiRouteDir = path.join(projectPath, 'src', 'app', 'api', 'auth', '[...nextauth]');
    await fsExtra.ensureDir(apiRouteDir);

    // Generate API route
    const routeContent = this.generateAPIRoute();
    await fsExtra.writeFile(
      path.join(apiRouteDir, 'route.ts'),
      routeContent
    );
  }

  private async createAuthComponents(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Creating authentication components...');

    // Create auth components directory
    const authComponentsDir = path.join(projectPath, 'src', 'components', 'auth');
    await fsExtra.ensureDir(authComponentsDir);

    // Generate auth provider component
    const providerContent = this.generateAuthProvider();
    await fsExtra.writeFile(
      path.join(authComponentsDir, 'auth-provider.tsx'),
      providerContent
    );
  }

  private async generateUnifiedInterfaceFiles(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Generating unified interface files...');

    const authLibDir = path.join(projectPath, 'src', 'lib', 'auth');
    await fsExtra.ensureDir(authLibDir);

    // Generate unified auth interface
    const unifiedContent = this.generateUnifiedIndex();
    await fsExtra.writeFile(
      path.join(authLibDir, 'index.ts'),
      unifiedContent
    );
  }

  private generateAuthConfig(config: Record<string, any>): string {
    const providers = config.providers || ['github', 'google'];
    const sessionStrategy = config.sessionStrategy || 'jwt';
    
    return `import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '../db/client.js';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: '${sessionStrategy}',
  },
  providers: [
    ${providers.includes('github') ? `
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),` : ''}
    ${providers.includes('google') ? `
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),` : ''}
  ],
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
};
`;
  }

  private generateAuthTypes(): string {
    return `import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
  }
}
`;
  }

  private generateAPIRoute(): string {
    return `import NextAuth from 'next-auth';
import { authOptions } from '../../../lib/auth/config.js';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
`;
  }

  private generateAuthProvider(): string {
    return `'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
`;
  }

  private generateUnifiedIndex(): string {
    return `/**
 * Unified Authentication Interface - NextAuth.js Implementation
 * 
 * This file provides a unified interface for authentication operations
 * that works with NextAuth.js. It abstracts away NextAuth-specific
 * details and provides a clean API for authentication operations.
 */

import { getServerSession } from 'next-auth/next';
import { getSession, signIn, signOut, useSession } from 'next-auth/react';
import { authOptions } from './config.js';
import type { Session, User } from 'next-auth';

// ============================================================================
// UNIFIED AUTHENTICATION INTERFACE
// ============================================================================

export interface UnifiedAuth {
  // Session management
  getSession: () => Promise<Session | null>;
  getServerSession: () => Promise<Session | null>;
  useSession: () => { data: Session | null; status: 'loading' | 'authenticated' | 'unauthenticated' };
  
  // Authentication
  signIn: (provider?: string, options?: SignInOptions) => Promise<void>;
  signOut: (options?: SignOutOptions) => Promise<void>;
  
  // User management
  getUser: () => Promise<User | null>;
  isAuthenticated: () => Promise<boolean>;
  
  // Provider management
  getProviders: () => Promise<AuthProvider[]>;
  
  // Utility
  getAuthUrl: (provider: string) => string;
}

export interface SignInOptions {
  callbackUrl?: string;
  redirect?: boolean;
}

export interface SignOutOptions {
  callbackUrl?: string;
  redirect?: boolean;
}

export interface AuthProvider {
  id: string;
  name: string;
  type: string;
  signinUrl: string;
  callbackUrl: string;
}

// ============================================================================
// NEXTAUTH IMPLEMENTATION
// ============================================================================

export const createUnifiedAuth = (): UnifiedAuth => {
  return {
    // Session management
    async getSession() {
      return await getSession();
    },

    async getServerSession() {
      return await getServerSession(authOptions);
    },

    useSession() {
      return useSession();
    },

    // Authentication
    async signIn(provider, options = {}) {
      await signIn(provider, {
        callbackUrl: options.callbackUrl || '/',
        redirect: options.redirect !== false,
      });
    },

    async signOut(options = {}) {
      await signOut({
        callbackUrl: options.callbackUrl || '/',
        redirect: options.redirect !== false,
      });
    },

    // User management
    async getUser() {
      const session = await this.getSession();
      return session?.user || null;
    },

    async isAuthenticated() {
      const session = await this.getSession();
      return !!session;
    },

    // Provider management
    async getProviders() {
      // This would typically fetch from NextAuth.js API
      // For now, return common providers
      return [
        {
          id: 'github',
          name: 'GitHub',
          type: 'oauth',
          signinUrl: '/api/auth/signin/github',
          callbackUrl: '/api/auth/callback/github',
        },
        {
          id: 'google',
          name: 'Google',
          type: 'oauth',
          signinUrl: '/api/auth/signin/google',
          callbackUrl: '/api/auth/callback/google',
        },
      ];
    },

    // Utility
    getAuthUrl(provider: string) {
      return \`/api/auth/signin/\${provider}\`;
    },
  };
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export const auth = createUnifiedAuth();
export default auth;

// ============================================================================
// RE-EXPORTS
// ============================================================================

export { authOptions } from './config.js';
export type { Session, User } from 'next-auth';
`;
  }

  private generateEnvConfig(config: Record<string, any>): string {
    const providers = config.providers || ['github', 'google'];
    
    return `# NextAuth.js Configuration
NEXTAUTH_SECRET="${config.secret || 'your-secret-key-here'}"
NEXTAUTH_URL="http://localhost:3000"

${providers.includes('github') ? `# GitHub OAuth
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"` : ''}

${providers.includes('google') ? `# Google OAuth
GOOGLE_ID="your-google-client-id"
GOOGLE_SECRET="your-google-client-secret"` : ''}
`;
  }

  private createErrorResult(
    message: string,
    startTime: number,
    errors: any[] = [],
    originalError?: any
  ): PluginResult {
    const duration = Date.now() - startTime;
    
    return {
      success: false,
      artifacts: [],
      dependencies: [],
      scripts: [],
      configs: [],
      errors: [
        {
          code: 'NEXTAUTH_INSTALL_ERROR',
          message,
          details: originalError,
          severity: 'error'
        },
        ...errors
      ],
      warnings: [],
      duration
    };
  }
} 