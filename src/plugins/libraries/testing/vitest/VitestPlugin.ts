import { IPlugin, PluginContext, PluginResult, PluginMetadata, PluginCategory, ValidationResult, CompatibilityMatrix, PluginRequirement, ConfigSchema, TargetPlatform, ProjectType } from '../../../../types/plugin.js';
import { AgentLogger as Logger } from '../../../../core/cli/logger.js';
import { CommandRunner } from '../../../../core/cli/command-runner.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { VitestConfig, VitestConfigSchema, VitestDefaultConfig } from './VitestSchema.js';
import { VitestGenerator } from './VitestGenerator.js';

export class VitestPlugin implements IPlugin {
  private logger: Logger;
  private commandRunner: CommandRunner;

  constructor() {
    this.logger = new Logger(false, 'VitestPlugin');
    this.commandRunner = new CommandRunner();
  }

  getMetadata(): PluginMetadata {
    return {
      id: 'vitest',
      name: 'Vitest',
      version: '1.0.0',
      description: 'Fast unit testing framework with native TypeScript support',
      author: 'The Architech Team',
      category: PluginCategory.TESTING,
      tags: ['testing', 'vitest', 'unit', 'typescript', 'fast'],
      license: 'MIT',
      repository: 'https://github.com/architech/plugins',
      homepage: 'https://vitest.dev',
      documentation: 'https://vitest.dev/guide'
    };
  }

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      this.logger.info('Installing Vitest testing plugin...');

      const { projectPath, pluginConfig } = context;

      // Step 1: Install dependencies
      await this.installDependencies(context);

      // Step 2: Create Vitest configuration
      await this.createVitestConfig(context);

      // Step 3: Create test setup files
      await this.createTestSetupFiles(context);

      // Step 4: Create example tests
      await this.createExampleTests(context);

      // Step 5: Update package.json scripts
      await this.updatePackageJsonScripts(context);

      const duration = Date.now() - startTime;

