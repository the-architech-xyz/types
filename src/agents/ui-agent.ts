/**
 * UI Agent - Design System Orchestrator
 * 
 * The brain for UI/design system decisions and plugin orchestration.
 * Handles user interaction, decision making, and coordinates the Shadcn/ui plugin.
 * Pure orchestrator - no direct installation logic.
 */

import { IAgent, AgentContext, AgentResult, AgentMetadata, AgentCategory, ValidationResult } from '../types/agent.js';
import { PluginSystem } from '../utils/plugin-system.js';
import { AbstractAgent } from './base/abstract-agent.js';
import { ProjectType, TargetPlatform } from '../types/plugin.js';
import { TemplateService, templateService } from '../utils/template-service.js';
import * as path from 'path';
import fsExtra from 'fs-extra';

export class UIAgent extends AbstractAgent {
  private pluginSystem: PluginSystem;
  private templateService: TemplateService;

  constructor() {
    super();
    this.pluginSystem = PluginSystem.getInstance();
    this.templateService = templateService;
  }

  // ============================================================================
  // AGENT METADATA
  // ============================================================================

  protected getAgentMetadata(): AgentMetadata {
    return {
      name: 'UIAgent',
      version: '2.0.0',
      description: 'UI/Design System orchestrator - coordinates Shadcn/ui plugin installation',
      author: 'The Architech Team',
      category: AgentCategory.UI,
      tags: ['ui', 'design-system', 'orchestrator', 'plugin-coordinator'],
      dependencies: ['BaseProjectAgent'],
      conflicts: [],
      requirements: [
        {
          type: 'package',
          name: 'packages/ui',
          description: 'UI package directory'
        }
      ],
      license: 'MIT',
      repository: 'https://github.com/the-architech/cli'
    };
  }

  protected getAgentCapabilities() {
    return [];
  }

  // ============================================================================
  // CORE EXECUTION
  // ============================================================================

  protected async executeInternal(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      context.logger.info('Starting UI/Design System orchestration...');

      // Step 1: Determine the correct path based on project structure
      const packagePath = this.getPackagePath(context, 'ui');
      context.logger.info(`UI package path: ${packagePath}`);

      // Step 2: Ensure package directory exists
      await this.ensurePackageDirectory(context, 'ui', packagePath);

      // Step 3: Get the Shadcn/ui plugin
      const shadcnPlugin = this.pluginSystem.getRegistry().get('shadcn-ui');
      if (!shadcnPlugin) {
        return this.createErrorResult(
          'PLUGIN_NOT_FOUND',
          'Shadcn/ui plugin not found in registry',
          [{
            field: 'plugin',
            message: 'Shadcn/ui plugin is not registered',
            code: 'PLUGIN_NOT_FOUND',
            severity: 'error'
          }]
        );
      }

      // Step 4: Prepare plugin context with correct path
      const pluginContext = {
        ...context,
        projectPath: packagePath, // Use package path instead of root path
        pluginId: 'shadcn-ui',
        pluginConfig: this.getPluginConfig(context),
        installedPlugins: [],
        projectType: ProjectType.NEXTJS,
        targetPlatform: [TargetPlatform.WEB]
      };

      // Step 5: Validate plugin compatibility
      const validation = await shadcnPlugin.validate(pluginContext);
      if (!validation.valid) {
        return this.createErrorResult(
          'PLUGIN_VALIDATION_FAILED',
          'Shadcn/ui plugin validation failed',
          validation.errors
        );
      }

      // Step 6: Execute the plugin
      context.logger.info('Executing Shadcn/ui plugin...');
      const pluginResult = await shadcnPlugin.install(pluginContext);

      if (!pluginResult.success) {
        return this.createErrorResult(
          'PLUGIN_EXECUTION_FAILED',
          'Shadcn/ui plugin execution failed',
          pluginResult.errors
        );
      }

      const duration = Date.now() - startTime;

      context.logger.success('UI/Design System setup completed successfully');

      return {
        success: true,
        data: {
          plugin: 'shadcn-ui',
          packagePath,
          components: pluginResult.artifacts.length,
          dependencies: pluginResult.dependencies.length
        },
        artifacts: pluginResult.artifacts,
        warnings: pluginResult.warnings,
        duration
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult(
        'UI_ORCHESTRATION_FAILED',
        `UI orchestration failed: ${errorMessage}`,
        [],
        0,
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

  private getPluginConfig(context: AgentContext): Record<string, any> {
    // Get configuration from context or use defaults
    const userConfig = context.config.ui || {};
    
    return {
      components: userConfig.components || ['button', 'card', 'input', 'label', 'dialog'],
      includeExamples: userConfig.includeExamples ?? true,
      useTypeScript: userConfig.useTypeScript ?? true,
      theme: userConfig.theme || 'slate'
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