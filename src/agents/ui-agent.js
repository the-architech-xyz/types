/**
 * UI Agent - Design System Package Generator
 * 
 * Sets up the packages/ui design system with:
 * - Tailwind CSS configuration
 * - Shadcn/ui integration
 * - Shared UI components
 * - Utility functions for styling
 */

import chalk from 'chalk';
import ora from 'ora';
import fsExtra from 'fs-extra';
import path from 'path';

const { writeFile, writeJSON, ensureDir } = fsExtra;

export class UIAgent {
  async execute(config, runner) {
    const spinner = ora({
      text: chalk.blue('🎨 Setting up UI design system package...'),
      color: 'blue'
    }).start();

    try {
      const projectPath = path.resolve(process.cwd(), config.projectName);
      const uiPackagePath = path.join(projectPath, 'packages', 'ui');
      
      // Update package.json with dependencies
      await this.updatePackageJson(uiPackagePath, config);
      
      // Create ESLint config
      await this.createESLintConfig(uiPackagePath);
      
      // Create Tailwind configuration
      await this.createTailwindConfig(uiPackagePath);
      
      // Create utility functions
      await this.createUtilities(uiPackagePath);
      
      // Create components.json for Shadcn/ui
      await this.createComponentsConfig(uiPackagePath, config);
      
      // Create base components directory structure
      await this.createComponentStructure(uiPackagePath);
      
      // Create CSS files
      await this.createCSSFiles(uiPackagePath);
      
      // Create index exports
      await this.createIndex(uiPackagePath);
      
      // Note: Component installation will be done after workspace setup
      spinner.succeed(chalk.green('✅ UI design system package configured'));
      
    } catch (error) {
      spinner.fail(chalk.red('❌ Failed to configure UI package'));
      throw error;
    }
  }

  async updatePackageJson(uiPackagePath, config) {
    const packageJson = {
      name: `@${config.projectName}/ui`,
      version: "0.1.0",
      private: true,
      description: "Shared UI components and design system",
      main: "index.ts",
      types: "index.ts",
      scripts: {
        "build": "tailwindcss -i ./styles/globals.css -o ./dist/styles.css --watch",
        "dev": "tailwindcss -i ./styles/globals.css -o ./dist/styles.css --watch",
        "lint": "eslint . --ext .ts,.tsx",
        "type-check": "tsc --noEmit"
      },
      dependencies: {
        "tailwindcss": "^3.3.6",
        "autoprefixer": "^10.4.16",
        "postcss": "^8.4.32",
        "class-variance-authority": "^0.7.0",
        "clsx": "^2.0.0",
        "tailwind-merge": "^2.0.0",
        "lucide-react": "^0.294.0",
        "@radix-ui/react-slot": "^1.0.2"
      },
      devDependencies: {
        "@types/react": "^18.2.37",
        "@types/react-dom": "^18.2.15",
        "typescript": "^5.2.2"
      },
      peerDependencies: {
        "react": "^18.0.0",
        "react-dom": "^18.0.0"
      }
    };

    await writeJSON(path.join(uiPackagePath, 'package.json'), packageJson, { spaces: 2 });
  }

  async createESLintConfig(uiPackagePath) {
    const eslintConfig = {
      extends: ["../../.eslintrc.json"],
      env: {
        browser: true
      }
    };

    await writeJSON(path.join(uiPackagePath, '.eslintrc.json'), eslintConfig, { spaces: 2 });
  }

  async createTailwindConfig(uiPackagePath) {
    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../apps/web/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
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

    await writeFile(path.join(uiPackagePath, 'tailwind.config.js'), tailwindConfig);
  }

  async createUtilities(uiPackagePath) {
    const utilsContent = `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`;

    await ensureDir(path.join(uiPackagePath, 'lib'));
    await writeFile(path.join(uiPackagePath, 'lib', 'utils.ts'), utilsContent);
  }

  async createComponentsConfig(uiPackagePath, config) {
    const componentsConfig = {
      "$schema": "https://ui.shadcn.com/schema.json",
      "style": "default",
      "rsc": true,
      "tsx": true,
      "tailwind": {
        "config": "./tailwind.config.js",
        "css": "./styles/globals.css",
        "baseColor": "slate",
        "cssVariables": true,
        "prefix": ""
      },
      "aliases": {
        "components": "./components",
        "utils": "./lib/utils"
      }
    };

    await writeJSON(path.join(uiPackagePath, 'components.json'), componentsConfig, { spaces: 2 });
  }

  async createComponentStructure(uiPackagePath) {
    const directories = [
      'components',
      'components/ui',
      'styles',
      'dist'
    ];

    for (const dir of directories) {
      await ensureDir(path.join(uiPackagePath, dir));
    }
  }

  async createCSSFiles(uiPackagePath) {
    const globalsCss = `@tailwind base;
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
    --primary: 221.2 83.2% 53.3%;
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
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;
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
    --ring: 224.3 76.3% 94.1%;
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

    await writeFile(path.join(uiPackagePath, 'styles', 'globals.css'), globalsCss);
  }

  async installBaseComponents(uiPackagePath, runner) {
    const originalCwd = process.cwd();
    
    try {
      process.chdir(uiPackagePath);
      
      // Install required Shadcn/ui dependencies first
      await runner.install(['tailwindcss-animate'], false, uiPackagePath);
      
      // Install base components
      const baseComponents = ['button', 'card', 'input', 'label'];
      
      for (const component of baseComponents) {
        try {
          await runner.exec('npx', ['shadcn-ui@latest', 'add', component, '--yes']);
        } catch (error) {
          // Continue if component installation fails
          console.log(chalk.yellow(`⚠️  Warning: Could not install ${component} component`));
        }
      }
      
    } finally {
      process.chdir(originalCwd);
    }
  }

  async createIndex(uiPackagePath) {
    const indexContent = `// UI Components
// Note: To add Shadcn components, run: npx shadcn@latest add button card input label
// export { Button } from "./components/ui/button";
// export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./components/ui/card";
// export { Input } from "./components/ui/input";
// export { Label } from "./components/ui/label";

// Utilities
export { cn } from "./lib/utils";

// Styles
import "./styles/globals.css";`;

    await writeFile(path.join(uiPackagePath, 'index.ts'), indexContent);
  }
} 