/**
 * Docker Deployment Plugin - Pure Technology Implementation
 *
 * Provides Docker containerization and deployment setup.
 * Focuses only on containerization technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginCategory } from '../../../../types/plugins.js';
import { DockerConfigSchema } from './DockerSchema.js';
import { DockerGenerator } from './DockerGenerator.js';
export class DockerPlugin extends BasePlugin {
    generator;
    constructor() {
        super();
        // Generator will be initialized in install method when pathResolver is available
    }
    // ============================================================================
    // PLUGIN METADATA
    // ============================================================================
    getMetadata() {
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
    // ENHANCED PLUGIN INTERFACE IMPLEMENTATIONS
    // ============================================================================
    getParameterSchema() {
        return {
            category: PluginCategory.DEPLOYMENT,
            groups: [
                { id: 'container', name: 'Container Settings', description: 'Configure Docker container settings.', order: 1, parameters: ['baseImage', 'port', 'environment'] },
                { id: 'deployment', name: 'Deployment Settings', description: 'Configure deployment options.', order: 2, parameters: ['enableKubernetes', 'enableCompose', 'enableRegistry'] },
                { id: 'performance', name: 'Performance', description: 'Configure performance settings.', order: 3, parameters: ['memoryLimit', 'cpuLimit', 'replicas'] }
            ],
            parameters: [
                {
                    id: 'baseImage',
                    name: 'Base Image',
                    type: 'string',
                    description: 'Docker base image to use',
                    required: true,
                    default: 'node:18-alpine',
                    group: 'container'
                },
                {
                    id: 'port',
                    name: 'Port',
                    type: 'number',
                    description: 'Application port',
                    required: true,
                    default: 3000,
                    group: 'container'
                },
                {
                    id: 'environment',
                    name: 'Environment',
                    type: 'select',
                    description: 'Deployment environment',
                    required: true,
                    default: 'production',
                    options: [
                        { value: 'development', label: 'Development' },
                        { value: 'staging', label: 'Staging' },
                        { value: 'production', label: 'Production' }
                    ],
                    group: 'container'
                },
                {
                    id: 'enableKubernetes',
                    name: 'Enable Kubernetes',
                    type: 'boolean',
                    description: 'Generate Kubernetes manifests',
                    required: false,
                    default: true,
                    group: 'deployment'
                },
                {
                    id: 'enableCompose',
                    name: 'Enable Docker Compose',
                    type: 'boolean',
                    description: 'Generate docker-compose.yml',
                    required: false,
                    default: true,
                    group: 'deployment'
                },
                {
                    id: 'enableRegistry',
                    name: 'Enable Registry',
                    type: 'boolean',
                    description: 'Configure container registry',
                    required: false,
                    default: false,
                    group: 'deployment'
                },
                {
                    id: 'memoryLimit',
                    name: 'Memory Limit',
                    type: 'string',
                    description: 'Container memory limit',
                    required: false,
                    default: '512Mi',
                    group: 'performance'
                },
                {
                    id: 'cpuLimit',
                    name: 'CPU Limit',
                    type: 'string',
                    description: 'Container CPU limit',
                    required: false,
                    default: '500m',
                    group: 'performance'
                },
                {
                    id: 'replicas',
                    name: 'Replicas',
                    type: 'number',
                    description: 'Number of replicas',
                    required: false,
                    default: 1,
                    group: 'performance'
                }
            ],
            dependencies: [],
            validations: []
        };
    }
    validateConfiguration(config) {
        const errors = [];
        const warnings = [];
        // Validate required fields
        if (!config.baseImage) {
            errors.push({
                field: 'baseImage',
                message: 'Base image is required',
                code: 'MISSING_FIELD',
                severity: 'error'
            });
        }
        if (!config.port || config.port < 1 || config.port > 65535) {
            errors.push({
                field: 'port',
                message: 'Port must be between 1 and 65535',
                code: 'INVALID_PORT',
                severity: 'error'
            });
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    generateUnifiedInterface(config) {
        return {
            category: PluginCategory.DEPLOYMENT,
            exports: [
                {
                    name: 'dockerfile',
                    type: 'constant',
                    implementation: 'Dockerfile configuration',
                    documentation: 'Docker container configuration'
                },
                {
                    name: 'compose',
                    type: 'constant',
                    implementation: 'Docker Compose configuration',
                    documentation: 'Multi-container deployment configuration'
                },
                {
                    name: 'kubernetes',
                    type: 'constant',
                    implementation: 'Kubernetes manifests',
                    documentation: 'Kubernetes deployment configuration'
                }
            ],
            types: [],
            utilities: [],
            constants: [],
            documentation: 'Docker containerization and deployment configuration'
        };
    }
    // ============================================================================
    // IUIDeploymentPlugin INTERFACE IMPLEMENTATIONS
    // ============================================================================
    getDeploymentPlatforms() {
        return ['docker', 'kubernetes', 'docker-compose'];
    }
    getEnvironmentOptions() {
        return ['development', 'staging', 'production'];
    }
    getInfrastructureOptions() {
        return ['single-container', 'multi-container', 'orchestrated'];
    }
    // ============================================================================
    // PLUGIN LIFECYCLE - Pure Technology Implementation
    // ============================================================================
    async install(context) {
        const startTime = Date.now();
        try {
            const { projectName, projectPath, pluginConfig } = context;
            context.logger.info('Installing Docker deployment...');
            // Initialize path resolver
            this.initializePathResolver(context);
            // Initialize generator
            this.generator = new DockerGenerator();
            // Validate configuration
            const validation = this.validateConfiguration(pluginConfig);
            if (!validation.valid) {
                return this.createErrorResult('Invalid Docker configuration', validation.errors, startTime);
            }
            // Step 1: Generate files using the generator
            const dockerfile = DockerGenerator.generateDockerfile(pluginConfig);
            const dockerignore = DockerGenerator.generateDockerignore();
            const compose = DockerGenerator.generateDockerCompose(pluginConfig);
            const buildScript = DockerGenerator.generateBuildScript(pluginConfig);
            const deployScript = DockerGenerator.generateDeployScript(pluginConfig);
            // Step 2: Write files to project
            await this.generateFile('Dockerfile', dockerfile);
            await this.generateFile('.dockerignore', dockerignore);
            await this.generateFile('docker-compose.yml', compose);
            await this.generateFile('scripts/build.sh', buildScript);
            await this.generateFile('scripts/deploy.sh', deployScript);
            // Step 3: Generate Kubernetes manifests if enabled
            if (pluginConfig.enableKubernetes) {
                const k8sDeployment = DockerGenerator.generateK8sDeployment(pluginConfig);
                const k8sService = DockerGenerator.generateK8sService(pluginConfig);
                await this.generateFile('k8s/deployment.yaml', k8sDeployment);
                await this.generateFile('k8s/service.yaml', k8sService);
            }
            const duration = Date.now() - startTime;
            return this.createSuccessResult([
                { type: 'file', path: 'Dockerfile' },
                { type: 'file', path: '.dockerignore' },
                { type: 'file', path: 'docker-compose.yml' },
                { type: 'file', path: 'scripts/build.sh' },
                { type: 'file', path: 'scripts/deploy.sh' },
                ...(pluginConfig.enableKubernetes ? [
                    { type: 'file', path: 'k8s/deployment.yaml' },
                    { type: 'file', path: 'k8s/service.yaml' }
                ] : [])
            ], [], [], [], validation.warnings, startTime);
        }
        catch (error) {
            return this.createErrorResult('Failed to install Docker deployment', [], startTime);
        }
    }
    // ============================================================================
    // PLUGIN INTERFACE IMPLEMENTATIONS
    // ============================================================================
    getDependencies() {
        return [];
    }
    getDevDependencies() {
        return [];
    }
    getCompatibility() {
        return {
            frameworks: ['nextjs', 'react', 'vue', 'svelte', 'express', 'fastify'],
            platforms: ['web', 'mobile', 'server'],
            nodeVersions: ['>=16.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm'],
            conflicts: []
        };
    }
    getConflicts() {
        return [];
    }
    getRequirements() {
        return [
            {
                type: 'binary',
                name: 'docker',
                description: 'Docker runtime',
                version: '>=20.0.0'
            }
        ];
    }
    getDefaultConfig() {
        return {
            baseImage: 'node:18-alpine',
            port: 3000,
            environment: 'production',
            enableKubernetes: true,
            enableCompose: true,
            enableRegistry: false,
            memoryLimit: '512Mi',
            cpuLimit: '500m',
            replicas: 1
        };
    }
    getConfigSchema() {
        return DockerConfigSchema;
    }
}
//# sourceMappingURL=DockerPlugin.js.map