/**
 * Shadcn/ui Plugin - Pure Technology Implementation
 *
 * Provides Shadcn/ui design system integration with Tailwind CSS.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { PluginCategory, TargetPlatform } from '../../types/plugin.js';
import { templateService } from '../../utils/template-service.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
export class ShadcnUIPlugin {
    templateService;
    constructor() {
        this.templateService = templateService;
    }
    // ============================================================================
    // PLUGIN METADATA
    // ============================================================================
    getMetadata() {
        return {
            id: 'shadcn-ui',
            name: 'Shadcn/ui',
            version: '1.0.0',
            description: 'Beautiful and accessible components built with Radix UI and Tailwind CSS',
            author: 'The Architech Team',
            category: PluginCategory.DESIGN_SYSTEM,
            tags: ['ui', 'components', 'tailwind', 'radix', 'accessible'],
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
            // Validate plugin can be installed
            const validation = await this.validate(context);
            if (!validation.valid) {
                return this.createErrorResult('Plugin validation failed', startTime, validation.errors);
            }
            const artifacts = [];
            const dependencies = [];
            const scripts = [];
            const configs = [];
            const warnings = [];
            // Use configuration from context (provided by agent)
            const config = { ...this.getDefaultConfig(), ...context.pluginConfig };
            // Add core dependencies
            dependencies.push({
                name: 'tailwindcss',
                version: '^3.4.0',
                type: 'production',
                category: PluginCategory.DESIGN_SYSTEM
            }, {
                name: 'class-variance-authority',
                version: '^0.7.0',
                type: 'production',
                category: PluginCategory.DESIGN_SYSTEM
            }, {
                name: 'clsx',
                version: '^2.0.0',
                type: 'production',
                category: PluginCategory.DESIGN_SYSTEM
            }, {
                name: 'tailwind-merge',
                version: '^2.0.0',
                type: 'production',
                category: PluginCategory.DESIGN_SYSTEM
            }, {
                name: 'lucide-react',
                version: '^0.294.0',
                type: 'production',
                category: PluginCategory.DESIGN_SYSTEM
            });
            // Add Radix UI dependencies for selected components
            const radixDependencies = this.getRadixDependencies(config.components);
            dependencies.push(...radixDependencies);
            // Add development dependencies
            dependencies.push({
                name: '@types/node',
                version: '^20.0.0',
                type: 'development',
                category: PluginCategory.DESIGN_SYSTEM
            }, {
                name: 'autoprefixer',
                version: '^10.4.16',
                type: 'development',
                category: PluginCategory.DESIGN_SYSTEM
            }, {
                name: 'postcss',
                version: '^8.4.32',
                type: 'development',
                category: PluginCategory.DESIGN_SYSTEM
            });
            // Generate technology artifacts
            const tailwindConfig = this.generateTailwindConfig(context);
            artifacts.push({
                type: 'file',
                path: 'tailwind.config.js',
                content: tailwindConfig
            });
            const postcssConfig = this.generatePostCSSConfig();
            artifacts.push({
                type: 'file',
                path: 'postcss.config.js',
                content: postcssConfig
            });
            const globalCSS = this.generateGlobalCSS(context);
            artifacts.push({
                type: 'file',
                path: 'src/app/globals.css',
                content: globalCSS
            });
            const componentsConfig = this.generateComponentsConfig(context);
            artifacts.push({
                type: 'file',
                path: 'components.json',
                content: componentsConfig
            });
            const utilsContent = this.generateUtils(context);
            artifacts.push({
                type: 'file',
                path: 'src/lib/utils.ts',
                content: utilsContent
            });
            // Generate component structure
            const componentStructure = this.generateComponentStructure(context, config.components);
            for (const [filePath, content] of Object.entries(componentStructure)) {
                artifacts.push({
                    type: 'file',
                    path: filePath,
                    content
                });
            }
            // Add technology scripts
            scripts.push({
                name: 'ui:add',
                command: 'npx shadcn@latest add',
                description: 'Add Shadcn/ui components',
                category: 'dev'
            }, {
                name: 'ui:init',
                command: 'npx shadcn@latest init',
                description: 'Initialize Shadcn/ui configuration',
                category: 'dev'
            });
            // Add configuration updates
            configs.push({
                file: 'package.json',
                content: this.generatePackageJsonUpdates(context),
                mergeStrategy: 'merge'
            });
            return {
                success: true,
                artifacts,
                dependencies,
                scripts,
                configs,
                errors: [],
                warnings,
                duration: Date.now() - startTime
            };
        }
        catch (error) {
            return this.createErrorResult(error instanceof Error ? error.message : 'Unknown error', startTime, [], error);
        }
    }
    async uninstall(context) {
        const startTime = Date.now();
        try {
            // Define artifacts to remove
            const artifacts = [
                { type: 'file', path: 'components.json' },
                { type: 'file', path: 'src/lib/utils.ts' },
                { type: 'directory', path: 'src/components/ui' }
            ];
            return {
                success: true,
                artifacts,
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [],
                warnings: ['Please manually remove Shadcn/ui dependencies from package.json'],
                duration: Date.now() - startTime
            };
        }
        catch (error) {
            return this.createErrorResult(error instanceof Error ? error.message : 'Unknown error', startTime, [], error);
        }
    }
    async update(context) {
        const startTime = Date.now();
        try {
            // For now, just reinstall
            return this.install(context);
        }
        catch (error) {
            return this.createErrorResult(error instanceof Error ? error.message : 'Unknown error', startTime, [], error);
        }
    }
    // ============================================================================
    // VALIDATION - Technology Compatibility Only
    // ============================================================================
    async validate(context) {
        const errors = [];
        const warnings = [];
        // Check technology compatibility
        if (!['nextjs', 'react'].includes(context.projectType)) {
            errors.push({
                field: 'projectType',
                message: 'Shadcn/ui requires Next.js or React project type',
                code: 'INCOMPATIBLE_PROJECT_TYPE',
                severity: 'error'
            });
        }
        // Check for existing configurations
        const tailwindConfigPath = path.join(context.projectPath, 'tailwind.config.js');
        if (fsExtra.existsSync(tailwindConfigPath)) {
            warnings.push('Tailwind CSS configuration already exists');
        }
        const componentsConfigPath = path.join(context.projectPath, 'components.json');
        if (fsExtra.existsSync(componentsConfigPath)) {
            warnings.push('components.json already exists');
        }
        // Check for technology conflicts
        const packageJsonPath = path.join(context.projectPath, 'package.json');
        if (fsExtra.existsSync(packageJsonPath)) {
            const packageJson = await fsExtra.readJSON(packageJsonPath);
            const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
            if (dependencies['@mui/material']) {
                warnings.push('Material-UI detected - potential conflict');
            }
            if (dependencies['@chakra-ui/react']) {
                warnings.push('Chakra UI detected - potential conflict');
            }
            if (dependencies['antd']) {
                warnings.push('Ant Design detected - potential conflict');
            }
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    // ============================================================================
    // COMPATIBILITY MATRIX
    // ============================================================================
    getCompatibility() {
        return {
            frameworks: ['nextjs', 'react'],
            platforms: [TargetPlatform.WEB],
            nodeVersions: ['18.0.0', '20.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm'],
            conflicts: ['mui', 'chakra-ui', 'antd']
        };
    }
    getDependencies() {
        return [];
    }
    getConflicts() {
        return ['mui', 'chakra-ui', 'antd'];
    }
    getRequirements() {
        return [
            {
                type: 'package',
                name: 'tailwindcss',
                version: '^3.4.0',
                description: 'Tailwind CSS for styling'
            },
            {
                type: 'package',
                name: 'class-variance-authority',
                version: '^0.7.0',
                description: 'Variant management for components'
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
                description: 'Tailwind class merging utility'
            }
        ];
    }
    // ============================================================================
    // CONFIGURATION SCHEMA
    // ============================================================================
    getDefaultConfig() {
        return {
            components: ['button', 'input', 'card', 'dialog'],
            includeExamples: true,
            useTypeScript: true,
            style: 'default'
        };
    }
    getConfigSchema() {
        return {
            type: 'object',
            properties: {
                components: {
                    type: 'array',
                    description: 'Shadcn/ui components to include',
                    items: {
                        type: 'string',
                        description: 'Component name',
                        enum: ['button', 'input', 'card', 'dialog', 'dropdown-menu', 'form', 'label', 'select', 'textarea', 'toast']
                    },
                    default: ['button', 'input', 'card', 'dialog']
                },
                includeExamples: {
                    type: 'boolean',
                    description: 'Include example components and usage',
                    default: true
                },
                useTypeScript: {
                    type: 'boolean',
                    description: 'Use TypeScript for components',
                    default: true
                },
                style: {
                    type: 'string',
                    description: 'Component style variant',
                    enum: ['default', 'new-york'],
                    default: 'default'
                }
            },
            required: ['components']
        };
    }
    // ============================================================================
    // TECHNOLOGY IMPLEMENTATION METHODS
    // ============================================================================
    getRadixDependencies(components) {
        const radixMap = {
            'button': '@radix-ui/react-slot',
            'dialog': '@radix-ui/react-dialog',
            'dropdown-menu': '@radix-ui/react-dropdown-menu',
            'form': '@radix-ui/react-form',
            'label': '@radix-ui/react-label',
            'select': '@radix-ui/react-select',
            'textarea': '@radix-ui/react-textarea',
            'toast': '@radix-ui/react-toast'
        };
        const dependencies = [];
        const uniqueDeps = new Set();
        for (const component of components) {
            const radixPackage = radixMap[component];
            if (radixPackage && !uniqueDeps.has(radixPackage)) {
                uniqueDeps.add(radixPackage);
                dependencies.push({
                    name: radixPackage,
                    version: '^1.0.0',
                    type: 'production',
                    category: PluginCategory.DESIGN_SYSTEM
                });
            }
        }
        return dependencies;
    }
    generateTailwindConfig(context) {
        return `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
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
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}`;
    }
    generatePostCSSConfig() {
        return `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
    }
    generateGlobalCSS(context) {
        return `@tailwind base;
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
    }
    generateComponentsConfig(context) {
        return `{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}`;
    }
    generateUtils(context) {
        return `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`;
    }
    generateComponentStructure(context, components) {
        const structure = {};
        for (const component of components) {
            structure[`src/components/ui/${component}.tsx`] = this.generateComponentFile(component);
        }
        return structure;
    }
    generateComponentFile(componentName) {
        // Simplified component generation - in real implementation, this would use templates
        return `import * as React from "react"
import { cn } from "@/lib/utils"

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
    generatePackageJsonUpdates(context) {
        return JSON.stringify({
            dependencies: {
                "tailwindcss-animate": "^1.0.7"
            }
        }, null, 2);
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
                    code: 'PLUGIN_ERROR',
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
//# sourceMappingURL=shadcn-ui-plugin.js.map