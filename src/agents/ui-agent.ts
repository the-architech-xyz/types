/**
 * UI Agent - Design System Orchestrator
 * 
 * The brain for UI/design system decisions and plugin orchestration.
 * Handles user interaction, decision making, and coordinates UI plugins through unified interfaces.
 * Pure orchestrator - no direct installation logic.
 */

import { existsSync } from 'fs';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { AbstractAgent } from './base/abstract-agent.js';
import { PluginContext, ProjectType, TargetPlatform } from '../types/plugin.js';
import { TemplateService, templateService } from '../core/templates/template-service.js';
import {
  AgentContext,
  AgentResult,
  AgentMetadata,
  AgentCapability,
  AgentCategory,
  CapabilityCategory,
  ValidationResult,
  Artifact,
  ValidationError
} from '../types/agent.js';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { structureService, StructureInfo } from '../core/project/structure-service.js';

interface UIConfig {
  designSystem: 'shadcn-ui' | 'tamagui' | 'chakra-ui' | 'mui' | 'antd' | 'radix';
  theme: 'light' | 'dark' | 'auto';
  components: string[];
  styling: 'tailwind' | 'css-modules' | 'styled-components' | 'emotion';
  features: {
    animations: boolean;
    responsiveDesign: boolean;
    themeCustomization: boolean;
    componentLibrary: boolean;
    iconLibrary: boolean;
    accessibility: boolean;
  };
  animations?: {
    library: 'framer-motion' | 'react-spring' | 'none';
    duration: number;
    easing: string;
  };
  responsiveDesign?: {
    breakpoints: string[];
    mobileFirst: boolean;
    fluidTypography: boolean;
  };
  themeCustomization?: {
    colors: Record<string, string>;
    fonts: Record<string, string>;
    spacing: Record<string, string>;
    borderRadius: Record<string, string>;
  };
  iconLibrary?: {
    provider: 'lucide' | 'heroicons' | 'feather' | 'phosphor';
    includeIcons: string[];
  };
}

export class UIAgent extends AbstractAgent {
  // ============================================================================
  // AGENT METADATA
  // ============================================================================

  protected getAgentMetadata(): AgentMetadata {
    return {
      name: 'UIAgent',
      version: '2.0.0',
      description: 'Orchestrates UI/design system setup using unified interfaces',
      author: 'The Architech Team',
      category: AgentCategory.UI,
      tags: ['ui', 'design-system', 'components', 'unified-interface'],
      dependencies: ['base-project'],
      conflicts: [],
      requirements: [
        {
          type: 'package',
          name: 'fs-extra',
          description: 'File system utilities'
        }
      ],
      license: 'MIT',
      repository: 'https://github.com/the-architech/cli'
    };
  }

  protected getAgentCapabilities(): AgentCapability[] {
    return [
      {
        name: 'UI Setup',
        description: 'Setup UI/design system with unified interfaces',
        category: CapabilityCategory.SETUP,
        parameters: [
          {
            name: 'designSystem',
            type: 'string',
            required: false,
            description: 'UI library to use (shadcn-ui, chakra-ui, mui, tamagui)',
            defaultValue: 'shadcn-ui'
          },
          {
            name: 'theme',
            type: 'string',
            required: false,
            description: 'Theme mode (light, dark, auto)',
            defaultValue: 'auto'
          }
        ]
      },
      {
        name: 'Shadcn/ui Setup',
        description: 'Creates UI setup with Shadcn/ui components using unified interfaces',
        category: CapabilityCategory.SETUP,
        examples: [
          {
            name: 'Basic Shadcn/ui setup',
            description: 'Setup Shadcn/ui with default components',
            parameters: { designSystem: 'shadcn-ui', components: ['button', 'card', 'input'] },
            expectedResult: 'Complete UI setup with Shadcn/ui via unified interface'
          }
        ]
      },
      {
        name: 'Tamagui Setup',
        description: 'Creates UI setup with Tamagui components using unified interfaces',
        category: CapabilityCategory.SETUP,
        examples: [
          {
            name: 'Basic Tamagui setup',
            description: 'Setup Tamagui with default components',
            parameters: { designSystem: 'tamagui', components: ['button', 'card', 'input'] },
            expectedResult: 'UI setup with Tamagui via unified interface'
          }
        ]
      },
      {
        name: 'Advanced UI Features',
        description: 'Creates UI setup with animations and responsive design using unified interfaces',
        category: CapabilityCategory.SETUP,
        examples: [
          {
            name: 'Advanced UI setup',
            description: 'Setup UI with animations, responsive design, and accessibility',
            parameters: { 
              designSystem: 'shadcn-ui', 
              features: ['animations', 'responsiveDesign', 'accessibility'] 
            },
            expectedResult: 'Advanced UI setup with animations and responsive design via unified interface'
          }
        ]
      },
      {
        name: 'UI Validation',
        description: 'Validates the UI setup using unified interfaces',
        category: CapabilityCategory.VALIDATION,
        examples: [
          {
            name: 'UI validation',
            description: 'Validate UI setup and unified interface files',
            parameters: { designSystem: 'shadcn-ui' },
            expectedResult: 'UI setup validation completed successfully'
          }
        ]
      }
    ];
  }

