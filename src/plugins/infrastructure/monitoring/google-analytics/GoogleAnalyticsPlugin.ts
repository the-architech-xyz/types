import { IPlugin, PluginMetadata, PluginCategory, PluginContext, PluginResult, ValidationResult, ConfigSchema, CompatibilityMatrix, PluginRequirement, TargetPlatform } from '../../../../types/plugins.js';
import { ValidationError } from '../../../../types/agents.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { GoogleAnalyticsConfig, GoogleAnalyticsConfigSchema, GoogleAnalyticsDefaultConfig } from './GoogleAnalyticsSchema.js';
import { GoogleAnalyticsGenerator } from './GoogleAnalyticsGenerator.js';
import { CommandRunner } from '../../../../core/cli/command-runner.js';

export class GoogleAnalyticsPlugin implements IPlugin {
  private runner: CommandRunner;

  constructor() {
    this.runner = new CommandRunner();
  }

  getMetadata(): PluginMetadata {
    return {
      id: 'google-analytics',
      name: 'Google Analytics',
      version: '1.0.0',
      description: 'Web analytics and tracking with Google Analytics 4',
      author: 'The Architech Team',
      category: PluginCategory.MONITORING,
      tags: ['monitoring', 'analytics', 'tracking', 'google', 'ga4'],
      license: 'MIT',
      repository: 'https://github.com/googleanalytics/ga-dev-tools',
      homepage: 'https://analytics.google.com',
      documentation: 'https://developers.google.com/analytics'
    };
  }

  async validate(context: PluginContext): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const config = context.pluginConfig as GoogleAnalyticsConfig;

    if (!config.measurementId) {
      errors.push({ field: 'measurementId', message: 'Google Analytics Measurement ID is required.', code: 'MISSING_MEASUREMENT_ID', severity: 'error' });
    }

    return { valid: errors.length === 0, errors, warnings: [] };
  }

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    try {
      await this.createProjectFiles(context);
      
      const duration = Date.now() - startTime;
      return {
        success: true,
        artifacts: [
          { type: 'file', path: 'src/lib/gtag.ts' },
          { type: 'file', path: 'src/components/GoogleAnalyticsProvider.tsx' },
        ],
        dependencies: [],
        scripts: [],
        configs: [{
          file: '.env',
          content: GoogleAnalyticsGenerator.generateEnvConfig(context.pluginConfig as GoogleAnalyticsConfig),
          mergeStrategy: 'append'
        }],
        errors: [],
        warnings: ['Google Analytics integration requires you to wrap your application with the GoogleAnalyticsProvider.'],
        duration
      };
    } catch (error) {
      return this.createErrorResult('Failed to install Google Analytics plugin', startTime, error);
    }
  }

  async uninstall(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    try {
      const filesToRemove = [
        path.join(context.projectPath, 'src', 'lib', 'gtag.ts'),
        path.join(context.projectPath, 'src', 'components', 'GoogleAnalyticsProvider.tsx'),
      ];
      for (const file of filesToRemove) {
        if (await fsExtra.pathExists(file)) {
          await fsExtra.remove(file);
        }
      }
      
      return {
        success: true,
        artifacts: [],
        dependencies: [],
        scripts: [],
        configs: [],
        errors: [],
        warnings: ['Google Analytics files have been removed.'],
        duration: Date.now() - startTime
      };
    } catch (error) {
      return this.createErrorResult('Failed to uninstall Google Analytics plugin', startTime, error);
    }
  }

  async update(context: PluginContext): Promise<PluginResult> {
    return this.install(context);
  }

  getCompatibility(): CompatibilityMatrix {
    return {
      frameworks: ['nextjs'],
      platforms: [TargetPlatform.WEB],
      nodeVersions: ['>=16.0.0'],
      packageManagers: ['npm', 'yarn', 'pnpm'],
      conflicts: []
    };
  }

  getDependencies(): string[] {
    return [];
  }

  getConflicts(): string[] {
    return [];
  }

  getRequirements(): PluginRequirement[] {
    return [
      { type: 'config', name: 'NEXT_PUBLIC_GA_ID', description: 'Your Google Analytics Measurement ID.', optional: false },
    ];
  }

  getDefaultConfig(): Record<string, any> {
    return GoogleAnalyticsDefaultConfig;
  }

  getConfigSchema(): ConfigSchema {
    return GoogleAnalyticsConfigSchema;
  }

  private async createProjectFiles(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    const config = pluginConfig as GoogleAnalyticsConfig;

    const libDir = path.join(projectPath, 'src', 'lib');
    await fsExtra.ensureDir(libDir);
    await fsExtra.writeFile(path.join(libDir, 'gtag.ts'), GoogleAnalyticsGenerator.generateGtagHelper(config));

    const componentsDir = path.join(projectPath, 'src', 'components');
    await fsExtra.ensureDir(componentsDir);
    await fsExtra.writeFile(path.join(componentsDir, 'GoogleAnalyticsProvider.tsx'), GoogleAnalyticsGenerator.generateAnalyticsProvider(config));
  }

  private createErrorResult(message: string, startTime: number, error: any): PluginResult {
    return {
      success: false,
      artifacts: [],
      dependencies: [],
      scripts: [],
      configs: [],
      errors: [{ code: 'GA_PLUGIN_ERROR', message, details: error, severity: 'error' }],
      warnings: [],
      duration: Date.now() - startTime
    };
  }
} 