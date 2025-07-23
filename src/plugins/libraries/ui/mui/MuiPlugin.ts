/**
 * MUI (Material-UI) Plugin - Pure Technology Implementation
 * 
 * Provides MUI component library integration using the latest v6.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */

import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginContext, PluginResult, PluginMetadata, PluginCategory, IUIPlugin, UnifiedInterfaceTemplate } from '../../../../types/plugins.js';
import { MuiSchema } from './MuiSchema.js';
import { MuiGenerator } from './MuiGenerator.js';

export class MuiPlugin extends BasePlugin implements IUIPlugin {
  private generator: MuiGenerator;

  constructor() {
    super();
    this.generator = new MuiGenerator();
  }

  // ============================================================================
  // METADATA
  // ============================================================================

  getMetadata(): PluginMetadata {
    return {
      id: 'mui',
      name: 'Material-UI (MUI)',
      version: '1.0.0',
      description: 'React component library implementing Google\'s Material Design',
      author: 'The Architech Team',
      category: PluginCategory.UI_LIBRARY,
      tags: ['ui', 'components', 'material-design', 'react', 'enterprise'],
      license: 'MIT',
    };
  }

  // ============================================================================
  // ENHANCED PLUGIN INTERFACE IMPLEMENTATION
  // ============================================================================

  getParameterSchema() {
    return MuiSchema.getParameterSchema();
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

    // Validate theme configuration
    if (config.theme && !['light', 'dark', 'system'].includes(config.theme)) {
      warnings.push('Theme should be one of: light, dark, system');
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
          implementation: 'MUI Button component',
          documentation: 'Material Design button component',
          examples: ['<Button variant="contained">Click me</Button>']
        },
        {
          name: 'TextField',
          type: 'class',
          implementation: 'MUI TextField component',
          documentation: 'Material Design text input component',
          examples: ['<TextField label="Email" variant="outlined" />']
        }
      ],
      types: [
        {
          name: 'Theme',
          type: 'interface',
          definition: 'interface Theme { palette: Palette; typography: Typography; }',
          documentation: 'MUI theme interface'
        }
      ],
      utilities: [
        {
          name: 'createTheme',
          type: 'function',
          implementation: 'Create MUI theme',
          documentation: 'Create a custom Material-UI theme',
          parameters: [],
          returnType: 'Theme',
          examples: ['const theme = createTheme({ palette: { mode: "dark" } })']
        }
      ],
      constants: [
        {
          name: 'DEFAULT_THEME',
          value: 'createTheme()',
          documentation: 'Default Material-UI theme',
          type: 'Theme'
        }
      ],
      documentation: 'Material-UI component library integration'
    };
  }

  // ============================================================================
  // UI PLUGIN INTERFACE IMPLEMENTATION
  // ============================================================================

  getUILibraries(): string[] {
    return ['mui'];
  }

  getComponentOptions(): string[] {
    return ['button', 'textfield', 'card', 'dialog', 'appbar', 'drawer', 'form', 'table'];
  }

  getThemeOptions(): string[] {
    return ['light', 'dark', 'system'];
  }

  getStylingOptions(): string[] {
    return ['emotion', 'styled-components', 'css-modules'];
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
          { type: 'config', path: 'theme.ts', description: 'MUI theme configuration' },
          { type: 'components', path: 'src/components/ui', description: 'MUI components' },
          { type: 'interface', path: this.pathResolver.getUnifiedInterfacePath('ui'), description: 'Unified UI interface' }
        ],
        dependencies,
        Object.keys(scripts),
        [],
        validation.warnings,
        startTime
      );

    } catch (error) {
      return this.createErrorResult('MUI plugin installation failed', [error], startTime);
    }
  }

  // ============================================================================
  // DEPENDENCIES AND CONFIGURATION
  // ============================================================================

  getDependencies(): string[] {
    return ['@mui/material', '@emotion/react', '@emotion/styled'];
  }

  getDevDependencies(): string[] {
    return ['@mui/icons-material', '@types/react', '@types/react-dom'];
  }

  getCompatibility(): any {
    return {
      frameworks: ['nextjs', 'react', 'vue'],
      platforms: ['node', 'browser'],
      nodeVersions: ['>=16.0.0'],
      packageManagers: ['npm', 'yarn', 'pnpm'],
      conflicts: ['shadcn-ui', 'chakra-ui', 'antd']
    };
  }

  getConflicts(): string[] {
    return ['shadcn-ui', 'chakra-ui', 'antd'];
  }

  getRequirements(): any[] {
    return [
      { type: 'framework', name: 'React' },
      { type: 'node', version: '>=16.0.0' }
    ];
  }

  getDefaultConfig(): Record<string, any> {
    return {
      components: ['button', 'textfield'],
      theme: 'light',
      styling: 'emotion'
    };
  }

  getConfigSchema(): any {
    return {
      type: 'object',
      properties: {
        components: { type: 'array', items: { type: 'string' } },
        theme: { type: 'string', enum: ['light', 'dark', 'system'] },
        styling: { type: 'string', enum: ['emotion', 'styled-components', 'css-modules'] }
      },
      required: ['components']
    };
  }
} 