/**
 * Create Command - Main project generation command
 * 
 * Updated to use the new framework-agnostic and structure-agnostic approach.
 */

import * as path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { CommandRunner } from '../utils/command-runner.js';
import { ContextFactory } from '../utils/context-factory.js';
import { OrchestratorAgent } from '../agents/orchestrator-agent.js';
import { ConfigurationManager } from '../utils/configuration-manager.js';
import { ProjectStructure } from '../utils/project-structure-manager.js';

export interface CreateOptions {
  template?: string;
  packageManager?: string;
  noGit?: boolean;
  noInstall?: boolean;
  yes?: boolean;
  structure?: 'single-app' | 'monorepo';
}

export interface ProjectConfig {
  projectName: string;
  template: string;
  packageManager: string;
  skipGit: boolean;
  skipInstall: boolean;
  useDefaults: boolean;
  structure: ProjectStructure;
  modules?: string[];
  userInput?: string;
}

export async function createCommand(projectName?: string, options: CreateOptions = {}): Promise<void> {
  console.log(chalk.blue.bold('🎭 Initializing The Architech Generation Process...\n'));
  
  try {
    // Step 1: Gather project configuration
    const config = await gatherProjectConfig(projectName, options);
    
    // Step 2: Validate project doesn't exist
    await validateProject(config);
    
    // Step 3: Initialize command runner
    const runner = new CommandRunner(config.packageManager as any, { verbose: true });
    
    // Step 4: Execute orchestrator agent
    await executeOrchestrator(config, runner);
    
    // Step 5: Display success summary
    displayProjectSummary(config);
    
  } catch (error) {
    displayError(`Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

async function gatherProjectConfig(projectName?: string, options: CreateOptions = {}): Promise<ProjectConfig> {
  let config: ProjectConfig = {
    projectName: projectName || '',
    template: options.template || 'nextjs-14',
    packageManager: options.packageManager || 'auto',
    skipGit: options.noGit || false,
    skipInstall: options.noInstall || false,
    useDefaults: options.yes || false,
    structure: options.structure || 'single-app',
    userInput: ''
  };

  // If project name not provided or using interactive mode
  if (!projectName || !options.yes) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: chalk.yellow('🎯 What is the name of your project?'),
        default: projectName || 'my-architech-app',
        when: !projectName,
        validate: (input: string) => {
          if (!input.trim()) return 'Project name is required';
          if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
            return 'Project name can only contain letters, numbers, hyphens, and underscores';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'userInput',
        message: chalk.yellow('🤖 Describe your project requirements (optional):'),
        default: '',
        when: !options.yes,
        description: 'Describe what you want to build, e.g., "A blog with authentication, database, and modern UI"'
      },
      {
        type: 'list',
        name: 'template',
        message: chalk.yellow('📦 Choose your project template:'),
        choices: [
          { name: 'Next.js 14 (App Router) - Recommended', value: 'nextjs-14' },
          { name: 'Next.js 13 (Pages Router)', value: 'nextjs-13' },
          { name: 'React with Vite', value: 'react-vite' },
          { name: 'Vue with Nuxt 3', value: 'vue-nuxt' }
        ],
        default: 'nextjs-14',
        when: !options.yes
      },
      {
        type: 'list',
        name: 'structure',
        message: chalk.yellow('🏗️ Choose your project structure:'),
        choices: [
          { name: 'Single Application - Simple and focused', value: 'single-app' },
          { name: 'Monorepo - Enterprise-grade with multiple packages', value: 'monorepo' }
        ],
        default: 'single-app',
        when: !options.yes
      },
      {
        type: 'list',
        name: 'packageManager',
        message: chalk.yellow('📦 Choose your package manager:'),
        choices: [
          { name: 'npm - Default Node.js package manager', value: 'npm' },
          { name: 'yarn - Fast, reliable, and secure', value: 'yarn' },
          { name: 'pnpm - Fast, disk space efficient', value: 'pnpm' },
          { name: 'bun - All-in-one JavaScript runtime & toolkit', value: 'bun' },
          { name: 'Auto-detect (recommended)', value: 'auto' }
        ],
        default: 'auto',
        when: !options.yes
      },
      {
        type: 'confirm',
        name: 'skipGit',
        message: chalk.yellow('🚫 Skip git repository initialization?'),
        default: false,
        when: !options.yes
      },
      {
        type: 'confirm',
        name: 'skipInstall',
        message: chalk.yellow('🚫 Skip dependency installation?'),
        default: false,
        when: !options.yes
      }
    ]);

    // Update config with user answers
    config = {
      ...config,
      projectName: answers.projectName || config.projectName,
      template: answers.template || config.template,
      structure: answers.structure || config.structure,
      packageManager: answers.packageManager || config.packageManager,
      skipGit: answers.skipGit !== undefined ? answers.skipGit : config.skipGit,
      skipInstall: answers.skipInstall !== undefined ? answers.skipInstall : config.skipInstall,
      userInput: answers.userInput || config.userInput
    };
  }

  // Set default modules for monorepo
  if (config.structure === 'monorepo') {
    config.modules = ['ui', 'db', 'auth', 'config'];
  }

  return config;
}

async function validateProject(config: ProjectConfig): Promise<void> {
  const projectPath = path.resolve(config.projectName);
  
  if (await import('fs-extra').then(fs => fs.pathExists(projectPath))) {
    throw new Error(`Project directory already exists: ${config.projectName}`);
  }
}

async function executeOrchestrator(config: ProjectConfig, runner: CommandRunner): Promise<void> {
  const projectPath = path.resolve(config.projectName);
  
  console.log(chalk.magenta.bold('\n🤖 Deploying AI Orchestrator Agent...\n'));
  
  // Create context using the factory
  const context = ContextFactory.createContext(
    config.projectName,
    {
      packageManager: config.packageManager,
      skipGit: config.skipGit,
      skipInstall: config.skipInstall,
      useDefaults: config.useDefaults,
      verbose: true
    },
    {
      template: config.template,
      structure: config.structure,
      modules: config.modules,
      userInput: config.userInput,
      // Agent-specific configurations
      ui: {
        components: ['button', 'card', 'input', 'label', 'dialog'],
        theme: 'slate',
        usePlugin: true
      },
      database: {
        provider: 'neon',
        schema: ['users', 'posts', 'comments'],
        migrations: true
      },
      authentication: {
        providers: ['email', 'github'],
        requireEmailVerification: true,
        sessionDuration: 604800
      },
      deployment: {
        platform: 'vercel',
        useDocker: true,
        useCI: true
      },
      validation: {
        strictMode: false,
        usePlugin: true
      }
    }
  );

  // Create and execute orchestrator agent
  const orchestrator = new OrchestratorAgent();
  
  console.log(chalk.blue.bold('🎯 Orchestrator Agent starting...'));
  const result = await orchestrator.execute(context);
  
  if (!result.success) {
    const errorMessage = result.errors?.[0]?.message || 'Unknown error occurred';
    throw new Error(`Orchestrator execution failed: ${errorMessage}`);
  }
  
  console.log(chalk.green.bold('\n✅ Project generation completed successfully!'));
}

function displayProjectSummary(config: ProjectConfig): void {
  const structureText = config.structure === 'monorepo' ? 'Enterprise Monorepo' : 'Single Application';
  
  console.log(chalk.green.bold(`\n✨ The Architech has successfully generated your ${structureText} '${config.projectName}'!\n`));
  
  console.log(chalk.cyan.bold('📊 GENERATION REPORT:'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.green(`✔ Project Type: ${structureText}`));
  console.log(chalk.green(`✔ Framework: ${config.template}`));
  console.log(chalk.green(`✔ Package Manager: ${config.packageManager}`));
  console.log(chalk.green(`✔ Project Structure: Complete`));
  console.log(chalk.green(`✔ Dependencies: ${config.skipInstall ? 'Skipped' : 'Installed'}`));
  console.log(chalk.green(`✔ Configuration: Optimized`));
  console.log(chalk.green(`✔ AI Orchestration: Successful`));
  
  if (config.structure === 'monorepo' && config.modules) {
    console.log(chalk.green(`✔ Packages: ${config.modules.join(', ')}`));
  }
  
  console.log(chalk.yellow.bold('\n⏱️  PRODUCTIVITY IMPACT:'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.white(`- Traditional Setup Time: 3-4 weeks`));
  console.log(chalk.white(`- The Architech Time: ~5 minutes`));
  console.log(chalk.white(`- Time Saved: 99.9%`));
  
  console.log(chalk.magenta.bold('\n🚀 NEXT STEPS:'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.cyan(`1. cd ${config.projectName}`));
  
  if (!config.skipInstall) {
    console.log(chalk.cyan(`2. npm run dev`));
    console.log(chalk.cyan(`3. Open http://localhost:3000`));
  } else {
    console.log(chalk.cyan(`2. npm install`));
    console.log(chalk.cyan(`3. npm run dev`));
    console.log(chalk.cyan(`4. Open http://localhost:3000`));
  }
  
  if (config.structure === 'monorepo') {
    console.log(chalk.blue.bold('\n🏗️  MONOREPO STRUCTURE:'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.white(`📁 apps/web - Main Next.js application`));
    if (config.modules) {
      config.modules.forEach(module => {
        console.log(chalk.white(`📁 packages/${module} - ${module} package`));
      });
    }
  }
  
  console.log(chalk.green.bold('\n🎉 Happy coding! Your project is ready to build amazing things!\n'));
}

function displayError(message: string): void {
  console.error(chalk.red.bold('\n❌ Error:'), chalk.red(message));
  console.log(chalk.yellow('\n💡 Need help? Check our documentation or open an issue on GitHub.'));
} 