/**
 * Tamagui Plugin - Pure Technology Implementation
 * 
 * Provides Tamagui UI framework integration.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */

import { IPlugin, PluginMetadata, PluginArtifact, ValidationResult, PluginCategory, PluginContext, PluginResult, TargetPlatform, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../../types/plugin.js';
import { TemplateService, templateService } from '../../../core/templates/template-service.js';
import { CommandRunner } from '../../../core/cli/command-runner.js';
import { ValidationError } from '../../../types/agent.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { TamaguiConfig, TamaguiConfigSchema, TamaguiDefaultConfig } from './TamaguiSchema.js';
import { TamaguiGenerator } from './TamaguiGenerator.js';

export class TamaguiPlugin implements IPlugin {
  private templateService: TemplateService;
  private runner: CommandRunner;

  constructor() {
    this.templateService = templateService;
    this.runner = new CommandRunner();
  }

  // ============================================================================
  // PLUGIN METADATA
  // ============================================================================

  getMetadata(): PluginMetadata {
    return {
      id: 'tamagui',
      name: 'Tamagui',
      version: '1.0.0',
      description: 'Universal React Native & Web UI kit',
      author: 'The Architech Team',
      category: PluginCategory.DESIGN_SYSTEM,
      tags: ['ui', 'components', 'design-system', 'react-native', 'web', 'universal'],
      license: 'MIT',
      repository: 'https://github.com/tamagui/tamagui',
      homepage: 'https://tamagui.dev'
    };
  }

  // ============================================================================
  // PLUGIN LIFECYCLE - Pure Technology Implementation
  // ============================================================================

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      const { projectPath, pluginConfig } = context;
      
      context.logger.info('Installing Tamagui UI framework...');

      // Step 1: Install dependencies
      await this.installDependencies(context);

      // Step 2: Create Tamagui configuration
      await this.createTamaguiConfig(context);

      // Step 3: Create UI components structure
      await this.createUIComponents(context);

      // Step 4: Generate unified interface files
      await this.generateUnifiedInterfaceFiles(context);

      const duration = Date.now() - startTime;

      return {
        success: true,
        artifacts: [
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'ui', 'index.ts')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'ui', 'components.tsx')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'ui', 'theme.ts')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'tamagui.config.ts')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'components', 'ui', 'button.tsx')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'components', 'ui', 'card.tsx')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'components', 'ui', 'input.tsx')
          }
        ],
        dependencies: [
          {
            name: 'tamagui',
            version: '^1.74.0',
            type: 'production',
            category: PluginCategory.UI_LIBRARY
          },
          {
            name: '@tamagui/core',
            version: '^1.74.0',
            type: 'production',
            category: PluginCategory.UI_LIBRARY
          },
          {
            name: '@tamagui/config',
            version: '^1.74.0',
            type: 'production',
            category: PluginCategory.UI_LIBRARY
          },
          {
            name: '@tamagui/themes',
            version: '^1.74.0',
            type: 'production',
            category: PluginCategory.UI_LIBRARY
          },
          {
            name: '@tamagui/font-inter',
            version: '^1.74.0',
            type: 'production',
            category: PluginCategory.UI_LIBRARY
          },
          {
            name: '@tamagui/shorthands',
            version: '^1.74.0',
            type: 'production',
            category: PluginCategory.UI_LIBRARY
          },
          {
            name: '@tamagui/lucide-icons',
            version: '^1.74.0',
            type: 'production',
            category: PluginCategory.UI_LIBRARY
          }
        ],
        scripts: [
          {
            name: 'storybook',
            command: 'storybook dev -p 6006',
            description: 'Start Storybook for component development',
            category: 'dev'
          }
        ],
        configs: [
          {
            file: 'tamagui.config.ts',
            content: TamaguiGenerator.generateThemeConfig(pluginConfig as TamaguiConfig),
            mergeStrategy: 'replace'
          }
        ],
        errors: [],
        warnings: [],
        duration
      };
    } catch (error) {
      return this.createErrorResult(
        'Failed to install Tamagui',
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
      
      context.logger.info('Uninstalling Tamagui...');

      // Remove Tamagui dependencies
      await this.runner.execCommand(['npm', 'uninstall', 'tamagui', '@tamagui/core', '@tamagui/config', '@tamagui/themes', '@tamagui/font-inter', '@tamagui/shorthands', '@tamagui/lucide-icons'], { cwd: projectPath });

      // Remove configuration files
      const configPath = path.join(projectPath, 'tamagui.config.ts');
      if (await fsExtra.pathExists(configPath)) {
        await fsExtra.remove(configPath);
      }

      // Remove UI components
      const uiPath = path.join(projectPath, 'src', 'components', 'ui');
      if (await fsExtra.pathExists(uiPath)) {
        await fsExtra.remove(uiPath);
      }

      // Remove unified interface files
      const unifiedPath = path.join(projectPath, 'src', 'lib', 'ui');
      if (await fsExtra.pathExists(unifiedPath)) {
        await fsExtra.remove(unifiedPath);
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
        'Failed to uninstall Tamagui',
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
      
      context.logger.info('Updating Tamagui...');

      // Update Tamagui dependencies
      await this.runner.execCommand(['npm', 'update', 'tamagui', '@tamagui/core', '@tamagui/config', '@tamagui/themes', '@tamagui/font-inter', '@tamagui/shorthands', '@tamagui/lucide-icons'], { cwd: projectPath });

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
        'Failed to update Tamagui',
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

      // Check if it's a React project
      const packageJson = await fsExtra.readJson(packageJsonPath);
      if (!packageJson.dependencies?.react && !packageJson.dependencies?.['@types/react']) {
        errors.push({
          code: 'NOT_REACT_PROJECT',
          message: 'Tamagui requires a React project',
          severity: 'error'
        });
      }

      // Check Node.js version
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion?.slice(1).split('.')[0] || '16');
      if (majorVersion < 16) {
        errors.push({
          code: 'NODE_VERSION_TOO_OLD',
          message: 'Node.js 16 or higher is required for Tamagui',
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
      frameworks: ['nextjs', 'react', 'vite', 'expo'],
      platforms: [TargetPlatform.WEB, TargetPlatform.MOBILE],
      nodeVersions: ['>=16.0.0'],
      packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
      databases: [],
      uiLibraries: [],
      conflicts: ['shadcn-ui', 'mui', 'chakra-ui'] // Conflicts with other UI libraries
    };
  }

  getDependencies(): string[] {
    return ['react', '@types/react'];
  }

  getConflicts(): string[] {
    return ['shadcn-ui', 'mui', 'chakra-ui'];
  }

  getRequirements(): PluginRequirement[] {
    return [
      {
        type: 'package',
        name: 'react',
        description: 'React 18 or higher',
        version: '^18.0.0'
      },
      {
        type: 'package',
        name: '@types/react',
        description: 'React TypeScript definitions',
        version: '^18.0.0'
      },
      {
        type: 'binary',
        name: 'node',
        description: 'Node.js 16 or higher',
        version: '>=16.0.0'
      }
    ];
  }

  getDefaultConfig(): Record<string, any> {
    return TamaguiDefaultConfig;
  }

  getConfigSchema(): ConfigSchema {
    return TamaguiConfigSchema;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private async installDependencies(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Installing Tamagui dependencies...');

    const dependencies = [
      'tamagui@^1.74.0',
      '@tamagui/core@^1.74.0',
      '@tamagui/config@^1.74.0',
      '@tamagui/themes@^1.74.0',
      '@tamagui/font-inter@^1.74.0',
      '@tamagui/shorthands@^1.74.0',
      '@tamagui/lucide-icons@^1.74.0'
    ];

    await this.runner.execCommand(['npm', 'install', ...dependencies], { cwd: projectPath });
  }

  private async createTamaguiConfig(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    context.logger.info('Creating Tamagui configuration...');

    const configContent = TamaguiGenerator.generateThemeConfig(pluginConfig as TamaguiConfig);
    await fsExtra.writeFile(path.join(projectPath, 'tamagui.config.ts'), configContent);
  }

  private async createUIComponents(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    context.logger.info('Creating Tamagui components...');

    const componentsPath = path.join(projectPath, 'src', 'components', 'ui');
    await fsExtra.ensureDir(componentsPath);

    // Create Button component
    await this.createButtonComponent(componentsPath);

    // Create Card component
    await this.createCardComponent(componentsPath);

    // Create Input component
    await this.createInputComponent(componentsPath);

    // Create Text component
    await this.createTextComponent(componentsPath);
  }

  private async createButtonComponent(componentsPath: string): Promise<void> {
    const buttonContent = TamaguiGenerator.generateComponentExamples({} as TamaguiConfig);
    await fsExtra.writeFile(path.join(componentsPath, 'button.tsx'), buttonContent);
  }

  private async createCardComponent(componentsPath: string): Promise<void> {
    const cardContent = TamaguiGenerator.generateComponentExamples({} as TamaguiConfig);
    await fsExtra.writeFile(path.join(componentsPath, 'card.tsx'), cardContent);
  }

  private async createInputComponent(componentsPath: string): Promise<void> {
    const inputContent = TamaguiGenerator.generateComponentExamples({} as TamaguiConfig);
    await fsExtra.writeFile(path.join(componentsPath, 'input.tsx'), inputContent);
  }

  private async createTextComponent(componentsPath: string): Promise<void> {
    const textContent = TamaguiGenerator.generateComponentExamples({} as TamaguiConfig);
    await fsExtra.writeFile(path.join(componentsPath, 'text.tsx'), textContent);
  }

  private async generateUnifiedInterfaceFiles(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    context.logger.info('Generating unified interface files...');

    // Create UI lib directory
    const uiLibDir = path.join(projectPath, 'src', 'lib', 'ui');
    await fsExtra.ensureDir(uiLibDir);

    // Generate unified interface
    const unifiedContent = TamaguiGenerator.generateUnifiedIndex();
    await fsExtra.writeFile(
      path.join(uiLibDir, 'index.ts'),
      unifiedContent
    );

    // Generate theme configuration
    const themeContent = TamaguiGenerator.generateThemeConfig(pluginConfig as TamaguiConfig);
    await fsExtra.writeFile(
      path.join(uiLibDir, 'theme.ts'),
      themeContent
    );

    // Generate component examples
    const componentContent = TamaguiGenerator.generateComponentExamples(pluginConfig as TamaguiConfig);
    await fsExtra.writeFile(
      path.join(uiLibDir, 'components.tsx'),
      componentContent
    );
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
        code: 'TAMAGUI_INSTALL_ERROR',
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