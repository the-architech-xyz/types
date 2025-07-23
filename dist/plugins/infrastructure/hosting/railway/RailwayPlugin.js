/**
 * Railway Deployment Plugin - Pure Technology Implementation
 *
 * Provides Railway deployment infrastructure setup.
 * Focuses only on deployment technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginCategory } from '../../../../types/plugins.js';
import { RailwayConfigSchema } from './RailwaySchema.js';
import { RailwayGenerator } from './RailwayGenerator.js';
export class RailwayPlugin extends BasePlugin {
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
            id: 'railway',
            name: 'Railway Deployment',
            version: '1.0.0',
            description: 'Deploy your application to Railway with seamless integration',
            author: 'The Architech Team',
            category: PluginCategory.DEPLOYMENT,
            tags: ['deployment', 'railway', 'docker', 'containers', 'infrastructure'],
            license: 'MIT',
            repository: 'https://github.com/railwayapp/railway',
            homepage: 'https://railway.app',
            documentation: 'https://docs.railway.app'
        };
    }
    // ============================================================================
    // ENHANCED PLUGIN INTERFACE IMPLEMENTATIONS
    // ============================================================================
    getParameterSchema() {
        return {
            category: PluginCategory.DEPLOYMENT,
            groups: [
                { id: 'project', name: 'Project Settings', description: 'Configure Railway project settings.', order: 1, parameters: ['projectId', 'serviceId', 'token', 'environment'] },
                { id: 'deployment', name: 'Deployment Settings', description: 'Configure deployment options.', order: 2, parameters: ['autoDeploy', 'healthcheckPath'] },
                { id: 'build', name: 'Build Settings', description: 'Configure build process.', order: 3, parameters: ['builder', 'dockerfilePath', 'buildCommand', 'watchPatterns'] },
                { id: 'runtime', name: 'Runtime Settings', description: 'Configure runtime behavior.', order: 4, parameters: ['startCommand', 'restartPolicyType', 'restartPolicyMaxRetries', 'healthcheckTimeout', 'healthcheckInterval', 'healthcheckRetries'] }
            ],
            parameters: [
                {
                    id: 'projectId',
                    name: 'Project ID',
                    type: 'string',
                    description: 'The Railway project ID. Can be found in your project settings.',
                    required: false,
                    group: 'project'
                },
                {
                    id: 'serviceId',
                    name: 'Service ID',
                    type: 'string',
                    description: 'The Railway service ID. If not provided, a new service will be created.',
                    required: false,
                    group: 'project'
                },
                {
                    id: 'token',
                    name: 'Auth Token',
                    type: 'string',
                    description: 'A Railway project or environment token for authentication.',
                    required: false,
                    group: 'project'
                },
                {
                    id: 'environment',
                    name: 'Environment',
                    type: 'string',
                    description: 'The Railway environment to deploy to.',
                    required: true,
                    default: 'production',
                    group: 'project'
                },
                {
                    id: 'autoDeploy',
                    name: 'Auto Deploy',
                    type: 'boolean',
                    description: 'Enable automatic deployments from your Git repository.',
                    required: false,
                    default: true,
                    group: 'deployment'
                },
                {
                    id: 'healthcheckPath',
                    name: 'Health Check Path',
                    type: 'string',
                    description: 'The path for the health check endpoint (e.g., /api/health).',
                    required: false,
                    default: '/api/health',
                    group: 'deployment'
                },
                {
                    id: 'builder',
                    name: 'Builder',
                    type: 'select',
                    description: 'The builder to use for your application.',
                    required: false,
                    default: 'nixpacks',
                    options: [
                        { value: 'nixpacks', label: 'Nixpacks' },
                        { value: 'dockerfile', label: 'Dockerfile' }
                    ],
                    group: 'build'
                },
                {
                    id: 'dockerfilePath',
                    name: 'Dockerfile Path',
                    type: 'string',
                    description: 'The path to the Dockerfile if using the dockerfile builder.',
                    required: false,
                    group: 'build'
                },
                {
                    id: 'buildCommand',
                    name: 'Build Command',
                    type: 'string',
                    description: 'A custom command to build your application (e.g., npm run build).',
                    required: false,
                    group: 'build'
                },
                {
                    id: 'watchPatterns',
                    name: 'Watch Patterns',
                    type: 'array',
                    description: 'Patterns to watch for changes to trigger a rebuild.',
                    required: false,
                    default: ['**/*'],
                    group: 'build'
                },
                {
                    id: 'startCommand',
                    name: 'Start Command',
                    type: 'string',
                    description: 'The command to start your application after a deployment.',
                    required: false,
                    group: 'runtime'
                },
                {
                    id: 'restartPolicyType',
                    name: 'Restart Policy',
                    type: 'select',
                    description: 'The restart policy for your application.',
                    required: false,
                    default: 'on_failure',
                    options: [
                        { value: 'on_failure', label: 'On Failure' },
                        { value: 'always', label: 'Always' },
                        { value: 'never', label: 'Never' }
                    ],
                    group: 'runtime'
                },
                {
                    id: 'restartPolicyMaxRetries',
                    name: 'Max Retries',
                    type: 'number',
                    description: 'The maximum number of times to retry a failed deployment.',
                    required: false,
                    default: 10,
                    group: 'runtime'
                },
                {
                    id: 'healthcheckTimeout',
                    name: 'Health Check Timeout',
                    type: 'number',
                    description: 'The timeout in seconds for the health check.',
                    required: false,
                    default: 300,
                    group: 'runtime'
                },
                {
                    id: 'healthcheckInterval',
                    name: 'Health Check Interval',
                    type: 'number',
                    description: 'The interval in seconds between health checks.',
                    required: false,
                    default: 5,
                    group: 'runtime'
                },
                {
                    id: 'healthcheckRetries',
                    name: 'Health Check Retries',
                    type: 'number',
                    description: 'The number of retries for a failed health check.',
                    required: false,
                    default: 3,
                    group: 'runtime'
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
        if (!config.environment) {
            errors.push({
                field: 'environment',
                message: 'Environment is required',
                code: 'MISSING_FIELD',
                severity: 'error'
            });
        }
        // Validate builder-specific requirements
        if (config.builder === 'dockerfile' && !config.dockerfilePath) {
            errors.push({
                field: 'dockerfilePath',
                message: 'Dockerfile path is required when using dockerfile builder',
                code: 'MISSING_FIELD',
                severity: 'error'
            });
        }
        // Validate health check path
        if (config.healthcheckPath && !config.healthcheckPath.startsWith('/')) {
            warnings.push('Health check path should start with /');
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
                    name: 'railway',
                    type: 'constant',
                    implementation: 'Railway configuration',
                    documentation: 'Railway deployment configuration'
                },
                {
                    name: 'deploy',
                    type: 'function',
                    implementation: 'Deployment utilities',
                    documentation: 'Railway deployment utilities and scripts'
                },
                {
                    name: 'config',
                    type: 'constant',
                    implementation: 'Railway project configuration',
                    documentation: 'Railway project and service configuration'
                }
            ],
            types: [],
            utilities: [],
            constants: [],
            documentation: 'Railway deployment and infrastructure configuration'
        };
    }
    // ============================================================================
    // IUIDeploymentPlugin INTERFACE IMPLEMENTATIONS
    // ============================================================================
    getDeploymentPlatforms() {
        return ['railway', 'docker', 'kubernetes'];
    }
    getEnvironmentOptions() {
        return ['development', 'staging', 'production'];
    }
    getInfrastructureOptions() {
        return ['single-service', 'multi-service', 'microservices'];
    }
    // ============================================================================
    // PLUGIN LIFECYCLE - Pure Technology Implementation
    // ============================================================================
    async install(context) {
        const startTime = Date.now();
        try {
            const { projectName, projectPath, pluginConfig } = context;
            context.logger.info('Installing Railway deployment...');
            // Initialize path resolver
            this.initializePathResolver(context);
            // Initialize generator
            this.generator = new RailwayGenerator();
            // Validate configuration
            const validation = this.validateConfiguration(pluginConfig);
            if (!validation.valid) {
                return this.createErrorResult('Invalid Railway configuration', validation.errors, startTime);
            }
            // Step 1: Install Railway CLI
            await this.installRailwayCLI();
            // Step 2: Generate files using the generator
            const railwayConfig = RailwayGenerator.generateRailwayConfig(pluginConfig);
            const envConfig = RailwayGenerator.generateEnvConfig(pluginConfig);
            // Step 3: Write files to project
            await this.generateFile('railway.json', railwayConfig);
            await this.generateFile('.env.local', envConfig);
            const duration = Date.now() - startTime;
            return this.createSuccessResult([
                { type: 'file', path: 'railway.json' },
                { type: 'file', path: '.env.local' }
            ], [
                {
                    name: '@railway/cli',
                    version: 'latest',
                    type: 'development',
                    category: PluginCategory.DEPLOYMENT
                }
            ], [
                { name: 'deploy', command: 'railway up', description: 'Deploy to Railway (default environment)', category: 'custom' },
                { name: 'deploy:prod', command: 'railway up --environment production', description: 'Deploy to production environment', category: 'custom' },
                { name: 'deploy:staging', command: 'railway up --environment staging', description: 'Deploy to staging environment', category: 'custom' }
            ], [], [
                'Railway CLI was installed globally. Please ensure it is in your system PATH.',
                ...validation.warnings
            ], startTime);
        }
        catch (error) {
            return this.createErrorResult('Failed to install Railway deployment', [], startTime);
        }
    }
    // ============================================================================
    // PLUGIN INTERFACE IMPLEMENTATIONS
    // ============================================================================
    getDependencies() {
        return ['@railway/cli'];
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
            conflicts: ['heroku', 'netlify', 'vercel-hosting']
        };
    }
    getConflicts() {
        return ['heroku', 'netlify', 'vercel-hosting'];
    }
    getRequirements() {
        return [
            {
                type: 'package',
                name: '@railway/cli',
                description: 'Railway CLI for interacting with the Railway platform.',
                version: 'latest'
            }
        ];
    }
    getDefaultConfig() {
        return {
            environment: 'production',
            autoDeploy: true,
            healthcheckPath: '/api/health',
            builder: 'nixpacks',
            watchPatterns: ['**/*'],
            restartPolicyType: 'on_failure',
            restartPolicyMaxRetries: 10,
            healthcheckTimeout: 300,
            healthcheckInterval: 5,
            healthcheckRetries: 3
        };
    }
    getConfigSchema() {
        return RailwayConfigSchema;
    }
    // ============================================================================
    // PRIVATE METHODS
    // ============================================================================
    async installRailwayCLI() {
        try {
            // Install Railway CLI globally
            await this.runner.execCommand(['npm', 'install', '-g', '@railway/cli']);
        }
        catch (error) {
            // If global installation fails, try local installation
            await this.runner.execCommand(['npm', 'install', '--save-dev', '@railway/cli']);
        }
    }
}
//# sourceMappingURL=RailwayPlugin.js.map