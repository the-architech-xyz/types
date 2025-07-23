/**
 * Shadcn/UI Code Generator
 * 
 * Handles all code generation for Shadcn/UI library integration.
 * Based on: https://ui.shadcn.com/
 */

import { UIPluginConfig } from '../../../../types/plugins.js';
import { ComponentOption } from '../../../../types/core.js';

export interface GeneratedFile {
    path: string;
    content: string;
}

export class ShadcnUIGenerator {
  
  generateAllFiles(config: UIPluginConfig): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    
    // Generate theme config
    files.push(this.generateTailwindConfig(config));
    files.push(this.generateCSSVariables(config));
    files.push(this.generateUtilsFile());
    files.push(this.generateComponentsJson(config));
    files.push(this.generateUnifiedIndex(config));
    
    // Generate component files based on selected components
    const components = config.components || [];
    if (components.length > 0) {
      for (const component of components) {
        const componentName = this.getComponentName(component);
        const methodName = `generate${componentName}Component`;
        const generatorMethod = (this as any)[methodName];
        if (typeof generatorMethod === 'function') {
          files.push(generatorMethod.call(this, config));
        }
      }
    }
    
    return files;
  }

  generateTailwindConfig(config: UIPluginConfig): GeneratedFile {
    const enableAnimations = true; // Default to true for Shadcn/UI
    const content = `import type { Config } from 'tailwindcss';

const config: Config = {
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
      ${enableAnimations ? `
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
      },` : ''}
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
`;
    return { path: 'tailwind.config.ts', content };
  }

  generateCSSVariables(config: UIPluginConfig): GeneratedFile {
    const content = `@tailwind base;
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
`;
    return { path: 'globals.css', content };
  }

  generateUtilsFile(): GeneratedFile {
    const content = `import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`;
    return { path: 'utils.ts', content };
  }

  generateComponentsJson(config: UIPluginConfig): GeneratedFile {
      const content = JSON.stringify({
          "$schema": "https://ui.shadcn.com/schema.json",
          "style": (config as any).style || 'default',
          // ... rest of components.json content
      }, null, 2);
      return { path: 'components.json', content };
  }

  private generateComponentExports(config: UIPluginConfig): string {
    const components = config.components || [];
    const exports: string[] = [];

    if (components.length > 0) {
      for (const component of components) {
        const componentName = this.getComponentName(component);
        exports.push(`export { ${componentName} } from './${componentName.toLowerCase()}.js';`);
      }
    }

    return exports.join('\n');
  }

  private getComponentName(component: ComponentOption): string {
    const names: Partial<Record<ComponentOption, string>> = {
      [ComponentOption.BUTTON]: 'Button',
      [ComponentOption.CARD]: 'Card',
      [ComponentOption.INPUT]: 'Input',
      [ComponentOption.FORM]: 'Form',
      [ComponentOption.MODAL]: 'Modal',
      [ComponentOption.TABLE]: 'Table',
      [ComponentOption.NAVIGATION]: 'Navigation',
      [ComponentOption.BADGE]: 'Badge',
      [ComponentOption.AVATAR]: 'Avatar',
      [ComponentOption.ALERT]: 'Alert'
    };
    return names[component] || component;
  }

  generateButtonComponent(config: UIPluginConfig): GeneratedFile {
    const enableAnimations = true; // Default to true for Shadcn/UI
      const content = `import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

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
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
`;
      return { path: 'components/button.tsx', content };
  }

  generateCardComponent(): GeneratedFile {
      const content = `import * as React from "react";

import { cn } from "@/lib/utils";

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
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

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
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
`;
      return { path: 'components/card.tsx', content };
  }
  
  generateUnifiedIndex(config: UIPluginConfig): GeneratedFile {
      const content = `/**
 * Unified UI Interface - Shadcn/ui Implementation
 * 
 * This file provides a unified interface for UI components
 * that works with Shadcn/ui design system. It abstracts away
 * Shadcn/ui-specific details and provides a clean API for UI operations.
 * 
 * Based on: https://ui.shadcn.com/docs/components
 */

// ============================================================================
// COMPONENT EXPORTS
// ============================================================================

export { Button, buttonVariants } from './components/button.js';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './components/card.js';
export { Input } from './components/input.js';
export { Label } from './components/label.js';
export { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, useFormField } from './components/form.js';
export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from './components/dialog.js';

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export { cn } from './utils.js';

// ============================================================================
// THEME EXPORTS
// ============================================================================

export { theme } from './theme.js';

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  Button,
  Card,
  Input,
  Label,
  Form,
  Dialog,
  cn,
  theme
};
`;
      return { path: 'index.ts', content };
  }
} 