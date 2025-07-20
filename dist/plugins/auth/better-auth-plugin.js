/**
 * Better Auth Plugin - Pure Technology Implementation
 *
 * Provides Better Auth authentication integration using the official @better-auth/cli.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { PluginCategory, TargetPlatform } from '../../types/plugin.js';
import { templateService } from '../../utils/template-service.js';
import { CommandRunner } from '../../utils/command-runner.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
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
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: [
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
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'index.ts')
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
                        name: '@better-auth/utils',
                        version: '^0.2.6',
                        type: 'production',
                        category: PluginCategory.AUTHENTICATION
                    },
                    {
                        name: '@better-auth/cli',
                        version: '^1.3.0',
                        type: 'development',
                        category: PluginCategory.AUTHENTICATION
                    },
                    {
                        name: 'bcryptjs',
                        version: '^2.4.3',
                        type: 'production',
                        category: PluginCategory.AUTHENTICATION
                    },
                    {
                        name: 'jsonwebtoken',
                        version: '^9.0.2',
                        type: 'production',
                        category: PluginCategory.AUTHENTICATION
                    }
                ],
                scripts: [
                    {
                        name: 'auth:generate',
                        command: 'better-auth generate',
                        description: 'Generate Better Auth schema',
                        category: 'dev'
                    },
                    {
                        name: 'auth:migrate',
                        command: 'better-auth migrate',
                        description: 'Run Better Auth migrations',
                        category: 'dev'
                    },
                    {
                        name: 'auth:secret',
                        command: 'better-auth secret',
                        description: 'Generate Better Auth secret',
                        category: 'dev'
                    }
                ],
                configs: [
                    {
                        file: '.env.local',
                        content: this.generateEnvConfig(pluginConfig),
                        mergeStrategy: 'append'
                    }
                ],
                errors: [],
                warnings: [],
                duration
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return this.createErrorResult(`Failed to setup Better Auth: ${errorMessage}`, startTime, [], error);
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
        return ['drizzle'];
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
                        enum: ['email', 'github', 'google'],
                        description: 'Authentication provider name'
                    },
                    description: 'Authentication providers to enable',
                    default: ['email']
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
        const dependencies = [
            'better-auth@^1.3.0',
            '@better-auth/utils@^0.2.6',
            'bcryptjs@^2.4.3',
            'jsonwebtoken@^9.0.2'
        ];
        const devDependencies = [
            '@better-auth/cli@^1.3.0'
        ];
        context.logger.info('Installing Better Auth dependencies...');
        await this.runner.install(dependencies, false, projectPath);
        await this.runner.install(devDependencies, true, projectPath);
        // Update package.json with the installed dependencies
        await this.updatePackageJson(context);
    }
    async updatePackageJson(context) {
        const { projectPath } = context;
        const packageJsonPath = path.join(projectPath, 'package.json');
        if (await fsExtra.pathExists(packageJsonPath)) {
            const packageJson = await fsExtra.readJSON(packageJsonPath);
            // Add dependencies if they don't exist
            packageJson.dependencies = {
                ...packageJson.dependencies,
                'better-auth': '^1.3.0',
                '@better-auth/utils': '^0.2.6',
                'bcryptjs': '^2.4.3',
                'jsonwebtoken': '^9.0.2'
            };
            // Add devDependencies if they don't exist
            packageJson.devDependencies = {
                ...packageJson.devDependencies,
                '@better-auth/cli': '^1.3.0'
            };
            await fsExtra.writeJSON(packageJsonPath, packageJson, { spaces: 2 });
            context.logger.info('Updated package.json with Better Auth dependencies');
        }
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
        const { projectPath, pluginConfig } = context;
        context.logger.info('Creating Better Auth files manually...');
        // Create the main auth configuration file
        const authConfig = this.generateAuthConfig(pluginConfig);
        const authPath = path.join(projectPath, 'src', 'auth.ts');
        await fsExtra.ensureDir(path.dirname(authPath));
        await fsExtra.writeFile(authPath, authConfig);
        // Create the auth.config.ts file
        const authConfigContent = `import { BetterAuth } from "better-auth";
import { DrizzleAdapter } from "better-auth/adapters/drizzle-adapter";
import { db } from "../../db";
import { users, sessions, accounts, verificationTokens } from "../../db/schema";

export default BetterAuth({
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
    maxAge: ${pluginConfig.sessionDuration || 604800},
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
`;
        const authConfigPath = path.join(projectPath, 'src', 'auth.config.ts');
        await fsExtra.writeFile(authConfigPath, authConfigContent);
        // Create components directory and basic auth components
        const componentsPath = path.join(projectPath, 'src', 'components');
        await fsExtra.ensureDir(componentsPath);
        // Create LoginButton component
        const loginButtonContent = `import React from 'react';
import { signIn, signOut } from '../auth';

interface LoginButtonProps {
  provider?: string;
  children?: React.ReactNode;
  className?: string;
}

export const LoginButton: React.FC<LoginButtonProps> = ({ 
  provider = 'github', 
  children = 'Sign In',
  className = ''
}) => {
  return (
    <button
      onClick={() => signIn(provider)}
      className={\`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors \${className}\`}
    >
      {children}
    </button>
  );
};

export const LogoutButton: React.FC<{ className?: string }> = ({ 
  className = '' 
}) => {
  return (
    <button
      onClick={() => signOut()}
      className={\`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors \${className}\`}
    >
      Sign Out
    </button>
  );
};
`;
        await fsExtra.writeFile(path.join(componentsPath, 'LoginButton.tsx'), loginButtonContent);
        // Create AuthForm component
        const authFormContent = `import React, { useState } from 'react';
import { signIn } from '../auth';

interface AuthFormProps {
  className?: string;
}

export const AuthForm: React.FC<AuthFormProps> = ({ className = '' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn('credentials', { email, password });
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={\`space-y-4 \${className}\`}>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Sign In
      </button>
    </form>
  );
};
`;
        await fsExtra.writeFile(path.join(componentsPath, 'AuthForm.tsx'), authFormContent);
        // Create components index file
        const componentsIndexContent = `export { LoginButton, LogoutButton } from './LoginButton';
export { AuthForm } from './AuthForm';
`;
        await fsExtra.writeFile(path.join(componentsPath, 'index.ts'), componentsIndexContent);
        // Create main package index file
        const packageIndexContent = `// Export auth configuration
export { auth, handlers, signIn, signOut, auth: getAuth } from './auth';

// Export auth components
export * from './components';

// Export types
export type { Session, User } from 'better-auth';
`;
        await fsExtra.writeFile(path.join(projectPath, 'src', 'index.ts'), packageIndexContent);
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
        context.logger.info('Creating Better Auth schema manually...');
        // Create the auth schema file
        const authSchemaContent = `import { BetterAuth } from "better-auth";
import { DrizzleAdapter } from "better-auth/adapters/drizzle-adapter";
import { db } from "../../packages/db";
import { users, sessions, accounts, verificationTokens } from "../../packages/db/schema";

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
        const authPath = path.join(projectPath, 'auth.ts');
        await fsExtra.writeFile(authPath, authSchemaContent);
        context.logger.success('Better Auth schema created manually');
    }
    async createAuthConfiguration(context) {
        const { projectPath, pluginConfig } = context;
        // Create lib directory if it doesn't exist
        const libPath = path.join(projectPath, 'lib');
        await fsExtra.ensureDir(libPath);
        // Create auth configuration file
        const authConfig = this.generateAuthConfig(pluginConfig);
        await fsExtra.writeFile(path.join(libPath, 'auth.ts'), authConfig);
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
import { db } from "../../db";
import { users, sessions, accounts, verificationTokens } from "../../db/schema";

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
    maxAge: ${config.sessionDuration || 604800}, // ${config.sessionDuration || 604800} seconds
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
    }
    generateEnvConfig(config) {
        return `# Better Auth Configuration
AUTH_SECRET="${config.secret || 'your-secret-key-here'}"

# Database URL (if not already set)
DATABASE_URL="${config.databaseUrl || config.connectionString || 'postgresql://user:password@localhost:5432/database'}"

# OAuth Provider Configuration (uncomment and configure as needed)
# GITHUB_CLIENT_ID="your-github-client-id"
# GITHUB_CLIENT_SECRET="your-github-client-secret"
# GOOGLE_CLIENT_ID="your-google-client-id"
# GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email Configuration (for email verification)
# EMAIL_SERVER_HOST="smtp.gmail.com"
# EMAIL_SERVER_PORT=587
# EMAIL_SERVER_USER="your-email@gmail.com"
# EMAIL_SERVER_PASSWORD="your-app-password"
# EMAIL_FROM="noreply@yourdomain.com"
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