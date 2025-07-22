/**
 * Chakra UI Plugin - Updated with Latest Best Practices
 * 
 * Provides Chakra UI design system integration using the official Chakra UI library.
 * Follows latest Chakra UI documentation and TypeScript best practices.
 * 
 * References:
 * - https://chakra-ui.com/getting-started
 * - https://chakra-ui.com/docs/components
 * - https://chakra-ui.com/docs/theming
 */

import { IPlugin, PluginMetadata, PluginArtifact, ValidationResult, PluginCategory, PluginContext, PluginResult, TargetPlatform, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../../../types/plugin.js';
import { TemplateService, templateService } from '../../../../core/templates/template-service.js';
import { CommandRunner } from '../../../../core/cli/command-runner.js';
import { ValidationError } from '../../../../types/agent.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { structureService, StructureInfo } from '../../../../core/project/structure-service.js';
import { ChakraUIConfig, ChakraUIConfigSchema, ChakraUIDefaultConfig } from './ChakraUISchema.js';
import { ChakraUIGenerator } from './ChakraUIGenerator.js';

export class ChakraUIPlugin implements IPlugin {
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
      id: 'chakra-ui',
      name: 'Chakra UI',
      version: '1.0.0',
      description: 'Simple, modular and accessible component library for React',
      author: 'The Architech Team',
      category: PluginCategory.UI_LIBRARY,
      tags: ['ui', 'components', 'design-system', 'react', 'typescript', 'accessibility'],
      license: 'MIT',
      repository: 'https://github.com/chakra-ui/chakra-ui',
      homepage: 'https://chakra-ui.com',
      documentation: 'https://chakra-ui.com/getting-started'
    };
  }

  // ============================================================================
  // PLUGIN LIFECYCLE - Pure Technology Implementation
  // ============================================================================

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      const { projectPath, pluginConfig } = context;
      
      context.logger.info('Installing Chakra UI...');

      // Step 1: Install dependencies
      await this.installDependencies(context);

      // Step 2: Create theme configuration
      await this.createThemeConfiguration(context);

      // Step 3: Create provider setup
      await this.createProviderSetup(context);

      // Step 4: Create component examples
      await this.createComponentExamples(context);

      // Step 5: Add environment configuration
      await this.addEnvironmentConfig(context);

      // Step 6: Generate unified interface files
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
            path: path.join(projectPath, 'src', 'lib', 'ui', 'theme.ts')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'ui', 'provider.tsx')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'ui', 'components.tsx')
          }
        ],
        dependencies: [
          {
            name: '@chakra-ui/react',
            version: '^2.8.0',
            type: 'production',
            category: PluginCategory.UI_LIBRARY
          },
          {
            name: '@emotion/react',
            version: '^11.0.0',
            type: 'production',
            category: PluginCategory.UI_LIBRARY
          },
          {
            name: '@emotion/styled',
            version: '^11.0.0',
            type: 'production',
            category: PluginCategory.UI_LIBRARY
          },
          {
            name: 'framer-motion',
            version: '^10.0.0',
            type: 'production',
            category: PluginCategory.UI_LIBRARY
          }
        ],
        scripts: [
          {
            name: 'ui:storybook',
            command: 'npx storybook dev -p 6006',
            description: 'Start Storybook for UI components',
            category: 'dev'
          },
          {
            name: 'ui:build-storybook',
            command: 'npx storybook build',
            description: 'Build Storybook for UI components',
            category: 'dev'
          }
        ],
        configs: [
          {
            file: '.env',
            content: ChakraUIGenerator.generateEnvConfig(pluginConfig as ChakraUIConfig),
            mergeStrategy: 'append'
          }
        ],
        errors: [],
        warnings: [],
        duration
      };

    } catch (error) {
      return this.createErrorResult(
        'Failed to install Chakra UI',
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
      
      context.logger.info('Uninstalling Chakra UI...');

      // Remove Chakra UI files
      const filesToRemove = [
        path.join(projectPath, 'src', 'lib', 'ui'),
        path.join(projectPath, 'src', 'components', 'ui'),
        path.join(projectPath, '.storybook')
      ];

      for (const file of filesToRemove) {
        if (await fsExtra.pathExists(file)) {
          await fsExtra.remove(file);
        }
      }

      const duration = Date.now() - startTime;

      return {
        success: true,
        artifacts: [],
        dependencies: [],
        scripts: [],
        configs: [],
        errors: [],
        warnings: ['Chakra UI files removed. You may need to manually remove dependencies from package.json'],
        duration
      };

    } catch (error) {
      return this.createErrorResult(
        'Failed to uninstall Chakra UI',
        startTime,
        [],
        error
      );
    }
  }

  async update(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      context.logger.info('Updating Chakra UI...');

      // Update dependencies
      await this.runner.execCommand(['npm', 'update', '@chakra-ui/react', '@emotion/react', '@emotion/styled', 'framer-motion']);

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
        'Failed to update Chakra UI',
        startTime,
        [],
        error
      );
    }
  }

  async validate(context: PluginContext): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    try {
      // Check if theme configuration exists
      const themePath = path.join(context.projectPath, 'src', 'lib', 'ui', 'theme.ts');
      if (!await fsExtra.pathExists(themePath)) {
        errors.push({
          field: 'chakra-ui.theme',
          message: 'Chakra UI theme configuration not found',
          code: 'MISSING_THEME',
          severity: 'error'
        });
      }

      // Check if provider setup exists
      const providerPath = path.join(context.projectPath, 'src', 'lib', 'ui', 'provider.tsx');
      if (!await fsExtra.pathExists(providerPath)) {
        errors.push({
          field: 'chakra-ui.provider',
          message: 'Chakra UI provider setup not found',
          code: 'MISSING_PROVIDER',
          severity: 'error'
        });
      }

      // Check if components exist
      const componentsPath = path.join(context.projectPath, 'src', 'lib', 'ui', 'components.tsx');
      if (!await fsExtra.pathExists(componentsPath)) {
        warnings.push('Chakra UI component examples not found');
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      return {
        valid: false,
        errors: [{
          field: 'validation',
          message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          code: 'VALIDATION_ERROR',
          severity: 'error'
        }],
        warnings: []
      };
    }
  }

  getCompatibility(): CompatibilityMatrix {
    return {
      frameworks: ['react', 'nextjs', 'vite', 'webpack'],
      platforms: [TargetPlatform.WEB],
      nodeVersions: ['>=16.0.0'],
      packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
      databases: [],
      conflicts: ['mui', 'antd', 'shadcn-ui']
    };
  }

  getDependencies(): string[] {
    return ['@chakra-ui/react', '@emotion/react', '@emotion/styled', 'framer-motion'];
  }

  getConflicts(): string[] {
    return ['mui', 'antd', 'shadcn-ui'];
  }

  getRequirements(): PluginRequirement[] {
    return [
      {
        type: 'package',
        name: '@chakra-ui/react',
        description: 'Chakra UI core library',
        version: '^2.8.0'
      },
      {
        type: 'package',
        name: '@emotion/react',
        description: 'Emotion CSS-in-JS library',
        version: '^11.0.0'
      },
      {
        type: 'package',
        name: '@emotion/styled',
        description: 'Emotion styled components',
        version: '^11.0.0'
      },
      {
        type: 'package',
        name: 'framer-motion',
        description: 'Animation library for Chakra UI',
        version: '^10.0.0'
      }
    ];
  }

  getDefaultConfig(): Record<string, any> {
    return ChakraUIDefaultConfig;
  }

  getConfigSchema(): ConfigSchema {
    return ChakraUIConfigSchema;
  }

  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================

  private async installDependencies(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    context.logger.info('Installing Chakra UI dependencies...');

    const dependencies = [
      '@chakra-ui/react@^2.8.0',
      '@emotion/react@^11.0.0',
      '@emotion/styled@^11.0.0',
      'framer-motion@^10.0.0'
    ];

    // Add optional dependencies based on config
    if (pluginConfig.enableIcons !== false) {
      dependencies.push('@chakra-ui/icons@^2.1.0');
    }

    if (pluginConfig.enableNextJS) {
      dependencies.push('@chakra-ui/next-js@^2.2.0');
    }

    await this.runner.execCommand(['npm', 'install', ...dependencies], { cwd: projectPath });
  }

  private async createThemeConfiguration(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    context.logger.info('Creating theme configuration...');

    // Create UI lib directory
    const uiLibDir = path.join(projectPath, 'src', 'lib', 'ui');
    await fsExtra.ensureDir(uiLibDir);

    // Generate theme configuration
    const themeConfig = ChakraUIGenerator.generateThemeConfig(pluginConfig as ChakraUIConfig);
    await fsExtra.writeFile(
      path.join(uiLibDir, 'theme.ts'),
      themeConfig
    );
  }

  private async createProviderSetup(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    context.logger.info('Creating provider setup...');

    // Create UI lib directory
    const uiLibDir = path.join(projectPath, 'src', 'lib', 'ui');
    await fsExtra.ensureDir(uiLibDir);

    // Generate provider setup
    const providerSetup = ChakraUIGenerator.generateProviderSetup(pluginConfig as ChakraUIConfig);
    await fsExtra.writeFile(
      path.join(uiLibDir, 'provider.tsx'),
      providerSetup
    );
  }

  private async createComponentExamples(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    context.logger.info('Creating component examples...');

    // Create UI lib directory
    const uiLibDir = path.join(projectPath, 'src', 'lib', 'ui');
    await fsExtra.ensureDir(uiLibDir);

    // Generate component examples
    const componentExamples = ChakraUIGenerator.generateComponentExamples(pluginConfig as ChakraUIConfig);
    await fsExtra.writeFile(
      path.join(uiLibDir, 'components.tsx'),
      componentExamples
    );
  }

  private async addEnvironmentConfig(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    context.logger.info('Adding environment configuration...');

    // Generate environment configuration
    const envConfig = ChakraUIGenerator.generateEnvConfig(pluginConfig as ChakraUIConfig);
    
    // Append to .env file
    const envPath = path.join(projectPath, '.env');
    if (await fsExtra.pathExists(envPath)) {
      const existingEnv = await fsExtra.readFile(envPath, 'utf-8');
      await fsExtra.writeFile(envPath, existingEnv + '\n' + envConfig);
    } else {
      await fsExtra.writeFile(envPath, envConfig);
    }
  }

  private async generateUnifiedInterfaceFiles(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Generating unified interface files...');

    // Create UI lib directory
    const uiLibDir = path.join(projectPath, 'src', 'lib', 'ui');
    await fsExtra.ensureDir(uiLibDir);

    // Generate unified interface
    const unifiedContent = ChakraUIGenerator.generateUnifiedIndex();
    await fsExtra.writeFile(
      path.join(uiLibDir, 'index.ts'),
      unifiedContent
    );
  }

  private createErrorResult(
    message: string,
    startTime: number,
    errors: any[] = [],
    originalError?: any
  ): PluginResult {
    const duration = Date.now() - startTime;

    return {
      success: false,
      artifacts: [],
      dependencies: [],
      scripts: [],
      configs: [],
      errors: [
        {
          code: 'CHAKRA_UI_INSTALL_ERROR',
          message,
          details: originalError,
          severity: 'error'
        },
        ...errors
      ],
      warnings: [],
      duration
    };
  }
} 