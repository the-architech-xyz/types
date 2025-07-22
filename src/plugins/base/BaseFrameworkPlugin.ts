import { BasePlugin } from './BasePlugin.js';
import { PluginContext, PluginResult, PluginMetadata, PluginCategory } from '../../types/plugin.js';
import { FrameworkPluginConfig, FrameworkOption, BuildOption, DeploymentOption, ParameterSchema, UnifiedInterfaceTemplate } from '../../types/plugin-interfaces.js';

export abstract class BaseFrameworkPlugin extends BasePlugin {
  
  // ============================================================================
  // ABSTRACT METHODS - Must be implemented by child classes
  // ============================================================================

  abstract getFrameworkOptions(): FrameworkOption[];
  abstract getBuildOptions(): BuildOption[];
  abstract getDeploymentOptions(): DeploymentOption[];

  // ============================================================================
  // SHARED LOGIC - Common framework functionality
  // ============================================================================

  getBaseFrameworkSchema(): ParameterSchema {
    return {
      category: PluginCategory.FRAMEWORK,
      groups: [
        { id: 'core', name: 'Core Framework', description: 'Configure the main framework settings.', order: 1, parameters: ['framework', 'typescript', 'eslint'] },
        { id: 'build', name: 'Build Configuration', description: 'Configure build and bundling options.', order: 2, parameters: ['buildTool', 'optimization'] },
        { id: 'deployment', name: 'Deployment', description: 'Configure deployment and hosting options.', order: 3, parameters: ['deploymentPlatform'] },
      ],
      parameters: [
        {
          id: 'framework',
          name: 'Framework',
          type: 'select',
          description: 'The main framework to use.',
          required: true,
          default: 'nextjs',
          options: this.getFrameworkOptions().map(opt => ({ value: opt.value, label: opt.label })),
          group: 'core'
        },
        {
          id: 'typescript',
          name: 'TypeScript',
          type: 'boolean',
          description: 'Enable TypeScript support.',
          required: true,
          default: true,
          group: 'core'
        },
        {
          id: 'eslint',
          name: 'ESLint',
          type: 'boolean',
          description: 'Enable ESLint for code linting.',
          required: true,
          default: true,
          group: 'core'
        },
        {
          id: 'buildTool',
          name: 'Build Tool',
          type: 'select',
          description: 'The build tool to use.',
          required: true,
          default: 'vite',
          options: this.getBuildOptions().map(opt => ({ value: opt.value, label: opt.label })),
          group: 'build'
        },
        {
          id: 'optimization',
          name: 'Optimization',
          type: 'boolean',
          description: 'Enable build optimizations.',
          required: true,
          default: true,
          group: 'build'
        },
        {
          id: 'deploymentPlatform',
          name: 'Deployment Platform',
          type: 'select',
          description: 'The platform to deploy to.',
          required: false,
          default: 'vercel',
          options: this.getDeploymentOptions().map(opt => ({ value: opt.value, label: opt.label })),
          group: 'deployment'
        }
      ],
      dependencies: [],
      validations: []
    };
  }

  generateFrameworkConfig(config: FrameworkPluginConfig): Record<string, any> {
    return {
      framework: config.framework,
      typescript: config.typescript,
      eslint: config.eslint,
      buildTool: config.buildTool,
      optimization: config.optimization,
      deploymentPlatform: config.deploymentPlatform
    };
  }

  addFrameworkScripts(config: FrameworkPluginConfig): Record<string, string> {
    const scripts: Record<string, string> = {
      'dev': 'next dev',
      'build': 'next build',
      'start': 'next start',
      'lint': 'next lint'
    };

    if (config.typescript) {
      scripts['type-check'] = 'tsc --noEmit';
    }

    return scripts;
  }

  // ============================================================================
  // IMPLEMENTED METHODS FROM IEnhancedPlugin
  // ============================================================================

  getDynamicQuestions(context: PluginContext): any[] {
    // Framework plugins typically don't need dynamic questions
    return [];
  }

  validateConfiguration(config: Record<string, any>): any {
    const errors: any[] = [];
    const warnings: string[] = [];

    if (!config.framework) {
      errors.push({
        field: 'framework',
        message: 'Framework is required',
        code: 'MISSING_FRAMEWORK',
        severity: 'error'
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
} 