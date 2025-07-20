/**
 * Next.js Framework Plugin - Pure Technology Implementation
 *
 * Provides Next.js framework integration using the official create-next-app CLI.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { PluginCategory, TargetPlatform } from '../../types/plugin.js';
import { templateService } from '../../utils/template-service.js';
import { CommandRunner } from '../../utils/command-runner.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
export class NextJSPlugin {
    templateService;
    runner;
    constructor() {
        this.templateService = templateService;
        this.runner = new CommandRunner();
    }
    // ============================================================================
    // PLUGIN METADATA
    // ============================================================================
    getMetadata() {
        return {
            id: 'nextjs',
            name: 'Next.js Framework',
            version: '1.0.0',
            description: 'React framework for production with App Router, Server Components, and TypeScript',
            author: 'The Architech Team',
            category: PluginCategory.FRAMEWORK,
            tags: ['react', 'nextjs', 'typescript', 'app-router', 'server-components'],
            license: 'MIT',
            repository: 'https://github.com/vercel/next.js',
            homepage: 'https://nextjs.org'
        };
    }
    // ============================================================================
    // PLUGIN LIFECYCLE - Pure Technology Implementation
    // ============================================================================
    async install(context) {
        const startTime = Date.now();
        try {
            const { projectName, projectPath, pluginConfig } = context;
            context.logger.info('Installing Next.js framework using create-next-app CLI...');
            // Step 1: Use official create-next-app CLI
            const cliArgs = this.buildCreateNextAppArgs(pluginConfig);
            const parentDir = path.dirname(projectPath);
            // Use execCommand with the proper create command
            await this.runner.execCommand([...this.runner.getCreateCommand(), ...cliArgs], { cwd: parentDir });
            // Step 2: Customize generated project
            await this.customizeProject(context);
            // Step 3: Add project-specific enhancements
            await this.addEnhancements(context);
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: [
                    {
                        type: 'directory',
                        path: projectPath
                    }
                ],
                dependencies: [
                    {
                        name: 'next',
                        version: '^15.4.2',
                        type: 'production',
                        category: PluginCategory.FRAMEWORK
                    },
                    {
                        name: 'react',
                        version: '^19.1.0',
                        type: 'production',
                        category: PluginCategory.FRAMEWORK
                    },
                    {
                        name: 'react-dom',
                        version: '^19.1.0',
                        type: 'production',
                        category: PluginCategory.FRAMEWORK
                    },
                    {
                        name: 'typescript',
                        version: '^5.8.3',
                        type: 'development',
                        category: PluginCategory.FRAMEWORK
                    },
                    {
                        name: '@types/node',
                        version: '^20.0.0',
                        type: 'development',
                        category: PluginCategory.FRAMEWORK
                    },
                    {
                        name: '@types/react',
                        version: '^19.0.0',
                        type: 'development',
                        category: PluginCategory.FRAMEWORK
                    },
                    {
                        name: '@types/react-dom',
                        version: '^19.0.0',
                        type: 'development',
                        category: PluginCategory.FRAMEWORK
                    },
                    {
                        name: 'eslint',
                        version: '^9.0.0',
                        type: 'development',
                        category: PluginCategory.FRAMEWORK
                    },
                    {
                        name: 'eslint-config-next',
                        version: '^15.4.2',
                        type: 'development',
                        category: PluginCategory.FRAMEWORK
                    }
                ],
                scripts: [
                    {
                        name: 'dev',
                        command: 'next dev',
                        description: 'Start development server',
                        category: 'dev'
                    },
                    {
                        name: 'build',
                        command: 'next build',
                        description: 'Build for production',
                        category: 'build'
                    },
                    {
                        name: 'start',
                        command: 'next start',
                        description: 'Start production server',
                        category: 'deploy'
                    },
                    {
                        name: 'lint',
                        command: 'next lint',
                        description: 'Run ESLint',
                        category: 'dev'
                    },
                    {
                        name: 'type-check',
                        command: 'tsc --noEmit',
                        description: 'Run TypeScript type checking',
                        category: 'dev'
                    }
                ],
                configs: [],
                errors: [],
                warnings: [],
                duration
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return this.createErrorResult(`Failed to setup Next.js: ${errorMessage}`, startTime, [], error);
        }
    }
    async uninstall(context) {
        const startTime = Date.now();
        try {
            // Remove Next.js specific files
            const filesToRemove = [
                'next.config.js',
                'next.config.ts',
                'tsconfig.json',
                'eslint.config.mjs',
                'eslint.config.js',
                'src/app',
                'src/pages',
                'src/styles',
                'next-env.d.ts'
            ];
            for (const file of filesToRemove) {
                const filePath = path.join(context.projectPath, file);
                if (await fsExtra.pathExists(filePath)) {
                    await fsExtra.remove(filePath);
                }
            }
            return {
                success: true,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [],
                warnings: [],
                duration: Date.now() - startTime
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return this.createErrorResult(`Failed to uninstall Next.js: ${errorMessage}`, startTime, [], error);
        }
    }
    async update(context) {
        return this.install(context);
    }
    // ============================================================================
    // VALIDATION & COMPATIBILITY
    // ============================================================================
    async validate(context) {
        const errors = [];
        const warnings = [];
        // For framework plugins that create projects, the directory should NOT exist yet
        if (await fsExtra.pathExists(context.projectPath)) {
            errors.push({
                field: 'projectPath',
                message: `Project directory already exists: ${context.projectPath}`,
                code: 'DIRECTORY_EXISTS',
                severity: 'error'
            });
        }
        // Check parent directory exists and is writable
        const parentDir = path.dirname(context.projectPath);
        if (!await fsExtra.pathExists(parentDir)) {
            errors.push({
                field: 'projectPath',
                message: `Parent directory does not exist: ${parentDir}`,
                code: 'PARENT_DIRECTORY_NOT_FOUND',
                severity: 'error'
            });
        }
        // Validate project name
        if (!context.pluginConfig?.projectName) {
            errors.push({
                field: 'projectName',
                message: 'Project name is required',
                code: 'PROJECT_NAME_REQUIRED',
                severity: 'error'
            });
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    getCompatibility() {
        return {
            frameworks: ['react'],
            platforms: [TargetPlatform.WEB, TargetPlatform.SERVER],
            nodeVersions: ['18.0.0', '20.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
            conflicts: ['vue', 'angular', 'svelte']
        };
    }
    getDependencies() {
        return [];
    }
    getConflicts() {
        return ['vue', 'angular', 'svelte'];
    }
    getRequirements() {
        return [
            {
                type: 'package',
                name: 'next',
                version: '^15.0.0',
                description: 'Next.js framework'
            },
            {
                type: 'package',
                name: 'react',
                version: '^19.0.0',
                description: 'React library'
            },
            {
                type: 'package',
                name: 'react-dom',
                version: '^19.0.0',
                description: 'React DOM'
            },
            {
                type: 'package',
                name: 'typescript',
                version: '^5.0.0',
                description: 'TypeScript support'
            }
        ];
    }
    getDefaultConfig() {
        return {
            typescript: true,
            tailwind: true,
            eslint: true,
            appRouter: true,
            srcDir: true,
            importAlias: '@/*',
            skipInstall: true
        };
    }
    getConfigSchema() {
        return {
            type: 'object',
            properties: {
                typescript: {
                    type: 'boolean',
                    description: 'Initialize as TypeScript project',
                    default: true
                },
                tailwind: {
                    type: 'boolean',
                    description: 'Initialize with Tailwind CSS',
                    default: true
                },
                eslint: {
                    type: 'boolean',
                    description: 'Initialize with ESLint',
                    default: true
                },
                appRouter: {
                    type: 'boolean',
                    description: 'Use App Router (recommended)',
                    default: true
                },
                srcDir: {
                    type: 'boolean',
                    description: 'Initialize inside src/ directory',
                    default: true
                },
                importAlias: {
                    type: 'string',
                    description: 'Import alias prefix',
                    default: '@/*'
                },
                skipInstall: {
                    type: 'boolean',
                    description: 'Skip dependency installation',
                    default: true
                }
            }
        };
    }
    // ============================================================================
    // PRIVATE METHODS
    // ============================================================================
    buildCreateNextAppArgs(config) {
        const args = [config.projectName || 'my-app'];
        // Add flags based on configuration
        if (config.typescript !== false) {
            args.push('--typescript');
        }
        else {
            args.push('--javascript');
        }
        if (config.tailwind !== false) {
            args.push('--tailwind');
        }
        if (config.eslint !== false) {
            args.push('--eslint');
        }
        if (config.appRouter !== false) {
            args.push('--app');
        }
        if (config.srcDir !== false) {
            args.push('--src-dir');
        }
        if (config.importAlias) {
            args.push('--import-alias', config.importAlias);
        }
        if (config.skipInstall !== false) {
            args.push('--skip-install');
        }
        // Always use yes to skip prompts
        args.push('--yes');
        return args;
    }
    async customizeProject(context) {
        const { projectPath, pluginConfig } = context;
        // Add custom configurations if needed
        if (pluginConfig.customConfig) {
            await this.addCustomConfigurations(projectPath, pluginConfig);
        }
    }
    async addEnhancements(context) {
        const { projectPath } = context;
        // Add any project-specific enhancements
        // This could include custom scripts, configurations, etc.
    }
    async addCustomConfigurations(projectPath, config) {
        // Add any custom configurations that aren't provided by create-next-app
        // This is where we can add project-specific customizations
    }
    createErrorResult(message, startTime, errors = [], originalError) {
        return {
            success: false,
            artifacts: [],
            dependencies: [],
            scripts: [],
            configs: [],
            errors: [
                {
                    code: 'NEXTJS_SETUP_FAILED',
                    message,
                    details: originalError,
                    severity: 'error'
                },
                ...errors
            ],
            warnings: [],
            duration: Date.now() - startTime
        };
    }
}
//# sourceMappingURL=nextjs-plugin.js.map