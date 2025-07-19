import { IPlugin, PluginMetadata, PluginArtifact, ValidationResult, PluginCategory, PluginContext, PluginResult, TargetPlatform } from '../../types/plugin.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { TemplateService, templateService } from '../../utils/template-service.js';

interface AuthConfig {
  providers: ('email' | 'github' | 'google')[];
  requireEmailVerification: boolean;
  sessionDuration: number;
}

export class BetterAuthPlugin implements IPlugin {
  private templateService: TemplateService;

  constructor() {
    this.templateService = templateService;
  }

  // ============================================================================
  // PLUGIN METADATA
  // ============================================================================

  getMetadata(): PluginMetadata {
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
  // PLUGIN LIFECYCLE
  // ============================================================================

  async install(context: PluginContext): Promise<PluginResult> {
    return this.setupAuthentication(context);
  }

  async uninstall(context: PluginContext): Promise<PluginResult> {
    const authPackagePath = path.join(context.projectPath, 'packages', 'auth');
    
    try {
      if (fsExtra.existsSync(authPackagePath)) {
        await context.runner.execCommand(['rm', '-rf', authPackagePath], { silent: true });
      }

      return {
        success: true,
        artifacts: [],
        dependencies: [],
        scripts: [],
        configs: [],
        errors: [],
        warnings: [],
        duration: 0
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        success: false,
        artifacts: [],
        dependencies: [],
        scripts: [],
        configs: [],
        errors: [{
          code: 'UNINSTALL_FAILED',
          message: `Failed to remove authentication package: ${errorMessage}`,
          severity: 'error'
        }],
        warnings: [],
        duration: 0
      };
    }
  }

  async update(context: PluginContext): Promise<PluginResult> {
    return this.install(context);
  }

  // ============================================================================
  // VALIDATION & COMPATIBILITY
  // ============================================================================

  async validate(context: PluginContext): Promise<ValidationResult> {
    const errors: any[] = [];
    const warnings: string[] = [];

    const authPackagePath = path.join(context.projectPath, 'packages', 'auth');
    if (!fsExtra.existsSync(authPackagePath)) {
      errors.push({
        field: 'authPackagePath',
        message: `Authentication package directory does not exist: ${authPackagePath}`,
        code: 'DIRECTORY_NOT_FOUND',
        severity: 'error'
      });
    }

    const packagesPath = path.join(context.projectPath, 'packages');
    if (!fsExtra.existsSync(packagesPath)) {
      warnings.push('Packages directory not found - this plugin is designed for monorepo structures');
    }

    const dbPackagePath = path.join(context.projectPath, 'packages', 'db');
    if (!fsExtra.existsSync(dbPackagePath)) {
      warnings.push('Database package not found - Better Auth requires a database for session storage');
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
      packageManagers: ['npm', 'yarn', 'pnpm'],
      databases: ['postgresql', 'mysql', 'sqlite'],
      conflicts: ['next-auth', '@auth/core', 'passport']
    };
  }

  getDependencies(): string[] {
    return ['drizzle'];
  }

  getConflicts(): string[] {
    return ['next-auth', '@auth/core', 'passport'];
  }

  getRequirements() {
    return [
      {
        type: 'package' as const,
        name: 'better-auth',
        version: '^0.0.1',
        description: 'Better Auth core package'
      },
      {
        type: 'package' as const,
        name: '@better-auth/utils',
        version: '^0.0.1',
        description: 'Better Auth utilities'
      },
      {
        type: 'package' as const,
        name: 'bcryptjs',
        version: '^2.4.3',
        description: 'Password hashing'
      },
      {
        type: 'package' as const,
        name: 'jsonwebtoken',
        version: '^9.0.2',
        description: 'JWT token handling'
      }
    ];
  }

  getDefaultConfig(): Record<string, any> {
    return {
      providers: ['email'],
      requireEmailVerification: true,
      sessionDuration: 604800
    };
  }

  getConfigSchema() {
    return {
      type: 'object' as const,
      properties: {
        providers: {
          type: 'array' as const,
          items: { 
            type: 'string' as const, 
            enum: ['email', 'github', 'google'],
            description: 'Authentication provider name'
          },
          description: 'Authentication providers to enable'
        },
        requireEmailVerification: {
          type: 'boolean' as const,
          description: 'Whether to require email verification for new accounts'
        },
        sessionDuration: {
          type: 'number' as const,
          description: 'Session duration in seconds'
        }
      },
      required: ['providers']
    };
  }

  // ============================================================================
  // TECHNOLOGY IMPLEMENTATION
  // ============================================================================

  private async setupAuthentication(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    const authPackagePath = path.join(context.projectPath, 'packages', 'auth');
    
    try {
      // Create auth package directory
      await fsExtra.ensureDir(authPackagePath);
      
      // Get configuration from context
      const authConfig = this.getAuthConfig(context);
      
      // Setup package structure
      await this.updatePackageJson(authPackagePath, context);
      await this.createESLintConfig(authPackagePath);
      await this.createAuthConfig(authPackagePath, context, authConfig);
      await this.createAuthUtils(authPackagePath, context);
      await this.createAuthMiddleware(authPackagePath, context);
      await this.createIndex(authPackagePath);
      await this.updateEnvConfig(context.projectPath, authConfig, context);

      const duration = Date.now() - startTime;

      return {
        success: true,
        artifacts: [
          {
            type: 'directory',
            path: authPackagePath,
            content: 'Authentication package with Better Auth'
          }
        ],
        dependencies: [
          {
            name: 'better-auth',
            version: '^0.0.1',
            type: 'production',
            category: PluginCategory.AUTHENTICATION
          },
          {
            name: '@better-auth/utils',
            version: '^0.0.1',
            type: 'production',
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
            description: 'Generate authentication types and utilities',
            category: 'dev'
          },
          {
            name: 'auth:validate',
            command: 'better-auth validate',
            description: 'Validate authentication configuration',
            category: 'dev'
          }
        ],
        configs: [
          {
            file: '.env.local',
            content: 'Authentication environment variables',
            mergeStrategy: 'append'
          }
        ],
        errors: [],
        warnings: [],
        duration
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const duration = Date.now() - startTime;
      
      return {
        success: false,
        artifacts: [],
        dependencies: [],
        scripts: [],
        configs: [],
        errors: [{
          code: 'SETUP_FAILED',
          message: `Failed to setup authentication: ${errorMessage}`,
          severity: 'error'
        }],
        warnings: [],
        duration
      };
    }
  }

  private getAuthConfig(context: PluginContext): AuthConfig {
    const providers = context.pluginConfig.providers || ['email'];
    const requireEmailVerification = context.pluginConfig.requireEmailVerification ?? true;
    const sessionDuration = context.pluginConfig.sessionDuration || 604800;

    return { providers, requireEmailVerification, sessionDuration };
  }

  private async updatePackageJson(authPackagePath: string, context: PluginContext): Promise<void> {
    const packageJson = {
      name: `@${context.projectName}/auth`,
      version: "0.1.0",
      private: true,
      description: "Authentication layer with Better Auth",
      main: "index.ts",
      types: "index.ts",
      scripts: {
        "build": "tsc",
        "dev": "tsc --watch",
        "lint": "eslint . --ext .ts",
        "type-check": "tsc --noEmit",
        "auth:generate": "better-auth generate",
        "auth:validate": "better-auth validate"
      },
      dependencies: {
        "better-auth": "^0.0.1",
        "@better-auth/utils": "^0.0.1",
        "bcryptjs": "^2.4.3",
        "jsonwebtoken": "^9.0.2"
      },
      devDependencies: {
        "typescript": "^5.2.2",
        "@types/bcryptjs": "^2.4.6",
        "@types/jsonwebtoken": "^9.0.5"
      }
    };

    await fsExtra.writeJSON(path.join(authPackagePath, 'package.json'), packageJson, { spaces: 2 });
  }

  private async createESLintConfig(authPackagePath: string): Promise<void> {
    const eslintConfig = {
      extends: ["../../.eslintrc.json"]
    };

    await fsExtra.writeJSON(path.join(authPackagePath, '.eslintrc.json'), eslintConfig, { spaces: 2 });
  }

  private async createAuthConfig(authPackagePath: string, context: PluginContext, authConfig: AuthConfig): Promise<void> {
    const templateData = { 
      projectName: context.projectName,
      providers: authConfig.providers,
      requireEmailVerification: authConfig.requireEmailVerification,
      sessionDuration: authConfig.sessionDuration
    };
    const content = await this.templateService.renderTemplate('auth', 'auth.config.ts.ejs', templateData);
    await fsExtra.writeFile(path.join(authPackagePath, 'auth.config.ts'), content);
  }

  private async createAuthUtils(authPackagePath: string, context: PluginContext): Promise<void> {
    const content = await this.templateService.renderTemplate('auth', 'utils.ts.ejs', {});
    await fsExtra.writeFile(path.join(authPackagePath, 'utils.ts'), content);
  }

  private async createAuthMiddleware(authPackagePath: string, context: PluginContext): Promise<void> {
    const content = await this.templateService.renderTemplate('auth', 'middleware.ts.ejs', {});
    await fsExtra.writeFile(path.join(authPackagePath, 'middleware.ts'), content);
  }

  private async createIndex(authPackagePath: string): Promise<void> {
    const content = await this.templateService.renderTemplate('auth', 'index.ts.ejs', {});
    await fsExtra.writeFile(path.join(authPackagePath, 'index.ts'), content);
  }

  private async updateEnvConfig(projectPath: string, authConfig: AuthConfig, context: PluginContext): Promise<void> {
    const envPath = path.join(projectPath, '.env.local');
    
    const envVars: Record<string, any> = {
      AUTH_SECRET: 'your-auth-secret-here',
      AUTH_URL: 'http://localhost:3000',
      sessionDuration: authConfig.sessionDuration
    };

    if (authConfig.providers.includes('github')) {
      envVars['GITHUB_CLIENT_ID'] = 'your-github-client-id';
      envVars['GITHUB_CLIENT_SECRET'] = 'your-github-client-secret';
    }

    if (authConfig.providers.includes('google')) {
      envVars['GOOGLE_CLIENT_ID'] = 'your-google-client-id';
      envVars['GOOGLE_CLIENT_SECRET'] = 'your-google-client-secret';
    }

    await this.templateService.renderAndWrite(
      'auth',
      '.env.local.ejs',
      envPath,
      envVars,
      { logger: context.logger }
    );
  }
} 