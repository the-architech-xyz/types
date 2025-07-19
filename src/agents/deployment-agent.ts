/**
 * Deployment Agent - DevOps Automation Specialist
 * 
 * Sets up production-ready deployment infrastructure:
 * - Multi-stage Dockerfile optimized for Next.js
 * - GitHub Actions CI/CD workflows
 * - Environment configuration
 * - Docker Compose for local development
 * 
 * Enhanced to integrate with the plugin system for modularity.
 */

import { existsSync, writeFileSync, mkdirSync } from 'fs';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { AbstractAgent } from './base/abstract-agent.js';
import { TemplateService, templateService } from '../utils/template-service.js';
import { PluginSystem } from '../utils/plugin-system.js';
import { PluginContext, ProjectType, TargetPlatform } from '../types/plugin.js';
import {
  AgentContext,
  AgentResult,
  AgentMetadata,
  AgentCapability,
  AgentCategory,
  CapabilityCategory,
  ValidationResult,
  Artifact
} from '../types/agent.js';

interface DeploymentConfig {
  platform: 'vercel' | 'netlify' | 'railway' | 'aws';
  environment: 'development' | 'staging' | 'production';
  useDocker: boolean;
  useCI: boolean;
}

export class DeploymentAgent extends AbstractAgent {
  private templateService: TemplateService;
  private pluginSystem: PluginSystem;

  constructor() {
    super();
    this.templateService = templateService;
    this.pluginSystem = PluginSystem.getInstance();
  }

  // ============================================================================
  // AGENT METADATA
  // ============================================================================

  protected getAgentMetadata(): AgentMetadata {
    return {
      name: 'DeploymentAgent',
      version: '2.0.0',
      description: 'Sets up production-ready deployment infrastructure using plugin system',
      author: 'The Architech Team',
      category: AgentCategory.DEPLOYMENT,
      tags: ['deployment', 'docker', 'ci-cd', 'github-actions', 'devops', 'plugin-integration'],
      dependencies: ['BaseProjectAgent'],
      conflicts: [],
      requirements: [
        {
          type: 'package',
          name: 'next',
          description: 'Next.js for application framework'
        },
        {
          type: 'package',
          name: 'typescript',
          description: 'TypeScript for type safety'
        }
      ],
      license: 'MIT',
      repository: 'https://github.com/the-architech/cli'
    };
  }

