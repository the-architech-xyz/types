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
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: [
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'components', 'ui', 'button.tsx')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'components', 'ui', 'card.tsx')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'components', 'ui', 'input.tsx')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'config', 'tailwind.config.js')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'index.ts')
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
    async installDependencies(context) {
        const { projectPath } = context;
        const dependencies = [
            'tailwindcss@^3.4.0',
            'autoprefixer@^10.4.0',
            'postcss@^8.4.0',
            'tailwindcss-animate@^1.0.7',
            'class-variance-authority@^0.7.0',
            'clsx@^2.0.0',
            'tailwind-merge@^2.0.0',
            'lucide-react@^0.300.0',
            '@radix-ui/react-slot@^1.0.2',
            '@radix-ui/react-dialog@^1.0.5',
            '@radix-ui/react-label@^2.0.2',
            'react-hook-form@^7.48.2'
        ];
        context.logger.info('Installing UI dependencies...');
        await this.runner.install(dependencies, false, projectPath);
    }
    async createTailwindConfig(context) {
        const { projectPath } = context;
        context.logger.info('Creating self-contained Tailwind configuration...');
        // Create config directory
        const configPath = path.join(projectPath, 'config');
        await fsExtra.ensureDir(configPath);
        // Create self-contained Tailwind config
        const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
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
        await fsExtra.writeFile(path.join(configPath, 'tailwind.config.js'), tailwindConfig);
        // Create PostCSS config
        const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
        await fsExtra.writeFile(path.join(configPath, 'postcss.config.js'), postcssConfig);
        context.logger.success('Tailwind configuration created');
    }
    async createUIComponents(context) {
        const { projectPath } = context;
        context.logger.info('Creating UI components structure...');
        // Create components directory structure
        const componentsPath = path.join(projectPath, 'src', 'components', 'ui');
        await fsExtra.ensureDir(componentsPath);
        // Create utils file
        const utilsPath = path.join(projectPath, 'src', 'lib');
        await fsExtra.ensureDir(utilsPath);
        const utilsContent = `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`;
        await fsExtra.writeFile(path.join(utilsPath, 'utils.ts'), utilsContent);
        // Create basic components manually (instead of using CLI)
        await this.createButtonComponent(componentsPath, utilsPath);
        await this.createCardComponent(componentsPath, utilsPath);
        await this.createInputComponent(componentsPath, utilsPath);
        await this.createLabelComponent(componentsPath, utilsPath);
        await this.createFormComponent(componentsPath, utilsPath);
        await this.createDialogComponent(componentsPath, utilsPath);
        context.logger.info('UI components created manually');
    }
    async createButtonComponent(componentsPath, utilsPath) {
        const buttonContent = `import * as React from "react"
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
        await fsExtra.writeFile(path.join(componentsPath, 'button.tsx'), buttonContent);
    }
    async createCardComponent(componentsPath, utilsPath) {
        const cardContent = `import * as React from "react"

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
        await fsExtra.writeFile(path.join(componentsPath, 'card.tsx'), cardContent);
    }
    async createInputComponent(componentsPath, utilsPath) {
        const inputContent = `import * as React from "react"

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
        await fsExtra.writeFile(path.join(componentsPath, 'input.tsx'), inputContent);
    }
    async createLabelComponent(componentsPath, utilsPath) {
        const labelContent = `import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "../../lib/utils"

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }`;
        await fsExtra.writeFile(path.join(componentsPath, 'label.tsx'), labelContent);
    }
    async createFormComponent(componentsPath, utilsPath) {
        const formContent = `import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form"

