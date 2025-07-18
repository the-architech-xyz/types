/**
 * Design System Agent - UI/UX Architect
 * 
 * Installs and configures design system components:
 * - Shadcn/ui components (with refined automation from Phase 0 learnings)
 * - Tailwind CSS utilities
 * - Icon libraries
 * - Typography system
 */

import chalk from 'chalk';
import path from 'path';
import { writeFileSync, existsSync } from 'fs';

export class DesignSystemAgent {
  constructor(commandRunner) {
    this.runner = commandRunner;
    this.name = 'DesignSystemAgent';
  }

  async execute(config) {
    const { projectPath } = config;
    
    console.log(chalk.cyan(`🔧 [${this.name}] Setting up design system...`));
    
    try {
      // Step 1: Install design dependencies
      await this.installDependencies(projectPath);
      
      // Step 2: Create shadcn-ui config (manual approach based on Phase 0 learnings)
      await this.createShadcnConfig(projectPath);
      
      // Step 3: Install core UI components manually for reliability
      await this.installCoreComponents(projectPath);
      
      console.log(chalk.green(`✅ [${this.name}] Design system configured successfully`));
      
    } catch (error) {
      console.log(chalk.red(`❌ [${this.name}] Failed: ${error.message}`));
      throw error;
    }
  }

  async installDependencies(projectPath) {
    console.log(chalk.blue(`📦 Installing design system dependencies...`));
    
    const dependencies = [
      'lucide-react',
      'clsx',
      'tailwind-merge',
      'class-variance-authority'
    ];
    
    await this.runner.install(dependencies, false, projectPath);
    console.log(chalk.green(`✅ Design dependencies installed`));
  }

  async createShadcnConfig(projectPath) {
    console.log(chalk.blue(`🎨 Creating shadcn/ui configuration...`));
    
    const componentsConfig = {
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
    };
    
    writeFileSync(
      path.join(projectPath, 'components.json'),
      JSON.stringify(componentsConfig, null, 2)
    );
    
    console.log(chalk.green(`✅ Shadcn/ui config created`));
  }

  async installCoreComponents(projectPath) {
    console.log(chalk.blue(`🧩 Installing core UI components...`));
    
    // Based on Phase 0 learnings, we'll use a more reliable approach
    try {
      // Create utils lib first
      await this.createUtilsLib(projectPath);
      
      // Create basic component structure
      await this.createComponentStructure(projectPath);
      
      console.log(chalk.green(`✅ Core components structure created`));
      console.log(chalk.yellow(`ℹ️  Run 'npx shadcn-ui@latest add button' manually to add specific components`));
      
    } catch (error) {
      console.log(chalk.yellow(`⚠️  Component installation skipped: ${error.message}`));
    }
  }

  async createUtilsLib(projectPath) {
    const utilsPath = path.join(projectPath, 'src', 'lib');
    const utilsFile = path.join(utilsPath, 'utils.ts');
    
    if (!existsSync(utilsPath)) {
      const fs = await import('fs');
      fs.mkdirSync(utilsPath, { recursive: true });
    }
    
    const utilsContent = `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`;
    
    writeFileSync(utilsFile, utilsContent);
  }

  async createComponentStructure(projectPath) {
    const componentsPath = path.join(projectPath, 'src', 'components', 'ui');
    
    if (!existsSync(componentsPath)) {
      const fs = await import('fs');
      fs.mkdirSync(componentsPath, { recursive: true });
    }
    
    // Create a basic README for the components directory
    const readmeContent = `# UI Components

This directory contains shadcn/ui components.

To add components, run:
\`\`\`bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
\`\`\`

See https://ui.shadcn.com/docs/components for all available components.
`;
    
    writeFileSync(
      path.join(componentsPath, 'README.md'),
      readmeContent
    );
  }
} 