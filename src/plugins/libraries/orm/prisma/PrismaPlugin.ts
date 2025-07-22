/**
 * Prisma ORM Plugin - Updated with Latest Best Practices
 * 
 * Provides Prisma ORM integration with multiple database providers.
 * Follows latest Prisma documentation and TypeScript best practices.
 * 
 * References:
 * - https://www.prisma.io/docs/getting-started
 * - https://www.prisma.io/docs/concepts/components/prisma-schema
 * - https://www.prisma.io/docs/concepts/components/prisma-client
 * - https://www.prisma.io/docs/guides/performance-and-optimization
 */

import { BaseDatabasePlugin } from '../../../base/index.js';
import { PluginContext, PluginResult, PluginMetadata, PluginCategory } from '../../../../types/plugin.js';
import { DatabasePluginConfig, DatabaseProvider, ORMOption, DatabaseFeature, ParameterSchema, UnifiedInterfaceTemplate, ConnectionOption } from '../../../../types/plugin-interfaces.js';
import { PrismaSchema } from './PrismaSchema.js';
import { PrismaGenerator } from './PrismaGenerator.js';

export class PrismaPlugin extends BaseDatabasePlugin {
  private generator: PrismaGenerator;

  constructor() {
    super();
    this.generator = new PrismaGenerator();
  }

  // ============================================================================
  // METADATA
  // ============================================================================

  getMetadata(): PluginMetadata {
    return {
      id: 'prisma',
      name: 'Prisma ORM',
      version: '1.0.0',
      description: 'Next-generation ORM for Node.js and TypeScript',
      author: 'The Architech Team',
      category: PluginCategory.ORM,
      tags: ['orm', 'database', 'typescript'],
      license: 'MIT',
    };
  }

  // ============================================================================
  // ABSTRACT METHOD IMPLEMENTATIONS
  // ============================================================================

  getParameterSchema(): ParameterSchema {
    return PrismaSchema.getParameterSchema();
  }

  getDatabaseProviders(): DatabaseProvider[] {
    return PrismaSchema.getDatabaseProviders() as DatabaseProvider[];
  }

  getORMOptions(): ORMOption[] {
    return [ORMOption.PRISMA];
  }

  getDatabaseFeatures(): DatabaseFeature[] {
    return [DatabaseFeature.MIGRATIONS, DatabaseFeature.SEEDING];
  }
  
  getConnectionOptions(provider: DatabaseProvider): ConnectionOption[] {
    return []; // Prisma uses a single DATABASE_URL
  }

  getProviderLabel(provider: DatabaseProvider): string {
    const labels: Record<string, string> = {
      [DatabaseProvider.NEON]: 'Neon',
      [DatabaseProvider.SUPABASE]: 'Supabase',
      [DatabaseProvider.MONGODB]: 'MongoDB',
      [DatabaseProvider.PLANETSCALE]: 'PlanetScale',
      [DatabaseProvider.LOCAL]: 'Local SQLite'
    };
    return labels[provider] || provider;
  }

  getProviderDescription(provider: DatabaseProvider): string {
    return `Use ${this.getProviderLabel(provider)} with Prisma.`;
  }

  getFeatureLabel(feature: DatabaseFeature): string {
    const labels: Record<string, string> = {
      [DatabaseFeature.MIGRATIONS]: 'Migrations',
      [DatabaseFeature.SEEDING]: 'Database Seeding'
    };
    return labels[feature] || feature;
  }

  getFeatureDescription(feature: DatabaseFeature): string {
    const descriptions: Record<string, string> = {
      [DatabaseFeature.MIGRATIONS]: 'Enable `prisma migrate` to manage your database schema.',
      [DatabaseFeature.SEEDING]: 'Enable a `seed.ts` file to populate your database with initial data.'
    };
    return descriptions[feature] || `Enable the ${feature} feature.`;
  }

  generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate {
    const generated = this.generator.generateUnifiedIndex();
    return {
        category: PluginCategory.ORM,
        exports: [], types: [], utilities: [], constants: [],
        documentation: generated.content,
    };
  }
  
  // ============================================================================
  // MAIN INSTALL METHOD
  // ============================================================================

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    const config = context.pluginConfig as DatabasePluginConfig;

    try {
      const allFiles = this.generator.generateAllFiles(config);
      
      for (const file of allFiles) {
        let filePath: string;
        if (file.path.startsWith('prisma/')) {
          filePath = this.pathResolver.getConfigPath(file.path, true); // Place in module dir
        } else {
          filePath = this.pathResolver.getLibPath('db', file.path.replace('db/', ''));
        }
        await this.generateFile(filePath, file.content);
      }

      await this.installDependencies(
        ['@prisma/client'],
        ['prisma', 'tsx']
      );

      const scripts = this.generator.generateScripts(config);
      await this.addScripts(scripts);

      const envVars = this.generator.generateEnvConfig(config);
      // await this.addEnvVariables(envVars);

      return this.createSuccessResult([], [], Object.entries(scripts).map(([name, command]) => ({ name, command })), [], [], startTime);

    } catch (error: any) {
      return this.createErrorResult('Prisma installation failed', [error], startTime);
    }
  }
} 