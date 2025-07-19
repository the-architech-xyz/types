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

      // Step 1: Get the Shadcn/ui plugin
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

      // Step 2: Prepare plugin context
      const pluginContext = {
        ...context,
        pluginId: 'shadcn-ui',
        pluginConfig: this.getPluginConfig(context),
        installedPlugins: [],
        projectType: ProjectType.NEXTJS,
        targetPlatform: [TargetPlatform.WEB]
      };

      // Step 3: Validate plugin compatibility
      const validation = await shadcnPlugin.validate(pluginContext);
      if (!validation.valid) {
        return this.createErrorResult(
          'PLUGIN_VALIDATION_FAILED',
          'Shadcn/ui plugin validation failed',
          validation.errors
        );
      }

      // Step 4: Execute the plugin
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

    // Check if UI package exists
    const uiPackagePath = path.join(context.projectPath, 'packages', 'ui');
    if (!await fsExtra.pathExists(uiPackagePath)) {
      errors.push({
        field: 'uiPackage',
        message: 'UI package directory does not exist',
        code: 'UI_PACKAGE_NOT_FOUND',
        severity: 'error'
      });
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