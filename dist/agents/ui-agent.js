/**
 * UI Agent - Design System Orchestrator
 *
 * The brain for UI/design system decisions and plugin orchestration.
 * Handles user interaction, decision making, and coordinates UI plugins through unified interfaces.
 * Pure orchestrator - no direct installation logic.
 */
import * as path from 'path';
import fsExtra from 'fs-extra';
import { AbstractAgent } from './base/abstract-agent.js';
import { PluginSystem } from '../core/plugin/plugin-system.js';
import { ProjectType, TargetPlatform } from '../types/plugin.js';
import { AgentCategory, CapabilityCategory } from '../types/agent.js';
export class UIAgent extends AbstractAgent {
    pluginSystem;
    constructor() {
        super();
        this.pluginSystem = PluginSystem.getInstance();
    }
    // ============================================================================
    // AGENT METADATA
    // ============================================================================
    getAgentMetadata() {
        return {
            name: 'UIAgent',
            version: '2.0.0',
            description: 'Orchestrates UI/design system setup using unified interfaces',
            author: 'The Architech Team',
            category: AgentCategory.UI,
            tags: ['ui', 'design-system', 'components', 'unified-interface'],
            dependencies: ['base-project'],
            conflicts: [],
            requirements: [
                {
                    type: 'package',
                    name: 'fs-extra',
                    description: 'File system utilities'
                }
            ],
            license: 'MIT',
            repository: 'https://github.com/the-architech/cli'
        };
    }
    getAgentCapabilities() {
        return [
            {
                name: 'ui-setup',
                description: 'Setup UI/design system with unified interfaces',
                category: CapabilityCategory.SETUP,
                parameters: [
                    {
                        name: 'designSystem',
                        type: 'string',
                        description: 'Design system to use',
                        required: false,
                        defaultValue: 'shadcn-ui'
                    },
                    {
                        name: 'theme',
                        type: 'string',
                        description: 'Theme mode',
                        required: false,
                        defaultValue: 'auto'
                    },
                    {
                        name: 'components',
                        type: 'array',
                        description: 'Components to install',
                        required: false,
                        defaultValue: ['button', 'input', 'card', 'form']
                    },
                    {
                        name: 'styling',
                        type: 'string',
                        description: 'Styling approach',
                        required: false,
                        defaultValue: 'tailwind'
                    },
                    {
                        name: 'features',
                        type: 'object',
                        description: 'Advanced UI features',
                        required: false,
                        defaultValue: {
                            animations: false,
                            responsiveDesign: true,
                            themeCustomization: false,
                            componentLibrary: true,
                            iconLibrary: false,
                            accessibility: true
                        }
                    },
                    {
                        name: 'animations',
                        type: 'object',
                        description: 'Animation configuration',
                        required: false,
                        defaultValue: {
                            library: 'framer-motion',
                            duration: 300,
                            easing: 'ease-in-out'
                        }
                    },
                    {
                        name: 'responsiveDesign',
                        type: 'object',
                        description: 'Responsive design configuration',
                        required: false,
                        defaultValue: {
                            breakpoints: ['sm', 'md', 'lg', 'xl', '2xl'],
                            mobileFirst: true,
                            fluidTypography: false
                        }
                    },
                    {
                        name: 'themeCustomization',
                        type: 'object',
                        description: 'Theme customization',
                        required: false,
                        defaultValue: {
                            colors: {},
                            fonts: {},
                            spacing: {},
                            borderRadius: {}
                        }
                    },
                    {
                        name: 'iconLibrary',
                        type: 'object',
                        description: 'Icon library configuration',
                        required: false,
                        defaultValue: {
                            provider: 'lucide',
                            includeIcons: ['home', 'user', 'settings', 'search']
                        }
                    }
                ],
                examples: [
                    {
                        name: 'Setup Shadcn/ui',
                        description: 'Creates UI setup with Shadcn/ui components using unified interfaces',
                        parameters: { designSystem: 'shadcn-ui', theme: 'auto' },
                        expectedResult: 'Complete UI setup with Shadcn/ui via unified interface'
                    },
                    {
                        name: 'Setup Tamagui',
                        description: 'Creates UI setup with Tamagui components using unified interfaces',
                        parameters: { designSystem: 'tamagui', theme: 'dark' },
                        expectedResult: 'UI setup with Tamagui via unified interface'
                    },
                    {
                        name: 'Setup advanced UI',
                        description: 'Creates UI setup with animations and responsive design using unified interfaces',
                        parameters: {
                            designSystem: 'shadcn-ui',
                            theme: 'auto',
                            features: { animations: true, responsiveDesign: true, iconLibrary: true },
                            animations: { library: 'framer-motion', duration: 250, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
                            responsiveDesign: { breakpoints: ['sm', 'md', 'lg', 'xl'], mobileFirst: true, fluidTypography: true },
                            iconLibrary: { provider: 'lucide', includeIcons: ['home', 'user', 'settings', 'search', 'menu', 'close'] }
                        },
                        expectedResult: 'Advanced UI setup with animations and responsive design via unified interface'
                    }
                ]
            },
            {
                name: 'ui-validation',
                description: 'Validate UI setup',
                category: CapabilityCategory.VALIDATION,
                parameters: [],
                examples: [
                    {
                        name: 'Validate UI setup',
                        description: 'Validates the UI setup using unified interfaces',
                        parameters: {},
                        expectedResult: 'UI setup validation report'
                    }
                ]
            },
            {
                name: 'ui-animations',
                description: 'Setup UI animations',
                category: CapabilityCategory.SETUP,
                parameters: [
                    {
                        name: 'library',
                        type: 'string',
                        description: 'Animation library to use',
                        required: true
                    },
                    {
                        name: 'duration',
                        type: 'number',
                        description: 'Default animation duration',
                        required: false,
                        defaultValue: 300
                    },
                    {
                        name: 'easing',
                        type: 'string',
                        description: 'Default easing function',
                        required: false,
                        defaultValue: 'ease-in-out'
                    }
                ],
                examples: [
                    {
                        name: 'Setup animations',
                        description: 'Creates animation system with Framer Motion',
                        parameters: {
                            library: 'framer-motion',
                            duration: 250,
                            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
                        },
                        expectedResult: 'Animation system setup with Framer Motion'
                    }
                ]
            },
            {
                name: 'ui-responsive',
                description: 'Setup responsive design',
                category: CapabilityCategory.SETUP,
                parameters: [
                    {
                        name: 'breakpoints',
                        type: 'array',
                        description: 'Breakpoint definitions',
                        required: true
                    },
                    {
                        name: 'mobileFirst',
                        type: 'boolean',
                        description: 'Use mobile-first approach',
                        required: false,
                        defaultValue: true
                    },
                    {
                        name: 'fluidTypography',
                        type: 'boolean',
                        description: 'Enable fluid typography',
                        required: false,
                        defaultValue: false
                    }
                ],
                examples: [
                    {
                        name: 'Setup responsive design',
                        description: 'Creates responsive design system',
                        parameters: {
                            breakpoints: ['sm', 'md', 'lg', 'xl', '2xl'],
                            mobileFirst: true,
                            fluidTypography: true
                        },
                        expectedResult: 'Responsive design system with mobile-first approach'
                    }
                ]
            }
        ];
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
            // Execute selected UI plugin through unified interface
            context.logger.info(`Executing ${selectedPlugin} plugin through unified interface...`);
            const result = await this.executeUIPluginUnified(context, selectedPlugin, uiConfig, installPath);
            // Validate the setup using unified interface
            await this.validateUISetupUnified(context, selectedPlugin, installPath);
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: result.artifacts || [],
                data: {
                    plugin: selectedPlugin,
                    installPath,
                    designSystem: uiConfig.designSystem,
                    theme: uiConfig.theme,
                    unifiedInterface: true
                },
                errors: [],
                warnings: result.warnings || [],
                duration
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            context.logger.error(`UI setup failed: ${errorMessage}`);
            return this.createErrorResult('UI_SETUP_FAILED', `Failed to setup UI: ${errorMessage}`, [], startTime, error);
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
        // Get plugin selection from context to determine which UI to use
        const pluginSelection = context.state.get('pluginSelection');
        const selectedUI = pluginSelection?.ui?.type;
        if (selectedUI && selectedUI !== 'none') {
            // Map plugin selection UI types to actual plugin system IDs
            const uiMapping = {
                'shadcn': 'shadcn-ui',
                'radix': 'shadcn-ui', // Radix is included with shadcn-ui
                'none': 'shadcn-ui'
            };
            const actualPluginId = uiMapping[selectedUI] || 'shadcn-ui';
            context.logger.info(`Using user selection for UI: ${selectedUI} -> ${actualPluginId}`);
            return actualPluginId;
        }
        // Check if user has specified a preference
        const userPreference = context.state.get('uiTechnology');
        if (userPreference) {
            context.logger.info(`Using user preference for UI: ${userPreference}`);
            return userPreference;
        }
        // Check if project has specified UI technology
        const projectUI = context.config.ui?.technology;
        if (projectUI) {
            context.logger.info(`Using project UI technology: ${projectUI}`);
            return projectUI;
        }
        // Default to Shadcn/ui for Next.js projects
        context.logger.info('Using default UI technology: shadcn-ui');
        return 'shadcn-ui';
    }
    getAvailableUIPlugins() {
        const registry = this.pluginSystem.getRegistry();
        const allPlugins = registry.getAll();
        return allPlugins.filter((plugin) => {
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
            designSystem: userConfig.designSystem || 'shadcn-ui',
            styling: userConfig.styling || 'tailwind',
            theme: userConfig.theme || 'auto',
            components: userConfig.components || ['button', 'card', 'input', 'form'],
            features: {
                animations: userConfig.features?.animations || false,
                responsiveDesign: userConfig.features?.responsiveDesign || false,
                themeCustomization: userConfig.features?.themeCustomization || false,
                componentLibrary: userConfig.features?.componentLibrary || false,
                iconLibrary: userConfig.features?.iconLibrary || false,
                accessibility: userConfig.features?.accessibility || false,
            },
            animations: userConfig.animations,
            responsiveDesign: userConfig.responsiveDesign,
            themeCustomization: userConfig.themeCustomization,
            iconLibrary: userConfig.iconLibrary,
        };
    }
    async executeUIPluginUnified(context, pluginName, uiConfig, installPath) {
        try {
            context.logger.info(`Starting unified execution of ${pluginName} plugin...`);
            // Get the selected plugin
            const plugin = this.pluginSystem.getRegistry().get(pluginName);
            if (!plugin) {
                throw new Error(`${pluginName} plugin not found in registry`);
            }
            context.logger.info(`Found ${pluginName} plugin in registry`);
            // Prepare plugin context
            const pluginContext = {
                ...context,
                projectPath: installPath,
                pluginId: pluginName,
                pluginConfig: this.getPluginConfig(uiConfig, pluginName),
                installedPlugins: [],
                projectType: ProjectType.NEXTJS,
                targetPlatform: [TargetPlatform.WEB]
            };
            context.logger.info(`Plugin context prepared for ${pluginName}`);
            // Validate plugin compatibility
            context.logger.info(`Validating ${pluginName} plugin...`);
            const validation = await plugin.validate(pluginContext);
            if (!validation.valid) {
                throw new Error(`${pluginName} plugin validation failed: ${validation.errors.map((e) => e.message).join(', ')}`);
            }
            context.logger.info(`${pluginName} plugin validation passed`);
            // Execute the plugin
            context.logger.info(`Executing ${pluginName} plugin...`);
            const result = await plugin.install(pluginContext);
            if (!result.success) {
                throw new Error(`${pluginName} plugin execution failed: ${result.errors.map((e) => e.message).join(', ')}`);
            }
            context.logger.info(`${pluginName} plugin execution completed successfully`);
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to execute UI plugin ${pluginName}: ${errorMessage}`);
        }
    }
    async validateUISetupUnified(context, pluginName, installPath) {
        try {
            context.logger.info(`Validating UI setup using unified interface for ${pluginName}...`);
            // Check if unified interface files exist
            const unifiedFiles = [
                path.join(installPath, 'src', 'lib', 'ui', 'index.ts'),
                path.join(installPath, 'src', 'lib', 'ui', 'components.tsx'),
                path.join(installPath, 'src', 'lib', 'ui', 'theme.ts')
            ];
            for (const file of unifiedFiles) {
                if (!await fsExtra.pathExists(file)) {
                    throw new Error(`Required unified interface file not found: ${file}`);
                }
            }
            // Get the plugin and validate it
            const plugin = this.pluginSystem.getRegistry().get(pluginName);
            if (!plugin) {
                throw new Error(`UI plugin not found: ${pluginName}`);
            }
            const pluginContext = {
                ...context,
                projectPath: installPath,
                pluginId: pluginName,
                pluginConfig: {},
                installedPlugins: [],
                projectType: ProjectType.NEXTJS,
                targetPlatform: [TargetPlatform.WEB]
            };
            const validation = await plugin.validate(pluginContext);
            if (!validation.valid) {
                const errorMessages = validation.errors.map((e) => e.message).join(', ');
                throw new Error(`UI plugin validation failed: ${errorMessages}`);
            }
            context.logger.success(`UI plugin ${pluginName} validation passed`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`UI plugin validation failed: ${errorMessage}`);
        }
    }
    getPluginConfig(uiConfig, pluginName) {
        return {
            components: uiConfig.components,
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