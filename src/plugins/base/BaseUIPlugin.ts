/**
 * Base UI Plugin Class
 * 
 * Provides common functionality for all UI library plugins.
 */

import { BasePlugin } from './BasePlugin.js';
import { UIPluginConfig, IUIPlugin, UILibrary, ComponentOption, ThemeOption, StylingOption, ParameterSchema } from '../../types/plugin-interfaces.js';
import { PluginContext } from '../../types/plugin.js';
import { DynamicQuestionGenerator } from '../../core/expert/dynamic-question-generator.js';
import { ValidationResult } from '../../types/agent.js';
import { PluginCategory } from '../../types/plugin.js';
import * as fs from 'fs-extra';

export abstract class BaseUIPlugin extends BasePlugin implements IUIPlugin {
  private questionGenerator: DynamicQuestionGenerator;

  constructor() {
    super();
    this.questionGenerator = new DynamicQuestionGenerator();
  }
  // --- Abstract Methods for Plugin to Implement ---
  abstract getUILibraries(): UILibrary[];
  abstract getComponentOptions(): ComponentOption[];
  abstract getThemeOptions(): ThemeOption[];
  abstract getStylingOptions(): StylingOption[];

  // --- Shared Logic ---
  protected getBaseUISchema(): ParameterSchema {
    return {
      category: PluginCategory.UI_LIBRARY,
      parameters: [{
        id: 'library',
        name: 'library',
        type: 'select',
        description: 'Select UI Library',
        required: true,
        options: this.getUILibraries().map(l => ({ value: l, label: this.getLibraryLabel(l) }))
      }],
      groups: [],
      dependencies: [],
      validations: []
    };
  }

  protected async setupThemeProvider(context: PluginContext, providerImport: string, providerWrapperStart: string, providerWrapperEnd: string): Promise<void> {
    const layoutPath = this.pathResolver.getRootLayoutPath();
    if (!await this.fileExists(layoutPath)) {
      context.logger.warn(`Could not find root layout file at ${layoutPath}. Skipping ThemeProvider injection.`);
      return;
    }

    let content = await fs.readFile(layoutPath, 'utf8');
    
    // Add import statement if it doesn't exist
    if (!content.includes(providerImport)) {
      content = `${providerImport}\n${content}`;
    }

    // Wrap children in provider
    content = content.replace(
      /(<body.*?>)([\s\S]*?)(<\/body>)/,
      `$1\n  ${providerWrapperStart}\n$2\n  ${providerWrapperEnd}\n$3`
    );

    await this.generateFile(layoutPath, content);
  }

  protected async configureStyling(config: UIPluginConfig): Promise<void> {
    // Example for TailwindCSS, can be extended
    if (config.styling.approach === StylingOption.TAILWIND) {
      const tailwindConfigPath = this.pathResolver.getConfigPath('tailwind.config.js');
      // Logic to modify tailwind config
    }
  }

  getDynamicQuestions(context: PluginContext): any[] {
    return this.questionGenerator.generateQuestions(this, context);
  }

  validateConfiguration(config: Record<string, any>): ValidationResult {
    // Basic validation, can be extended by child classes
    return this.validateRequiredConfig(config, ['library']);
  }

  // --- Abstract helpers for schema ---
  protected abstract getLibraryLabel(library: UILibrary): string;
} 