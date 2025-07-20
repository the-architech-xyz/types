/**
 * UI Agent - Design System Orchestrator
 * 
 * The brain for UI/design system decisions and plugin orchestration.
 * Handles user interaction, decision making, and coordinates UI plugins through unified interfaces.
 * Pure orchestrator - no direct installation logic.
 */

import { IAgent, AgentContext, AgentResult, AgentMetadata, AgentCategory, ValidationResult, AgentCapability, CapabilityCategory } from '../types/agent.js';
import { PluginSystem } from '../core/plugin/plugin-system.js';
import { AbstractAgent } from './base/abstract-agent.js';
import { ProjectType, TargetPlatform } from '../types/plugin.js';
import { TemplateService, templateService } from '../core/templates/template-service.js';
import { globalRegistry, globalAdapterFactory } from '../types/unified-registry.js';
import { UnifiedUI } from '../types/unified.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { PluginContext } from '../types/plugin.js';
import inquirer from 'inquirer';
import chalk from 'chalk';

interface UIConfig {
  designSystem: 'shadcn-ui' | 'tamagui' | 'chakra-ui' | 'mui';
  theme: 'light' | 'dark' | 'auto';
  components: string[];
  styling: 'tailwind' | 'css-modules' | 'styled-components';
}

export class UIAgent extends AbstractAgent {
  private pluginSystem: PluginSystem;