  // ============================================================================
  // CORE EXECUTION
  // ============================================================================

  protected async executeInternal(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      context.logger.info('Starting UI/Design System orchestration...');

      // For monorepo, install UI components in the ui package directory
      const isMonorepo = context.projectStructure?.type === 'monorepo';
      let installPath: string;
      
      if (isMonorepo) {
        // Install in the ui package directory (packages/ui)
        installPath = path.join(context.projectPath, 'packages', 'ui');
        context.logger.info(`UI package path: ${installPath}`);
        
        // Ensure the ui package directory exists
        await fsExtra.ensureDir(installPath);
        context.logger.info(`Using ui package directory for UI setup: ${installPath}`);
      } else {
        // For single-app, use the project root
        installPath = context.projectPath;
        context.logger.info(`Using project root for UI setup: ${installPath}`);
      }

      // Select UI plugin based on user preferences or project requirements
      const selectedPlugin = await this.selectUIPlugin(context);

      // Get UI configuration
      const uiConfig = await this.getUIConfig(context);

      // Execute selected UI plugin through unified interface
      context.logger.info(`Executing ${selectedPlugin} plugin through unified interface...`);
      const result = await this.executePlugin(selectedPlugin, context, this.getPluginConfig(uiConfig, selectedPlugin), installPath);

      // Validate the setup using unified interface
      await this.validateUnifiedInterface('ui', context, selectedPlugin);

      const duration = Date.now() - startTime;
      
      return {
        success: true,
        artifacts: result.artifacts || [],
        data: {
          plugin: selectedPlugin,
          designSystem: uiConfig.designSystem,
          theme: uiConfig.theme,
          components: uiConfig.components,
          features: uiConfig.features,
          unifiedInterface: true
        },
        errors: [],
        warnings: result.warnings || [],
        duration
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult(
        'UI_SETUP_FAILED',
        `UI setup failed: ${errorMessage}`,
        [],
        startTime,
        error
      );
    }
  }

  // ============================================================================
  // VALIDATION
  // ============================================================================

  async validate(context: AgentContext): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    // Check if project structure is valid
    if (!context.projectStructure) {
      errors.push({
        field: 'projectStructure',
        message: 'Project structure is required',
        code: 'MISSING_PROJECT_STRUCTURE',
        severity: 'error'
      });
    }

    // Check if required dependencies are available
    const requiredDeps = ['fs-extra', 'path'];
    for (const dep of requiredDeps) {
      try {
        require.resolve(dep);
      } catch {
        errors.push({
          field: 'dependencies',
          message: `Required dependency not found: ${dep}`,
          code: 'MISSING_DEPENDENCY',
          severity: 'error'
        });
      }
    }

