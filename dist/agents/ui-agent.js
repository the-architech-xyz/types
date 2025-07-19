/**
 * UI Agent - Design System Package Generator
 *
 * Sets up the packages/ui design system with:
 * - Tailwind CSS configuration
 * - Shadcn/ui integration
 * - Shared UI components
 * - Utility functions for styling
 *
 * Enhanced to integrate with the plugin system for modularity.
 */
import { existsSync } from 'fs';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { AbstractAgent } from './base/abstract-agent.js';
import { templateService } from '../utils/template-service.js';
import { PluginSystem } from '../utils/plugin-system.js';
import { ProjectType, TargetPlatform } from '../types/plugin.js';
import { AgentCategory, CapabilityCategory } from '../types/agent.js';
export class UIAgent extends AbstractAgent {
    templateService;
    pluginSystem;
    constructor() {
        super();
        this.templateService = templateService;
        this.pluginSystem = PluginSystem.getInstance();
    }
    // ============================================================================
    // AGENT METADATA
    // ============================================================================
    getAgentMetadata() {
        return {
            name: 'UIAgent',
            version: '2.0.0',
            description: 'Sets up the UI design system package with Tailwind CSS and Shadcn/ui using plugin system',
            author: 'The Architech Team',
            category: AgentCategory.UI,
            tags: ['ui', 'design-system', 'tailwind', 'shadcn', 'components', 'plugin-integration'],
            dependencies: ['BaseProjectAgent'],
            conflicts: [],
            requirements: [
                {
                    type: 'package',
                    name: 'tailwindcss',
                    description: 'Tailwind CSS framework'
                },
                {
                    type: 'package',
                    name: 'shadcn',
                    description: 'Shadcn/ui component library'
                },
                {
                    type: 'file',
                    name: 'packages/ui',
                    description: 'UI package directory'
                }
            ],
            license: 'MIT',
            repository: 'https://github.com/the-architech/cli'
        };
    }
    getAgentCapabilities() {
        return [
            {
                name: 'setup-design-system',
                description: 'Creates a complete design system with Tailwind CSS and Shadcn/ui using plugin system',
                parameters: [
                    {
                        name: 'components',
                        type: 'array',
                        required: false,
                        description: 'List of Shadcn/ui components to install',
                        defaultValue: ['button', 'card', 'input', 'label']
                    },
                    {
                        name: 'theme',
                        type: 'string',
                        required: false,
                        description: 'Tailwind theme configuration',
                        defaultValue: 'slate'
                    },
                    {
                        name: 'usePlugin',
                        type: 'boolean',
                        required: false,
                        description: 'Whether to use the Shadcn/ui plugin for core setup',
                        defaultValue: true
                    }
                ],
                examples: [
                    {
                        name: 'Setup basic design system with plugin',
                        description: 'Creates a design system using the Shadcn/ui plugin',
                        parameters: { usePlugin: true },
                        expectedResult: 'Complete UI package with Tailwind and Shadcn/ui via plugin'
                    },
                    {
                        name: 'Setup with custom components',
                        description: 'Creates a design system with specific components',
                        parameters: {
                            components: ['button', 'card', 'input', 'label', 'dialog', 'dropdown-menu'],
                            theme: 'zinc',
                            usePlugin: true
                        },
                        expectedResult: 'UI package with custom components and theme via plugin'
                    }
                ],
                category: CapabilityCategory.SETUP
            },
            {
                name: 'install-shadcn-components',
                description: 'Installs specific Shadcn/ui components using plugin system',
                parameters: [
                    {
                        name: 'componentNames',
                        type: 'array',
                        required: true,
                        description: 'Array of component names to install'
                    },
                    {
                        name: 'usePlugin',
                        type: 'boolean',
                        required: false,
                        description: 'Whether to use the Shadcn/ui plugin for installation',
                        defaultValue: true
                    }
                ],
                examples: [
                    {
                        name: 'Install form components via plugin',
                        description: 'Installs form-related Shadcn/ui components using plugin',
                        parameters: { componentNames: ['input', 'label', 'button', 'form'], usePlugin: true },
                        expectedResult: 'Form components installed and configured via plugin'
                    }
                ],
                category: CapabilityCategory.INTEGRATION
            },
            {
                name: 'enhance-ui-package',
                description: 'Adds agent-specific enhancements to the UI package',
                parameters: [
                    {
                        name: 'utilities',
                        type: 'boolean',
                        required: false,
                        description: 'Whether to add utility functions',
                        defaultValue: true
                    },
                    {
                        name: 'healthChecks',
                        type: 'boolean',
                        required: false,
                        description: 'Whether to add health check utilities',
                        defaultValue: true
                    },
                    {
                        name: 'aiFeatures',
                        type: 'boolean',
                        required: false,
                        description: 'Whether to add AI-powered component generation',
                        defaultValue: true
                    }
                ],
                examples: [
                    {
                        name: 'Add all enhancements',
                        description: 'Adds all agent-specific enhancements to the UI package',
                        parameters: { utilities: true, healthChecks: true, aiFeatures: true },
                        expectedResult: 'Enhanced UI package with utilities, health checks, and AI features'
                    }
                ],
                category: CapabilityCategory.INTEGRATION
            }
        ];
    }
    // ============================================================================
    // CORE EXECUTION
    // ============================================================================
    async executeInternal(context) {
        const { projectName, projectPath } = context;
        const uiPackagePath = path.join(projectPath, 'packages', 'ui');
        context.logger.info(`Setting up UI design system package: ${projectName}/packages/ui`);
        try {
            // Get parameters from context config
            const components = context.config?.components || ['button', 'card', 'input', 'label'];
            const theme = context.config?.theme || 'slate';
            const usePlugin = context.config?.usePlugin !== false; // Default to true
            let pluginResult = null;
            // Use plugin for core setup if enabled
            if (usePlugin) {
                context.logger.info('Using Shadcn/ui plugin for core setup...');
                pluginResult = await this.executeShadcnPlugin(context, uiPackagePath, components, theme);
            }
            // Always run agent-specific enhancements
            await this.enhanceUIPackage(uiPackagePath, context);
            const artifacts = [
                {
                    type: 'directory',
                    path: uiPackagePath,
                    metadata: {
                        package: 'ui',
                        framework: 'tailwind',
                        components: 'shadcn',
                        features: ['design-system', 'components', 'utilities', 'enhancements'],
                        pluginUsed: usePlugin
                    }
                },
                {
                    type: 'file',
                    path: path.join(uiPackagePath, 'package.json'),
                    metadata: { type: 'package-config' }
                },
                {
                    type: 'file',
                    path: path.join(uiPackagePath, 'tailwind.config.js'),
                    metadata: { type: 'tailwind-config' }
                }
            ];
            // Add plugin artifacts if plugin was used
            if (pluginResult?.artifacts) {
                artifacts.push(...pluginResult.artifacts);
            }
            return this.createSuccessResult({
                packagePath: uiPackagePath,
                components,
                framework: 'tailwind',
                designSystem: 'shadcn',
                pluginUsed: usePlugin,
                enhancements: ['utilities', 'health-checks', 'ai-features']
            }, artifacts, [
                'UI package structure created',
                'Tailwind CSS configured',
                'Shadcn/ui components installed',
                'Agent-specific enhancements added',
                'Ready for component development'
            ]);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            context.logger.error(`Failed to setup UI package: ${errorMessage}`, error);
            return this.createErrorResult('UI_SETUP_FAILED', `Failed to setup UI package: ${errorMessage}`, [], 0, error);
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
        // Check if UI package directory exists
        const uiPackagePath = path.join(context.projectPath, 'packages', 'ui');
        if (!existsSync(uiPackagePath)) {
            errors.push({
                field: 'uiPackagePath',
                message: `UI package directory does not exist: ${uiPackagePath}`,
                code: 'DIRECTORY_NOT_FOUND',
                severity: 'error'
            });
        }
        // Check if project has packages structure (monorepo)
        const packagesPath = path.join(context.projectPath, 'packages');
        if (!existsSync(packagesPath)) {
            warnings.push('Packages directory not found - this agent is designed for monorepo structures');
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    // ============================================================================
    // PACKAGE SETUP METHODS
    // ============================================================================
    async updatePackageJson(uiPackagePath, context) {
        await this.templateService.renderAndWrite('ui', 'package.json.ejs', path.join(uiPackagePath, 'package.json'), { projectName: context.projectName }, { logger: context.logger });
        context.logger.success(`Package.json updated for UI package`);
    }
    async createTailwindConfig(uiPackagePath, context) {
        await this.templateService.renderAndWrite('ui', 'tailwind.config.js.ejs', path.join(uiPackagePath, 'tailwind.config.js'), {}, { logger: context.logger });
    }
    async createUtilities(uiPackagePath, context) {
        await fsExtra.ensureDir(path.join(uiPackagePath, 'lib'));
        await this.templateService.renderAndWrite('ui', 'lib/utils.ts.ejs', path.join(uiPackagePath, 'lib', 'utils.ts'), {}, { logger: context.logger });
    }
    async createComponentStructure(uiPackagePath, context) {
        const directories = [
            'components',
            'components/ui',
            'styles',
            'dist'
        ];
        for (const dir of directories) {
            await fsExtra.ensureDir(path.join(uiPackagePath, dir));
        }
    }
    async createCSSFiles(uiPackagePath, context) {
        await this.templateService.renderAndWrite('ui', 'styles/globals.css.ejs', path.join(uiPackagePath, 'styles', 'globals.css'), {}, { logger: context.logger });
    }
    async installShadcnComponents(uiPackagePath, context) {
        const originalCwd = process.cwd();
        const projectPath = context.projectPath;
        try {
            // Change to project root directory for Shadcn commands
            process.chdir(projectPath);
            // Install base components using the root-level Shadcn configuration
            const baseComponents = ['button', 'card', 'input', 'label'];
            for (const component of baseComponents) {
                try {
                    // Use the root-level shadcn CLI with non-interactive options
                    await context.runner.execCommand(['npx', 'shadcn', 'add', component, '--yes'], {
                        env: {
                            ...process.env,
                            CI: 'true', // Force non-interactive mode
                            FORCE_COLOR: '1'
                        }
                    });
                    context.logger.success(`Installed ${component} component`);
                }
                catch (error) {
                    context.logger.warn(`Could not install ${component} component: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    // Create a placeholder component if installation fails
                    await this.createPlaceholderComponent(uiPackagePath, component, context);
                }
            }
        }
        finally {
            process.chdir(originalCwd);
        }
    }
    async createPlaceholderComponent(uiPackagePath, componentName, context) {
        const componentPath = path.join(uiPackagePath, 'components', 'ui', `${componentName}.tsx`);
        await this.templateService.renderAndWrite('ui/components/ui', 'placeholder.tsx.ejs', componentPath, { componentName }, { logger: context.logger });
    }
    async createIndex(uiPackagePath, context) {
        await this.templateService.renderAndWrite('ui', 'index.ts.ejs', path.join(uiPackagePath, 'index.ts'), {}, { logger: context.logger });
    }
    // ============================================================================
    // PLUGIN INTEGRATION
    // ============================================================================
    async executeShadcnPlugin(context, uiPackagePath, components, theme) {
        try {
            const registry = this.pluginSystem.getRegistry();
            const shadcnPlugin = registry.get('shadcn-ui');
            if (!shadcnPlugin) {
                throw new Error('Shadcn/ui plugin not found in registry');
            }
            const pluginContext = {
                ...context,
                pluginId: 'shadcn-ui',
                pluginConfig: {
                    components,
                    theme,
                    targetPath: uiPackagePath
                },
                installedPlugins: [],
                projectType: ProjectType.NEXTJS,
                targetPlatform: [TargetPlatform.WEB]
            };
            context.logger.info('Executing Shadcn/ui plugin...');
            const result = await shadcnPlugin.install(pluginContext);
            if (!result.success) {
                throw new Error(`Plugin execution failed: ${result.errors?.[0]?.message || 'Unknown error'}`);
            }
            context.logger.info('Shadcn/ui plugin executed successfully');
            return result;
        }
        catch (error) {
            context.logger.warn(`Plugin execution failed, falling back to manual setup: ${error}`);
            // Fall back to manual setup
            await this.manualSetup(uiPackagePath, context, components, theme);
            return null;
        }
    }
    // ============================================================================
    // AGENT-SPECIFIC ENHANCEMENTS
    // ============================================================================
    async enhanceUIPackage(uiPackagePath, context) {
        context.logger.info('Adding agent-specific enhancements to UI package...');
        // Add utility functions
        await this.createEnhancedUtilities(uiPackagePath, context);
        // Add health check utilities
        await this.createHealthChecks(uiPackagePath, context);
        // Add AI-powered component generation utilities
        await this.createAIFeatures(uiPackagePath, context);
        // Add enhanced component structure
        await this.createEnhancedComponentStructure(uiPackagePath, context);
        // Add development utilities
        await this.createDevUtilities(uiPackagePath, context);
    }
    async createEnhancedUtilities(uiPackagePath, context) {
        const utilsPath = path.join(uiPackagePath, 'lib', 'utils');
        await fsExtra.ensureDir(utilsPath);
        // Enhanced cn utility with better type safety
        await this.templateService.renderTemplate('ui/enhanced-cn.ts', path.join(utilsPath, 'cn.ts'), {
            projectName: context.projectName
        });
        // Color utilities
        await this.templateService.renderTemplate('ui/color-utils.ts', path.join(utilsPath, 'colors.ts'), {
            projectName: context.projectName
        });
        // Spacing utilities
        await this.templateService.renderTemplate('ui/spacing-utils.ts', path.join(utilsPath, 'spacing.ts'), {
            projectName: context.projectName
        });
        // Animation utilities
        await this.templateService.renderTemplate('ui/animation-utils.ts', path.join(utilsPath, 'animations.ts'), {
            projectName: context.projectName
        });
    }
    async createHealthChecks(uiPackagePath, context) {
        const healthPath = path.join(uiPackagePath, 'lib', 'health');
        await fsExtra.ensureDir(healthPath);
        // Component health checker
        await this.templateService.renderTemplate('ui/component-health.ts', path.join(healthPath, 'component-health.ts'), {
            projectName: context.projectName
        });
        // Style health checker
        await this.templateService.renderTemplate('ui/style-health.ts', path.join(healthPath, 'style-health.ts'), {
            projectName: context.projectName
        });
        // Accessibility health checker
        await this.templateService.renderTemplate('ui/accessibility-health.ts', path.join(healthPath, 'accessibility.ts'), {
            projectName: context.projectName
        });
    }
    async createAIFeatures(uiPackagePath, context) {
        const aiPath = path.join(uiPackagePath, 'lib', 'ai');
        await fsExtra.ensureDir(aiPath);
        // AI component generator
        await this.templateService.renderTemplate('ui/ai-component-generator.ts', path.join(aiPath, 'component-generator.ts'), {
            projectName: context.projectName
        });
        // AI style analyzer
        await this.templateService.renderTemplate('ui/ai-style-analyzer.ts', path.join(aiPath, 'style-analyzer.ts'), {
            projectName: context.projectName
        });
        // AI accessibility checker
        await this.templateService.renderTemplate('ui/ai-accessibility-checker.ts', path.join(aiPath, 'accessibility-checker.ts'), {
            projectName: context.projectName
        });
    }
    async createEnhancedComponentStructure(uiPackagePath, context) {
        const componentsPath = path.join(uiPackagePath, 'components');
        // Create enhanced component structure
        const structure = [
            'ui/button',
            'ui/card',
            'ui/input',
            'ui/label',
            'ui/dialog',
            'ui/dropdown-menu',
            'ui/form',
            'ui/select',
            'ui/textarea',
            'ui/checkbox',
            'ui/radio-group',
            'ui/switch',
            'ui/tabs',
            'ui/accordion',
            'ui/alert',
            'ui/avatar',
            'ui/badge',
            'ui/breadcrumb',
            'ui/calendar',
            'ui/carousel',
            'ui/command',
            'ui/context-menu',
            'ui/hover-card',
            'ui/menubar',
            'ui/navigation-menu',
            'ui/pagination',
            'ui/popover',
            'ui/progress',
            'ui/scroll-area',
            'ui/separator',
            'ui/sheet',
            'ui/skeleton',
            'ui/slider',
            'ui/table',
            'ui/toast',
            'ui/toggle',
            'ui/tooltip'
        ];
        for (const componentPath of structure) {
            const fullPath = path.join(componentsPath, componentPath);
            await fsExtra.ensureDir(fullPath);
            // Create enhanced component files
            await this.createEnhancedComponent(fullPath, componentPath.split('/').pop(), context);
        }
    }
    async createEnhancedComponent(componentPath, componentName, context) {
        const pascalName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
        // Enhanced component with better TypeScript support
        await this.templateService.renderTemplate('ui/enhanced-component.tsx', path.join(componentPath, `${componentName}.tsx`), {
            componentName: pascalName,
            projectName: context.projectName
        });
        // Component story for Storybook
        await this.templateService.renderTemplate('ui/component-story.ts', path.join(componentPath, `${componentName}.stories.tsx`), {
            componentName: pascalName,
            projectName: context.projectName
        });
        // Component test
        await this.templateService.renderTemplate('ui/component-test.tsx', path.join(componentPath, `${componentName}.test.tsx`), {
            componentName: pascalName,
            projectName: context.projectName
        });
        // Component documentation
        await this.templateService.renderTemplate('ui/component-docs.mdx', path.join(componentPath, `${componentName}.mdx`), {
            componentName: pascalName,
            projectName: context.projectName
        });
    }
    async createDevUtilities(uiPackagePath, context) {
        const devPath = path.join(uiPackagePath, 'lib', 'dev');
        await fsExtra.ensureDir(devPath);
        // Development utilities
        await this.templateService.renderTemplate('ui/dev-utils.ts', path.join(devPath, 'utils.ts'), {
            projectName: context.projectName
        });
        // Component playground
        await this.templateService.renderTemplate('ui/component-playground.tsx', path.join(devPath, 'playground.tsx'), {
            projectName: context.projectName
        });
        // Style guide generator
        await this.templateService.renderTemplate('ui/style-guide-generator.ts', path.join(devPath, 'style-guide.ts'), {
            projectName: context.projectName
        });
    }
    // ============================================================================
    // FALLBACK MANUAL SETUP
    // ============================================================================
    async manualSetup(uiPackagePath, context, components, theme) {
        context.logger.info('Performing manual UI setup...');
        // Update package.json with dependencies
        await this.updatePackageJson(uiPackagePath, context);
        // Install dependencies first
        context.logger.info('Installing UI package dependencies...');
        await context.runner.installNonInteractive([], false, uiPackagePath);
        // Create Tailwind configuration
        await this.createTailwindConfig(uiPackagePath, context);
        // Create utility functions
        await this.createUtilities(uiPackagePath, context);
        // Create base components directory structure
        await this.createComponentStructure(uiPackagePath, context);
        // Create CSS files
        await this.createCSSFiles(uiPackagePath, context);
        // Install Shadcn/ui components using root-level configuration
        await this.installShadcnComponents(uiPackagePath, context);
        // Create index exports
        await this.createIndex(uiPackagePath, context);
    }
    // ============================================================================
    // ROLLBACK
    // ============================================================================
    async rollback(context) {
        context.logger.info('Rolling back UIAgent changes...');
        try {
            const uiPackagePath = path.join(context.projectPath, 'packages', 'ui');
            if (await fsExtra.pathExists(uiPackagePath)) {
                await fsExtra.remove(uiPackagePath);
                context.logger.success('UI package removed');
            }
        }
        catch (error) {
            context.logger.error(`Failed to remove UI package`, error);
        }
    }
}
//# sourceMappingURL=ui-agent.js.map