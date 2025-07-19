/**
 * Shadcn/ui Plugin
 *
 * Handles the installation and setup of Shadcn/ui design system.
 * Pure technology implementer - no user interaction or decision making.
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
            repository: 'https://github.com/shadcn/ui'
        };
    }
    // ============================================================================
    // PLUGIN LIFECYCLE
    // ============================================================================
    async uninstall(context) {
        const startTime = Date.now();
        try {
            const { projectPath } = context;
            const uiPackagePath = path.join(projectPath, 'packages', 'ui');
            if (await fsExtra.pathExists(uiPackagePath)) {
                await fsExtra.remove(uiPackagePath);
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
            return {
                success: false,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [{
                        code: 'UNINSTALL_FAILED',
                        message: `Failed to uninstall Shadcn/ui: ${error instanceof Error ? error.message : 'Unknown error'}`,
                        details: error,
                        severity: 'error'
                    }],
                warnings: [],
                duration: Date.now() - startTime
            };
        }
    }
    async update(context) {
        // For now, just reinstall
        return this.install(context);
    }
    // ============================================================================
    // PLUGIN EXECUTION
    // ============================================================================
    async install(context) {
        const startTime = Date.now();
        try {
            const { projectPath, pluginConfig } = context;
            const uiPackagePath = path.join(projectPath, 'packages', 'ui');
            context.logger.info('Installing Shadcn/ui design system...');
            // Step 1: Update package.json with Shadcn dependencies
            await this.updatePackageJson(uiPackagePath, context);
            // Step 2: Install dependencies
            context.logger.info('Installing UI package dependencies...');
            await this.runner.install([], false, uiPackagePath);
            // Step 3: Create Tailwind configuration
            await this.createTailwindConfig(uiPackagePath, context);
            // Step 4: Create utility functions
            await this.createUtilities(uiPackagePath, context);
            // Step 5: Create component structure
            await this.createComponentStructure(uiPackagePath, context);
            // Step 6: Create CSS files
            await this.createCSSFiles(uiPackagePath, context);
            // Step 7: Install Shadcn/ui components
            await this.installShadcnComponents(uiPackagePath, context, pluginConfig);
            // Step 8: Create index exports
            await this.createIndex(uiPackagePath, context);
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: [
                    {
                        type: 'directory',
                        path: uiPackagePath
                    },
                    {
                        type: 'file',
                        path: path.join(uiPackagePath, 'package.json')
                    },
                    {
                        type: 'file',
                        path: path.join(uiPackagePath, 'tailwind.config.js')
                    }
                ],
                dependencies: [
                    {
                        name: 'tailwindcss',
                        version: '^3.3.6',
                        type: 'development',
                        category: PluginCategory.DESIGN_SYSTEM
                    },
                    {
                        name: 'react',
                        version: '^18.0.0',
                        type: 'production',
                        category: PluginCategory.DESIGN_SYSTEM
                    }
                ],
                scripts: [],
                configs: [],
                errors: [],
                warnings: [],
                duration
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [
                    {
                        code: 'SHADCN_INSTALLATION_FAILED',
                        message: `Failed to install Shadcn/ui: ${errorMessage}`,
                        details: error,
                        severity: 'error'
                    }
                ],
                warnings: [],
                duration: Date.now() - startTime
            };
        }
    }
    // ============================================================================
    // INSTALLATION METHODS
    // ============================================================================
    async updatePackageJson(uiPackagePath, context) {
        const packageJson = {
            name: `@${context.projectName}/ui`,
            version: "0.1.0",
            private: true,
            description: "Shared UI components with Shadcn/ui",
            main: "index.ts",
            types: "index.ts",
            scripts: {
                "build": "tsc",
                "dev": "tsc --watch",
                "lint": "eslint . --ext .ts,.tsx",
                "type-check": "tsc --noEmit"
            },
            dependencies: {
                "react": "^18.3.1",
                "react-dom": "^18.3.1",
                "tailwindcss": "^3.4.17",
                "class-variance-authority": "^0.7.0",
                "clsx": "^2.1.1",
                "tailwind-merge": "^2.5.4",
                "lucide-react": "^0.468.0",
                "@radix-ui/react-slot": "^1.0.2",
                "@radix-ui/react-label": "^2.0.2",
                "tailwindcss-animate": "^1.0.7"
            },
            devDependencies: {
                "@types/react": "^18.3.12",
                "@types/react-dom": "^18.3.1",
                "typescript": "^5.8.3",
                "autoprefixer": "^10.4.21",
                "postcss": "^8.5.6"
            }
        };
        await fsExtra.writeJSON(path.join(uiPackagePath, 'package.json'), packageJson, { spaces: 2 });
        context.logger.success('Package.json updated for UI package');
    }
    async createTailwindConfig(uiPackagePath, context) {
        const tailwindConfig = {
            content: [
                "./components/**/*.{js,ts,jsx,tsx}",
                "../../apps/**/*.{js,ts,jsx,tsx}",
                "../../packages/**/*.{js,ts,jsx,tsx}"
            ],
            theme: {
                extend: {
                    colors: {
                        border: "hsl(var(--border))",
                        input: "hsl(var(--input))",
                        ring: "hsl(var(--ring))",
                        background: "hsl(var(--background))",
                        foreground: "hsl(var(--foreground))",
                        primary: {
                            DEFAULT: "hsl(var(--primary))",
                            foreground: "hsl(var(--primary-foreground))",
                        },
                        secondary: {
                            DEFAULT: "hsl(var(--secondary))",
                            foreground: "hsl(var(--secondary-foreground))",
                        },
                        destructive: {
                            DEFAULT: "hsl(var(--destructive))",
                            foreground: "hsl(var(--destructive-foreground))",
                        },
                        muted: {
                            DEFAULT: "hsl(var(--muted))",
                            foreground: "hsl(var(--muted-foreground))",
                        },
                        accent: {
                            DEFAULT: "hsl(var(--accent))",
                            foreground: "hsl(var(--accent-foreground))",
                        },
                        popover: {
                            DEFAULT: "hsl(var(--popover))",
                            foreground: "hsl(var(--popover-foreground))",
                        },
                        card: {
                            DEFAULT: "hsl(var(--card))",
                            foreground: "hsl(var(--card-foreground))",
                        },
                    },
                    borderRadius: {
                        lg: "var(--radius)",
                        md: "calc(var(--radius) - 2px)",
                        sm: "calc(var(--radius) - 4px)",
                    },
                },
            },
            plugins: ["tailwindcss-animate"],
        };
        await fsExtra.writeJSON(path.join(uiPackagePath, 'tailwind.config.js'), tailwindConfig, { spaces: 2 });
        context.logger.success('Tailwind configuration created');
    }
    async createUtilities(uiPackagePath, context) {
        await fsExtra.ensureDir(path.join(uiPackagePath, 'lib'));
        const utilsContent = `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`;
        await fsExtra.writeFile(path.join(uiPackagePath, 'lib', 'utils.ts'), utilsContent);
        context.logger.success('Utility functions created');
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
        context.logger.success('Component structure created');
    }
    async createCSSFiles(uiPackagePath, context) {
        const globalsCSS = `@tailwind base;
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
}`;
        await fsExtra.writeFile(path.join(uiPackagePath, 'styles', 'globals.css'), globalsCSS);
        context.logger.success('CSS files created');
    }
    async installShadcnComponents(uiPackagePath, context, pluginConfig) {
        const originalCwd = process.cwd();
        try {
            process.chdir(uiPackagePath);
            // Get components from plugin config or use defaults
            const components = pluginConfig?.components || ['button', 'card', 'input', 'label'];
            // Create components.json at root level (not in UI package)
            await this.createComponentsJson(path.dirname(uiPackagePath), context);
            // Install each component manually instead of using CLI
            for (const component of components) {
                try {
                    await this.createComponentManually(uiPackagePath, component, context);
                    context.logger.success(`Created ${component} component`);
                }
                catch (error) {
                    context.logger.warn(`Could not create ${component} component: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    // Create a placeholder component if creation fails
                    await this.createPlaceholderComponent(uiPackagePath, component, context);
                }
            }
        }
        finally {
            process.chdir(originalCwd);
        }
    }
    async createComponentsJson(projectRoot, context) {
        const componentsJson = {
            "$schema": "https://ui.shadcn.com/schema.json",
            "style": "default",
            "rsc": true,
            "tsx": true,
            "tailwind": {
                "config": "packages/ui/tailwind.config.js",
                "css": "packages/ui/styles/globals.css",
                "baseColor": "slate",
                "cssVariables": true,
                "prefix": ""
            },
            "aliases": {
                "components": "packages/ui/components",
                "utils": "packages/ui/lib/utils"
            }
        };
        await fsExtra.writeJSON(path.join(projectRoot, 'components.json'), componentsJson, { spaces: 2 });
        context.logger.success('components.json created at project root');
    }
    async createComponentManually(uiPackagePath, componentName, context) {
        const componentPath = path.join(uiPackagePath, 'components', 'ui', `${componentName}.tsx`);
        // Create component based on name
        let componentContent = '';
        switch (componentName) {
            case 'button':
                componentContent = `import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
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
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }`;
                break;
            case 'card':
                componentContent = `import * as React from "react"

import { cn } from "../../lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }`;
                break;
            case 'input':
                componentContent = `import * as React from "react"

import { cn } from "../../lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }`;
                break;
            case 'label':
                componentContent = `import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }`;
                break;
            default:
                // Create a generic component for unknown components
                componentContent = `import * as React from "react"
import { cn } from "../../lib/utils"

export interface ${componentName.charAt(0).toUpperCase() + componentName.slice(1)}Props extends React.HTMLAttributes<HTMLDivElement> {}

const ${componentName.charAt(0).toUpperCase() + componentName.slice(1)} = React.forwardRef<HTMLDivElement, ${componentName.charAt(0).toUpperCase() + componentName.slice(1)}Props>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn("${componentName}-component", className)}
        ref={ref}
        {...props}
      />
    )
  }
)
${componentName.charAt(0).toUpperCase() + componentName.slice(1)}.displayName = "${componentName.charAt(0).toUpperCase() + componentName.slice(1)}"

export { ${componentName.charAt(0).toUpperCase() + componentName.slice(1)} }`;
        }
        await fsExtra.writeFile(componentPath, componentContent);
    }
    async createPlaceholderComponent(uiPackagePath, componentName, context) {
        const componentPath = path.join(uiPackagePath, 'components', 'ui', `${componentName}.tsx`);
        const placeholderContent = `import * as React from "react"
import { cn } from "../../lib/utils"

export interface ${componentName.charAt(0).toUpperCase() + componentName.slice(1)}Props extends React.HTMLAttributes<HTMLDivElement> {}

const ${componentName.charAt(0).toUpperCase() + componentName.slice(1)} = React.forwardRef<HTMLDivElement, ${componentName.charAt(0).toUpperCase() + componentName.slice(1)}Props>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn("${componentName}-component", className)}
        ref={ref}
        {...props}
      />
    )
  }
)
${componentName.charAt(0).toUpperCase() + componentName.slice(1)}.displayName = "${componentName.charAt(0).toUpperCase() + componentName.slice(1)}"

export { ${componentName.charAt(0).toUpperCase() + componentName.slice(1)} }`;
        await fsExtra.writeFile(componentPath, placeholderContent);
    }
    async createIndex(uiPackagePath, context) {
        const indexContent = `// UI Components
export * from './components/ui/button';
export * from './components/ui/card';
export * from './components/ui/input';
export * from './components/ui/label';

// Utilities
export * from './lib/utils';

// Styles
import './styles/globals.css';`;
        await fsExtra.writeFile(path.join(uiPackagePath, 'index.ts'), indexContent);
        context.logger.success('Index file created');
    }
    // ============================================================================
    // VALIDATION AND COMPATIBILITY
    // ============================================================================
    async validate(context) {
        const errors = [];
        const warnings = [];
        // Check if UI package exists
        const uiPackagePath = path.join(context.projectPath, 'packages', 'ui');
        if (!await fsExtra.pathExists(uiPackagePath)) {
            errors.push({
                code: 'UI_PACKAGE_NOT_FOUND',
                message: 'UI package directory does not exist',
                field: 'uiPackage'
            });
        }
        // Check if components.json exists at root
        const componentsJsonPath = path.join(context.projectPath, 'components.json');
        if (!await fsExtra.pathExists(componentsJsonPath)) {
            warnings.push('components.json not found at project root - Shadcn/ui may not work correctly');
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    getCompatibility() {
        return {
            frameworks: ['nextjs', 'react', 'vite'],
            platforms: [TargetPlatform.WEB],
            nodeVersions: ['>=16.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
            uiLibraries: ['tailwindcss'],
            conflicts: ['mui', 'chakra-ui', 'antd']
        };
    }
    // ============================================================================
    // DEPENDENCIES AND CONFLICTS
    // ============================================================================
    getDependencies() {
        return ['tailwindcss', 'react'];
    }
    getConflicts() {
        return ['mui', 'chakra-ui', 'antd'];
    }
    getRequirements() {
        return [
            {
                type: 'package',
                name: 'tailwindcss',
                version: '^3.0.0',
                description: 'Tailwind CSS framework'
            },
            {
                type: 'package',
                name: 'react',
                version: '^18.0.0',
                description: 'React framework'
            }
        ];
    }
    // ============================================================================
    // CONFIGURATION
    // ============================================================================
    getDefaultConfig() {
        return {
            components: ['button', 'card', 'input', 'label'],
            includeExamples: true,
            useTypeScript: true
        };
    }
    getConfigSchema() {
        return {
            type: 'object',
            properties: {
                components: {
                    type: 'array',
                    description: 'List of Shadcn/ui components to install',
                    items: {
                        type: 'string',
                        description: 'Component name'
                    }
                },
                includeExamples: {
                    type: 'boolean',
                    description: 'Whether to include example components',
                    default: true
                },
                useTypeScript: {
                    type: 'boolean',
                    description: 'Whether to use TypeScript',
                    default: true
                }
            },
            required: []
        };
    }
}
//# sourceMappingURL=shadcn-ui.js.map