    // Check if UI package directory can be created (for monorepo)
    if (context.projectStructure?.type === 'monorepo') {
      const uiPackagePath = path.join(context.projectPath, 'packages', 'ui');
      try {
        await fsExtra.ensureDir(uiPackagePath);
      } catch {
        errors.push({
          field: 'uiPackagePath',
          message: `Cannot create UI package directory: ${uiPackagePath}`,
          code: 'UI_PACKAGE_CREATION_FAILED',
          severity: 'error'
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ============================================================================
  // PLUGIN SELECTION
  // ============================================================================

  private async selectUIPlugin(context: AgentContext): Promise<string> {
    // Check for expert mode first
    if (this.isExpertMode(context)) {
      return await this.selectUIPluginExpertMode(context);
    }

    // Check for template-based selection
    const pluginSelection = context.state.get('pluginSelection') as any;
    if (pluginSelection?.ui?.library) {
      context.logger.info(`Using template-based UI selection: ${pluginSelection.ui.library}`);
      return pluginSelection.ui.library;
    }

    // Check for user preference
    const userPreference = context.state.get('uiTechnology');
    if (userPreference) {
      context.logger.info(`Using user preference for UI: ${userPreference}`);
      return userPreference;
    }

    // Check if project has specified UI technology
    const projectUI = context.config.ui?.designSystem;
    if (projectUI) {
      context.logger.info(`Using project UI technology: ${projectUI}`);
      return projectUI;
    }

    // Default to Shadcn/ui for Next.js projects
    context.logger.info('Using default UI technology: shadcn-ui');
    return 'shadcn-ui';
  }

  private async selectUIPluginExpertMode(context: AgentContext): Promise<string> {
    const { library } = await inquirer.prompt([
      {
        type: 'list',
        name: 'library',
        message: 'Select UI library:',
        choices: [
          { name: 'Shadcn/ui (Recommended)', value: 'shadcn-ui' },
          { name: 'Chakra UI', value: 'chakra-ui' },
          { name: 'Material-UI (MUI)', value: 'mui' },
          { name: 'Tamagui', value: 'tamagui' },
          { name: 'Ant Design', value: 'antd' },
          { name: 'Radix UI (Headless)', value: 'radix' }
        ],
        default: 'shadcn-ui'
      }
    ]);

    return library;
  }

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  private async getUIConfig(context: AgentContext): Promise<UIConfig> {
    // Check for expert mode first
    if (this.isExpertMode(context)) {
      return await this.getUIConfigExpertMode(context);
    }

    // Get configuration from context or use defaults
    const userConfig = context.config.ui || {};
    
    return {
      designSystem: userConfig.designSystem || 'shadcn-ui',
      styling: userConfig.styling || 'tailwind',
      theme: userConfig.theme || 'auto',
      components: userConfig.components || ['button', 'card', 'input', 'form'],
      features: {
        animations: userConfig.features?.animations || false,
        responsiveDesign: userConfig.features?.responsiveDesign || false,
        themeCustomization: userConfig.features?.themeCustomization || false,
        componentLibrary: userConfig.features?.componentLibrary || false,
        iconLibrary: userConfig.features?.iconLibrary || false,
        accessibility: userConfig.features?.accessibility || false,
      },
      animations: userConfig.animations,
      responsiveDesign: userConfig.responsiveDesign,
      themeCustomization: userConfig.themeCustomization,
      iconLibrary: userConfig.iconLibrary,
    };
  }

  private async getUIConfigExpertMode(context: AgentContext): Promise<UIConfig> {
    const baseConfig = context.config.ui || {};
    
    const { designSystem, theme, components, features } = await inquirer.prompt([
      {
        type: 'list',
        name: 'designSystem',
        message: 'Select design system:',
        choices: [
          { name: 'Shadcn/ui', value: 'shadcn-ui' },
          { name: 'Chakra UI', value: 'chakra-ui' },
          { name: 'Material-UI (MUI)', value: 'mui' },
          { name: 'Tamagui', value: 'tamagui' },
          { name: 'Ant Design', value: 'antd' },
          { name: 'Radix UI (Headless)', value: 'radix' }
        ],
        default: baseConfig.designSystem || 'shadcn-ui'
      },
      {
        type: 'list',
        name: 'theme',
        message: 'Select theme mode:',
        choices: [
          { name: 'Light', value: 'light' },
          { name: 'Dark', value: 'dark' },
          { name: 'Auto (system preference)', value: 'auto' }
        ],
        default: baseConfig.theme || 'auto'
      },
      {
        type: 'checkbox',
        name: 'components',
        message: 'Select components to include:',
        choices: [
          { name: 'Button', value: 'button' },
          { name: 'Card', value: 'card' },
          { name: 'Input', value: 'input' },
          { name: 'Form', value: 'form' },
          { name: 'Modal/Dialog', value: 'modal' },
          { name: 'Table', value: 'table' },
          { name: 'Navigation', value: 'navigation' },
          { name: 'Dropdown/Select', value: 'select' },
          { name: 'Checkbox/Radio', value: 'checkbox' },
          { name: 'Switch/Toggle', value: 'switch' },
          { name: 'Badge', value: 'badge' },
          { name: 'Avatar', value: 'avatar' },
          { name: 'Alert/Toast', value: 'alert' }
        ],
        default: baseConfig.components || ['button', 'card', 'input', 'form']
      },
      {
        type: 'checkbox',
        name: 'features',
        message: 'Select advanced features:',
        choices: [
          { name: 'Animations', value: 'animations' },
          { name: 'Responsive Design', value: 'responsiveDesign' },
          { name: 'Theme Customization', value: 'themeCustomization' },
          { name: 'Icon Library', value: 'iconLibrary' },
          { name: 'Accessibility (a11y)', value: 'accessibility' },
          { name: 'Internationalization (i18n)', value: 'internationalization' }
        ],
        default: baseConfig.features || ['responsiveDesign', 'accessibility']
      }
    ]);
    
    return {
      designSystem,
      theme,
      components,
      styling: 'tailwind', // Default to Tailwind for most UI libraries
      features: {
        animations: features.includes('animations'),
        responsiveDesign: features.includes('responsiveDesign'),
        themeCustomization: features.includes('themeCustomization'),
        componentLibrary: true,
        iconLibrary: features.includes('iconLibrary'),
        accessibility: features.includes('accessibility')
      }
    };
  }

  private getPluginConfig(uiConfig: UIConfig, pluginName: string): Record<string, any> {
    const config: Record<string, any> = {
      designSystem: uiConfig.designSystem,
      theme: uiConfig.theme,
      components: uiConfig.components,
      features: uiConfig.features,
      styling: uiConfig.styling,
      useTypeScript: true,
      includeExamples: true
    };

    // Add specific plugin-specific configurations if needed
    if (pluginName === 'shadcn-ui') {
      config.skipDb = true; // Shadcn/ui doesn't need database
      config.skipPlugins = true; // Shadcn/ui handles its own setup
    } else if (pluginName === 'chakra-ui') {
      config.skipDb = true;
      config.skipPlugins = true;
    }

    return config;
  }

  // ============================================================================
  // ROLLBACK
  // ============================================================================

  async rollback(context: AgentContext): Promise<void> {
    context.logger.warn('Rolling back UI setup...');

    try {
      // Get the UI plugin for uninstallation
      const selectedPlugin = this.getSelectedPlugin(context, 'ui');
      const uiPlugin = this.pluginSystem.getRegistry().get(selectedPlugin);
      
      if (uiPlugin) {
        const installPath = context.projectStructure?.type === 'monorepo' 
          ? path.join(context.projectPath, 'packages', 'ui')
          : context.projectPath;
          
        const pluginContext: PluginContext = {
          ...context,
          projectPath: installPath,
          pluginId: selectedPlugin,
          pluginConfig: {},
          installedPlugins: [],
          projectType: ProjectType.NEXTJS,
          targetPlatform: [TargetPlatform.WEB]
        };

        await uiPlugin.uninstall(pluginContext);
      }

      context.logger.success('UI setup rollback completed');
    } catch (error) {
      context.logger.error('UI rollback failed', error as Error);
    }
  }
}