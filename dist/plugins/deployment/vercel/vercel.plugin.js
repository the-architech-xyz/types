import { PluginCategory, TargetPlatform, ProjectType } from '../../../types/plugin.js';
import { AgentLogger as Logger } from '../../../core/cli/logger.js';
import { CommandRunner } from '../../../core/cli/command-runner.js';
export class VercelPlugin {
    logger;
    commandRunner;
    constructor() {
        this.logger = new Logger(false, 'VercelPlugin');
        this.commandRunner = new CommandRunner();
    }
    getMetadata() {
        return {
            id: 'vercel',
            name: 'Vercel',
            version: '1.0.0',
            description: 'Deploy your application to Vercel with zero configuration',
            author: 'The Architech Team',
            category: PluginCategory.DEPLOYMENT,
            tags: ['deployment', 'vercel', 'serverless', 'edge'],
            license: 'MIT',
            repository: 'https://github.com/architech/plugins',
            homepage: 'https://vercel.com',
            documentation: 'https://vercel.com/docs'
        };
    }
    async install(context) {
        try {
            this.logger.info('Installing Vercel deployment plugin...');
            // Install Vercel CLI
            const installResult = await this.commandRunner.exec('npm', ['install', '-g', 'vercel']);
            if (installResult.code !== 0) {
                return {
                    success: false,
                    artifacts: [],
                    dependencies: [],
                    scripts: [],
                    configs: [],
                    errors: [{
                            code: 'INSTALL_FAILED',
                            message: 'Failed to install Vercel CLI',
                            details: installResult.stderr,
                            severity: 'error'
                        }],
                    warnings: [],
                    duration: 0
                };
            }
            // Add Vercel configuration to package.json
            const packageJsonPath = `${context.projectPath}/package.json`;
            const packageJson = require(packageJsonPath);
            if (!packageJson.scripts) {
                packageJson.scripts = {};
            }
            packageJson.scripts.deploy = 'vercel --prod';
            packageJson.scripts['deploy:dev'] = 'vercel';
            packageJson.scripts['deploy:preview'] = 'vercel --preview';
            // Create Vercel configuration file
            const vercelConfig = {
                version: 2,
                builds: [
                    {
                        src: 'package.json',
                        use: '@vercel/next'
                    }
                ],
                routes: [
                    {
                        src: '/(.*)',
                        dest: '/'
                    }
                ]
            };
            this.logger.success('Vercel deployment plugin installed successfully');
            return {
                success: true,
                artifacts: [
                    {
                        type: 'config',
                        path: 'vercel.json',
                        content: JSON.stringify(vercelConfig, null, 2)
                    }
                ],
                dependencies: [
                    {
                        name: 'vercel',
                        version: 'latest',
                        type: 'development',
                        category: PluginCategory.DEPLOYMENT
                    }
                ],
                scripts: [
                    {
                        name: 'deploy',
                        command: 'vercel --prod',
                        description: 'Deploy to production',
                        category: 'deploy'
                    },
                    {
                        name: 'deploy:dev',
                        command: 'vercel',
                        description: 'Deploy to development',
                        category: 'deploy'
                    },
                    {
                        name: 'deploy:preview',
                        command: 'vercel --preview',
                        description: 'Deploy preview',
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
            this.logger.error('Failed to install Vercel deployment plugin:', error);
            return {
                success: false,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [{
                        code: 'INSTALL_ERROR',
                        message: 'Failed to install Vercel deployment plugin',
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
            this.logger.info('Uninstalling Vercel deployment plugin...');
            // Remove Vercel configuration files
            await this.commandRunner.exec('rm', ['-f', `${context.projectPath}/vercel.json`]);
            await this.commandRunner.exec('rm', ['-f', `${context.projectPath}/deploy.sh`]);
            await this.commandRunner.exec('rm', ['-rf', `${context.projectPath}/lib/deployment`]);
            await this.commandRunner.exec('rm', ['-rf', `${context.projectPath}/.github/workflows/deploy.yml`]);
            this.logger.success('Vercel deployment plugin uninstalled successfully');
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
            this.logger.error('Failed to uninstall Vercel deployment plugin:', error);
            return {
                success: false,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [{
                        code: 'UNINSTALL_ERROR',
                        message: 'Failed to uninstall Vercel deployment plugin',
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
            this.logger.info('Updating Vercel deployment plugin...');
            // Update Vercel CLI
            const updateResult = await this.commandRunner.exec('npm', ['update', '-g', 'vercel']);
            this.logger.success('Vercel deployment plugin updated successfully');
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
            this.logger.error('Failed to update Vercel deployment plugin:', error);
            return {
                success: false,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [{
                        code: 'UPDATE_ERROR',
                        message: 'Failed to update Vercel deployment plugin',
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
            this.logger.info('Validating Vercel deployment plugin...');
            // Check if Vercel CLI is installed
            const vercelInstalled = await this.commandRunner.exec('vercel', ['--version']);
            if (vercelInstalled.code !== 0) {
                return {
                    valid: false,
                    errors: [{
                            field: 'vercel-cli',
                            message: 'Vercel CLI is not installed',
                            code: 'CLI_MISSING',
                            severity: 'error'
                        }],
                    warnings: []
                };
            }
            // Check if vercel.json exists
            const vercelConfigExists = await this.commandRunner.exec('test', ['-f', `${context.projectPath}/vercel.json`]);
            if (vercelConfigExists.code !== 0) {
                return {
                    valid: false,
                    errors: [{
                            field: 'vercel-config',
                            message: 'vercel.json configuration file is missing',
                            code: 'CONFIG_MISSING',
                            severity: 'error'
                        }],
                    warnings: []
                };
            }
            this.logger.success('Vercel deployment plugin validation passed');
            return {
                valid: true,
                errors: [],
                warnings: []
            };
        }
        catch (error) {
            this.logger.error('Vercel deployment plugin validation failed:', error);
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
            frameworks: [ProjectType.NEXTJS, ProjectType.REACT, ProjectType.NODE, ProjectType.EXPRESS],
            platforms: [TargetPlatform.WEB, TargetPlatform.SERVER],
            nodeVersions: ['16.x', '18.x', '20.x'],
            packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
            conflicts: []
        };
    }
    getDependencies() {
        return ['vercel'];
    }
    getConflicts() {
        return [];
    }
    getRequirements() {
        return [
            {
                type: 'package',
                name: 'vercel',
                description: 'Vercel CLI for deployment',
                version: 'latest'
            }
        ];
    }
    getDefaultConfig() {
        return {
            projectId: '',
            orgId: '',
            token: '',
            environment: 'production',
            autoDeploy: false
        };
    }
    getConfigSchema() {
        return {
            type: 'object',
            properties: {
                projectId: {
                    type: 'string',
                    description: 'Vercel project ID'
                },
                orgId: {
                    type: 'string',
                    description: 'Vercel organization ID'
                },
                token: {
                    type: 'string',
                    description: 'Vercel API token'
                },
                environment: {
                    type: 'string',
                    description: 'Deployment environment',
                    enum: ['production', 'preview', 'development'],
                    default: 'production'
                },
                autoDeploy: {
                    type: 'boolean',
                    description: 'Enable automatic deployment',
                    default: false
                }
            },
            required: [],
            additionalProperties: false
        };
    }
}
//# sourceMappingURL=vercel.plugin.js.map