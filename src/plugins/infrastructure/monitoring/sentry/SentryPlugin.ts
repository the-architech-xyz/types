/**
 * Sentry Monitoring Plugin - Pure Technology Implementation
 * 
 * Provides Sentry error tracking and performance monitoring setup.
 * Focuses only on monitoring technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */

import { IPlugin, PluginMetadata, PluginCategory, PluginContext, PluginResult, ValidationResult, ConfigSchema, CompatibilityMatrix, PluginRequirement, TargetPlatform } from '../../../../types/plugin.js';
import { ValidationError } from '../../../../types/agent.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { SentryConfig, SentryConfigSchema, SentryDefaultConfig } from './SentrySchema.js';
import { SentryGenerator } from './SentryGenerator.js';
import { CommandRunner } from '../../../../core/cli/command-runner.js';

export class SentryPlugin implements IPlugin {
  private runner: CommandRunner;

  constructor() {
    this.runner = new CommandRunner();
  }

  getMetadata(): PluginMetadata {
    return {
      id: 'sentry',
      name: 'Sentry Monitoring',
      version: '1.0.0',
      description: 'Error tracking and performance monitoring with Sentry',
      author: 'The Architech Team',
      category: PluginCategory.MONITORING,
      tags: ['monitoring', 'error-tracking', 'performance', 'sentry', 'analytics'],
      license: 'MIT',
      repository: 'https://github.com/getsentry/sentry-javascript',
      homepage: 'https://sentry.io',
      documentation: 'https://docs.sentry.io'
    };
  }

  async validate(context: PluginContext): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const config = context.pluginConfig as SentryConfig;

    if (!config.dsn) {
      errors.push({ field: 'dsn', message: 'Sentry DSN is required.', code: 'MISSING_DSN', severity: 'error' });
    }
    if (config.enableSourceMaps && (!config.authToken || !config.org || !config.project)) {
      errors.push({ field: 'sourceMaps', message: 'Auth token, organization, and project are required for source map uploading.', code: 'MISSING_SOURCEMAP_CONFIG', severity: 'error' });
    }

    return { valid: errors.length === 0, errors, warnings: [] };
  }

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    try {
      await this.installDependencies(context);
      await this.createProjectFiles(context);
      
      const duration = Date.now() - startTime;
      return {
        success: true,
        artifacts: [
          { type: 'file', path: 'sentry.client.config.ts' },
          { type: 'file', path: 'sentry.server.config.ts' },
          { type: 'file', path: 'next.config.sentry.js' },
        ],
        dependencies: [{ name: '@sentry/nextjs', version: '^7.0.0', type: 'production', category: PluginCategory.MONITORING }],
        scripts: [],
        configs: [{
          file: '.env',
          content: SentryGenerator.generateEnvConfig(context.pluginConfig as SentryConfig),
          mergeStrategy: 'append'
        }],
        errors: [],
        warnings: ['Sentry integration requires manual wrapping of your Next.js config. A `next.config.sentry.js` file has been created as a reference.'],
        duration
      };
    } catch (error) {
      return this.createErrorResult('Failed to install Sentry plugin', startTime, error);
    }
  }

  async uninstall(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    try {
      await this.runner.execCommand(['npm', 'uninstall', '@sentry/nextjs'], { cwd: context.projectPath });
      
      const filesToRemove = ['sentry.client.config.ts', 'sentry.server.config.ts', 'next.config.sentry.js'];
      for (const file of filesToRemove) {
        const filePath = path.join(context.projectPath, file);
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
        warnings: ['Sentry files and dependencies have been removed.'],
        duration: Date.now() - startTime
      };
    } catch (error) {
      return this.createErrorResult('Failed to uninstall Sentry plugin', startTime, error);
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
    return ['@sentry/nextjs'];
  }

  getConflicts(): string[] {
    return [];
  }

  getRequirements(): PluginRequirement[] {
    return [
      { type: 'package', name: '@sentry/nextjs', description: 'The Sentry SDK for Next.js.', version: '^7.0.0' },
      { type: 'config', name: 'SENTRY_DSN', description: 'Your Sentry Data Source Name.', optional: false },
    ];
  }

  getDefaultConfig(): Record<string, any> {
    return SentryDefaultConfig;
  }

  getConfigSchema(): ConfigSchema {
    return SentryConfigSchema;
  }

  private async installDependencies(context: PluginContext): Promise<void> {
    await this.runner.execCommand(['npm', 'install', '@sentry/nextjs'], { cwd: context.projectPath });
  }

  private async createProjectFiles(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    const config = pluginConfig as SentryConfig;

    await fsExtra.writeFile(path.join(projectPath, 'sentry.client.config.ts'), SentryGenerator.generateSentryClientConfig(config));
    await fsExtra.writeFile(path.join(projectPath, 'sentry.server.config.ts'), SentryGenerator.generateSentryServerConfig(config));
    
    if(config.enableSourceMaps) {
      await fsExtra.writeFile(path.join(projectPath, 'next.config.sentry.js'), SentryGenerator.generateNextConfig(config));
    }
  }

  private createErrorResult(message: string, startTime: number, error: any): PluginResult {
    return {
      success: false,
      artifacts: [],
      dependencies: [],
      scripts: [],
      configs: [],
      errors: [{ code: 'SENTRY_PLUGIN_ERROR', message, details: error, severity: 'error' }],
      warnings: [],
      duration: Date.now() - startTime
    };
  }
} 