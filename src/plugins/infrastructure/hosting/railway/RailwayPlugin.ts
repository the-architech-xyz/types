import { IPlugin, PluginContext, PluginResult, PluginMetadata, PluginCategory, ValidationResult, CompatibilityMatrix, PluginRequirement, ConfigSchema, TargetPlatform, ProjectType } from '../../../../types/plugins.js';
import { CommandRunner } from '../../../../core/cli/command-runner.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { RailwayConfig, RailwayConfigSchema, RailwayDefaultConfig } from './RailwaySchema.js';
import { RailwayGenerator } from './RailwayGenerator.js';
import { ValidationError } from '../../../../types/agents.js';

export class RailwayPlugin implements IPlugin {
  private commandRunner: CommandRunner;

  constructor() {
    this.commandRunner = new CommandRunner();
  }

  getMetadata(): PluginMetadata {
    return {
      id: 'railway',
      name: 'Railway',
      version: '1.0.0',
      description: 'Deploy your application to Railway with seamless integration',
      author: 'The Architech Team',
      category: PluginCategory.DEPLOYMENT,
      tags: ['deployment', 'railway', 'docker', 'containers'],
      license: 'MIT',
      repository: 'https://github.com/architech/plugins',
      homepage: 'https://railway.app',
      documentation: 'https://docs.railway.app'
    };
  }

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    try {
      const { projectPath, pluginConfig } = context;
      const config = pluginConfig as RailwayConfig;

      await this.installCli();
      await this.createProjectFiles(projectPath, config);

      const duration = Date.now() - startTime;
      return {
        success: true,
        artifacts: [{ type: 'file', path: 'railway.json' }],
        dependencies: [{ name: '@railway/cli', version: 'latest', type: 'development', category: PluginCategory.DEPLOYMENT }],
        scripts: [
          { name: 'deploy', command: 'railway up', description: 'Deploy to Railway (default environment)', category: 'custom' },
          { name: 'deploy:prod', command: 'railway up --environment production', description: 'Deploy to production environment', category: 'custom' },
          { name: 'deploy:staging', command: 'railway up --environment staging', description: 'Deploy to staging environment', category: 'custom' },
        ],
        configs: [{
          file: '.env',
          content: RailwayGenerator.generateEnvConfig(config),
          mergeStrategy: 'append'
        }],
        errors: [],
        warnings: ['Railway CLI was installed globally. Please ensure it is in your system PATH.'],
        duration
      };
    } catch (error) {
      return this.createErrorResult('Failed to install Railway plugin', startTime, error);
    }
  }

  async uninstall(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    try {
      const { projectPath } = context;
      const railwayJsonPath = path.join(projectPath, 'railway.json');
      if (await fsExtra.pathExists(railwayJsonPath)) {
        await fsExtra.remove(railwayJsonPath);
      }
      
      const duration = Date.now() - startTime;
      return {
        success: true,
        artifacts: [],
        dependencies: [],
        scripts: [],
        configs: [],
        errors: [],
        warnings: ['Railway configuration file removed. The Railway CLI is not uninstalled automatically.'],
        duration
      };
    } catch (error) {
      return this.createErrorResult('Failed to uninstall Railway plugin', startTime, error);
    }
  }

  async update(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    try {
      await this.installCli();
      const duration = Date.now() - startTime;
      return {
        success: true,
        artifacts: [],
        dependencies: [],
        scripts: [],
        configs: [],
        errors: [],
        warnings: ['Railway CLI has been updated.'],
        duration
      };
    } catch (error) {
      return this.createErrorResult('Failed to update Railway plugin', startTime, error);
    }
  }

  async validate(context: PluginContext): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    try {
      const { code } = await this.commandRunner.execCommand(['railway', '--version']);
      if (code !== 0) {
        errors.push({
          field: 'railway-cli',
          message: 'Railway CLI is not installed or not in your PATH.',
          code: 'CLI_NOT_FOUND',
          severity: 'error'
        });
      }
    } catch (error) {
      errors.push({
        field: 'railway-cli',
        message: 'Railway CLI is not installed or not in your PATH.',
        code: 'CLI_NOT_FOUND',
        severity: 'error'
      });
    }
    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  getCompatibility(): CompatibilityMatrix {
    return {
      frameworks: [ProjectType.NEXTJS, ProjectType.REACT, ProjectType.NODE, ProjectType.EXPRESS, ProjectType.NESTJS],
      platforms: [TargetPlatform.SERVER],
      nodeVersions: ['16.x', '18.x', '20.x'],
      packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
      conflicts: ['heroku', 'netlify', 'vercel-hosting']
    };
  }

  getDependencies(): string[] {
    return ['@railway/cli'];
  }

  getConflicts(): string[] {
    return ['heroku', 'netlify', 'vercel-hosting'];
  }

  getRequirements(): PluginRequirement[] {
    return [{
      type: 'package',
      name: '@railway/cli',
      description: 'Railway CLI for interacting with the Railway platform.',
      version: 'latest'
    }];
  }

  getDefaultConfig(): Record<string, any> {
    return RailwayDefaultConfig;
  }

  getConfigSchema(): ConfigSchema {
    return RailwayConfigSchema;
  }

  private async installCli(): Promise<void> {
    const { code, stderr } = await this.commandRunner.execCommand(['npm', 'install', '-g', '@railway/cli']);
    if (code !== 0) {
      throw new Error(`Failed to install Railway CLI: ${stderr}`);
    }
  }

  private async createProjectFiles(projectPath: string, config: RailwayConfig): Promise<void> {
    const railwayJsonPath = path.join(projectPath, 'railway.json');
    const railwayJsonContent = RailwayGenerator.generateRailwayConfig(config);
    await fsExtra.writeFile(railwayJsonPath, railwayJsonContent);
  }

  private createErrorResult(message: string, startTime: number, error: any): PluginResult {
    const duration = Date.now() - startTime;
    return {
      success: false,
      artifacts: [],
      dependencies: [],
      scripts: [],
      configs: [],
      errors: [{
        code: 'RAILWAY_PLUGIN_ERROR',
        message,
        details: error,
        severity: 'error'
      }],
      warnings: [],
      duration
    };
  }
} 