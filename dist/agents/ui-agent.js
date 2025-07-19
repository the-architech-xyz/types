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
        context.logger.info('Setting up UI/Design System...');
        try {
            // Step 1: Execute Shadcn/ui plugin for core UI setup
            const pluginResult = await this.executeShadcnPlugin(context, projectPath);
            // Step 2: Add agent-specific enhancements
            await this.enhanceUIPackage(projectPath, context);
            // Step 3: Update package.json with UI dependencies
            await this.updatePackageJson(projectPath, context);
            // Step 4: Create component structure
            await this.createComponentStructure(projectPath, context);
            // Step 5: Create CSS files
            await this.createCSSFiles(projectPath, context);
            // Step 6: Create index file
            await this.createIndex(projectPath, context);
            const artifacts = [
                {
                    type: 'directory',
                    path: path.join(projectPath, 'src', 'components'),
                    metadata: { type: 'ui-components' }
                },
                {
                    type: 'file',
                    path: path.join(projectPath, 'tailwind.config.js'),
                    metadata: { type: 'tailwind-config' }
                },
                {
                    type: 'file',
                    path: path.join(projectPath, 'src', 'lib', 'utils.ts'),
                    metadata: { type: 'ui-utils' }
                }
            ];
            // Add plugin artifacts if plugin was used
            if (pluginResult?.artifacts) {
                artifacts.push(...pluginResult.artifacts);
            }
            context.logger.success('UI/Design System setup completed successfully');
            return this.createSuccessResult({
                uiFramework: 'shadcn-ui',
                components: ['button', 'input', 'card', 'dialog'],
                theme: 'default',
                pluginUsed: true
            }, artifacts, [
                'Shadcn/ui design system configured',
                'Tailwind CSS configured',
                'Component structure created',
                'Agent-specific enhancements added',
                'Ready for UI development'
            ]);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            context.logger.error(`Failed to setup UI/Design System: ${errorMessage}`, error);
            return this.createErrorResult('UI_SETUP_FAILED', `Failed to setup UI/Design System: ${errorMessage}`, [], 0, error);
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
        // Check if project directory exists
        if (!existsSync(context.projectPath)) {
            errors.push({
                field: 'projectPath',
                message: `Project directory does not exist: ${context.projectPath}`,
                code: 'PROJECT_NOT_FOUND',
                severity: 'error'
            });
        }
        // Check if package.json exists
        const packageJsonPath = path.join(context.projectPath, 'package.json');
        if (!existsSync(packageJsonPath)) {
            errors.push({
                field: 'packageJson',
                message: `package.json not found in project: ${packageJsonPath}`,
                code: 'PACKAGE_JSON_NOT_FOUND',
                severity: 'error'
            });
        }
        // Check if src directory exists
        const srcPath = path.join(context.projectPath, 'src');
        if (!existsSync(srcPath)) {
            errors.push({
                field: 'srcDirectory',
                message: `src directory not found in project: ${srcPath}`,
                code: 'SRC_DIRECTORY_NOT_FOUND',
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
    // UTILITY METHODS
    // ============================================================================
    async updatePackageJson(projectPath, context) {
        const packageJsonPath = path.join(projectPath, 'package.json');
        if (existsSync(packageJsonPath)) {
            const packageJson = await fsExtra.readJson(packageJsonPath);
            // Add UI-specific dependencies if not already present
            const uiDependencies = {
                'class-variance-authority': '^0.7.0',
                'clsx': '^2.0.0',
                'tailwind-merge': '^2.0.0',
                'lucide-react': '^0.294.0'
            };
            packageJson.dependencies = {
                ...packageJson.dependencies,
                ...uiDependencies
            };
            await fsExtra.writeJson(packageJsonPath, packageJson, { spaces: 2 });
            context.logger.info('Updated package.json with UI dependencies');
        }
    }
    async createTailwindConfig(projectPath, context) {
        const tailwindConfigPath = path.join(projectPath, 'tailwind.config.js');
        if (!existsSync(tailwindConfigPath)) {
            await this.templateService.renderAndWrite('ui', 'tailwind.config.js.ejs', tailwindConfigPath, {
                projectName: context.projectName
            });
            context.logger.info('Created Tailwind config');
        }
    }
    async createUtilities(projectPath, context) {
        const utilsPath = path.join(projectPath, 'src', 'lib', 'utils.ts');
        if (!existsSync(utilsPath)) {
            await fsExtra.writeFile(utilsPath, `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`);
            context.logger.info('Created utility functions');
        }
    }
    async createComponentStructure(projectPath, context) {
        const componentsPath = path.join(projectPath, 'src', 'components');
        await fsExtra.ensureDir(componentsPath);
        // Create basic component structure
        const basicComponents = ['ui', 'layout', 'forms'];
        for (const componentType of basicComponents) {
            const typePath = path.join(componentsPath, componentType);
            await fsExtra.ensureDir(typePath);
        }
        context.logger.info('Created component structure');
    }
    async createCSSFiles(projectPath, context) {
        const globalsPath = path.join(projectPath, 'src', 'app', 'globals.css');
        if (!existsSync(globalsPath)) {
            await fsExtra.writeFile(globalsPath, `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
`);
            context.logger.info('Created global CSS file');
        }
    }
    async createIndex(projectPath, context) {
        const indexPath = path.join(projectPath, 'src', 'components', 'index.ts');
        if (!existsSync(indexPath)) {
            await fsExtra.writeFile(indexPath, `// UI Components
export * from './ui';

// Layout Components
export * from './layout';

// Form Components
export * from './forms';
`);
            context.logger.info('Created components index file');
        }
    }
    // ============================================================================
    // PACKAGE SETUP METHODS
    // ============================================================================
    async installShadcnComponents(projectPath, context) {
        context.logger.info('Installing Shadcn/ui components...');
        try {
            // This would be handled by the Shadcn/ui plugin
            // For now, just log that components would be installed
            context.logger.info('Shadcn/ui components would be installed here');
        }
        catch (error) {
            context.logger.warn(`Failed to install Shadcn/ui components: ${error}`);
        }
    }
    async createPlaceholderComponent(projectPath, componentName, context) {
        const componentPath = path.join(projectPath, 'src', 'components', 'ui', `${componentName}.tsx`);
        if (!existsSync(componentPath)) {
            await fsExtra.writeFile(componentPath, `import React from 'react';

export interface ${componentName.charAt(0).toUpperCase() + componentName.slice(1)}Props {
  children?: React.ReactNode;
  className?: string;
}

export function ${componentName.charAt(0).toUpperCase() + componentName.slice(1)}({ 
  children, 
  className = '' 
}: ${componentName.charAt(0).toUpperCase() + componentName.slice(1)}Props) {
  return (
    <div className={\`\${className}\`}>
      {children}
    </div>
  );
}
`);
        }
    }
    // ============================================================================
    // PLUGIN INTEGRATION
    // ============================================================================
    async executeShadcnPlugin(context, projectPath) {
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
                    components: ['button', 'input', 'card', 'dialog'],
                    theme: 'default',
                    targetPath: projectPath
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
            await this.manualSetup(projectPath, context, ['button', 'input', 'card', 'dialog'], 'default');
            return null;
        }
    }
    // ============================================================================
    // AGENT-SPECIFIC ENHANCEMENTS
    // ============================================================================
    async enhanceUIPackage(projectPath, context) {
        context.logger.info('Adding agent-specific enhancements to UI setup...');
        // Add basic component examples
        await this.createBasicComponents(projectPath, context);
        // Add development utilities
        await this.createDevUtilities(projectPath, context);
    }
    async createBasicComponents(projectPath, context) {
        const uiPath = path.join(projectPath, 'src', 'components', 'ui');
        await fsExtra.ensureDir(uiPath);
        // Create a basic button component
        const buttonPath = path.join(uiPath, 'button.tsx');
        if (!existsSync(buttonPath)) {
            await fsExtra.writeFile(buttonPath, `import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
`);
        }
        context.logger.info('Created basic UI components');
    }
    async createDevUtilities(projectPath, context) {
        const devPath = path.join(projectPath, 'src', 'lib', 'dev');
        await fsExtra.ensureDir(devPath);
        // Create a simple dev utilities file
        const devUtilsPath = path.join(devPath, 'ui-utils.ts');
        await fsExtra.writeFile(devUtilsPath, `// UI Development utilities for ${context.projectName}
export const isDev = process.env.NODE_ENV === 'development';

export function logUI(message: string, data?: any) {
  if (isDev) {
    console.log(\`[UI] \${message}\`, data || '');
  }
}

export function validateComponent(componentName: string, props: any) {
  if (isDev) {
    console.log(\`[UI] Validating component: \${componentName}\`, props);
  }
}
`);
    }
    // ============================================================================
    // MANUAL SETUP FALLBACK
    // ============================================================================
    async manualSetup(projectPath, context, components, theme) {
        context.logger.info('Performing manual UI setup...');
        // Create basic UI structure manually
        await this.createTailwindConfig(projectPath, context);
        await this.createUtilities(projectPath, context);
        await this.createComponentStructure(projectPath, context);
        await this.createCSSFiles(projectPath, context);
        await this.createIndex(projectPath, context);
        context.logger.info('Manual UI setup completed');
    }
    async rollback(context) {
        const { projectPath } = context;
        try {
            // Remove UI-specific files
            const filesToRemove = [
                path.join(projectPath, 'src', 'components'),
                path.join(projectPath, 'tailwind.config.js'),
                path.join(projectPath, 'src', 'lib', 'utils.ts')
            ];
            for (const file of filesToRemove) {
                if (existsSync(file)) {
                    await fsExtra.remove(file);
                }
            }
            context.logger.info('Rolled back UI setup');
        }
        catch (error) {
            context.logger.error(`Failed to rollback UI setup: ${error}`);
        }
    }
}
//# sourceMappingURL=ui-agent.js.map