import { PluginCategory, TargetPlatform, ProjectType } from '../../../../types/plugin.js';
import { AgentLogger as Logger } from '../../../../core/cli/logger.js';
import { CommandRunner } from '../../../../core/cli/command-runner.js';
export class RailwayPlugin {
    logger;
    commandRunner;
    constructor() {
        this.logger = new Logger(false, 'RailwayPlugin');
        this.commandRunner = new CommandRunner();
    }
    getMetadata() {
        return {
            id: 'railway',
            name: 'Railway',
            version: '1.0.0',
            description: 'Deploy your application to Railway with seamless integration',
            author: 'The Architech Team',
            category: PluginCategory.DEPLOYMENT,
            tags: ['deployment', 'railway', 'docker', 'containers'],
            license: 'MIT',
            repository: 'https://github.com/architech/plugins',
            homepage: 'https://railway.app',
            documentation: 'https://docs.railway.app'
        };
    }
    async install(context) {
        try {
            this.logger.info('Installing Railway deployment plugin...');
            // Install Railway CLI
            const installResult = await this.commandRunner.exec('npm', ['install', '-g', '@railway/cli']);
            if (installResult.code !== 0) {
                return {
                    success: false,
                    artifacts: [],
                    dependencies: [],
                    scripts: [],
                    configs: [],
                    errors: [{
                            code: 'INSTALL_FAILED',
                            message: 'Failed to install Railway CLI',
                            details: installResult.stderr,
                            severity: 'error'
                        }],
                    warnings: [],
                    duration: 0
                };
            }
            // Add Railway configuration to package.json
            const packageJsonPath = `${context.projectPath}/package.json`;
            const packageJson = require(packageJsonPath);
            if (!packageJson.scripts) {
                packageJson.scripts = {};
            }
            packageJson.scripts.deploy = 'railway up';
            packageJson.scripts['deploy:dev'] = 'railway up --environment development';
            packageJson.scripts['deploy:staging'] = 'railway up --environment staging';
            // Create Railway configuration file
            const railwayConfig = {
                build: {
                    builder: 'nixpacks'
                },
                deploy: {
                    startCommand: 'npm start',
                    healthcheckPath: '/health',
                    healthcheckTimeout: 300,
                    restartPolicyType: 'on_failure'
                }
            };
            this.logger.success('Railway deployment plugin installed successfully');
            return {
                success: true,
                artifacts: [
                    {
                        type: 'config',
                        path: 'railway.json',
                        content: JSON.stringify(railwayConfig, null, 2)
                    }
                ],
                dependencies: [
                    {
                        name: '@railway/cli',
                        version: 'latest',
                        type: 'development',
                        category: PluginCategory.DEPLOYMENT
                    }
                ],
                scripts: [
                    {
                        name: 'deploy',
                        command: 'railway up',
                        description: 'Deploy to Railway',
                        category: 'deploy'
                    },
                    {
                        name: 'deploy:dev',
                        command: 'railway up --environment development',
                        description: 'Deploy to development environment',
                        category: 'deploy'
                    },
                    {
                        name: 'deploy:staging',
                        command: 'railway up --environment staging',
                        description: 'Deploy to staging environment',
                        category: 'deploy'
                    }
                ],
                configs: [
                    {
                        file: 'package.json',
                        content: JSON.stringify(packageJson, null, 2),
                        mergeStrategy: 'merge'
                    }
                ],
                errors: [],
                warnings: [],
                duration: 0
            };
        }
        catch (error) {
            this.logger.error('Failed to install Railway deployment plugin:', error);
            return {
                success: false,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [{
                        code: 'INSTALL_ERROR',
                        message: 'Failed to install Railway deployment plugin',
                        details: error,
                        severity: 'error'
                    }],
                warnings: [],
                duration: 0
            };
        }
    }
    async uninstall(context) {
        try {
            this.logger.info('Uninstalling Railway deployment plugin...');
            // Remove Railway configuration files
            await this.commandRunner.exec('rm', ['-f', `${context.projectPath}/railway.json`]);
            await this.commandRunner.exec('rm', ['-f', `${context.projectPath}/railway.toml`]);
            await this.commandRunner.exec('rm', ['-rf', `${context.projectPath}/.railway`]);
            this.logger.success('Railway deployment plugin uninstalled successfully');
            return {
                success: true,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [],
                warnings: [],
                duration: 0
            };
        }
        catch (error) {
            this.logger.error('Failed to uninstall Railway deployment plugin:', error);
            return {
                success: false,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [{
                        code: 'UNINSTALL_ERROR',
                        message: 'Failed to uninstall Railway deployment plugin',
                        details: error,
                        severity: 'error'
                    }],
                warnings: [],
                duration: 0
            };
        }
    }
    async update(context) {
        try {
            this.logger.info('Updating Railway deployment plugin...');
            // Update Railway CLI
            const updateResult = await this.commandRunner.exec('npm', ['update', '-g', '@railway/cli']);
            this.logger.success('Railway deployment plugin updated successfully');
            return {
                success: true,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [],
                warnings: [],
                duration: 0
            };
        }
        catch (error) {
            this.logger.error('Failed to update Railway deployment plugin:', error);
            return {
                success: false,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [{
                        code: 'UPDATE_ERROR',
                        message: 'Failed to update Railway deployment plugin',
                        details: error,
                        severity: 'error'
                    }],
                warnings: [],
                duration: 0
            };
        }
    }
    async validate(context) {
        try {
            this.logger.info('Validating Railway deployment plugin...');
            // Check if Railway CLI is installed
            const railwayInstalled = await this.commandRunner.exec('railway', ['--version']);
            if (railwayInstalled.code !== 0) {
                return {
                    valid: false,
                    errors: [{
                            field: 'railway-cli',
                            message: 'Railway CLI is not installed',
                            code: 'CLI_MISSING',
                            severity: 'error'
                        }],
                    warnings: []
                };
            }
            // Check if railway.json exists
            const railwayConfigExists = await this.commandRunner.exec('test', ['-f', `${context.projectPath}/railway.json`]);
            if (railwayConfigExists.code !== 0) {
                return {
                    valid: false,
                    errors: [{
                            field: 'railway-config',
                            message: 'railway.json configuration file is missing',
                            code: 'CONFIG_MISSING',
                            severity: 'error'
                        }],
                    warnings: []
                };
            }
            this.logger.success('Railway deployment plugin validation passed');
            return {
                valid: true,
                errors: [],
                warnings: []
            };
        }
        catch (error) {
            this.logger.error('Railway deployment plugin validation failed:', error);
            return {
                valid: false,
                errors: [{
                        field: 'validation',
                        message: `Validation failed: ${error}`,
                        code: 'VALIDATION_ERROR',
                        severity: 'error'
                    }],
                warnings: []
            };
        }
    }
    getCompatibility() {
        return {
            frameworks: [ProjectType.NEXTJS, ProjectType.REACT, ProjectType.NODE, ProjectType.EXPRESS, ProjectType.NESTJS],
            platforms: [TargetPlatform.WEB, TargetPlatform.SERVER],
            nodeVersions: ['16.x', '18.x', '20.x'],
            packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
            conflicts: []
        };
    }
    getDependencies() {
        return ['@railway/cli'];
    }
    getConflicts() {
        return [];
    }
    getRequirements() {
        return [
            {
                type: 'package',
                name: '@railway/cli',
                description: 'Railway CLI for deployment',
                version: 'latest'
            }
        ];
    }
    getDefaultConfig() {
        return {
            projectId: '',
            token: '',
            environment: 'production',
            autoDeploy: false,
            healthcheckPath: '/health'
        };
    }
    getConfigSchema() {
        return {
            type: 'object',
            properties: {
                projectId: {
                    type: 'string',
                    description: 'Railway project ID'
                },
                token: {
                    type: 'string',
                    description: 'Railway API token'
                },
                environment: {
                    type: 'string',
                    description: 'Deployment environment',
                    enum: ['production', 'staging', 'development'],
                    default: 'production'
                },
                autoDeploy: {
                    type: 'boolean',
                    description: 'Enable automatic deployment',
                    default: false
                },
                healthcheckPath: {
                    type: 'string',
                    description: 'Health check endpoint path',
                    default: '/health'
                }
            },
            required: [],
            additionalProperties: false
        };
    }
}
//# sourceMappingURL=railway.plugin.js.map