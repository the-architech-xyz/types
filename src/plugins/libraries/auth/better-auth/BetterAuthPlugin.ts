/**
 * Better Auth Plugin - Updated with Latest Best Practices
 * 
 * Provides Better Auth authentication integration using the official @better-auth/cli.
 * Follows latest Better Auth documentation and TypeScript best practices.
 * 
 * References:
 * - https://better-auth.com/docs
 * - https://better-auth.com/docs/providers
 * - https://better-auth.com/docs/adapters
 */

import { BaseAuthPlugin } from '../../../base/index.js';
import { PluginContext, PluginResult, PluginMetadata, PluginCategory } from '../../../../types/plugin.js';
import { AuthPluginConfig, AuthProvider, AuthFeature, SessionOption, SecurityOption, ParameterSchema, UnifiedInterfaceTemplate } from '../../../../types/plugin-interfaces.js';
import { BetterAuthSchema } from './BetterAuthSchema.js';
import { BetterAuthGenerator } from './BetterAuthGenerator.js';

export class BetterAuthPlugin extends BaseAuthPlugin {
  private generator: BetterAuthGenerator;

  constructor() {
    super();
    this.generator = new BetterAuthGenerator();
  }

  // ============================================================================
  // METADATA
  // ============================================================================

  getMetadata(): PluginMetadata {
    return {
      id: 'better-auth',
      name: 'Better Auth',
      version: '1.0.0',
      description: 'Modern, secure authentication library',
      author: 'The Architech Team',
      category: PluginCategory.AUTHENTICATION,
      tags: ['auth', 'security', 'oauth'],
      license: 'MIT',
    };
  }
  
  // ============================================================================
  // ABSTRACT METHOD IMPLEMENTATIONS
  // ============================================================================

  getParameterSchema(): ParameterSchema {
    return BetterAuthSchema.getParameterSchema();
  }

  getAuthProviders(): AuthProvider[] {
    return BetterAuthSchema.getAuthProviders();
  }
  
  getAuthFeatures(): AuthFeature[] {
    return BetterAuthSchema.getAuthFeatures();
  }

  getSessionOptions(): SessionOption[] { return []; }
  getSecurityOptions(): SecurityOption[] { return []; }

  protected getProviderLabel(provider: AuthProvider): string {
    return BetterAuthSchema.getProviderLabel(provider);
  }

  protected getFeatureLabel(feature: AuthFeature): string {
    // Assuming a static helper exists or adding one
    return feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }
  
  generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate {
    const generated = this.generator.generateUnifiedIndex(); // CORRECTED: Was generateUnifiedInterface
    return {
        category: PluginCategory.AUTHENTICATION,
        exports: [],
        types: [],
        utilities: [],
        constants: [],
        documentation: generated.content,
    };
  }
  
  // ============================================================================
  // MAIN INSTALL METHOD
  // ============================================================================

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    const config = context.pluginConfig as AuthPluginConfig;

    try {
      // Initialize path resolver first
      this.initializePathResolver(context);

      // 1. Generate all file contents from the "dumb" generator
      const allFiles = this.generator.generateAllFiles(config);
      
      // 2. Use BasePlugin methods to write files to appropriate locations
      for (const file of allFiles) {
        const filePath = this.pathResolver.getLibPath('auth', file.path.replace('auth/', ''));
        await this.generateFile(filePath, file.content);
      }

      // Handle the API route specifically for Next.js
      const routeContent = this.generator.generateAuthConfig(config); // CORRECTED: Was generateAuthRoutes
      await this.setupAuthRoutes(context, routeContent.content);

      // 3. Add dependencies
      await this.installDependencies(
        ['better-auth', '@better-auth/drizzle-adapter', '@better-auth/utils'],
        ['@types/node']
      );

      // 4. Add scripts (if any)
      // await this.addScripts({...});

      // 5. Add environment variables
      const envVars = this.generator.generateEnvConfig(config);
      // await this.addEnvVariables(envVars);

      return this.createSuccessResult([], [], [], [], [], startTime);

    } catch (error: any) {
      return this.createErrorResult('Better Auth installation failed', [error], startTime);
    }
  }
} 