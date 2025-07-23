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

import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginContext, PluginResult, PluginMetadata, PluginCategory, IUIPlugin, UnifiedInterfaceTemplate, ValidationResult, ValidationError } from '../../../../types/plugins.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { structureService, StructureInfo } from '../../../../core/project/structure-service.js';
import { ChakraUIConfigSchema, ChakraUIDefaultConfig } from './ChakraUISchema.js';
import { ChakraUIGenerator } from './ChakraUIGenerator.js';

export class ChakraUIPlugin extends BasePlugin implements IUIPlugin {
  constructor() {
    super();
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
      await this.installChakraDependencies(context);

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
            path: path.join(projectPath, 'src', 'lib', 'ui', 'components', 'index.ts')
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
            version: '^11.11.0',
            type: 'production',
            category: PluginCategory.UI_LIBRARY
          },
          {
            name: '@emotion/styled',
            version: '^11.11.0',
            type: 'production',
            category: PluginCategory.UI_LIBRARY
          },
          {
            name: 'framer-motion',
            version: '^10.16.0',
            type: 'production',
            category: PluginCategory.UI_LIBRARY
          }
        ],
        scripts: [
          {
            name: 'ui:storybook',
            command: 'npm run storybook',
            description: 'Start Storybook for UI components',
            category: 'dev'
          }
        ],
        configs: [
          {
            file: '.env',
            content: ChakraUIGenerator.generateEnvConfig(pluginConfig as any),
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
        [error],
        startTime
      );
    }
  }

  async uninstall(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      const { projectPath } = context;
      
      context.logger.info('Uninstalling Chakra UI...');

      // Remove UI files
      const uiDir = path.join(projectPath, 'src', 'lib', 'ui');
      if (await fsExtra.pathExists(uiDir)) {
        await fsExtra.remove(uiDir);
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
        'Failed to uninstall Chakra UI',
        [error],
        startTime
      );
    }
  }

  async update(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      const { projectPath } = context;
      
      context.logger.info('Updating Chakra UI...');

      // Update dependencies
      await this.runner.execCommand(['npm', 'update', '@chakra-ui/react', '@emotion/react', '@emotion/styled', 'framer-motion'], { cwd: projectPath });

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
        [error],
        startTime
      );
    }
  }

  async validate(context: PluginContext): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    
    try {
      const { projectPath } = context;
      
      // Check if Chakra UI is installed
      const packageJsonPath = path.join(projectPath, 'package.json');
      if (await fsExtra.pathExists(packageJsonPath)) {
        const packageJson = await fsExtra.readJson(packageJsonPath);
        if (!packageJson.dependencies?.['@chakra-ui/react']) {
          errors.push({
            field: 'chakra-ui.dependencies',
            message: 'Chakra UI dependencies not found in package.json',
            code: 'MISSING_DEPENDENCIES',
            severity: 'error'
          });
        }
      }
      
    } catch (error) {
      errors.push({
        field: 'validation',
        message: `Validation failed: ${error}`,
        code: 'VALIDATION_ERROR',
        severity: 'error'
      });
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  getCompatibility(): any {
    return {
      frameworks: ['nextjs', 'react', 'vite', 'cra'],
      platforms: ['web'],
      nodeVersions: ['>=16.0.0'],
      packageManagers: ['npm', 'yarn', 'pnpm'],
      conflicts: []
    };
  }

  getDependencies(): string[] {
    return ['@chakra-ui/react', '@emotion/react', '@emotion/styled', 'framer-motion'];
  }

  getConflicts(): string[] {
    return ['@mui/material', 'antd', 'shadcn-ui'];
  }

  getRequirements(): any[] {
    return [
      {
        type: 'package',
        name: '@chakra-ui/react',
        description: 'Chakra UI React components',
        version: '^2.8.0',
        optional: false
      }
    ];
  }

  getDefaultConfig(): Record<string, any> {
    return ChakraUIDefaultConfig;
  }

  getConfigSchema(): any {
    return ChakraUIConfigSchema;
  }

  // ============================================================================
  // ENHANCED PLUGIN INTERFACE IMPLEMENTATIONS
  // ============================================================================

  getParameterSchema(): any {
    return ChakraUIConfigSchema;
  }

  getDynamicQuestions(context: PluginContext): any[] {
    return []; // Plugins NEVER generate questions
  }

  validateConfiguration(config: Record<string, any>): ValidationResult {
    const errors: ValidationError[] = [];
    
    // Validate required fields
    if (!config.theme) {
      errors.push({
        field: 'theme',
        message: 'Theme configuration is required',
        code: 'MISSING_THEME',
        severity: 'error'
      });
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate {
    return {
      category: PluginCategory.UI_LIBRARY,
      exports: [
        {
          name: 'ChakraProvider',
          type: 'function',
          implementation: 'ChakraProvider',
          documentation: 'Chakra UI provider component',
          parameters: [],
          returnType: 'JSX.Element',
          examples: []
        },
        {
          name: 'useTheme',
          type: 'function',
          implementation: 'useTheme',
          documentation: 'Access Chakra UI theme',
          parameters: [],
          returnType: 'Theme',
          examples: []
        }
      ],
      types: [
        {
          name: 'ChakraConfig',
          type: 'interface',
          definition: 'interface ChakraConfig { theme: Theme; colorMode: ColorMode; }',
          documentation: 'Configuration for Chakra UI',
          properties: []
        },
        {
          name: 'Theme',
          type: 'interface',
          definition: 'interface Theme { colors: ColorPalette; fonts: FontPalette; }',
          documentation: 'Chakra UI theme configuration',
          properties: []
        }
      ],
      utilities: [],
      constants: [
        {
          name: 'CHAKRA_VERSION',
          value: '2.8.0',
          documentation: 'Current Chakra UI version',
          type: 'string'
        },
        {
          name: 'DEFAULT_THEME',
          value: 'light',
          documentation: 'Default theme mode',
          type: 'string'
        }
      ],
      documentation: 'Chakra UI unified interface for React components'
    };
  }

  // ============================================================================
  // IUIPlugin INTERFACE IMPLEMENTATIONS
  // ============================================================================

  getUILibraries(): string[] {
    return [
      'chakra-ui',
      'chakra-ui-next',
      'chakra-ui-vue'
    ];
  }

  getComponentOptions(): string[] {
    return [
      'button',
      'input',
      'card',
      'modal',
      'navigation',
      'form',
      'table',
      'chart',
      'calendar',
      'dropdown',
      'tooltip',
      'badge',
      'avatar',
      'progress',
      'alert'
    ];
  }

  getThemeOptions(): string[] {
    return [
      'light',
      'dark',
      'system',
      'custom'
    ];
  }

  getStylingOptions(): string[] {
    return [
      'emotion',
      'styled-components',
      'css-modules',
      'tailwind'
    ];
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private async installChakraDependencies(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Installing Chakra UI dependencies...');

    // Install Chakra UI and dependencies
    await this.runner.execCommand(['npm', 'install', '@chakra-ui/react', '@emotion/react', '@emotion/styled', 'framer-motion'], { cwd: projectPath });
  }

  private async createThemeConfiguration(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    context.logger.info('Creating theme configuration...');

    // Create UI library directory
    const uiLibDir = path.join(projectPath, 'src', 'lib', 'ui');
    await fsExtra.ensureDir(uiLibDir);

    // Generate theme configuration
    const themeContent = ChakraUIGenerator.generateThemeConfig(pluginConfig as any);
    await fsExtra.writeFile(
      path.join(uiLibDir, 'theme.ts'),
      themeContent
    );
  }

  private async createProviderSetup(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    context.logger.info('Creating provider setup...');

    // Create UI library directory
    const uiLibDir = path.join(projectPath, 'src', 'lib', 'ui');
    await fsExtra.ensureDir(uiLibDir);

    // Generate provider component
    const providerContent = ChakraUIGenerator.generateProviderSetup(pluginConfig as any);
    await fsExtra.writeFile(
      path.join(uiLibDir, 'provider.tsx'),
      providerContent
    );
  }

  private async createComponentExamples(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    context.logger.info('Creating component examples...');

    // Create components directory
    const componentsDir = path.join(projectPath, 'src', 'lib', 'ui', 'components');
    await fsExtra.ensureDir(componentsDir);

    // Generate component examples
    const componentsContent = ChakraUIGenerator.generateComponentExamples(pluginConfig as any);
    await fsExtra.writeFile(
      path.join(componentsDir, 'index.ts'),
      componentsContent
    );
  }

  private async addEnvironmentConfig(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    context.logger.info('Adding environment configuration...');

    // Generate environment configuration
    const envContent = ChakraUIGenerator.generateEnvConfig(pluginConfig as any);

    // Append to .env file
    const envPath = path.join(projectPath, '.env');
    if (await fsExtra.pathExists(envPath)) {
      const existingContent = await fsExtra.readFile(envPath, 'utf8');
      await fsExtra.writeFile(envPath, `${existingContent}\n${envContent}`);
    } else {
      await fsExtra.writeFile(envPath, envContent);
    }
  }

  private async generateUnifiedInterfaceFiles(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Generating unified interface files...');

    // Create UI library directory
    const uiLibDir = path.join(projectPath, 'src', 'lib', 'ui');
    await fsExtra.ensureDir(uiLibDir);

    // Generate unified interface
    const unifiedContent = ChakraUIGenerator.generateUnifiedIndex();
    await fsExtra.writeFile(
      path.join(uiLibDir, 'index.ts'),
      unifiedContent
    );
  }
} 