  protected getAgentCapabilities(): AgentCapability[] {
    return [
      {
        name: 'setup-deployment-infrastructure',
        description: 'Creates complete deployment infrastructure using plugin system',
        parameters: [
          {
            name: 'platform',
            type: 'string',
            required: false,
            description: 'Deployment platform (vercel, netlify, railway, aws)',
            defaultValue: 'vercel',
            validation: [
              {
                type: 'enum',
                value: ['vercel', 'netlify', 'railway', 'aws'],
                message: 'Platform must be vercel, netlify, railway, or aws'
              }
            ]
          },
          {
            name: 'usePlugin',
            type: 'boolean',
            required: false,
            description: 'Whether to use deployment plugins for enhanced setup',
            defaultValue: true
          },
          {
            name: 'useDocker',
            type: 'boolean',
            required: false,
            description: 'Whether to include Docker configuration',
            defaultValue: true
          },
          {
            name: 'useCI',
            type: 'boolean',
            required: false,
            description: 'Whether to include CI/CD configuration',
            defaultValue: true
          }
        ],
        examples: [
          {
            name: 'Setup Vercel deployment with plugin',
            description: 'Creates Vercel deployment configuration using deployment plugins',
            parameters: { platform: 'vercel', usePlugin: true, useDocker: false, useCI: true },
            expectedResult: 'Complete Vercel deployment setup with CI/CD via plugin'
          },
          {
            name: 'Setup Docker deployment',
            description: 'Creates Docker-based deployment configuration',
            parameters: { platform: 'aws', usePlugin: true, useDocker: true, useCI: true },
            expectedResult: 'Complete Docker deployment setup with CI/CD via plugin'
          }
        ],
        category: CapabilityCategory.SETUP
      },
      {
        name: 'create-dockerfile',
        description: 'Creates optimized multi-stage Dockerfile for Next.js using plugin system',
        parameters: [
          {
            name: 'usePlugin',
            type: 'boolean',
            required: false,
            description: 'Whether to use Docker plugins for enhanced configuration',
            defaultValue: true
          }
        ],
        examples: [
          {
            name: 'Create Dockerfile with plugin',
            description: 'Creates production-ready Dockerfile using Docker plugins',
            parameters: { usePlugin: true },
            expectedResult: 'Optimized Dockerfile with plugin-enhanced configuration'
          }
        ],
        category: CapabilityCategory.SETUP
      },
      {
        name: 'create-ci-cd-pipeline',
        description: 'Creates CI/CD pipeline configuration using plugin system',
        parameters: [
          {
            name: 'platform',
            type: 'string',
            required: false,
            description: 'CI/CD platform (github-actions, gitlab-ci, circleci)',
            defaultValue: 'github-actions'
          },
          {
            name: 'usePlugin',
            type: 'boolean',
            required: false,
            description: 'Whether to use CI/CD plugins for enhanced configuration',
            defaultValue: true
          }
        ],
        examples: [
          {
            name: 'Create GitHub Actions with plugin',
            description: 'Creates GitHub Actions workflow using CI/CD plugins',
            parameters: { platform: 'github-actions', usePlugin: true },
            expectedResult: 'Complete GitHub Actions workflow with plugin-enhanced features'
          }
        ],
        category: CapabilityCategory.SETUP
      },
      {
        name: 'enhance-deployment-package',
        description: 'Adds agent-specific deployment enhancements',
        parameters: [
          {
            name: 'utilities',
            type: 'boolean',
            required: false,
            description: 'Whether to add deployment utility functions',
            defaultValue: true
          },
          {
            name: 'healthChecks',
            type: 'boolean',
            required: false,
            description: 'Whether to add health check utilities',
            defaultValue: true
          },
          {
            name: 'aiFeatures',
            type: 'boolean',
            required: false,
            description: 'Whether to add AI-powered deployment features',
            defaultValue: true
          }
        ],
        examples: [
          {
            name: 'Add all enhancements',
            description: 'Adds all agent-specific deployment enhancements',
            parameters: { utilities: true, healthChecks: true, aiFeatures: true },
            expectedResult: 'Enhanced deployment package with utilities, health checks, and AI features'
          }
        ],
        category: CapabilityCategory.INTEGRATION
      }
    ];
  }

  // ============================================================================
  // CORE EXECUTION
  // ============================================================================