import { cn } from "../../lib/utils"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: \`\${id}-form-item\`,
    formDescriptionId: \`\${id}-form-item-description\`,
    formMessageId: \`\${id}-form-item-message\`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? \`\${formDescriptionId}\`
          : \`\${formDescriptionId} \${formMessageId}\`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
})
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message) : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}`;
        await fsExtra.writeFile(path.join(componentsPath, 'form.tsx'), formContent);
    }
    async createDialogComponent(componentsPath, utilsPath) {
        const dialogContent = `import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "../../lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}`;
        await fsExtra.writeFile(path.join(componentsPath, 'dialog.tsx'), dialogContent);
    }
    async createPackageExports(context) {
        const { projectPath } = context;
        context.logger.info('Creating package exports...');
        // Create tsup configuration
        const tsupConfig = `import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  treeshake: true,
});
`;
        await fsExtra.writeFile(path.join(projectPath, 'tsup.config.ts'), tsupConfig);
        // Create package index file
        const indexContent = `// Export UI components
export { Button, buttonVariants } from './components/ui/button';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './components/ui/card';
export { Input } from './components/ui/input';
export { Label } from './components/ui/label';
export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './components/ui/dialog';

// Export utilities
export { cn } from './lib/utils';

// Export types
export type { ButtonProps } from './components/ui/button';
export type { InputProps } from './components/ui/input';
export type { LabelProps } from './components/ui/label';
export type { DialogProps } from './components/ui/dialog';
`;
        await fsExtra.writeFile(path.join(projectPath, 'src', 'index.ts'), indexContent);
        context.logger.success('Package exports created');
    }
    async initializeShadcn(context) {
        const { projectPath, pluginConfig } = context;
        // For standalone UI packages, we need to create minimal framework detection files
        await this.createFrameworkDetectionFiles(context);
        // Create components.json for Shadcn/ui configuration
        await this.createComponentsConfig(context);
        context.logger.info('Shadcn/ui initialized for standalone UI package');
    }
    async createFrameworkDetectionFiles(context) {
        const { projectPath } = context;
        context.logger.info('Creating framework detection files for Shadcn/ui...');
        // Create a minimal next.config.js for framework detection
        const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  // This is a minimal config for Shadcn/ui framework detection
  // The actual Next.js app is in apps/web
  reactStrictMode: true,
  transpilePackages: ['@test-ui-package/ui']
};

module.exports = nextConfig;`;
        await fsExtra.writeFile(path.join(projectPath, 'next.config.js'), nextConfig);
        // Create a minimal package.json with Next.js dependency for framework detection
        const packageJsonPath = path.join(projectPath, 'package.json');
        if (await fsExtra.pathExists(packageJsonPath)) {
            const packageJson = await fsExtra.readJSON(packageJsonPath);
            // Add Next.js as a peer dependency for framework detection
            packageJson.peerDependencies = {
                ...packageJson.peerDependencies,
                'next': '^14.0.0',
                'react': '^18.0.0',
                'react-dom': '^18.0.0'
            };
            await fsExtra.writeJSON(packageJsonPath, packageJson, { spaces: 2 });
        }
        context.logger.info('Framework detection files created');
    }
    async createComponentsConfig(context) {
        const { projectPath } = context;
        context.logger.info('Creating components.json configuration...');
        const componentsConfig = {
            "$schema": "https://ui.shadcn.com/schema.json",
            "style": "default",
            "rsc": true,
            "tsx": true,
            "tailwind": {
                "config": "tailwind.config.js",
                "css": "src/styles/globals.css",
                "baseColor": "neutral",
                "cssVariables": true,
                "prefix": ""
            },
            "aliases": {
                "components": "src/components",
                "utils": "src/lib/utils"
            }
        };
        await fsExtra.writeJSON(path.join(projectPath, 'components.json'), componentsConfig, { spaces: 2 });
        // Create the CSS file referenced in the config
        const cssDir = path.join(projectPath, 'src', 'styles');
        await fsExtra.ensureDir(cssDir);
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
        await fsExtra.writeFile(path.join(cssDir, 'globals.css'), globalsCSS);
        context.logger.info('Components configuration created');
    }
    async setupTailwindCSS(context) {
        const { projectPath } = context;
        // Ensure we have the correct Tailwind CSS version (v3 for Shadcn/ui)
        context.logger.info('Setting up Tailwind CSS v3 for Shadcn/ui...');
        // Install required dependencies if not already present
        await this.runner.install(['tailwindcss@^3.4.0', 'autoprefixer@^10.4.0', 'postcss@^8.4.0', 'tailwindcss-animate@^1.0.7'], false, projectPath);
        // Create tailwind.config.js
        const tailwindConfig = `/** @type {import('tailwindcss').Config} */
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
        await fsExtra.writeFile(path.join(projectPath, 'tailwind.config.js'), tailwindConfig);
        // Update postcss.config.js
        const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
        await fsExtra.writeFile(path.join(projectPath, 'postcss.config.js'), postcssConfig);
        context.logger.info('Tailwind CSS v3 setup completed');
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