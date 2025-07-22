/**
 * Shadcn/ui Plugin - Updated with Latest Best Practices
 * 
 * Provides Shadcn/ui design system integration using the official shadcn CLI.
 * Follows latest Shadcn/ui documentation and TypeScript best practices.
 * 
 * References:
 * - https://ui.shadcn.com/docs/installation
 * - https://ui.shadcn.com/docs/components
 * - https://ui.shadcn.com/docs/themes
 */

import { BaseUIPlugin } from '../../../base/index.js';
import { PluginContext, PluginResult, PluginMetadata, PluginCategory } from '../../../../types/plugin.js';
import { UIPluginConfig, UILibrary, ComponentOption, ThemeOption, StylingOption, ParameterSchema, UnifiedInterfaceTemplate } from '../../../../types/plugin-interfaces.js';
import { ShadcnUISchema } from './ShadcnUISchema.js';
import { ShadcnUIGenerator } from './ShadcnUIGenerator.js';

export class ShadcnUIPlugin extends BaseUIPlugin {
  private generator: ShadcnUIGenerator;

  constructor() {
    super();
    this.generator = new ShadcnUIGenerator();
  }

  // ============================================================================
  // METADATA
  // ============================================================================

  getMetadata(): PluginMetadata {
    return {
      id: 'shadcn-ui',
      name: 'Shadcn/UI',
      version: '1.0.0',
      description: 'Beautifully designed components that you can copy and paste into your apps.',
      author: 'The Architech Team',
      category: PluginCategory.DESIGN_SYSTEM,
      tags: ['ui', 'tailwind', 'radix', 'design-system'],
      license: 'MIT',
    };
  }

  // ============================================================================
  // ABSTRACT METHOD IMPLEMENTATIONS
  // ============================================================================

  getParameterSchema(): ParameterSchema {
    return ShadcnUISchema.getParameterSchema();
  }

  getUILibraries(): UILibrary[] {
    return ShadcnUISchema.getUILibraries();
  }

  getComponentOptions(): ComponentOption[] {
    return ShadcnUISchema.getComponentOptions();
  }
  
  getThemeOptions(): ThemeOption[] { return []; }
  getStylingOptions(): StylingOption[] { return []; }

  protected getLibraryLabel(library: UILibrary): string {
    return 'Shadcn/UI';
  }

  generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate {
    const generated = this.generator.generateUnifiedIndex();
    return {
        category: PluginCategory.DESIGN_SYSTEM,
        exports: [], types: [], utilities: [], constants: [],
        documentation: generated.content,
    };
  }
  
  // ============================================================================
  // MAIN INSTALL METHOD
  // ============================================================================

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    const config = context.pluginConfig as UIPluginConfig;

    try {
      // Initialize path resolver first
      this.initializePathResolver(context);

      // 1. Generate all file contents from the "dumb" generator
      const allFiles = this.generator.generateAllFiles(config);
      
      // 2. Use BasePlugin methods to write files
      for (const file of allFiles) {
        let filePath: string;
        if (file.path.startsWith('components/')) {
          filePath = this.pathResolver.getUIComponentPath(file.path.replace('components/', ''));
        } else if (file.path === 'utils.ts') {
          // Correctly call getLibPath with two arguments
          filePath = this.pathResolver.getLibPath('common', 'utils.ts');
        } else if (file.path === 'globals.css') {
            filePath = this.pathResolver.getStylePath(file.path);
        } else {
          filePath = this.pathResolver.getConfigPath(file.path);
        }
        await this.generateFile(filePath, file.content);
      }

      // 3. Add dependencies
      await this.installDependencies(
        ['tailwind-merge', 'class-variance-authority', 'clsx', 'lucide-react', 'tailwindcss-animate'],
        ['tailwindcss', 'postcss', 'autoprefixer']
      );

      // 4. Add scripts (e.g., shadcn-ui cli)
      await this.addScripts({
          "ui:add": "pnpm dlx shadcn-ui@latest add"
      });
      
      // 5. Setup Theme Provider
      await this.setupThemeProvider(
          context, 
          'import { ThemeProvider } from "@/components/theme-provider"',
          'ThemeProvider',
          'attribute="class" defaultTheme="system" enableSystem'
      );

      return this.createSuccessResult([], [], [], [], [], startTime);

    } catch (error: any) {
      return this.createErrorResult('Shadcn/UI installation failed', [error], startTime);
    }
  }
}