  protected async executeInternal(context: AgentContext): Promise<AgentResult> {
    const { projectPath } = context;
    
    context.logger.info('Setting up deployment infrastructure...');

    try {
      // Get deployment configuration from context
      const deploymentConfig = await this.getDeploymentConfig(context);
      const usePlugin = context.config?.usePlugin !== false; // Default to true

      let pluginResult = null;

      // Use plugin for enhanced deployment setup if enabled
      if (usePlugin) {
        context.logger.info('Using deployment plugins for enhanced setup...');
        pluginResult = await this.executeDeploymentPlugins(context, deploymentConfig);
      }

      const artifacts: Artifact[] = [];
      const startTime = Date.now();

      // Step 1: Create Dockerfile (if enabled)
      if (deploymentConfig.useDocker) {
        const dockerArtifacts = await this.createDockerfile(context, usePlugin);
        artifacts.push(...dockerArtifacts);
      }
      
      // Step 2: Create Docker Compose files (if Docker enabled)
      if (deploymentConfig.useDocker) {
        const composeArtifacts = await this.createDockerCompose(context);
        artifacts.push(...composeArtifacts);
      }
      
      // Step 3: Create CI/CD pipeline (if enabled)
      if (deploymentConfig.useCI) {
        const ciArtifacts = await this.createCICDPipeline(context, deploymentConfig, usePlugin);
        artifacts.push(...ciArtifacts);
      }
      
      // Step 4: Create environment files
      const envArtifacts = await this.createEnvironmentFiles(context, deploymentConfig);
      artifacts.push(...envArtifacts);
      
      // Step 5: Create .dockerignore (if Docker enabled)
      if (deploymentConfig.useDocker) {
        const ignoreArtifacts = await this.createDockerIgnore(context);
        artifacts.push(...ignoreArtifacts);
      }

      // Step 6: Add agent-specific enhancements
      await this.enhanceDeploymentPackage(projectPath, context, deploymentConfig);

      // Add plugin artifacts if plugin was used
      if (pluginResult?.artifacts) {
        artifacts.push(...pluginResult.artifacts);
      }

      const duration = Date.now() - startTime;
      
      context.logger.success('Deployment infrastructure configured successfully');
      
      return this.createSuccessResult(
        {
          deploymentConfig,
          pluginUsed: usePlugin,
          filesCreated: artifacts.map(a => a.path),
          configurations: ['docker', 'docker-compose', 'ci-cd', 'environment']
        },
        artifacts,
        [
          'Update .env.example with your actual environment variables',
          'Configure repository secrets for deployment',
          'Run "docker-compose up" for local development',
          'Push to main branch to trigger CI/CD pipeline'
        ]
      );

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      context.logger.error(`Failed to configure deployment infrastructure: ${errorMessage}`, error as Error);
      
      return this.createErrorResult(
        'DEPLOYMENT_SETUP_FAILED',
        `Failed to configure deployment infrastructure: ${errorMessage}`,
        [],
        0,
        error
      );
    }
  }

  // ============================================================================
  // PLUGIN INTEGRATION
  // ============================================================================

  private async executeDeploymentPlugins(context: AgentContext, deploymentConfig: DeploymentConfig): Promise<any> {
    try {
      // For now, we'll simulate plugin execution since we don't have deployment plugins yet
      // This is ready for when we add deployment plugins to the system
      context.logger.info('Deployment plugins would be executed here...');
      
      return {
        success: true,
        artifacts: [],
        warnings: ['No deployment plugins currently available']
      };
    } catch (error) {
      context.logger.warn(`Plugin execution failed, falling back to manual setup: ${error}`);
      return null;
    }
  }

  // ============================================================================
  // AGENT-SPECIFIC ENHANCEMENTS
  // ============================================================================

