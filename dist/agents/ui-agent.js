/**
 * UI Agent - Design System Package Generator
 *
 * Sets up the packages/ui design system with:
 * - Tailwind CSS configuration
 * - Shadcn/ui integration
 * - Shared UI components
 * - Utility functions for styling
 *
 * Migrated to the new standardized agent interface for robustness and extensibility.
 */
import { existsSync } from 'fs';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { AbstractAgent } from './base/abstract-agent.js';
import { templateService } from '../utils/template-service.js';
import { AgentCategory, CapabilityCategory } from '../types/agent.js';
export class UIAgent extends AbstractAgent {
    templateService;
    constructor() {
        super();
        this.templateService = templateService;
    }
    // ============================================================================
    // AGENT METADATA
    // ============================================================================
    getAgentMetadata() {
        return {
            name: 'UIAgent',
            version: '1.0.0',
            description: 'Sets up the UI design system package with Tailwind CSS and Shadcn/ui',
            author: 'The Architech Team',
            category: AgentCategory.UI,
            tags: ['ui', 'design-system', 'tailwind', 'shadcn', 'components'],
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
                description: 'Creates a complete design system with Tailwind CSS and Shadcn/ui',
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
                    }
                ],
                examples: [
                    {
                        name: 'Setup basic design system',
                        description: 'Creates a design system with default components',
                        parameters: {},
                        expectedResult: 'Complete UI package with Tailwind and Shadcn/ui'
                    },
                    {
                        name: 'Setup with custom components',
                        description: 'Creates a design system with specific components',
                        parameters: {
                            components: ['button', 'card', 'input', 'label', 'dialog', 'dropdown-menu'],
                            theme: 'zinc'
                        },
                        expectedResult: 'UI package with custom components and theme'
                    }
                ],
                category: CapabilityCategory.SETUP
            },
            {
                name: 'install-shadcn-components',
                description: 'Installs specific Shadcn/ui components',
                parameters: [
                    {
                        name: 'componentNames',
                        type: 'array',
                        required: true,
                        description: 'Array of component names to install'
                    }
                ],
                examples: [
                    {
                        name: 'Install form components',
                        description: 'Installs form-related Shadcn/ui components',
                        parameters: { componentNames: ['input', 'label', 'button', 'form'] },
                        expectedResult: 'Form components installed and configured'
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
            // Update package.json with dependencies
            await this.updatePackageJson(uiPackagePath, context);
            // Create Tailwind configuration
            await this.createTailwindConfig(uiPackagePath, context);
            // Create utility functions
            await this.createUtilities(uiPackagePath, context);
            // Create components.json for Shadcn/ui
            await this.createComponentsConfig(uiPackagePath, context);
            // Create base components directory structure
            await this.createComponentStructure(uiPackagePath, context);
            // Create CSS files
            await this.createCSSFiles(uiPackagePath, context);
            // Install Shadcn/ui components
            await this.installShadcnComponents(uiPackagePath, context);
            // Create index exports
            await this.createIndex(uiPackagePath, context);
            const artifacts = [
                {
                    type: 'directory',
                    path: uiPackagePath,
                    metadata: {
                        package: 'ui',
                        framework: 'tailwind',
                        components: 'shadcn',
                        features: ['design-system', 'components', 'utilities']
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
                },
                {
                    type: 'file',
                    path: path.join(uiPackagePath, 'components.json'),
                    metadata: { type: 'shadcn-config' }
                }
            ];
            context.logger.success(`UI design system package configured successfully`);
            return this.createSuccessResult({
                uiPackagePath,
                components: ['button', 'card', 'input', 'label'],
                theme: 'slate'
            }, artifacts, [
                'UI package structure created',
                'Tailwind CSS configured',
                'Shadcn/ui components installed',
                'Ready for component development'
            ]);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            context.logger.error(`Failed to configure UI package: ${errorMessage}`, error);
            return this.createErrorResult('UI_PACKAGE_SETUP_FAILED', `Failed to configure UI package: ${errorMessage}`, [], 0, error);
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
    async createComponentsConfig(uiPackagePath, context) {
        await this.templateService.renderAndWrite('ui', 'components.json.ejs', path.join(uiPackagePath, 'components.json'), {}, { logger: context.logger });
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
        // Note: components index file will be created by shadcn when components are added
    }
    async createCSSFiles(uiPackagePath, context) {
        await this.templateService.renderAndWrite('ui', 'styles/globals.css.ejs', path.join(uiPackagePath, 'styles', 'globals.css'), {}, { logger: context.logger });
    }
    async installShadcnComponents(uiPackagePath, context) {
        const originalCwd = process.cwd();
        try {
            process.chdir(uiPackagePath);
            // Install dependencies first
            await context.runner.install([], false, uiPackagePath);
            // Initialize Shadcn with non-interactive mode
            try {
                // Create components.json manually instead of using shadcn init
                const componentsJsonPath = path.join(uiPackagePath, 'components.json');
                if (!await fsExtra.pathExists(componentsJsonPath)) {
                    await this.createComponentsConfig(uiPackagePath, context);
                }
                context.logger.success('Shadcn configuration created');
            }
            catch (error) {
                context.logger.warn(`Could not create shadcn config: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
            // Install base components using shadcn add command
            const baseComponents = ['button', 'card', 'input', 'label'];
            for (const component of baseComponents) {
                try {
                    // Use shadcn add command to generate the component
                    await context.runner.exec('shadcn@latest', ['add', component, '--yes'], uiPackagePath);
                    context.logger.success(`Added ${component} component via shadcn`);
                }
                catch (error) {
                    context.logger.warn(`Could not add ${component} component: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    // Create a placeholder component if shadcn fails
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
        const placeholderContent = `import React from 'react';

export interface ${componentName.charAt(0).toUpperCase() + componentName.slice(1)}Props {
  children?: React.ReactNode;
  className?: string;
}

export function ${componentName.charAt(0).toUpperCase() + componentName.slice(1)}({ 
  children, 
  className 
}: ${componentName.charAt(0).toUpperCase() + componentName.slice(1)}Props) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export { ${componentName.charAt(0).toUpperCase() + componentName.slice(1)} }`;
        await fsExtra.writeFile(componentPath, placeholderContent);
    }
    async createIndex(uiPackagePath, context) {
        await this.templateService.renderAndWrite('ui', 'index.ts.ejs', path.join(uiPackagePath, 'index.ts'), {}, { logger: context.logger });
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