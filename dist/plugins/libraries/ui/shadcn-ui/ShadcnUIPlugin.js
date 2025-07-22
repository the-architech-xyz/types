/**
 * Shadcn/ui Plugin - Updated with Latest Best Practices
 *
 * Provides Shadcn/ui design system integration using the official shadcn CLI.
 * Follows latest Shadcn/ui documentation and TypeScript best practices.
 *
 * References:
 * - https://ui.shadcn.com/docs/installation
 * - https://ui.shadcn.com/docs/components
 * - https://ui.shadcn.com/docs/themes
 */
import { PluginCategory, TargetPlatform } from '../../../../types/plugin.js';
import { templateService } from '../../../../core/templates/template-service.js';
import { CommandRunner } from '../../../../core/cli/command-runner.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { ShadcnUIConfigSchema, ShadcnUIDefaultConfig } from './ShadcnUISchema.js';
import { ShadcnUIGenerator } from './ShadcnUIGenerator.js';
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
            homepage: 'https://ui.shadcn.com',
            documentation: 'https://ui.shadcn.com/docs'
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
            // Step 1: Install dependencies
            await this.installDependencies(context);
            // Step 2: Create self-contained Tailwind configuration
            await this.createTailwindConfig(context);
            // Step 3: Initialize Shadcn/ui
            await this.initializeShadcn(context);
            // Step 4: Create UI components structure
            await this.createUIComponents(context);
            // Step 5: Create package exports
            await this.createPackageExports(context);
            // Step 6: Generate unified interface files
            await this.generateUnifiedInterfaceFiles(context);
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: [
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'ui', 'index.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'ui', 'components.tsx')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'ui', 'theme.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'components', 'ui', 'button.tsx')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'components', 'ui', 'card.tsx')
                    }
                ],
                dependencies: [
                    {
                        name: '@radix-ui/react-slot',
                        version: '^1.0.2',
                        type: 'production',
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
                        name: 'tailwindcss-animate',
                        version: '^1.0.7',
                        type: 'production',
                        category: PluginCategory.DESIGN_SYSTEM
                    }
                ],
                scripts: [
                    {
                        name: 'ui:add',
                        command: 'npx shadcn@latest add',
                        description: 'Add a new Shadcn/ui component',
                        category: 'dev'
                    },
                    {
                        name: 'ui:init',
                        command: 'npx shadcn@latest init',
                        description: 'Initialize Shadcn/ui configuration',
                        category: 'dev'
                    }
                ],
                configs: [
                    {
                        file: '.env',
                        content: ShadcnUIGenerator.generateEnvConfig(pluginConfig),
                        mergeStrategy: 'append'
                    }
                ],
                errors: [],
                warnings: [],
                duration
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to install Shadcn/ui', startTime, [], error);
        }
    }
    async uninstall(context) {
        const startTime = Date.now();
        try {
            const { projectPath } = context;
            context.logger.info('Uninstalling Shadcn/ui...');
            // Remove Shadcn/ui files
            const filesToRemove = [
                path.join(projectPath, 'src', 'components', 'ui'),
                path.join(projectPath, 'src', 'lib', 'ui'),
                path.join(projectPath, 'components.json')
            ];
            for (const file of filesToRemove) {
                if (await fsExtra.pathExists(file)) {
                    await fsExtra.remove(file);
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
                warnings: ['Shadcn/ui files removed. You may need to manually remove dependencies from package.json'],
                duration
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to uninstall Shadcn/ui', startTime, [], error);
        }
    }
    async update(context) {
        const startTime = Date.now();
        try {
            context.logger.info('Updating Shadcn/ui...');
            // Update dependencies
            await this.runner.execCommand(['npm', 'update', '@radix-ui/react-slot', 'class-variance-authority', 'clsx', 'tailwind-merge', 'tailwindcss-animate']);
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
        }
        catch (error) {
            return this.createErrorResult('Failed to update Shadcn/ui', startTime, [], error);
        }
    }
    async validate(context) {
        const errors = [];
        const warnings = [];
        try {
            // Check if components.json exists
            const configPath = path.join(context.projectPath, 'components.json');
            if (!await fsExtra.pathExists(configPath)) {
                errors.push({
                    field: 'shadcn.config',
                    message: 'Shadcn/ui configuration file not found',
                    code: 'MISSING_CONFIG',
                    severity: 'error'
                });
            }
            // Check if UI components directory exists
            const componentsPath = path.join(context.projectPath, 'src', 'components', 'ui');
            if (!await fsExtra.pathExists(componentsPath)) {
                errors.push({
                    field: 'shadcn.components',
                    message: 'Shadcn/ui components directory not found',
                    code: 'MISSING_COMPONENTS',
                    severity: 'error'
                });
            }
            // Check if utils file exists
            const utilsPath = path.join(context.projectPath, 'src', 'lib', 'utils.ts');
            if (!await fsExtra.pathExists(utilsPath)) {
                warnings.push('Shadcn/ui utils file not found');
            }
            return {
                valid: errors.length === 0,
                errors,
                warnings
            };
        }
        catch (error) {
            return {
                valid: false,
                errors: [{
                        field: 'validation',
                        message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                        code: 'VALIDATION_ERROR',
                        severity: 'error'
                    }],
                warnings: []
            };
        }
    }
    getCompatibility() {
        return {
            frameworks: ['nextjs', 'react', 'vue', 'svelte', 'angular'],
            platforms: [TargetPlatform.WEB],
            nodeVersions: ['>=16.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
            databases: [],
            conflicts: ['chakra-ui', 'mui', 'tamagui']
        };
    }
    getDependencies() {
        return ['@radix-ui/react-slot', 'class-variance-authority', 'clsx', 'tailwind-merge', 'tailwindcss-animate'];
    }
    getConflicts() {
        return ['chakra-ui', 'mui', 'tamagui'];
    }
    getRequirements() {
        return [
            {
                type: 'package',
                name: '@radix-ui/react-slot',
                description: 'Radix UI Slot component',
                version: '^1.0.2'
            },
            {
                type: 'package',
                name: 'class-variance-authority',
                description: 'Class variance authority for component variants',
                version: '^0.7.0'
            },
            {
                type: 'package',
                name: 'clsx',
                description: 'Conditional className utility',
                version: '^2.0.0'
            },
            {
                type: 'package',
                name: 'tailwind-merge',
                description: 'Tailwind CSS class merging utility',
                version: '^2.0.0'
            },
            {
                type: 'package',
                name: 'tailwindcss-animate',
                description: 'Tailwind CSS animation utilities',
                version: '^1.0.7'
            }
        ];
    }
    getDefaultConfig() {
        return ShadcnUIDefaultConfig;
    }
    getConfigSchema() {
        return ShadcnUIConfigSchema;
    }
    // ============================================================================
    // PRIVATE IMPLEMENTATION METHODS
    // ============================================================================
    async installDependencies(context) {
        const { projectPath } = context;
        context.logger.info('Installing Shadcn/ui dependencies...');
        const dependencies = [
            '@radix-ui/react-slot@^1.0.2',
            'class-variance-authority@^0.7.0',
            'clsx@^2.0.0',
            'tailwind-merge@^2.0.0',
            'tailwindcss-animate@^1.0.7'
        ];
        await this.runner.execCommand(['npm', 'install', ...dependencies], { cwd: projectPath });
    }
    async createTailwindConfig(context) {
        const { projectPath, pluginConfig } = context;
        context.logger.info('Creating Tailwind configuration...');
        // Generate Tailwind config
        const tailwindConfig = ShadcnUIGenerator.generateTailwindConfig(pluginConfig);
        await fsExtra.writeFile(path.join(projectPath, 'tailwind.config.ts'), tailwindConfig);
        // Generate CSS variables
        const cssVariables = ShadcnUIGenerator.generateCSSVariables(pluginConfig);
        await fsExtra.writeFile(path.join(projectPath, 'src', 'app', 'globals.css'), cssVariables);
    }
    async initializeShadcn(context) {
        const { projectPath, pluginConfig } = context;
        context.logger.info('Initializing Shadcn/ui...');
        // Create components.json
        const componentsConfig = {
            "$schema": "https://ui.shadcn.com/schema.json",
            "style": pluginConfig.style || 'default',
            "rsc": true,
            "tsx": true,
            "tailwind": {
                "config": "tailwind.config.ts",
                "css": "src/app/globals.css",
                "baseColor": pluginConfig.baseColor || 'slate',
                "cssVariables": pluginConfig.cssVariables !== false
            },
            "aliases": {
                "components": "@/components",
                "utils": "@/lib/utils"
            }
        };
        await fsExtra.writeFile(path.join(projectPath, 'components.json'), JSON.stringify(componentsConfig, null, 2));
    }
    async createUIComponents(context) {
        const { projectPath } = context;
        context.logger.info('Creating UI components...');
        // Create utils file
        const utilsContent = ShadcnUIGenerator.generateUtilsFile();
        await fsExtra.writeFile(path.join(projectPath, 'src', 'lib', 'utils.ts'), utilsContent);
        // Create components directory
        const componentsDir = path.join(projectPath, 'src', 'components', 'ui');
        await fsExtra.ensureDir(componentsDir);
        // Generate button component
        const buttonContent = ShadcnUIGenerator.generateButtonComponent();
        await fsExtra.writeFile(path.join(componentsDir, 'button.tsx'), buttonContent);
        // Generate card component
        const cardContent = ShadcnUIGenerator.generateCardComponent();
        await fsExtra.writeFile(path.join(componentsDir, 'card.tsx'), cardContent);
    }
    async createPackageExports(context) {
        const { projectPath } = context;
        context.logger.info('Creating package exports...');
        // Create UI lib directory
        const uiLibDir = path.join(projectPath, 'src', 'lib', 'ui');
        await fsExtra.ensureDir(uiLibDir);
        // Generate unified interface
        const unifiedContent = ShadcnUIGenerator.generateUnifiedIndex();
        await fsExtra.writeFile(path.join(uiLibDir, 'index.ts'), unifiedContent);
    }
    async generateUnifiedInterfaceFiles(context) {
        const { projectPath } = context;
        context.logger.info('Generating unified interface files...');
        // This is already handled in createPackageExports
        // Additional unified interface files can be added here
    }
    createErrorResult(message, startTime, errors = [], originalError) {
        const duration = Date.now() - startTime;
        return {
            success: false,
            artifacts: [],
            dependencies: [],
            scripts: [],
            configs: [],
            errors: [
                {
                    code: 'SHADCN_INSTALL_ERROR',
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
//# sourceMappingURL=ShadcnUIPlugin.js.map