  constructor() {
    super();
    this.pluginSystem = PluginSystem.getInstance();
  }

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
        name: 'ui-setup',
        description: 'Setup UI/design system with unified interfaces',
        category: CapabilityCategory.SETUP,
        parameters: [
          {
            name: 'designSystem',
            type: 'string',
            description: 'Design system to use',
            required: false,
            defaultValue: 'shadcn-ui'
          },
          {
            name: 'theme',
            type: 'string',
            description: 'Theme mode',
            required: false,
            defaultValue: 'auto'
          },
          {
            name: 'components',
            type: 'array',
            description: 'Components to install',
            required: false,
            defaultValue: ['button', 'input', 'card', 'form']
          },
          {
            name: 'styling',
            type: 'string',
            description: 'Styling approach',
            required: false,
            defaultValue: 'tailwind'
          }
        ],
        examples: [
          {
            name: 'Setup Shadcn/ui',
            description: 'Creates UI setup with Shadcn/ui components using unified interfaces',
            parameters: { designSystem: 'shadcn-ui', theme: 'auto' },
            expectedResult: 'Complete UI setup with Shadcn/ui via unified interface'
          },
          {
            name: 'Setup Tamagui',
            description: 'Creates UI setup with Tamagui components using unified interfaces',
            parameters: { designSystem: 'tamagui', theme: 'dark' },
            expectedResult: 'UI setup with Tamagui via unified interface'
          }
        ]
      },
      {
        name: 'ui-validation',
        description: 'Validate UI setup',
        category: CapabilityCategory.VALIDATION,
        parameters: [],
        examples: [
          {
            name: 'Validate UI setup',
            description: 'Validates the UI setup using unified interfaces',
            parameters: {},
            expectedResult: 'UI setup validation report'
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
      const result = await this.executeUIPluginUnified(context, selectedPlugin, uiConfig, installPath);

      // Validate the setup using unified interface
      await this.validateUISetupUnified(context, selectedPlugin, installPath);

      const duration = Date.now() - startTime;
      
      return {
        success: true,
        artifacts: result.artifacts || [],
        data: {
          plugin: selectedPlugin,
          installPath,
          designSystem: uiConfig.designSystem,
          theme: uiConfig.theme,
          unifiedInterface: true
        },
        errors: [],
        warnings: result.warnings || [],
        duration
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      context.logger.error(`UI setup failed: ${errorMessage}`);
      
      return this.createErrorResult(
        'UI_SETUP_FAILED',
        `Failed to setup UI: ${errorMessage}`,
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
    const baseValidation = await super.validate(context);
    
    if (!baseValidation.valid) {
      return baseValidation;
    }

    const errors: any[] = [];
    const warnings: string[] = [];

    // Check if UI package exists (but don't fail if it doesn't - we'll create it)
    const packagePath = this.getPackagePath(context, 'ui');
    if (!await fsExtra.pathExists(packagePath)) {
      warnings.push(`UI package directory will be created at: ${packagePath}`);
    }

    // Check if Shadcn/ui plugin is available
    const shadcnPlugin = this.pluginSystem.getRegistry().get('shadcn-ui');
    if (!shadcnPlugin) {
      errors.push({
        field: 'plugin',
        message: 'Shadcn/ui plugin not found in registry',
        code: 'PLUGIN_NOT_FOUND',
        severity: 'error'
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private getPackagePath(context: AgentContext, packageName: string): string {
    const isMonorepo = context.projectStructure?.type === 'monorepo';
    
    if (isMonorepo) {
      return path.join(context.projectPath, 'packages', packageName);
    } else {
      // For single-app, install in the root directory (Next.js project)
      return context.projectPath;
    }
  }

  private async ensurePackageDirectory(context: AgentContext, packageName: string, packagePath: string): Promise<void> {
    const isMonorepo = context.projectStructure?.type === 'monorepo';
    
    if (isMonorepo) {
      // Create package directory and basic structure
      await fsExtra.ensureDir(packagePath);
      
      // Create package.json for the UI package
      const packageJson = {
        name: `@${context.projectName}/${packageName}`,
        version: "0.1.0",
        private: true,
        main: "./index.ts",
        types: "./index.ts",
        scripts: {
          "build": "tsc",
          "dev": "tsc --watch",
          "lint": "eslint . --ext .ts,.tsx"
        },
        dependencies: {},
        devDependencies: {
          "typescript": "^5.0.0"
        }
      };
      
      await fsExtra.writeJSON(path.join(packagePath, 'package.json'), packageJson, { spaces: 2 });
      
      // Create index.ts
      await fsExtra.writeFile(path.join(packagePath, 'index.ts'), `// ${packageName} package exports\n`);
      
      // Create tsconfig.json
      const tsconfig = {
        extends: "../../tsconfig.json",
        compilerOptions: {
          outDir: "./dist",
          rootDir: "."
        },
        include: ["./**/*"],
        exclude: ["node_modules", "dist"]
      };
      
      await fsExtra.writeJSON(path.join(packagePath, 'tsconfig.json'), tsconfig, { spaces: 2 });
      
      context.logger.info(`Created ${packageName} package at: ${packagePath}`);
    } else {
      // For single-app, just ensure the directory exists (Next.js project already has structure)
      await fsExtra.ensureDir(packagePath);
      context.logger.info(`Using existing Next.js project at: ${packagePath}`);
    }
  }

  // ============================================================================
  // PLUGIN SELECTION
  // ============================================================================

  private async selectUIPlugin(context: AgentContext): Promise<string> {
    // Get plugin selection from context to determine which UI to use
    const pluginSelection = context.state.get('pluginSelection') as any;
    const selectedUI = pluginSelection?.ui?.type;
    
    if (selectedUI && selectedUI !== 'none') {
      // Map plugin selection UI types to actual plugin system IDs
      const uiMapping: Record<string, string> = {
        'shadcn': 'shadcn-ui',
        'radix': 'shadcn-ui', // Radix is included with shadcn-ui
        'none': 'shadcn-ui'
      };
      const actualPluginId = uiMapping[selectedUI] || 'shadcn-ui';
      context.logger.info(`Using user selection for UI: ${selectedUI} -> ${actualPluginId}`);
      return actualPluginId;
    }
    
    // Check if user has specified a preference
    const userPreference = context.state.get('uiTechnology');
    if (userPreference) {
      context.logger.info(`Using user preference for UI: ${userPreference}`);
      return userPreference;
    }

    // Check if project has specified UI technology
    const projectUI = context.config.ui?.technology;
    if (projectUI) {
      context.logger.info(`Using project UI technology: ${projectUI}`);
      return projectUI;
    }

    // Default to Shadcn/ui for Next.js projects
    context.logger.info('Using default UI technology: shadcn-ui');
    return 'shadcn-ui';
  }

  private getAvailableUIPlugins(): any[] {
    const registry = this.pluginSystem.getRegistry();
    const allPlugins = registry.getAll();
    
    return allPlugins.filter(plugin => {
      const metadata = plugin.getMetadata();
      return metadata.category === 'ui-library' || metadata.category === 'design-system';
    });
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private async getUIConfig(context: AgentContext): Promise<UIConfig> {
    // Get configuration from context or use defaults
    const userConfig = context.config.ui || {};
    
    return {
      designSystem: userConfig.designSystem || 'shadcn-ui',
      styling: userConfig.styling || 'tailwind',
      theme: userConfig.theme || 'auto',
      components: userConfig.components || ['button', 'card', 'input', 'form']
    };
  }

  private async executeUIPluginUnified(
    context: AgentContext,
    pluginName: string,
    uiConfig: UIConfig,
    installPath: string
  ): Promise<any> {
    try {
      context.logger.info(`Starting unified execution of ${pluginName} plugin...`);
      
      // Get the selected plugin
      const plugin = this.pluginSystem.getRegistry().get(pluginName);
      if (!plugin) {
        throw new Error(`${pluginName} plugin not found in registry`);
      }

      context.logger.info(`Found ${pluginName} plugin in registry`);

      // Prepare plugin context with correct path
      const pluginContext: PluginContext = {
        ...context,
        projectPath: installPath,
        pluginId: pluginName,
        pluginConfig: this.getPluginConfig(uiConfig, pluginName),
        installedPlugins: [],
        projectType: ProjectType.NEXTJS,
        targetPlatform: [TargetPlatform.WEB]
      };

      context.logger.info(`Plugin context prepared for ${pluginName}`);

      // Validate plugin compatibility
      context.logger.info(`Validating ${pluginName} plugin...`);
      const validation = await plugin.validate(pluginContext);
      if (!validation.valid) {
        throw new Error(`${pluginName} plugin validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      context.logger.info(`${pluginName} plugin validation passed`);

      // Execute the plugin
      context.logger.info(`Executing ${pluginName} plugin...`);
      const result = await plugin.install(pluginContext);

      if (!result.success) {
        throw new Error(`${pluginName} plugin execution failed: ${result.errors.map(e => e.message).join(', ')}`);
      }

      context.logger.info(`${pluginName} plugin execution completed successfully`);

      // Create unified interface adapter
      context.logger.info(`Creating unified interface adapter for ${pluginName}...`);
      const uiAdapter = await globalAdapterFactory.createUIAdapter(pluginName);
      
      // Register the adapter in the global registry
      globalRegistry.register('ui', pluginName, uiAdapter);
      context.logger.info(`Registered ${pluginName} adapter in unified registry`);

      return result;
    } catch (error) {
      context.logger.error(`Error in executeUIPluginUnified for ${pluginName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  private async validateUISetupUnified(
    context: AgentContext,
    pluginName: string,
    installPath: string
  ): Promise<void> {
    try {
      context.logger.info(`Validating UI setup using unified interface for ${pluginName}...`);

      // Get the unified UI interface
      const uiInterface = globalRegistry.get('ui', pluginName);
      if (!uiInterface) {
        throw new Error(`UI interface not found for ${pluginName}`);
      }

      // Validate design tokens
      context.logger.info('Validating design tokens...');
      if (uiInterface.tokens.colors && uiInterface.tokens.spacing) {
        context.logger.info('Design tokens available');
      }

      // Validate core components
      context.logger.info('Validating core components...');
      const requiredComponents = ['Button', 'Input', 'Card', 'Text', 'Stack', 'Box'];
      for (const componentName of requiredComponents) {
        if (uiInterface.components[componentName as keyof typeof uiInterface.components]) {
          context.logger.info(`${componentName} component available`);
        } else {
          context.logger.warn(`${componentName} component not available`);
        }
      }

      // Validate utility functions
      context.logger.info('Validating utility functions...');
      if (typeof uiInterface.utils.cn === 'function') {
        context.logger.info('Utility functions available');
      }

      // Validate theme management
      context.logger.info('Validating theme management...');
      if (uiInterface.theme.light && uiInterface.theme.dark) {
        context.logger.info('Theme management available');
      }

      context.logger.info('UI setup validation completed successfully');
    } catch (error) {
      context.logger.error(`UI setup validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  private getPluginConfig(uiConfig: UIConfig, pluginName: string): Record<string, any> {
    return {
      components: uiConfig.components,
      includeExamples: true,
      useTypeScript: true,
      yes: true,
      defaults: true
    };
  }

  // ============================================================================
  // ROLLBACK
  // ============================================================================

  async rollback(context: AgentContext): Promise<void> {
    context.logger.info('Rolling back UIAgent changes...');
    
    try {
      const shadcnPlugin = this.pluginSystem.getRegistry().get('shadcn-ui');
      if (shadcnPlugin) {
        const pluginContext = {
          ...context,
          pluginId: 'shadcn-ui',
          pluginConfig: {},
          installedPlugins: [],
          projectType: ProjectType.NEXTJS,
          targetPlatform: [TargetPlatform.WEB]
        };
        
        await shadcnPlugin.uninstall(pluginContext);
        context.logger.success('Shadcn/ui plugin uninstalled');
      }
    } catch (error) {
      context.logger.error(`Failed to rollback UI changes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}