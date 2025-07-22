/**
 * Mongoose ORM Plugin - Updated with Latest Best Practices
 * 
 * Provides Mongoose ODM integration with MongoDB database providers.
 * Follows latest Mongoose documentation and TypeScript best practices.
 * 
 * References:
 * - https://mongoosejs.com/docs/typescript.html
 * - https://mongoosejs.com/docs/plugins.html
 * - https://mongoosejs.com/docs/schematypes.html
 * - https://mongoosejs.com/docs/middleware.html
 */

import { BaseDatabasePlugin } from '../../../base/index.js';
import { PluginContext, PluginResult, PluginMetadata, PluginCategory } from '../../../../types/plugin.js';
import { DatabasePluginConfig, DatabaseProvider, ORMOption, DatabaseFeature, ParameterSchema, UnifiedInterfaceTemplate, ConnectionOption } from '../../../../types/plugin-interfaces.js';
import { MongooseSchema } from './MongooseSchema.js';
import { MongooseGenerator } from './MongooseGenerator.js';

export class MongoosePlugin extends BaseDatabasePlugin {
  private generator: MongooseGenerator;

  constructor() {
    super();
    this.generator = new MongooseGenerator();
  }

  // ============================================================================
  // METADATA
  // ============================================================================

  getMetadata(): PluginMetadata {
    return {
      id: 'mongoose',
      name: 'Mongoose ODM',
      version: '1.0.0',
      description: 'Elegant MongoDB object modeling for Node.js',
      author: 'The Architech Team',
      category: PluginCategory.ORM,
      tags: ['orm', 'odm', 'mongodb', 'database'],
      license: 'MIT',
    };
  }

  // ============================================================================
  // ABSTRACT METHOD IMPLEMENTATIONS
  // ============================================================================

  getParameterSchema(): ParameterSchema {
    return MongooseSchema.getParameterSchema();
  }

  getDatabaseProviders(): DatabaseProvider[] {
    return [DatabaseProvider.MONGODB];
  }

  getORMOptions(): ORMOption[] {
    return [ORMOption.MONGOOSE];
  }

  getDatabaseFeatures(): DatabaseFeature[] {
    return []; // Mongoose has features like plugins, but they don't map to our current enum
  }
  
  getConnectionOptions(provider: DatabaseProvider): ConnectionOption[] {
    return []; // Mongoose uses a single connection string
  }

  getProviderLabel(provider: DatabaseProvider): string {
    return 'MongoDB';
  }

  getProviderDescription(provider: DatabaseProvider): string {
    return 'Use MongoDB with the Mongoose ODM.';
  }

  getFeatureLabel(feature: DatabaseFeature): string {
    return feature; // No specific features to label for Mongoose yet
  }

  getFeatureDescription(feature: DatabaseFeature): string {
    return `Enable the ${feature} feature.`;
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
        if (file.path.includes('plugins')) {
            filePath = this.pathResolver.getLibPath('db/plugins', file.path.replace('db/plugins/', ''));
        } else if (file.path.includes('models')) {
            filePath = this.pathResolver.getLibPath('db/models', file.path.replace('db/models/', ''));
        } else {
            filePath = this.pathResolver.getLibPath('db', file.path.replace('db/', ''));
        }
        await this.generateFile(filePath, file.content);
      }

      await this.installDependencies(
        ['mongoose'],
        ['@types/mongoose']
      );

      const envVars = this.generator.generateEnvConfig(config);
      // await this.addEnvVariables(envVars);

      return this.createSuccessResult([], [], [], [], [], startTime);

    } catch (error: any) {
      return this.createErrorResult('Mongoose installation failed', [error], startTime);
    }
  }
} 