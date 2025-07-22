/**
 * Next.js Framework Plugin - Pure Technology Implementation
 * 
 * Provides Next.js framework integration using the official create-next-app CLI.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */

import { BaseFrameworkPlugin } from '../../../base/index.js';
import { PluginContext, PluginResult, PluginMetadata, PluginCategory } from '../../../../types/plugin.js';
import { FrameworkPluginConfig, FrameworkOption, BuildOption, DeploymentOption, ParameterSchema, UnifiedInterfaceTemplate } from '../../../../types/plugin-interfaces.js';
import { NextJSSchema } from './NextJSSchema.js';
import { NextJSGenerator } from './NextJSGenerator.js';

export class NextJSPlugin extends BaseFrameworkPlugin {
  private generator: NextJSGenerator;

  constructor() {
    super();
    this.generator = new NextJSGenerator();
  }

  // ============================================================================
  // METADATA
  // ============================================================================

  getMetadata(): PluginMetadata {
    return {
      id: 'nextjs',
      name: 'Next.js Framework',
      version: '1.0.0',
      description: 'React framework for production with App Router, Server Components, and TypeScript',
      author: 'The Architech Team',
      category: PluginCategory.FRAMEWORK,
      tags: ['react', 'nextjs', 'typescript', 'app-router', 'server-components'],
      license: 'MIT',
    };
  }
  
  // ============================================================================
  // ABSTRACT METHOD IMPLEMENTATIONS
  // ============================================================================

  getParameterSchema(): ParameterSchema {
    return NextJSSchema.getParameterSchema();
  }

  getFrameworkOptions(): FrameworkOption[] {
    return NextJSSchema.getFrameworkOptions();
  }

  getBuildOptions(): BuildOption[] {
    return NextJSSchema.getBuildOptions();
  }

  getDeploymentOptions(): DeploymentOption[] {
    return NextJSSchema.getDeploymentOptions();
  }

  generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate {
    return {
        category: PluginCategory.FRAMEWORK,
        exports: [], types: [], utilities: [], constants: [],
        documentation: 'Next.js framework integration',
    };
  }
  
  // ============================================================================
  // MAIN INSTALL METHOD
  // ============================================================================

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    const config = context.pluginConfig as FrameworkPluginConfig;

    try {
      // 1. Generate all file contents
      const allFiles = this.generator.generateAllFiles(config);
      
      // 2. Use BasePlugin methods to write files
      for (const file of allFiles) {
        const filePath = this.pathResolver.getConfigPath(file.path);
        await this.generateFile(filePath, file.content);
      }

      // 3. Add dependencies
      await this.installDependencies(
        ['next', 'react', 'react-dom'],
        ['@types/node', '@types/react', '@types/react-dom', 'eslint', 'eslint-config-next', 'tailwindcss', 'autoprefixer', 'postcss']
      );

      // 4. Add scripts
      const scripts = this.generator.generateScripts(config);
      await this.addScripts(scripts);

      return this.createSuccessResult([], [], [], [], [], startTime);

    } catch (error: any) {
      return this.createErrorResult('Next.js installation failed', [error], startTime);
    }
  }
} 