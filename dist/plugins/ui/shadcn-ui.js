/**
 * Shadcn/ui Plugin - Pure Technology Implementation
 *
 * Provides Shadcn/ui design system integration using the official shadcn CLI.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { PluginCategory, TargetPlatform } from '../../types/plugin.js';
import { templateService } from '../../utils/template-service.js';
import { CommandRunner } from '../../utils/command-runner.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
export class ShadcnUIPlugin {
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
            id: 'shadcn-ui',
            name: 'Shadcn/ui',
            version: '1.0.0',
            description: 'Modern component library built with Radix UI and Tailwind CSS',
            author: 'The Architech Team',
            category: PluginCategory.DESIGN_SYSTEM,
            tags: ['ui', 'components', 'design-system', 'tailwind', 'radix'],
            license: 'MIT',
            repository: 'https://github.com/shadcn/ui',
            homepage: 'https://ui.shadcn.com'
        };
    }
    // ============================================================================
    // PLUGIN LIFECYCLE - Pure Technology Implementation
    // ============================================================================
    async install(context) {
        const startTime = Date.now();
        try {
            const { projectPath, pluginConfig } = context;
            context.logger.info('Installing Shadcn/ui design system using official CLI...');
            // Step 1: Initialize Shadcn/ui using official CLI
            await this.initializeShadcn(context);
            // Step 2: Add requested components using official CLI
            await this.addComponents(context);
            // Step 3: Customize configuration if needed
            await this.customizeConfiguration(context);
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: [
                    {
                        type: 'file',
                        path: path.join(projectPath, 'components.json')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'tailwind.config.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'lib/utils.ts')
                    }
                ],
                dependencies: [
                    {
                        name: 'tailwindcss',
                        version: '^3.4.0',
                        type: 'development',
                        category: PluginCategory.DESIGN_SYSTEM
                    },
                    {
                        name: 'class-variance-authority',
                        version: '^0.7.0',
                        type: 'production',
                        category: PluginCategory.DESIGN_SYSTEM
                    },
                    {
                        name: 'clsx',
                        version: '^2.0.0',
                        type: 'production',
                        category: PluginCategory.DESIGN_SYSTEM
                    },
                    {
                        name: 'tailwind-merge',
                        version: '^2.0.0',
                        type: 'production',
                        category: PluginCategory.DESIGN_SYSTEM
                    },
                    {
                        name: 'lucide-react',
                        version: '^0.300.0',
                        type: 'production',
                        category: PluginCategory.DESIGN_SYSTEM
                    },
                    {
                        name: '@radix-ui/react-slot',
                        version: '^1.0.2',
                        type: 'production',
                        category: PluginCategory.DESIGN_SYSTEM
                    },
                    {
                        name: 'tailwindcss-animate',
                        version: '^1.0.7',
                        type: 'development',
                        category: PluginCategory.DESIGN_SYSTEM
                    }
                ],
                scripts: [
                    {
                        name: 'ui:add',
                        command: 'shadcn add',
                        description: 'Add a Shadcn/ui component',
                        category: 'dev'
                    },
                    {
                        name: 'ui:build',
                        command: 'shadcn build',
                        description: 'Build Shadcn/ui components',
                        category: 'build'
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
            return this.createErrorResult(`Failed to setup Shadcn/ui: ${errorMessage}`, startTime, [], error);
        }
    }
    async uninstall(context) {
        const startTime = Date.now();
        try {
            const { projectPath } = context;
            // Remove Shadcn/ui specific files
            const filesToRemove = [
                'components.json',
                'components/ui',
                'lib/utils.ts'
            ];
            for (const file of filesToRemove) {
                const filePath = path.join(projectPath, file);
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
            return this.createErrorResult(`Failed to uninstall Shadcn/ui: ${errorMessage}`, startTime, [], error);
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
        // Check if project directory exists
        if (!await fsExtra.pathExists(context.projectPath)) {
            errors.push({
                field: 'projectPath',
                message: `Project directory does not exist: ${context.projectPath}`,
                code: 'DIRECTORY_NOT_FOUND',
                severity: 'error'
            });
        }
        // Check for Tailwind CSS
        const tailwindConfigPath = path.join(context.projectPath, 'tailwind.config.js');
        const tailwindConfigTsPath = path.join(context.projectPath, 'tailwind.config.ts');
        if (!await fsExtra.pathExists(tailwindConfigPath) && !await fsExtra.pathExists(tailwindConfigTsPath)) {
            warnings.push('Tailwind CSS configuration not found - Shadcn/ui requires Tailwind CSS');
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    getCompatibility() {
        return {
            frameworks: ['next', 'react', 'vue', 'svelte'],
            platforms: [TargetPlatform.WEB],
            nodeVersions: ['18.0.0', '20.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
            conflicts: ['material-ui', 'antd', 'chakra-ui']
        };
    }
    getDependencies() {
        return ['tailwindcss'];
    }
    getConflicts() {
        return ['material-ui', 'antd', 'chakra-ui'];
    }
    getRequirements() {
        return [
            {
                type: 'package',
                name: 'tailwindcss',
                version: '^3.4.0',
                description: 'Tailwind CSS framework'
            },
            {
                type: 'package',
                name: 'class-variance-authority',
                version: '^0.7.0',
                description: 'Component variant management'
            },
            {
                type: 'package',
                name: 'clsx',
                version: '^2.0.0',
                description: 'Conditional className utility'
            },
            {
                type: 'package',
                name: 'tailwind-merge',
                version: '^2.0.0',
                description: 'Tailwind CSS class merging utility'
            }
        ];
    }
    getDefaultConfig() {
        return {
            template: 'next',
            baseColor: 'neutral',
            cssVariables: true,
            srcDir: false,
            components: ['button', 'input', 'card', 'dialog'],
            yes: true,
            defaults: true
        };
    }
    getConfigSchema() {
        return {
            type: 'object',
            properties: {
                template: {
                    type: 'string',
                    enum: ['next', 'next-monorepo'],
                    description: 'Template to use for initialization',
                    default: 'next'
                },
                baseColor: {
                    type: 'string',
                    enum: ['neutral', 'gray', 'zinc', 'stone', 'slate'],
                    description: 'Base color for the design system',
                    default: 'neutral'
                },
                cssVariables: {
                    type: 'boolean',
                    description: 'Use CSS variables for theming',
                    default: true
                },
                srcDir: {
                    type: 'boolean',
                    description: 'Use src directory structure',
                    default: false
                },
                components: {
                    type: 'array',
                    items: {
                        type: 'string',
                        description: 'Component name to install'
                    },
                    description: 'Components to install',
                    default: ['button', 'input', 'card', 'dialog']
                },
                yes: {
                    type: 'boolean',
                    description: 'Skip confirmation prompts',
                    default: true
                },
                defaults: {
                    type: 'boolean',
                    description: 'Use default configuration',
                    default: true
                }
            }
        };
    }
    // ============================================================================
    // PRIVATE METHODS
    // ============================================================================
    async initializeShadcn(context) {
        const { projectPath, pluginConfig } = context;
        const args = this.buildInitArgs(pluginConfig);
        context.logger.info('Initializing Shadcn/ui...');
        await this.runner.exec('shadcn', ['init', ...args], projectPath);
    }
    async addComponents(context) {
        const { projectPath, pluginConfig } = context;
        const components = pluginConfig.components || ['button', 'input', 'card', 'dialog'];
        for (const component of components) {
            context.logger.info(`Adding component: ${component}`);
            await this.runner.exec('shadcn', ['add', component, '--yes'], projectPath);
        }
    }
    async customizeConfiguration(context) {
        const { projectPath, pluginConfig } = context;
        // Add any custom configurations that aren't provided by the CLI
        if (pluginConfig.customConfig) {
            await this.addCustomConfigurations(projectPath, pluginConfig);
        }
    }
    buildInitArgs(config) {
        const args = [];
        if (config.template) {
            args.push('--template', config.template);
        }
        if (config.baseColor) {
            args.push('--base-color', config.baseColor);
        }
        if (config.cssVariables === false) {
            args.push('--no-css-variables');
        }
        if (config.srcDir) {
            args.push('--src-dir');
        }
        if (config.yes !== false) {
            args.push('--yes');
        }
        if (config.defaults) {
            args.push('--defaults');
        }
        return args;
    }
    async addCustomConfigurations(projectPath, config) {
        // Add any custom configurations that aren't provided by the shadcn CLI
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
                    code: 'SHADCN_SETUP_FAILED',
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
//# sourceMappingURL=shadcn-ui.js.map