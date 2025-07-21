/**
 * Better Auth Plugin - Pure Technology Implementation
 *
 * Provides Better Auth authentication integration using the official @better-auth/cli.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { PluginCategory, TargetPlatform } from '../../types/plugin.js';
import { templateService } from '../../core/templates/template-service.js';
import { CommandRunner } from '../../core/cli/command-runner.js';
import { AUTH_PROVIDERS } from '../../types/shared-config.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { structureService } from '../../core/project/structure-service.js';
export class BetterAuthPlugin {
    templateService;
    runner;
    constructor() {
        this.templateService = templateService;
        this.runner = new CommandRunner();
    }
    // ============================================================================
    // PLUGIN METADATA
    // ============================================================================
    getMetadata() {
        return {
            id: 'better-auth',
            name: 'Better Auth',
            version: '1.0.0',
            description: 'Modern authentication library with excellent TypeScript support',
            author: 'The Architech Team',
            category: PluginCategory.AUTHENTICATION,
            tags: ['authentication', 'oauth', 'session', 'security', 'typescript'],
            license: 'MIT',
            repository: 'https://github.com/next-auth/better-auth',
            homepage: 'https://better-auth.com'
        };
    }
    // ============================================================================
    // PLUGIN LIFECYCLE - Pure Technology Implementation
    // ============================================================================
    async install(context) {
        const startTime = Date.now();
        try {
            const { projectPath, pluginConfig } = context;
            context.logger.info('Installing Better Auth using official CLI...');
            // Step 1: Install dependencies
            await this.installDependencies(context);
            // Step 2: Initialize Better Auth using official CLI
            await this.initializeBetterAuth(context);
            // Step 3: Generate database schema
            await this.generateDatabaseSchema(context);
            // Step 4: Create authentication configuration
            await this.createAuthConfiguration(context);
            // Step 5: Add environment configuration
            await this.addEnvironmentConfig(context);
            // Step 6: Generate unified interface files
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
                        path: path.join(projectPath, 'src', 'lib', 'auth', 'components.tsx')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'auth', 'config.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'auth.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'auth.config.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'components', 'LoginButton.tsx')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'components', 'AuthForm.tsx')
                    }
                ],
                dependencies: [
                    {
                        name: 'better-auth',
                        version: '^1.3.0',
                        type: 'production',
                        category: PluginCategory.AUTHENTICATION
                    },
                    {
                        name: '@better-auth/cli',
                        version: '^1.3.0',
                        type: 'development',
                        category: PluginCategory.AUTHENTICATION
                    }
                ],
                scripts: [
                    {
                        name: 'auth:generate',
                        command: 'better-auth generate',
                        description: 'Generate Better Auth files',
                        category: 'dev'
                    }
                ],
                configs: [],
                errors: [],
                warnings: [],
                duration
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to install Better Auth', startTime, [], error);
        }
    }
    async uninstall(context) {
        const startTime = Date.now();
        try {
            const { projectPath } = context;
            // Remove Better Auth specific files
            const filesToRemove = [
                'auth.ts',
                'auth.config.ts',
                'lib/auth.ts',
                'auth.config.js',
                'lib/auth.js'
            ];
            for (const file of filesToRemove) {
                const filePath = path.join(projectPath, file);
                if (await fsExtra.pathExists(filePath)) {
                    await fsExtra.remove(filePath);
                }
            }
            return {
                success: true,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [],
                warnings: [],
                duration: Date.now() - startTime
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return this.createErrorResult(`Failed to uninstall Better Auth: ${errorMessage}`, startTime, [], error);
        }
    }
    async update(context) {
        return this.install(context);
    }
    // ============================================================================
    // VALIDATION & COMPATIBILITY
    // ============================================================================
    async validate(context) {
        const errors = [];
        const warnings = [];
        // Check if project directory exists
        if (!await fsExtra.pathExists(context.projectPath)) {
            errors.push({
                field: 'projectPath',
                message: `Project directory does not exist: ${context.projectPath}`,
                code: 'DIRECTORY_NOT_FOUND',
                severity: 'error'
            });
        }
        // Check for database configuration
        const authConfig = context.pluginConfig;
        if (!authConfig.databaseUrl && !authConfig.connectionString) {
            warnings.push('Database URL not configured - Better Auth requires a database for user storage');
        }
        // Check for required environment variables
        if (!authConfig.secret) {
            warnings.push('AUTH_SECRET not configured - you will need to set this environment variable');
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    getCompatibility() {
        return {
            frameworks: ['next', 'react', 'vue', 'svelte', 'angular'],
            platforms: [TargetPlatform.WEB, TargetPlatform.SERVER],
            nodeVersions: ['18.0.0', '20.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
            databases: ['postgresql', 'mysql', 'sqlite'],
            conflicts: ['next-auth', '@auth/core', 'passport']
        };
    }
    getDependencies() {
        return [
            'better-auth@^1.3.0',
            '@better-auth/cli@^1.3.0'
        ];
    }
    getConflicts() {
        return ['next-auth', '@auth/core', 'passport'];
    }
    getRequirements() {
        return [
            {
                type: 'package',
                name: 'better-auth',
                version: '^1.3.0',
                description: 'Better Auth core package'
            },
            {
                type: 'package',
                name: '@better-auth/utils',
                version: '^0.2.6',
                description: 'Better Auth utilities'
            },
            {
                type: 'package',
                name: '@better-auth/cli',
                version: '^1.3.0',
                description: 'Better Auth CLI'
            },
            {
                type: 'package',
                name: 'bcryptjs',
                version: '^2.4.3',
                description: 'Password hashing'
            },
            {
                type: 'package',
                name: 'jsonwebtoken',
                version: '^9.0.2',
                description: 'JWT token handling'
            }
        ];
    }
    getDefaultConfig() {
        return {
            providers: ['email'],
            requireEmailVerification: true,
            sessionDuration: 604800,
            databaseUrl: process.env.DATABASE_URL || '',
            secret: process.env.AUTH_SECRET || '',
            skipDb: false,
            skipPlugins: false
        };
    }
    getConfigSchema() {
        return {
            type: 'object',
            properties: {
                providers: {
                    type: 'array',
                    items: {
                        type: 'string',
                        enum: Object.values(AUTH_PROVIDERS),
                        description: 'Authentication provider name'
                    },
                    description: 'Authentication providers to enable',
                    default: [AUTH_PROVIDERS.EMAIL]
                },
                requireEmailVerification: {
                    type: 'boolean',
                    description: 'Whether to require email verification for new accounts',
                    default: true
                },
                sessionDuration: {
                    type: 'number',
                    description: 'Session duration in seconds',
                    default: 604800
                },
                databaseUrl: {
                    type: 'string',
                    description: 'Database connection URL',
                    default: ''
                },
                secret: {
                    type: 'string',
                    description: 'Authentication secret for JWT signing',
                    default: ''
                },
                skipDb: {
                    type: 'boolean',
                    description: 'Skip database setup',
                    default: false
                },
                skipPlugins: {
                    type: 'boolean',
                    description: 'Skip plugins setup',
                    default: false
                }
            }
        };
    }
    // ============================================================================
    // PRIVATE METHODS
    // ============================================================================
    async installDependencies(context) {
        const { projectPath } = context;
        // Better Auth provides everything we need - no additional dependencies required
        const dependencies = [
            'better-auth@^1.3.0'
        ];
        const devDependencies = [
            '@better-auth/cli@^1.3.0'
        ];
        context.logger.info('Installing Better Auth...');
        await this.runner.install(dependencies, false, projectPath);
        await this.runner.install(devDependencies, true, projectPath);
    }
    async initializeBetterAuth(context) {
        const { projectPath, pluginConfig } = context;
        // Create auth configuration file first
        await this.createAuthConfiguration(context);
        // Create .env.local if it doesn't exist
        await this.addEnvironmentConfig(context);
        const args = this.buildInitArgs(pluginConfig);
        context.logger.info('Initializing Better Auth...');
        // For non-interactive mode, we need to handle the CLI differently
        // The Better Auth CLI asks for user input, so we'll use a different approach
        try {
            // Use non-interactive execution with predefined answers
            const packageManager = context.packageManager || 'bun';
            const input = [
                'Yes', // Update dependency version
                packageManager // Choose package manager
            ];
            await this.runner.execNonInteractive('@better-auth/cli', ['init', ...args], input, projectPath);
            context.logger.success('Better Auth initialized successfully');
        }
        catch (error) {
            // If that fails due to interactive prompts, we'll create the files manually
            context.logger.warn('Better Auth CLI interactive prompts detected, creating files manually...');
            await this.createBetterAuthFilesManually(context);
        }
    }
    async createBetterAuthFilesManually(context) {
        const { projectPath, pluginConfig, projectName } = context;
        const structure = context.projectStructure;
        context.logger.info('Creating Better Auth files manually...');
        if (structure.isMonorepo) {
            // For monorepo, create files in packages/auth/
            const authPackagePath = structureService.getModulePath(projectPath, structure, 'auth');
            await fsExtra.ensureDir(authPackagePath);
            // Create package.json for auth package
            const packageJson = {
                name: `@${projectName}/auth`,
                version: "0.1.0",
                private: true,
                main: "./index.ts",
                types: "./index.ts",
                scripts: {
                    "build": "tsc",
                    "dev": "tsc --watch",
                    "lint": "eslint . --ext .ts,.tsx"
                },
                dependencies: {
                    "better-auth": "^1.3.0",
                    "@better-auth/utils": "^0.2.6",
                    "bcryptjs": "^2.4.3",
                    "jsonwebtoken": "^9.0.2"
                },
                devDependencies: {
                    "@better-auth/cli": "^1.3.0",
                    "typescript": "^5.0.0"
                }
            };
            await fsExtra.writeJSON(path.join(authPackagePath, 'package.json'), packageJson, { spaces: 2 });
            // Create the main auth configuration file
            const authConfig = this.generateAuthConfig(pluginConfig);
            const authPath = path.join(authPackagePath, 'index.ts');
            await fsExtra.writeFile(authPath, authConfig);
            // Create components directory and basic auth components
            const componentsPath = path.join(authPackagePath, 'src', 'components');
            await fsExtra.ensureDir(componentsPath);
            // Create basic auth components
            const loginButtonContent = `import { signIn, signOut, useSession } from 'better-auth/react';

export function LoginButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <button onClick={() => signOut()}>
        Sign Out
      </button>
    );
  }

  return (
    <button onClick={() => signIn()}>
      Sign In
    </button>
  );
}`;
            await fsExtra.writeFile(path.join(componentsPath, 'LoginButton.tsx'), loginButtonContent);
        }
        // For single app, skip this step as files will be created in src/lib/auth/ by generateUnifiedInterfaceFiles
        context.logger.success('Better Auth files created manually');
    }
    async generateDatabaseSchema(context) {
        const { projectPath } = context;
        context.logger.info('Generating Better Auth database schema...');
        try {
            // Try to run the generate command non-interactively
            await this.runner.execNonInteractive('@better-auth/cli', ['generate', '--y'], [], projectPath);
            context.logger.success('Better Auth schema generated successfully');
        }
        catch (error) {
            // If that fails due to interactive prompts, we'll create the schema manually
            context.logger.warn('Better Auth schema generation failed, creating schema manually...');
            await this.createBetterAuthSchemaManually(context);
        }
    }
    async createBetterAuthSchemaManually(context) {
        const { projectPath } = context;
        const structure = context.projectStructure;
        context.logger.info('Creating Better Auth schema manually...');
        if (structure.isMonorepo) {
            // For monorepo, create the auth schema file in packages/auth/
            const authPackagePath = structureService.getModulePath(projectPath, structure, 'auth');
            await fsExtra.ensureDir(authPackagePath);
            const authSchemaContent = `import { BetterAuth } from "better-auth";
import { DrizzleAdapter } from "better-auth/adapters/drizzle-adapter";
import { db } from "../db";
import { users, sessions, accounts, verificationTokens } from "../db/schema";

export const auth = new BetterAuth({
  adapter: DrizzleAdapter(db, {
    users,
    sessions,
    accounts,
    verificationTokens,
  }),
  providers: [
    // Configure your providers here
  ],
  session: {
    strategy: "jwt",
    maxAge: 604800, // 7 days
  },
  callbacks: {
    async session({ session, token }) {
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
});

export const { handlers, signIn, signOut, auth: getAuth } = auth;
`;
            const authPath = path.join(authPackagePath, 'index.ts');
            await fsExtra.writeFile(authPath, authSchemaContent);
        }
        // For single app, skip this step as files will be created in src/lib/auth/ by generateUnifiedInterfaceFiles
        context.logger.success('Better Auth schema created manually');
    }
    async createAuthConfiguration(context) {
        const { projectPath, pluginConfig } = context;
        const structure = context.projectStructure;
        // For single app projects, don't create redundant files in root lib/
        // The unified interface files will be created in src/lib/auth/ by generateUnifiedInterfaceFiles
        if (structure.isMonorepo) {
            // For monorepo, create files in packages/auth/
            const authPackagePath = structureService.getModulePath(projectPath, structure, 'auth');
            await fsExtra.ensureDir(authPackagePath);
            // Create auth configuration file
            const authConfig = this.generateAuthConfig(pluginConfig);
            await fsExtra.writeFile(path.join(authPackagePath, 'index.ts'), authConfig);
        }
        // For single app, skip this step as files will be created in src/lib/auth/
    }
    async addEnvironmentConfig(context) {
        const { projectPath, pluginConfig } = context;
        // Add environment variables to .env.local
        const envContent = this.generateEnvConfig(pluginConfig);
        const envPath = path.join(projectPath, '.env.local');
        // Append to existing .env.local or create new
        let existingContent = '';
        if (await fsExtra.pathExists(envPath)) {
            existingContent = await fsExtra.readFile(envPath, 'utf-8');
        }
        await fsExtra.writeFile(envPath, existingContent + '\n' + envContent);
    }
    async generateUnifiedInterfaceFiles(context) {
        const { projectPath } = context;
        const structure = context.projectStructure;
        // For monorepo projects, generate files directly in the package directory
        // For single app projects, use the structure service
        let unifiedPath;
        if (structure.isMonorepo) {
            // In monorepo, we're already in the package directory (packages/auth)
            unifiedPath = projectPath;
        }
        else {
            // In single app, use the structure service to get the correct path
            unifiedPath = structureService.getUnifiedInterfacePath(projectPath, structure, 'auth');
        }
        await fsExtra.ensureDir(unifiedPath);
        // Create index.ts for the unified interface
        const indexContent = `import { BetterAuth } from "better-auth";
import { DrizzleAdapter } from "better-auth/adapters/drizzle-adapter";
import { db } from "../db";
import { users, sessions, accounts, verificationTokens } from "../db/schema";

export const auth = new BetterAuth({
  adapter: DrizzleAdapter(db, {
    users,
    sessions,
    accounts,
    verificationTokens,
  }),
  providers: [
    // Configure your providers here
    // Example:
    // GithubProvider({
    //   clientId: process.env.GITHUB_CLIENT_ID!,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    // }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 604800, // 7 days
  },
  callbacks: {
    async session({ session, token }) {
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
});

export const { handlers, signIn, signOut, auth: getAuth } = auth;
`;
        await fsExtra.writeFile(path.join(unifiedPath, 'index.ts'), indexContent);
        // Create components.tsx for the unified interface
        const componentsContent = `import { signIn, signOut, useSession } from 'better-auth/react';

export function LoginButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <button onClick={() => signOut()}>
        Sign Out
      </button>
    );
  }

  return (
    <button onClick={() => signIn()}>
      Sign In
    </button>
  );
}`;
        await fsExtra.writeFile(path.join(unifiedPath, 'components.tsx'), componentsContent);
        // Create config.ts for the unified interface
        const configContent = `import { BetterAuth } from "better-auth";
import { DrizzleAdapter } from "better-auth/adapters/drizzle-adapter";
import { db } from "../db";
import { users, sessions, accounts, verificationTokens } from "../db/schema";

export const auth = new BetterAuth({
  adapter: DrizzleAdapter(db, {
    users,
    sessions,
    accounts,
    verificationTokens,
  }),
  providers: [
    // Configure your providers here
    // Example:
    // GithubProvider({
    //   clientId: process.env.GITHUB_CLIENT_ID!,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    // }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 604800, // 7 days
  },
  callbacks: {
    async session({ session, token }) {
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
});

export const { handlers, signIn, signOut, auth: getAuth } = auth;
`;
        await fsExtra.writeFile(path.join(unifiedPath, 'config.ts'), configContent);
    }
    buildInitArgs(config) {
        const args = [];
        if (config.skipDb) {
            args.push('--skip-db');
        }
        if (config.skipPlugins) {
            args.push('--skip-plugins');
        }
        if (config.packageManager) {
            args.push('--package-manager', config.packageManager);
        }
        return args;
    }
    generateAuthConfig(config) {
        return `import { BetterAuth } from "better-auth";
import { DrizzleAdapter } from "better-auth/adapters/drizzle-adapter";
import { db } from "../db";
import { users, sessions, accounts, verificationTokens } from "../db/schema";

// Better Auth handles all security, validation, and configuration automatically
export const auth = new BetterAuth({
  adapter: DrizzleAdapter(db, {
    users,
    sessions,
    accounts,
    verificationTokens,
  }),
  providers: [
    // Better Auth CLI will configure providers automatically
    // or you can add them manually here
  ],
  session: {
    strategy: "jwt",
    maxAge: ${config.sessionDuration || 604800}, // 7 days
  },
  // Better Auth provides sensible defaults for all security features
  // No need to manually configure CSRF, rate limiting, etc.
});

export const { handlers, signIn, signOut, auth: getAuth } = auth;

// Type exports for better TypeScript support
export type Session = Awaited<ReturnType<typeof getAuth>>;
export type User = NonNullable<Session>['user'];
`;
    }
    generateEnvConfig(config) {
        return `# ============================================================================
# Better Auth Configuration
# ============================================================================

# REQUIRED: Authentication secret (generate with: openssl rand -base64 32)
AUTH_SECRET="${config.secret || 'your-secret-key-here'}"

# REQUIRED: Database URL (if not already set)
DATABASE_URL="${config.databaseUrl || config.connectionString || 'postgresql://user:password@localhost:5432/database'}"

# ============================================================================
# OAuth Provider Configuration (optional)
# ============================================================================

# GitHub OAuth (optional)
# 1. Go to https://github.com/settings/developers
# 2. Create a new OAuth App
# 3. Set Authorization callback URL to: http://localhost:3000/api/auth/callback/github
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Google OAuth (optional)
# 1. Go to https://console.cloud.google.com/apis/credentials
# 2. Create a new OAuth 2.0 Client ID
# 3. Set Authorized redirect URIs to: http://localhost:3000/api/auth/callback/google
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# ============================================================================
# Application Configuration
# ============================================================================

# Base URL for your application
NEXTAUTH_URL="http://localhost:3000"

# Environment
NODE_ENV="development"

# Better Auth handles all security features automatically:
# - CSRF protection
# - Rate limiting
# - Session management
# - Email verification
# - Password hashing
# - JWT token handling
`;
    }
    createErrorResult(message, startTime, errors = [], originalError) {
        return {
            success: false,
            artifacts: [],
            dependencies: [],
            scripts: [],
            configs: [],
            errors: [
                {
                    code: 'BETTER_AUTH_SETUP_FAILED',
                    message,
                    details: originalError,
                    severity: 'error'
                },
                ...errors
            ],
            warnings: [],
            duration: Date.now() - startTime
        };
    }
}
//# sourceMappingURL=better-auth-plugin.js.map