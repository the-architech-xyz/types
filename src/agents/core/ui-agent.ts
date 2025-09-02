/**
 * UI Agent
 * 
 * Handles UI component modules (Shadcn/ui, Chakra UI, etc.)
 * Responsible for setting up UI component libraries
 */

import { SimpleAgent } from '../base/simple-agent.js';
import { Module, ProjectContext, AgentResult } from '../../types/agent.js';
import { PathHandler } from '../../core/services/path/path-handler.js';

export class UIAgent extends SimpleAgent {
  constructor(pathHandler: PathHandler) {
    super('ui', pathHandler);
  }

  /**
   * Execute a UI module
   */
  async execute(module: Module, context: ProjectContext): Promise<AgentResult> {
    console.log(`🎨 UI Agent executing: ${module.id}`);
    
    // Validate module
    const validation = this.validateModule(module);
    if (!validation.valid) {
      return {
        success: false,
        files: [],
        errors: validation.errors,
        warnings: []
      };
    }
    
    // UI-specific validation
    const uiValidation = this.validateUIModule(module);
    if (!uiValidation.valid) {
      return {
        success: false,
        files: [],
        errors: uiValidation.errors,
        warnings: []
      };
    }
    
    // Execute the adapter
    return await this.executeAdapter(module, context);
  }

  /**
   * Validate UI-specific parameters
   */
  private validateUIModule(module: Module): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate UI ID
    const supportedUI = ['shadcn-ui', 'chakra-ui', 'mui', 'antd', 'tailwind-ui'];
    if (!supportedUI.includes(module.id)) {
      errors.push(`Unsupported UI library: ${module.id}. Supported: ${supportedUI.join(', ')}`);
    }
    
    // Validate parameters based on UI library
    if (module.id === 'shadcn-ui') {
      this.validateShadcnUIParameters(module.parameters, errors);
    } else if (module.id === 'chakra-ui') {
      this.validateChakraUIParameters(module.parameters, errors);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate Shadcn/ui specific parameters
   */
  private validateShadcnUIParameters(parameters: Record<string, any>, errors: string[]): void {
    // Shadcn/ui specific validations
    if (parameters.components !== undefined) {
      if (!Array.isArray(parameters.components)) {
        errors.push('Shadcn/ui components parameter must be an array');
      } else {
        const supportedComponents = ['button', 'input', 'card', 'dialog', 'dropdown', 'form', 'table'];
        const invalidComponents = parameters.components.filter((c: string) => !supportedComponents.includes(c));
        if (invalidComponents.length > 0) {
          errors.push(`Unsupported components: ${invalidComponents.join(', ')}. Supported: ${supportedComponents.join(', ')}`);
        }
      }
    }
    
    if (parameters.theme !== undefined) {
      const supportedThemes = ['default', 'dark', 'light'];
      if (!supportedThemes.includes(parameters.theme)) {
        errors.push(`Unsupported theme: ${parameters.theme}. Supported: ${supportedThemes.join(', ')}`);
      }
    }
  }

  /**
   * Validate Chakra UI specific parameters
   */
  private validateChakraUIParameters(parameters: Record<string, any>, errors: string[]): void {
    // Chakra UI specific validations
    if (parameters.colorMode !== undefined) {
      const supportedColorModes = ['light', 'dark', 'system'];
      if (!supportedColorModes.includes(parameters.colorMode)) {
        errors.push(`Unsupported color mode: ${parameters.colorMode}. Supported: ${supportedColorModes.join(', ')}`);
      }
    }
    
    if (parameters.includeIcons !== undefined && typeof parameters.includeIcons !== 'boolean') {
      errors.push('Chakra UI includeIcons parameter must be boolean');
    }
  }
}