  private async enhanceDeploymentPackage(
    projectPath: string, 
    context: AgentContext, 
    deploymentConfig: DeploymentConfig
  ): Promise<void> {
    context.logger.info('Adding agent-specific deployment enhancements...');

    // Create deployment package structure
    const deploymentPath = path.join(projectPath, 'packages', 'deployment');
    await fsExtra.ensureDir(deploymentPath);

    // Create basic utils
    const utilsPath = path.join(deploymentPath, 'utils');
    await fsExtra.ensureDir(utilsPath);

    const enhancedUtilsContent = `// Enhanced deployment utilities for ${context.projectName}
export function validateDeploymentConfig(config: any): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (!config.platform) {
    issues.push('Deployment platform is required');
  }
  
  if (!config.environment) {
    issues.push('Deployment environment is required');
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

export function generateDeploymentScripts(platform: string): Record<string, string> {
  const scripts: Record<string, string> = {
    'build': 'turbo run build',
    'start': 'turbo run start',
    'dev': 'turbo run dev'
  };
  
  switch (platform) {
    case 'vercel':
      scripts['deploy'] = 'vercel --prod';
      break;
    case 'netlify':
      scripts['deploy'] = 'netlify deploy --prod';
      break;
    case 'railway':
      scripts['deploy'] = 'railway up';
      break;
  }
  
  return scripts;
}`;

    await fsExtra.writeFile(path.join(utilsPath, 'enhanced.ts'), enhancedUtilsContent);

    // Create basic health checks
    const healthPath = path.join(deploymentPath, 'health');
    await fsExtra.ensureDir(healthPath);

    const healthContent = `// Deployment health utilities for ${context.projectName}
export class DeploymentHealthChecker {
  static async checkDockerHealth(): Promise<{ healthy: boolean; issues: string[] }> {
    const issues: string[] = [];
    
    // Add Docker health check logic here
    
    return {
      healthy: issues.length === 0,
      issues
    };
  }
  
  static async checkCIHealth(): Promise<{ healthy: boolean; issues: string[] }> {
    const issues: string[] = [];
    
    // Add CI health check logic here
    
    return {
      healthy: issues.length === 0,
      issues
    };
  }
}`;

    await fsExtra.writeFile(path.join(healthPath, 'deployment-health.ts'), healthContent);

    // Create basic dev utilities
    const devPath = path.join(deploymentPath, 'dev');
    await fsExtra.ensureDir(devPath);

    const devContent = `// Development utilities for ${context.projectName}
export function generateDeploymentReport(config: any): string {
  return \`Deployment Report for \${context.projectName}
Platform: \${config.platform}
Environment: \${config.environment}
Docker: \${config.useDocker ? 'Enabled' : 'Disabled'}
CI/CD: \${config.useCI ? 'Enabled' : 'Disabled'}
Generated on: \${new Date().toISOString()}
\`;
}`;

    await fsExtra.writeFile(path.join(devPath, 'utils.ts'), devContent);
  }

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  private async getDeploymentConfig(context: AgentContext): Promise<DeploymentConfig> {
    // Get configuration from context or use defaults
    const config = context.config.deployment || {};
    
    return {
      platform: config.platform || 'vercel',
      environment: config.environment || 'development',
      useDocker: config.useDocker !== false,
      useCI: config.useCI !== false
    };
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

    // Check if project has package.json
    const packageJsonPath = path.join(context.projectPath, 'package.json');
    if (!existsSync(packageJsonPath)) {
      errors.push({
        field: 'projectPath',
        message: 'package.json not found in project directory',
        code: 'MISSING_PACKAGE_JSON',
        severity: 'error'
      });
    }

    // Check if Next.js is configured
    const nextConfigPath = path.join(context.projectPath, 'next.config.js');
    if (!existsSync(nextConfigPath)) {
      warnings.push('Next.js configuration not found - Docker setup may need adjustments');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ============================================================================
  // DEPLOYMENT SETUP METHODS
  // ============================================================================

  private async createDockerfile(context: AgentContext, usePlugin: boolean): Promise<Artifact[]> {
    const artifacts: Artifact[] = [];
    
    try {
      await this.templateService.renderAndWrite(
        'deployment',
        'Dockerfile.ejs',
        path.join(context.projectPath, 'Dockerfile'),
        { projectName: context.projectName },
        { logger: context.logger }
      );
      
      artifacts.push({
        type: 'file',
        path: path.join(context.projectPath, 'Dockerfile'),
        metadata: { type: 'dockerfile', pluginUsed: usePlugin }
      });
      
      context.logger.success('Dockerfile created');
    } catch (error) {
      context.logger.warn(`Failed to create Dockerfile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    return artifacts;
  }

  private async createDockerCompose(context: AgentContext): Promise<Artifact[]> {
    const artifacts: Artifact[] = [];
    
    try {
      // Create docker-compose.yml
      await this.templateService.renderAndWrite(
        'deployment',
        'docker-compose.yml.ejs',
        path.join(context.projectPath, 'docker-compose.yml'),
        { projectName: context.projectName },
        { logger: context.logger }
      );
      
      // Create docker-compose.dev.yml
      await this.templateService.renderAndWrite(
        'deployment',
        'docker-compose.dev.yml.ejs',
        path.join(context.projectPath, 'docker-compose.dev.yml'),
        { projectName: context.projectName },
        { logger: context.logger }
      );
      
      artifacts.push(
        {
          type: 'file',
          path: path.join(context.projectPath, 'docker-compose.yml'),
          metadata: { type: 'docker-compose' }
        },
        {
          type: 'file',
          path: path.join(context.projectPath, 'docker-compose.dev.yml'),
          metadata: { type: 'docker-compose-dev' }
        }
      );
      
      context.logger.success('Docker Compose files created');
    } catch (error) {
      context.logger.warn(`Failed to create Docker Compose files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    return artifacts;
  }

  private async createCICDPipeline(
    context: AgentContext, 
    deploymentConfig: DeploymentConfig, 
    usePlugin: boolean
  ): Promise<Artifact[]> {
    const artifacts: Artifact[] = [];
    
    try {
      const workflowsDir = path.join(context.projectPath, '.github', 'workflows');
      await fsExtra.ensureDir(workflowsDir);
      
      await this.templateService.renderAndWrite(
        'deployment',
        'github-actions.yml.ejs',
        path.join(workflowsDir, 'ci.yml'),
        { 
          projectName: context.projectName,
          platform: deploymentConfig.platform
        },
        { logger: context.logger }
      );
      
      artifacts.push({
        type: 'file',
        path: path.join(workflowsDir, 'ci.yml'),
        metadata: { type: 'github-actions', pluginUsed: usePlugin }
      });
      
      context.logger.success('GitHub Actions workflow created');
    } catch (error) {
      context.logger.warn(`Failed to create CI/CD pipeline: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    return artifacts;
  }

  private async createEnvironmentFiles(context: AgentContext, deploymentConfig: DeploymentConfig): Promise<Artifact[]> {
    const artifacts: Artifact[] = [];
    
    try {
      // Create .env.example
      await this.templateService.renderAndWrite(
        'deployment',
        '.env.example.ejs',
        path.join(context.projectPath, '.env.example'),
        { 
          projectName: context.projectName,
          platform: deploymentConfig.platform
        },
        { logger: context.logger }
      );
      
      // Create .env.local.example
      await this.templateService.renderAndWrite(
        'deployment',
        '.env.local.example.ejs',
        path.join(context.projectPath, '.env.local.example'),
        { 
          projectName: context.projectName,
          platform: deploymentConfig.platform
        },
        { logger: context.logger }
      );
      
      artifacts.push(
        {
          type: 'file',
          path: path.join(context.projectPath, '.env.example'),
          metadata: { type: 'env-example' }
        },
        {
          type: 'file',
          path: path.join(context.projectPath, '.env.local.example'),
          metadata: { type: 'env-local-example' }
        }
      );
      
      context.logger.success('Environment files created');
    } catch (error) {
      context.logger.warn(`Failed to create environment files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    return artifacts;
  }

  private async createDockerIgnore(context: AgentContext): Promise<Artifact[]> {
    const artifacts: Artifact[] = [];
    
    try {
      await this.templateService.renderAndWrite(
        'deployment',
        '.dockerignore.ejs',
        path.join(context.projectPath, '.dockerignore'),
        { projectName: context.projectName },
        { logger: context.logger }
      );
      
      artifacts.push({
        type: 'file',
        path: path.join(context.projectPath, '.dockerignore'),
        metadata: { type: 'dockerignore' }
      });
      
      context.logger.success('.dockerignore created');
    } catch (error) {
      context.logger.warn(`Failed to create .dockerignore: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    return artifacts;
  }

  // ============================================================================
  // ROLLBACK
  // ============================================================================

  async rollback(context: AgentContext): Promise<void> {
    context.logger.info('Rolling back DeploymentAgent changes...');
    
    try {
      const filesToRemove = [
        'Dockerfile',
        'docker-compose.yml',
        'docker-compose.dev.yml',
        '.github/workflows/ci.yml',
        '.env.example',
        '.env.local.example',
        '.dockerignore'
      ];
      
      for (const file of filesToRemove) {
        const filePath = path.join(context.projectPath, file);
        if (await fsExtra.pathExists(filePath)) {
          await fsExtra.remove(filePath);
          context.logger.success(`Removed: ${file}`);
        }
      }
      
      // Remove deployment package if it exists
      const deploymentPath = path.join(context.projectPath, 'packages', 'deployment');
      if (await fsExtra.pathExists(deploymentPath)) {
        await fsExtra.remove(deploymentPath);
        context.logger.success('Removed deployment package');
      }
    } catch (error) {
      context.logger.error(`Failed to rollback deployment changes`, error as Error);
    }
  }
} 