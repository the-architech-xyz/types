/**
 * Docker Deployment Plugin - Pure Technology Implementation
 * 
 * Provides Docker containerization and deployment setup.
 * Focuses only on containerization technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */

import { IPlugin, PluginMetadata, PluginArtifact, ValidationResult, PluginCategory, PluginContext, PluginResult, TargetPlatform, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../../../types/plugins.js';
import { TemplateService, templateService } from '../../../../core/templates/template-service.js';
import { CommandRunner } from '../../../../core/cli/command-runner.js';
import { ValidationError } from '../../../../types/agents.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { structureService, StructureInfo } from '../../../../core/project/structure-service.js';
import { DockerConfig, DockerConfigSchema, DockerDefaultConfig } from './DockerSchema.js';
import { DockerGenerator } from './DockerGenerator.js';

export class DockerPlugin implements IPlugin {
  private templateService: TemplateService;
  private runner: CommandRunner;

  constructor() {
    this.templateService = templateService;
    this.runner = new CommandRunner();
  }

  // ============================================================================
  // PLUGIN METADATA
  // ============================================================================

  getMetadata(): PluginMetadata {
    return {
      id: 'docker',
      name: 'Docker Deployment',
      version: '1.0.0',
      description: 'Containerization and deployment with Docker',
      author: 'The Architech Team',
      category: PluginCategory.DEPLOYMENT,
      tags: ['deployment', 'containerization', 'docker', 'kubernetes', 'microservices'],
      license: 'Apache-2.0',
      repository: 'https://github.com/docker/docker-ce',
      homepage: 'https://www.docker.com',
      documentation: 'https://docs.docker.com'
    };
  }

  // ============================================================================
  // PLUGIN LIFECYCLE - Pure Technology Implementation
  // ============================================================================

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      const { projectName, projectPath, pluginConfig } = context;
      
      context.logger.info('Installing Docker deployment...');

      // Step 1: Create Docker configuration files
      await this.createDockerFiles(context);

      // Step 2: Create deployment scripts
      await this.createDeploymentScripts(context);

      // Step 3: Create Kubernetes manifests (optional)
      await this.createKubernetesManifests(context);

      // Step 4: Generate unified interface files
      await this.generateUnifiedInterfaceFiles(context);

      const duration = Date.now() - startTime;

      return {
        success: true,
        artifacts: [
          {
            type: 'file',
            path: path.join(projectPath, 'Dockerfile')
          },
          {
            type: 'file',
            path: path.join(projectPath, '.dockerignore')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'docker-compose.yml')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'scripts', 'build.sh')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'scripts', 'deploy.sh')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'k8s', 'deployment.yaml')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'k8s', 'service.yaml')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'k8s', 'ingress.yaml')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'deployment', 'index.ts')
          }
        ],
        dependencies: [],
        scripts: [
          {
            name: 'docker:build',
            command: 'bash scripts/build.sh',
            description: 'Build Docker image',
            category: 'custom'
          },
          {
            name: 'docker:deploy',
            command: 'bash scripts/deploy.sh',
            description: 'Deploy with Docker Compose',
            category: 'custom'
          },
          {
            name: 'docker:compose',
            command: 'docker-compose up -d',
            description: 'Start with Docker Compose',
            category: 'custom'
          },
          {
            name: 'docker:compose:down',
            command: 'docker-compose down',
            description: 'Stop Docker Compose',
            category: 'custom'
          }
        ],
        configs: [
          {
            file: '.env',
            content: DockerGenerator.generateEnvConfig(pluginConfig as DockerConfig),
            mergeStrategy: 'append'
          }
        ],
        errors: [],
        warnings: [],
        duration
      };
    } catch (error) {
      return this.createErrorResult(
        'Failed to install Docker deployment',
        startTime,
        [],
        error
      );
    }
  }

  async uninstall(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      const { projectPath } = context;
      
      context.logger.info('Uninstalling Docker deployment...');

      // Remove Docker files
      const filesToRemove = [
        'Dockerfile',
        '.dockerignore',
        'docker-compose.yml',
        'scripts/build.sh',
        'scripts/deploy.sh',
        'k8s/deployment.yaml',
        'k8s/service.yaml',
        'k8s/ingress.yaml',
        'src/deployment/index.ts'
      ];

      for (const file of filesToRemove) {
        const filePath = path.join(projectPath, file);
        if (await fsExtra.pathExists(filePath)) {
          await fsExtra.remove(filePath);
        }
      }

      const duration = Date.now() - startTime;

      return {
        success: true,
        artifacts: [],
        dependencies: [],
        scripts: [],
        configs: [],
        errors: [],
        warnings: [],
        duration
      };
    } catch (error) {
      return this.createErrorResult(
        'Failed to uninstall Docker deployment',
        startTime,
        [],
        error
      );
    }
  }

  async update(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      context.logger.info('Updating Docker deployment...');

      // Reinstall to update all files
      const result = await this.install(context);

      const duration = Date.now() - startTime;
      return {
        ...result,
        duration
      };
    } catch (error) {
      return this.createErrorResult(
        'Failed to update Docker deployment',
        startTime,
        [],
        error
      );
    }
  }

  async validate(context: PluginContext): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    try {
      const { projectPath, pluginConfig } = context;

      // Check if Docker is installed
      try {
        await this.runner.execCommand(['docker', '--version']);
      } catch (error) {
        errors.push({
          field: 'docker',
          code: 'DOCKER_NOT_INSTALLED',
          message: 'Docker is not installed or not accessible',
          severity: 'error'
        });
      }

      // Check if Docker Compose is available
      try {
        await this.runner.execCommand(['docker-compose', '--version']);
      } catch (error) {
        warnings.push({
          field: 'docker-compose',
          code: 'DOCKER_COMPOSE_NOT_AVAILABLE',
          message: 'Docker Compose is not available',
          severity: 'warning'
        });
      }

      // Validate configuration
      if (!pluginConfig.imageName) {
        errors.push({
          field: 'imageName',
          code: 'MISSING_IMAGE_NAME',
          message: 'Docker image name is required',
          severity: 'error'
        });
      }

      if (!pluginConfig.port || pluginConfig.port < 1 || pluginConfig.port > 65535) {
        errors.push({
          field: 'port',
          code: 'INVALID_PORT',
          message: 'Port must be between 1 and 65535',
          severity: 'error'
        });
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings: warnings.map(w => w.message)
      };
    } catch (error) {
      errors.push({
        field: 'validation',
        code: 'VALIDATION_ERROR',
        message: 'Failed to validate Docker configuration',
        severity: 'error'
      });

      return {
        valid: false,
        errors,
        warnings: []
      };
    }
  }

  getCompatibility(): CompatibilityMatrix {
    return {
      platforms: [TargetPlatform.SERVER],
      frameworks: ['nextjs', 'react', 'vue', 'angular', 'express', 'fastify', 'nest'],
      databases: ['postgresql', 'mysql', 'mongodb', 'sqlite'],
      nodeVersions: ['>=16.0.0'],
      packageManagers: ['npm', 'yarn', 'pnpm'],
      conflicts: []
    };
  }

  getDependencies(): string[] {
    return [];
  }

  getConflicts(): string[] {
    return [];
  }

  getRequirements(): PluginRequirement[] {
    return [
      {
        type: 'binary',
        name: 'Docker',
        description: 'Docker must be installed and running',
        version: '>=20.0.0'
      }
    ];
  }

  getDefaultConfig(): Record<string, any> {
    return DockerDefaultConfig;
  }

  getConfigSchema(): ConfigSchema {
    return DockerConfigSchema;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private async createDockerFiles(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    const config = pluginConfig as DockerConfig;

    // Create Dockerfile
    const dockerfileContent = DockerGenerator.generateDockerfile(config);
    await fsExtra.writeFile(path.join(projectPath, 'Dockerfile'), dockerfileContent);

    // Create .dockerignore
    const dockerignoreContent = DockerGenerator.generateDockerignore();
    await fsExtra.writeFile(path.join(projectPath, '.dockerignore'), dockerignoreContent);

    // Create docker-compose.yml
    const dockerComposeContent = DockerGenerator.generateDockerCompose(config);
    await fsExtra.writeFile(path.join(projectPath, 'docker-compose.yml'), dockerComposeContent);
  }

  private async createDeploymentScripts(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    const config = pluginConfig as DockerConfig;

    // Ensure scripts directory exists
    await fsExtra.ensureDir(path.join(projectPath, 'scripts'));

    // Create build script
    const buildScriptContent = DockerGenerator.generateBuildScript(config);
    await fsExtra.writeFile(path.join(projectPath, 'scripts', 'build.sh'), buildScriptContent);
    await fsExtra.chmod(path.join(projectPath, 'scripts', 'build.sh'), 0o755);

    // Create deploy script
    const deployScriptContent = DockerGenerator.generateDeployScript(config);
    await fsExtra.writeFile(path.join(projectPath, 'scripts', 'deploy.sh'), deployScriptContent);
    await fsExtra.chmod(path.join(projectPath, 'scripts', 'deploy.sh'), 0o755);
  }

  private async createKubernetesManifests(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    const config = pluginConfig as DockerConfig;

    // Ensure k8s directory exists
    await fsExtra.ensureDir(path.join(projectPath, 'k8s'));

    // Create deployment manifest
    const deploymentContent = DockerGenerator.generateK8sDeployment(config);
    await fsExtra.writeFile(path.join(projectPath, 'k8s', 'deployment.yaml'), deploymentContent);

    // Create service manifest
    const serviceContent = DockerGenerator.generateK8sService(config);
    await fsExtra.writeFile(path.join(projectPath, 'k8s', 'service.yaml'), serviceContent);

    // Create ingress manifest
    const ingressContent = DockerGenerator.generateK8sIngress(config);
    await fsExtra.writeFile(path.join(projectPath, 'k8s', 'ingress.yaml'), ingressContent);
  }

  private async generateUnifiedInterfaceFiles(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    // Ensure deployment directory exists
    await fsExtra.ensureDir(path.join(projectPath, 'src', 'deployment'));

    // Create unified deployment interface
    const unifiedIndexContent = DockerGenerator.generateUnifiedIndex();
    await fsExtra.writeFile(path.join(projectPath, 'src', 'deployment', 'index.ts'), unifiedIndexContent);
  }

  private createErrorResult(
    message: string,
    startTime: number,
    errors: any[] = [],
    originalError?: any
  ): PluginResult {
    const duration = Date.now() - startTime;
    
    return {
      success: false,
      artifacts: [],
      dependencies: [],
      scripts: [],
      configs: [],
      errors: [
        {
          code: 'DOCKER_INSTALL_ERROR',
          message,
          details: originalError,
          severity: 'error'
        },
        ...errors
      ],
      warnings: [],
      duration
    };
  }
} 