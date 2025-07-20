/**
 * UI Agent - Design System Orchestrator
 *
 * The brain for UI/design system decisions and plugin orchestration.
 * Handles user interaction, decision making, and coordinates the Shadcn/ui plugin.
 * Pure orchestrator - no direct installation logic.
 */
import { AgentCategory } from '../types/agent.js';
import { PluginSystem } from '../utils/plugin-system.js';
import { AbstractAgent } from './base/abstract-agent.js';
import { ProjectType, TargetPlatform } from '../types/plugin.js';
import { templateService } from '../utils/template-service.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import inquirer from 'inquirer';
import chalk from 'chalk';
export class UIAgent extends AbstractAgent {
    pluginSystem;
    templateService;
    constructor() {
        super();
        this.pluginSystem = PluginSystem.getInstance();
        this.templateService = templateService;
    }
    // ============================================================================
    // AGENT METADATA
    // ============================================================================
    getAgentMetadata() {
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
    getAgentCapabilities() {
        return [];
    }
    // ============================================================================
    // CORE EXECUTION
    // ============================================================================
    async executeInternal(context) {
        const startTime = Date.now();
        try {
            context.logger.info('Starting UI/Design System orchestration...');
            // For monorepo, install UI components in the ui package directory
            const isMonorepo = context.projectStructure?.type === 'monorepo';
            let installPath;
            if (isMonorepo) {
                // Install in the ui package directory (packages/ui)
                installPath = path.join(context.projectPath, 'packages', 'ui');
                context.logger.info(`UI package path: ${installPath}`);
                // Ensure the ui package directory exists
                await fsExtra.ensureDir(installPath);
                context.logger.info(`Using ui package directory for UI setup: ${installPath}`);
            }
            else {
                // For single-app, use the project root
                installPath = context.projectPath;
                context.logger.info(`Using project root for UI setup: ${installPath}`);
            }
            // Select UI plugin based on user preferences or project requirements
            const selectedPlugin = await this.selectUIPlugin(context);
            // Get UI configuration
            const uiConfig = await this.getUIConfig(context);
            // Execute selected UI plugin in the correct location
            context.logger.info(`Executing ${selectedPlugin} plugin...`);
            const result = await this.executeUIPlugin(context, selectedPlugin, uiConfig, installPath);
            // Validate the setup
            await this.validateUISetup(context, installPath);
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: result.artifacts || [],
                data: {
                    plugin: selectedPlugin,
                    installPath,
                    designSystem: uiConfig.designSystem
                },
                errors: [],
                warnings: result.warnings || [],
                duration
            };
        }
        catch (error) {
            return {
                success: false,
                data: null,
                errors: [{
                        code: 'UI_AGENT_ERROR',
                        message: error instanceof Error ? error.message : 'Unknown error occurred',
                        details: error,
                        recoverable: false,
                        suggestion: 'Check UI plugin configuration and try again',
                        timestamp: new Date()
                    }],
                warnings: [],
                duration: Date.now() - startTime
            };
        }
    }
    // ============================================================================
    // VALIDATION
    // ============================================================================
    async validate(context) {
        const baseValidation = await super.validate(context);
        if (!baseValidation.valid) {
            return baseValidation;
        }
        const errors = [];
        const warnings = [];
        // Check if UI package exists (but don't fail if it doesn't - we'll create it)
        const packagePath = this.getPackagePath(context, 'ui');
        if (!await fsExtra.pathExists(packagePath)) {
            warnings.push(`UI package directory will be created at: ${packagePath}`);
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
    getPackagePath(context, packageName) {
        const isMonorepo = context.projectStructure?.type === 'monorepo';
        if (isMonorepo) {
            return path.join(context.projectPath, 'packages', packageName);
        }
        else {
            // For single-app, install in the root directory (Next.js project)
            return context.projectPath;
        }
    }
    async ensurePackageDirectory(context, packageName, packagePath) {
        const isMonorepo = context.projectStructure?.type === 'monorepo';
        if (isMonorepo) {
            // Create package directory and basic structure
            await fsExtra.ensureDir(packagePath);
            // Create package.json for the UI package
            const packageJson = {
                name: `@${context.projectName}/${packageName}`,
                version: "0.1.0",
                private: true,
                main: "./index.ts",
                types: "./index.ts",
                scripts: {
                    "build": "tsc",
                    "dev": "tsc --watch",
                    "lint": "eslint . --ext .ts,.tsx"
                },
                dependencies: {},
                devDependencies: {
                    "typescript": "^5.0.0"
                }
            };
            await fsExtra.writeJSON(path.join(packagePath, 'package.json'), packageJson, { spaces: 2 });
            // Create index.ts
            await fsExtra.writeFile(path.join(packagePath, 'index.ts'), `// ${packageName} package exports\n`);
            // Create tsconfig.json
            const tsconfig = {
                extends: "../../tsconfig.json",
                compilerOptions: {
                    outDir: "./dist",
                    rootDir: "."
                },
                include: ["./**/*"],
                exclude: ["node_modules", "dist"]
            };
            await fsExtra.writeJSON(path.join(packagePath, 'tsconfig.json'), tsconfig, { spaces: 2 });
            context.logger.info(`Created ${packageName} package at: ${packagePath}`);
        }
        else {
            // For single-app, just ensure the directory exists (Next.js project already has structure)
            await fsExtra.ensureDir(packagePath);
            context.logger.info(`Using existing Next.js project at: ${packagePath}`);
        }
    }
    // ============================================================================
    // PLUGIN SELECTION
    // ============================================================================
    async selectUIPlugin(context) {
        // Check if user has specified a UI plugin preference
        const userPreference = context.config?.ui?.plugin;
        if (userPreference) {
            context.logger.info(`Using user-specified UI plugin: ${userPreference}`);
            return userPreference;
        }
        // Check if we're in non-interactive mode (--yes flag) and no user preference
        if (context.options.useDefaults && !userPreference) {
            context.logger.info('Using default UI plugin: shadcn-ui');
            // Store the default selection in context
            if (!context.config.ui)
                context.config.ui = {};
            context.config.ui.plugin = 'shadcn-ui';
            return 'shadcn-ui';
        }
        // Interactive plugin selection
        const availablePlugins = this.getAvailableUIPlugins();
        if (availablePlugins.length === 1) {
            context.logger.info(`Only one UI plugin available: ${availablePlugins[0].id}`);
            // Store the selection in context
            if (!context.config.ui)
                context.config.ui = {};
            context.config.ui.plugin = availablePlugins[0].id;
            return availablePlugins[0].id;
        }
        // Show plugin selection prompt
        console.log(chalk.blue.bold('\n🎨 Choose your UI framework:\n'));
        const choices = availablePlugins.map(plugin => {
            const metadata = plugin.getMetadata();
            return {
                name: `${metadata.name} - ${metadata.description}`,
                value: metadata.id,
                description: `Tags: ${metadata.tags.join(', ')}`
            };
        });
        const { selectedPlugin } = await inquirer.prompt([
            {
                type: 'list',
                name: 'selectedPlugin',
                message: chalk.yellow('Select UI framework:'),
                choices,
                default: 'shadcn-ui'
            }
        ]);
        context.logger.info(`Selected UI plugin: ${selectedPlugin}`);
        // Store the selection in context
        if (!context.config.ui)
            context.config.ui = {};
        context.config.ui.plugin = selectedPlugin;
        return selectedPlugin;
    }
    getAvailableUIPlugins() {
        const registry = this.pluginSystem.getRegistry();
        const allPlugins = registry.getAll();
        return allPlugins.filter(plugin => {
            const metadata = plugin.getMetadata();
            return metadata.category === 'ui-library' || metadata.category === 'design-system';
        });
    }
    // ============================================================================
    // PRIVATE METHODS
    // ============================================================================
    async getUIConfig(context) {
        // Get configuration from context or use defaults
        const userConfig = context.config.ui || {};
        return {
            designSystem: userConfig.designSystem || 'shadcn',
            styling: userConfig.styling || 'tailwind',
            theme: userConfig.theme || 'default',
            components: userConfig.components || ['button', 'card', 'input', 'form']
        };
    }
    async executeUIPlugin(context, pluginName, uiConfig, installPath) {
        // Get the selected plugin
        const plugin = this.pluginSystem.getRegistry().get(pluginName);
        if (!plugin) {
            throw new Error(`${pluginName} plugin not found in registry`);
        }
        // Prepare plugin context with correct path
        const pluginContext = {
            ...context,
            projectPath: installPath, // Use the correct install path
            pluginId: pluginName,
            pluginConfig: this.getPluginConfig(context),
            installedPlugins: [],
            projectType: ProjectType.NEXTJS,
            targetPlatform: [TargetPlatform.WEB]
        };
        // Validate plugin compatibility
        const validation = await plugin.validate(pluginContext);
        if (!validation.valid) {
            throw new Error(`${pluginName} plugin validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
        }
        // Execute the plugin
        context.logger.info(`Executing ${pluginName} plugin...`);
        const result = await plugin.install(pluginContext);
        if (!result.success) {
            throw new Error(`${pluginName} plugin execution failed: ${result.errors.map(e => e.message).join(', ')}`);
        }
        return result;
    }
    async validateUISetup(context, installPath) {
        context.logger.info('Validating UI setup...');
        // Check for essential UI files
        const essentialFiles = [
            'components.json',
            'src/components/ui/button.tsx',
            'src/lib/utils.ts'
        ];
        for (const file of essentialFiles) {
            const filePath = path.join(installPath, file);
            if (!await fsExtra.pathExists(filePath)) {
                throw new Error(`UI file missing: ${file}`);
            }
        }
        // Check for Tailwind config (either .js or .ts)
        const tailwindConfigJs = path.join(installPath, 'config', 'tailwind.config.js');
        const tailwindConfigTs = path.join(installPath, 'config', 'tailwind.config.ts');
        if (!await fsExtra.pathExists(tailwindConfigJs) && !await fsExtra.pathExists(tailwindConfigTs)) {
            throw new Error('Tailwind configuration file missing');
        }
        context.logger.success('UI setup validation passed');
    }
    getPluginConfig(context) {
        return {
            components: ['button', 'input', 'card', 'dialog'],
            includeExamples: true,
            useTypeScript: true,
            yes: true,
            defaults: true
        };
    }
    // ============================================================================
    // ROLLBACK
    // ============================================================================
    async rollback(context) {
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
        }
        catch (error) {
            context.logger.error(`Failed to rollback UI changes: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
//# sourceMappingURL=ui-agent.js.map