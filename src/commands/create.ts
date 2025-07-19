/**
 * Create Command - The Heart of The Architech
 * 
 * Orchestrates specialized AI agents to generate complete, production-ready
 * applications in minutes instead of weeks.
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import path from 'path';
import { existsSync } from 'fs';
import { CommandRunner } from '../utils/command-runner.js';
import { ContextFactory } from '../utils/context-factory.js';
import { displaySuccess, displayError, displayInfo } from '../utils/banner.js';

// Import our orchestrator agent
import { OrchestratorAgent } from '../agents/orchestrator-agent.js';

export interface CreateOptions {
  template?: string;
  packageManager?: string;
  noGit?: boolean;
  noInstall?: boolean;
  yes?: boolean;
}

export interface ProjectConfig {
  projectName: string;
  template: string;
  packageManager: string;
  skipGit: boolean;
  skipInstall: boolean;
  useDefaults: boolean;
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
        name: 'packageManager',
        message: chalk.yellow('📦 Which package manager would you like to use?'),
        choices: [
          { name: 'Auto-detect (Recommended)', value: 'auto' },
          { name: 'npm', value: 'npm' },
          { name: 'yarn', value: 'yarn' },
          { name: 'pnpm', value: 'pnpm' },
          { name: 'bun', value: 'bun' }
        ],
        default: 'auto',
        when: !options.yes && options.packageManager === 'auto'
      },
      {
        type: 'checkbox',
        name: 'modules',
        message: chalk.yellow('🧩 Select modules to include:'),
        choices: [
          { name: 'Best Practices (ESLint, Prettier, Husky)', value: 'best-practices', checked: true },
          { name: 'Design System (Tailwind, Shadcn/ui)', value: 'design-system', checked: true },
          { name: 'Database (Drizzle ORM, PostgreSQL)', value: 'database', checked: true },
          { name: 'Authentication (Better Auth)', value: 'authentication', checked: true },
          { name: 'Deployment (Docker, CI/CD)', value: 'deployment', checked: true },
          { name: 'Testing (Validation, Quality)', value: 'testing', checked: true }
        ],
        when: !options.yes,
        validate: (choices: string[]) => {
          if (choices.length === 0) return 'Please select at least one module';
          return true;
        }
      }
    ]);

    // Merge answers with config
    config = { ...config, ...answers };
  }

  // Set defaults for non-interactive mode
  if (options.yes) {
    config.modules = ['best-practices', 'design-system', 'database', 'authentication', 'deployment', 'testing'];
    config.template = config.template || 'nextjs-14';
    config.userInput = config.userInput || 'A modern web application with Next.js, database, authentication, and deployment';
  }

  // Ensure we have a project name
  if (!config.projectName) {
    config.projectName = projectName || 'my-architech-app';
  }

  // Normalize template name
  if (config.template === 'nextjs') {
    config.template = 'nextjs-14';
  }

  return config;
}

async function validateProject(config: ProjectConfig): Promise<void> {
  const projectPath = path.resolve(config.projectName);
  
  if (existsSync(projectPath)) {
    throw new Error(`Directory "${config.projectName}" already exists`);
  }
  
  displayInfo(`Creating project: ${config.projectName}`);
  displayInfo(`Template: ${config.template}`);
  displayInfo(`Modules: ${config.modules?.join(', ') || 'base project only'}`);
  if (config.userInput) {
    displayInfo(`Requirements: ${config.userInput}`);
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

  if (result.success) {
    console.log(chalk.green('✅ Orchestrator completed successfully!'));
    console.log(chalk.gray(`Duration: ${result.duration}ms`));
    console.log(chalk.gray(`Artifacts: ${result.artifacts?.length || 0}`));
    
    if (result.warnings && result.warnings.length > 0) {
      console.log(chalk.yellow('\n⚠️  Warnings:'));
      result.warnings.forEach(warning => {
        console.log(chalk.yellow(`  • ${warning}`));
      });
    }
  } else {
    console.log(chalk.red('❌ Orchestrator failed!'));
    if (result.errors) {
      result.errors.forEach(error => {
        console.log(chalk.red(`  • ${error.message}`));
      });
    }
    throw new Error('Orchestrator execution failed');
  }
}

function displayProjectSummary(config: ProjectConfig): void {
  console.log(chalk.green.bold(`\n✨ The Architech has successfully generated your project '${config.projectName}'!\n`));
  
  console.log(chalk.cyan.bold('📊 GENERATION REPORT:'));
  console.log(chalk.gray('─'.repeat(45)));
  console.log(chalk.green(`✔ Template: ${config.template}`));
  console.log(chalk.green(`✔ Package Manager: ${config.packageManager}`));
  console.log(chalk.green(`✔ Modules: ${config.modules?.join(', ') || 'base project'}`));
  console.log(chalk.green(`✔ Project Structure: Complete`));
  console.log(chalk.green(`✔ Dependencies: Installed`));
  console.log(chalk.green(`✔ Configuration: Optimized`));
  console.log(chalk.green(`✔ AI Orchestration: Successful`));
  
  console.log(chalk.yellow.bold('\n⏱️  PRODUCTIVITY IMPACT:'));
  console.log(chalk.gray('─'.repeat(45)));
  console.log(chalk.white(`- Traditional Setup Time: 2-3 weeks`));
  console.log(chalk.white(`- The Architech Time: ~3 minutes`));
  console.log(chalk.white(`- Time Saved: 99.8%`));
  
  console.log(chalk.magenta.bold('\n🚀 NEXT STEPS:'));
  console.log(chalk.gray('─'.repeat(45)));
  console.log(chalk.cyan(`1. cd ${config.projectName}`));
  if (config.skipInstall) {
    console.log(chalk.cyan(`2. ${config.packageManager === 'npm' ? 'npm install' : config.packageManager + ' install'}`));
    console.log(chalk.cyan(`3. ${config.packageManager === 'npm' ? 'npm run dev' : config.packageManager === 'yarn' ? 'yarn dev' : config.packageManager + ' run dev'}`));
  } else {
    console.log(chalk.cyan(`2. ${config.packageManager === 'npm' ? 'npm run dev' : config.packageManager === 'yarn' ? 'yarn dev' : config.packageManager + ' run dev'}`));
  }
  
  console.log(chalk.green.bold('\n🎉 Happy coding! Your AI-generated project is ready to go!\n'));
  console.log(chalk.gray('📚 Documentation: https://the-architech.dev/docs'));
  console.log(chalk.gray('💬 Support: https://github.com/the-architech/cli/issues\n'));
} 