      return {
        success: true,
        artifacts: [
          {
            type: 'file',
            path: path.join(projectPath, 'vitest.config.ts')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'test', 'setup.ts')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'components', 'ui', 'button.test.tsx')
          }
        ],
        dependencies: [
          {
            name: 'vitest',
            version: '^1.0.0',
            type: 'development',
            category: PluginCategory.TESTING
          },
          {
            name: '@vitest/ui',
            version: '^1.0.0',
            type: 'development',
            category: PluginCategory.TESTING
          },
          {
            name: '@testing-library/react',
            version: '^14.0.0',
            type: 'development',
            category: PluginCategory.TESTING
          },
          {
            name: '@testing-library/jest-dom',
            version: '^6.0.0',
            type: 'development',
            category: PluginCategory.TESTING
          },
          {
            name: '@testing-library/user-event',
            version: '^14.0.0',
            type: 'development',
            category: PluginCategory.TESTING
          },
          {
            name: 'jsdom',
            version: '^23.0.0',
            type: 'development',
            category: PluginCategory.TESTING
          },
          {
            name: '@vitejs/plugin-react',
            version: '^4.0.0',
            type: 'development',
            category: PluginCategory.TESTING
          }
        ],
        scripts: [
          {
            name: 'test',
            command: 'vitest',
            description: 'Run tests in watch mode',
            category: 'test'
          },
          {
            name: 'test:ui',
            command: 'vitest --ui',
            description: 'Open Vitest UI for interactive testing',
            category: 'test'
          },
          {
            name: 'test:run',
            command: 'vitest run',
            description: 'Run tests once',
            category: 'test'
          },
          {
            name: 'test:coverage',
            command: 'vitest run --coverage',
            description: 'Run tests with coverage report',
            category: 'test'
          },
          {
            name: 'test:watch',
            command: 'vitest --watch',
            description: 'Run tests in watch mode',
            category: 'test'
          },
          {
            name: 'test:related',
            command: 'vitest run --related',
            description: 'Run tests related to changed files',
            category: 'test'
          }
        ],
        configs: [
          {
            file: 'vitest.config.ts',
            content: VitestGenerator.generateVitestConfig(pluginConfig as VitestConfig),
            mergeStrategy: 'replace'
          }
        ],
        errors: [],
        warnings: [],
        duration
      };
    } catch (error) {
      return this.createErrorResult(
        'Failed to install Vitest',
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
      
      this.logger.info('Uninstalling Vitest testing plugin...');

      // Remove Vitest dependencies
      await this.commandRunner.execCommand(['npm', 'uninstall', 'vitest', '@vitest/ui', '@testing-library/react', '@testing-library/jest-dom', '@testing-library/user-event', 'jsdom', '@vitejs/plugin-react'], { cwd: projectPath });

      // Remove configuration files
      const configPath = path.join(projectPath, 'vitest.config.ts');
      if (await fsExtra.pathExists(configPath)) {
        await fsExtra.remove(configPath);
      }

      // Remove test setup files
      const testSetupPath = path.join(projectPath, 'src', 'test');
      if (await fsExtra.pathExists(testSetupPath)) {
        await fsExtra.remove(testSetupPath);
      }

      // Remove example test files
      const exampleTestPath = path.join(projectPath, 'src', 'components', 'ui', 'button.test.tsx');
      if (await fsExtra.pathExists(exampleTestPath)) {
        await fsExtra.remove(exampleTestPath);
      }

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
        'Failed to uninstall Vitest',
        startTime,
        [],
        error
      );
    }
  }

  async update(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      const { projectPath } = context;
      
      this.logger.info('Updating Vitest testing plugin...');

      // Update Vitest dependencies
      await this.commandRunner.execCommand(['npm', 'update', 'vitest', '@vitest/ui', '@testing-library/react', '@testing-library/jest-dom', '@testing-library/user-event', 'jsdom', '@vitejs/plugin-react'], { cwd: projectPath });

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
        'Failed to update Vitest',
        startTime,
        [],
        error
      );
    }
  }

  async validate(context: PluginContext): Promise<ValidationResult> {
    const errors: any[] = [];
    const warnings: string[] = [];

    try {
      const { projectPath } = context;

      // Check if package.json exists
      const packageJsonPath = path.join(projectPath, 'package.json');
      if (!await fsExtra.pathExists(packageJsonPath)) {
        errors.push({
          code: 'MISSING_PACKAGE_JSON',
          message: 'package.json not found in project directory',
          severity: 'error'
        });
      }

      // Check if it's a Node.js project
      const packageJson = await fsExtra.readJson(packageJsonPath);
      if (!packageJson.dependencies && !packageJson.devDependencies) {
        errors.push({
          code: 'NOT_NODE_PROJECT',
          message: 'Vitest requires a Node.js project',
            severity: 'error'
        });
      }

      // Check Node.js version
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion?.slice(1).split('.')[0] || '16');
      if (majorVersion < 16) {
        errors.push({
          code: 'NODE_VERSION_TOO_OLD',
          message: 'Node.js 16 or higher is required for Vitest',
            severity: 'error'
        });
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      errors.push({
        code: 'VALIDATION_ERROR',
        message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });

      return {
        valid: false,
        errors,
        warnings
      };
    }
  }

  getCompatibility(): CompatibilityMatrix {
    return {
      frameworks: ['nextjs', 'react', 'vite', 'vue', 'svelte'],
      platforms: [TargetPlatform.WEB, TargetPlatform.SERVER],
      nodeVersions: ['>=16.0.0'],
      packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
      databases: [],
      uiLibraries: [],
      conflicts: ['jest', 'mocha', 'ava'] // Conflicts with other testing frameworks
    };
  }

  getDependencies(): string[] {
    return ['node'];
  }

  getConflicts(): string[] {
    return ['jest', 'mocha', 'ava'];
  }

  getRequirements(): PluginRequirement[] {
    return [
      {
        type: 'binary',
        name: 'node',
        description: 'Node.js 16 or higher',
        version: '>=16.0.0'
      },
      {
        type: 'package',
        name: 'package.json',
        description: 'Valid package.json file',
        version: 'any'
      }
    ];
  }

  getDefaultConfig(): Record<string, any> {
    return VitestDefaultConfig;
  }

  getConfigSchema(): ConfigSchema {
    return VitestConfigSchema;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private async installDependencies(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    this.logger.info('Installing Vitest dependencies...');

    const packages = [
      'vitest@^1.0.0',
      '@vitest/ui@^1.0.0',
      '@testing-library/react@^14.0.0',
      '@testing-library/jest-dom@^6.0.0',
      '@testing-library/user-event@^14.0.0',
      'jsdom@^23.0.0',
      '@vitejs/plugin-react@^4.0.0'
    ];

    await this.commandRunner.install(packages, true, projectPath);
  }

  private async createVitestConfig(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    this.logger.info('Creating Vitest configuration...');

    const configContent = VitestGenerator.generateVitestConfig(pluginConfig as VitestConfig);
    await fsExtra.writeFile(path.join(projectPath, 'vitest.config.ts'), configContent);
  }

  private async createTestSetupFiles(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    this.logger.info('Creating test setup files...');

    // Create test directory
    const testDir = path.join(projectPath, 'src', 'test');
    await fsExtra.ensureDir(testDir);

    // Create setup file
    const setupContent = VitestGenerator.generateSetupFile(pluginConfig as VitestConfig);
    await fsExtra.writeFile(path.join(testDir, 'setup.ts'), setupContent);
  }

  private async createExampleTests(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    this.logger.info('Creating example tests...');

    // Create components directory if it doesn't exist
    const componentsDir = path.join(projectPath, 'src', 'components', 'ui');
    await fsExtra.ensureDir(componentsDir);

    // Create example test
    const testContent = VitestGenerator.generateTestExample(pluginConfig as VitestConfig);
    await fsExtra.writeFile(path.join(componentsDir, 'button.test.tsx'), testContent);
  }

  private async updatePackageJsonScripts(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    this.logger.info('Updating package.json scripts...');

    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageJson = await fsExtra.readJson(packageJsonPath);
    
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    packageJson.scripts.test = 'vitest';
    packageJson.scripts['test:ui'] = 'vitest --ui';
    packageJson.scripts['test:run'] = 'vitest run';
    packageJson.scripts['test:coverage'] = 'vitest run --coverage';
    packageJson.scripts['test:watch'] = 'vitest --watch';
    packageJson.scripts['test:related'] = 'vitest run --related';

    await fsExtra.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }

  private createErrorResult(
    message: string,
    startTime: number,
    errors: any[] = [],
    originalError?: any
  ): PluginResult {
    const duration = Date.now() - startTime;
    
    if (originalError) {
      errors.push({
        code: 'VITEST_INSTALL_ERROR',
        message: originalError instanceof Error ? originalError.message : String(originalError),
        severity: 'error',
        details: originalError
      });
    }

    return {
      success: false,
      artifacts: [],
      dependencies: [],
      scripts: [],
      configs: [],
      errors,
      warnings: [],
      duration
    };
  }
}