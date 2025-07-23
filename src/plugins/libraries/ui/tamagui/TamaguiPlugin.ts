/**
 * Tamagui Plugin - Pure Technology Implementation
 * 
 * Provides Tamagui UI framework integration.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */

import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginContext, PluginResult, PluginMetadata, PluginCategory, IUIPlugin, UnifiedInterfaceTemplate } from '../../../../types/plugins.js';
import { TamaguiSchema } from './TamaguiSchema.js';
import { TamaguiGenerator } from './TamaguiGenerator.js';

export class TamaguiPlugin extends BasePlugin implements IUIPlugin {
  private generator: TamaguiGenerator;

  constructor() {
    super();
    this.generator = new TamaguiGenerator();
  }

  // ============================================================================
  // METADATA
  // ============================================================================

  getMetadata(): PluginMetadata {
    return {
      id: 'tamagui',
      name: 'Tamagui',
      version: '1.0.0',
      description: 'Universal React Native & Web UI kit',
      author: 'The Architech Team',
      category: PluginCategory.UI_LIBRARY,
      tags: ['ui', 'components', 'design-system', 'react-native', 'web', 'universal'],
      license: 'MIT',
    };
  }

  // ============================================================================
  // ENHANCED PLUGIN INTERFACE IMPLEMENTATION
  // ============================================================================

  getParameterSchema() {
    return TamaguiSchema.getParameterSchema();
  }

  // Plugins NEVER generate questions - agents handle this
  getDynamicQuestions(context: PluginContext): any[] {
    return [];
  }

  validateConfiguration(config: Record<string, any>): any {
    const errors: any[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!config.components || config.components.length === 0) {
        errors.push({
        field: 'components',
        message: 'At least one component is required',
        code: 'MISSING_FIELD',
          severity: 'error'
        });
      }

    // Validate platform configuration
    if (config.platforms && !Array.isArray(config.platforms)) {
      warnings.push('Platforms should be an array');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate {
    return {
      category: PluginCategory.UI_LIBRARY,
      exports: [
        {
          name: 'Button',
          type: 'class',
          implementation: 'Tamagui Button component',
          documentation: 'Universal button component for web and native',
          examples: ['<Button>Click me</Button>']
        },
        {
          name: 'Text',
          type: 'class',
          implementation: 'Tamagui Text component',
          documentation: 'Universal text component for web and native',
          examples: ['<Text>Hello World</Text>']
        }
      ],
      types: [
        {
          name: 'TamaguiConfig',
          type: 'interface',
          definition: 'interface TamaguiConfig { themes: Record<string, any>; tokens: Record<string, any>; }',
          documentation: 'Tamagui configuration interface'
        }
      ],
      utilities: [
        {
          name: 'createTamagui',
          type: 'function',
          implementation: 'Create Tamagui configuration',
          documentation: 'Create Tamagui configuration for universal UI',
          parameters: [],
          returnType: 'TamaguiConfig',
          examples: ['const config = createTamagui({ themes, tokens })']
        }
      ],
      constants: [
        {
          name: 'tamaguiConfig',
          value: 'createTamagui(config)',
          documentation: 'Tamagui configuration instance',
          type: 'TamaguiConfig'
        }
      ],
      documentation: 'Tamagui universal UI kit integration'
    };
  }

  // ============================================================================
  // UI PLUGIN INTERFACE IMPLEMENTATION
  // ============================================================================

  getUILibraries(): string[] {
    return ['tamagui'];
  }

  getComponentOptions(): string[] {
    return ['button', 'text', 'card', 'input', 'select', 'dialog', 'form', 'list'];
  }

  getThemeOptions(): string[] {
    return ['light', 'dark', 'system'];
  }

  getStylingOptions(): string[] {
    return ['tamagui', 'styled-components', 'css-modules'];
  }

  // ============================================================================
  // PLUGIN INSTALLATION
  // ============================================================================

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();

    try {
      // Initialize path resolver
      this.initializePathResolver(context);

      // Get configuration from context
      const config = context.pluginConfig;

      // Validate configuration
      const validation = this.validateConfiguration(config);
      if (!validation.valid) {
        return this.createErrorResult('Configuration validation failed', validation.errors, startTime);
      }

      // Install dependencies
      const dependencies = this.getDependencies();
      const devDependencies = this.getDevDependencies();
      await this.installDependencies(dependencies, devDependencies);

      // Generate files
      const allFiles = this.generator.generateAllFiles(config as any);
      for (const file of allFiles) {
        const filePath = this.pathResolver.getLibPath('ui', file.path.replace('src/lib/ui/', ''));
        await this.generateFile(filePath, file.content);
      }

      // Add scripts
      const scripts = this.generator.generateScripts(config as any);
      await this.addScripts(scripts);

      return this.createSuccessResult(
        [
          { type: 'config', path: 'tamagui.config.ts', description: 'Tamagui configuration' },
          { type: 'components', path: 'src/components/ui', description: 'Tamagui components' },
          { type: 'interface', path: this.pathResolver.getUnifiedInterfacePath('ui'), description: 'Unified UI interface' }
        ],
        dependencies,
        Object.keys(scripts),
        [],
        validation.warnings,
        startTime
      );

    } catch (error) {
      return this.createErrorResult('Tamagui plugin installation failed', [error], startTime);
    }
  }

  // ============================================================================
  // DEPENDENCIES AND CONFIGURATION
  // ============================================================================

  getDependencies(): string[] {
    return ['tamagui', '@tamagui/core', '@tamagui/config'];
  }

  getDevDependencies(): string[] {
    return ['@tamagui/babel-plugin', '@tamagui/vite-plugin'];
  }

  getCompatibility(): any {
    return {
      frameworks: ['nextjs', 'react', 'react-native'],
      platforms: ['node', 'browser', 'mobile'],
      nodeVersions: ['>=16.0.0'],
      packageManagers: ['npm', 'yarn', 'pnpm'],
      conflicts: ['shadcn-ui', 'mui', 'chakra-ui']
    };
  }

  getConflicts(): string[] {
    return ['shadcn-ui', 'mui', 'chakra-ui'];
  }

  getRequirements(): any[] {
    return [
      { type: 'framework', name: 'React or React Native' },
      { type: 'node', version: '>=16.0.0' }
    ];
  }

  getDefaultConfig(): Record<string, any> {
    return {
      components: ['button', 'text'],
      platforms: ['web'],
      theme: 'light'
    };
  }

  getConfigSchema(): any {
    return {
      type: 'object',
      properties: {
        components: { type: 'array', items: { type: 'string' } },
        platforms: { type: 'array', items: { type: 'string' } },
        theme: { type: 'string', enum: ['light', 'dark', 'system'] }
      },
      required: ['components']
    };
  }
} 