/**
 * New Command - Unified Project Generation
 * 
 * Single entry point for project generation with guided decision making:
 * - Quick Prototype (Single App) - Start fast and simple
 * - Scalable Application (Monorepo) - Build serious projects that will grow
 * 
 * The secret: Same underlying architecture, different surface structure
 */

import * as path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { CommandRunner } from '../utils/command-runner.js';
import { ContextFactory } from '../utils/context-factory.js';
import { OrchestratorAgent } from '../agents/orchestrator-agent.js';
import fsExtra from 'fs-extra';

export interface NewOptions {
  packageManager?: string;
  noGit?: boolean;
  noInstall?: boolean;
  yes?: boolean;
  projectType?: 'quick-prototype' | 'scalable-monorepo';
}

export interface NewConfig {
  projectName: string;
  projectType: 'quick-prototype' | 'scalable-monorepo';
  packageManager: string;
  skipGit: boolean;
  skipInstall: boolean;
  useDefaults: boolean;
  userInput?: string;
  template: string;
}

export async function newCommand(projectName?: string, options: NewOptions = {}): Promise<void> {
  console.log(chalk.blue.bold('🎭 Welcome to The Architech!\n'));
  
  // Debug: Log the options being passed
  console.log('DEBUG: newCommand called with options:', JSON.stringify(options, null, 2));
  console.log('DEBUG: projectName:', projectName);
  
  try {
    // Step 1: Gather project configuration with guided decision making
    const config = await gatherProjectConfig(projectName, options);
    
    // Debug: Log the final config
    console.log('DEBUG: Final config:', JSON.stringify(config, null, 2));
    
    // Step 2: Validate project doesn't exist
    await validateProject(config);
    
    // Step 3: Create enhanced context with project structure awareness
    const context = createEnhancedContext(config);
    
    // Step 4: Execute orchestrator agent with enhanced context
    await executeOrchestrator(context);
    
    // Step 5: Display success summary with next steps
    displayProjectSummary(config);
    
  } catch (error) {
    displayError(`Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

async function gatherProjectConfig(projectName?: string, options: NewOptions = {}): Promise<NewConfig> {
  let config: NewConfig = {
    projectName: projectName || '',
    projectType: options.projectType || 'scalable-monorepo', // Default to recommended
    packageManager: options.packageManager || 'auto',
    skipGit: options.noGit || false,
    skipInstall: options.noInstall || false,
    useDefaults: options.yes || false,
    template: 'nextjs-14',
    userInput: ''
  };

  // If using interactive mode (not --yes flag)
  if (!options.yes) {
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
        type: 'list',
        name: 'projectType',
        message: chalk.yellow('🎯 What is the primary goal for this project?'),
        choices: [
          {
            name: 'Quick Prototype / Single App (I want to start fast and simple)',
            value: 'quick-prototype',
            description: 'Perfect for MVPs, prototypes, and learning'
          },
          {
            name: 'Scalable Application / Monorepo (I\'m building a serious project that will grow - Recommended)',
            value: 'scalable-monorepo',
            description: 'Enterprise-grade structure with packages and shared tooling'
          }
        ],
        default: 'scalable-monorepo'
      },
      {
        type: 'input',
        name: 'userInput',
        message: chalk.yellow('🤖 Describe your project requirements (optional):'),
        default: '',
        description: 'Describe what you want to build, e.g., "A blog with authentication, database, and modern UI"'
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
        default: 'auto'
      },
      {
        type: 'confirm',
        name: 'skipGit',
        message: chalk.yellow('🚫 Skip git repository initialization?'),
        default: false
      },
      {
        type: 'confirm',
        name: 'skipInstall',
        message: chalk.yellow('🚫 Skip dependency installation?'),
        default: false
      }
    ]);

    // Update config with user answers
    config = {
      ...config,
      projectName: answers.projectName || config.projectName,
      projectType: answers.projectType || config.projectType,
      packageManager: answers.packageManager || config.packageManager,
      skipGit: answers.skipGit !== undefined ? answers.skipGit : config.skipGit,
      skipInstall: answers.skipInstall !== undefined ? answers.skipInstall : config.skipInstall,
      userInput: answers.userInput || config.userInput
    };
  }

  return config;
}

async function validateProject(config: NewConfig): Promise<void> {
  const projectPath = path.resolve(config.projectName);
  
  if (await fsExtra.pathExists(projectPath)) {
    throw new Error(`Project directory already exists: ${config.projectName}`);
  }
}

function createEnhancedContext(config: NewConfig) {
  // Map user preference to internal structure
  const structureType = config.projectType === 'quick-prototype' ? 'single-app' : 'monorepo';
  const modules = structureType === 'monorepo' ? ['ui', 'db', 'auth', 'config'] : [];

  // Create enhanced context with project structure awareness
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
      structure: structureType,
      modules: modules,
      userInput: config.userInput,
      projectType: config.projectType
    }
  );

  // Enhance the context with project structure information
  context.projectStructure = {
    type: structureType,
    userPreference: config.projectType,
    modules: modules,
    template: config.template
  };
  
  context.userInput = config.userInput || '';

  return context;
}

async function executeOrchestrator(context: any): Promise<void> {
  console.log(chalk.magenta.bold('\n🤖 Deploying AI Orchestrator Agent...\n'));
  
  // Execute orchestrator agent with enhanced context
  const orchestrator = new OrchestratorAgent();
  const result = await orchestrator.execute(context);

  if (!result.success) {
    throw new Error(`Orchestration failed: ${result.errors?.map((e: any) => e.message).join(', ')}`);
  }

  console.log(chalk.green.bold('\n✅ Project generation completed successfully!\n'));
}

function displayProjectSummary(config: NewConfig): void {
  console.log(chalk.green.bold('🎉 Your project is ready!\n'));
  
  console.log(chalk.blue.bold('📁 Project Structure:'));
  if (config.projectType === 'quick-prototype') {
    console.log(chalk.gray('  my-quick-project/'));
    console.log(chalk.gray('  ├── src/'));
    console.log(chalk.gray('  │   ├── app/            # Pages'));
    console.log(chalk.gray('  │   ├── components/     # UI components'));
    console.log(chalk.gray('  │   └── lib/            # Utilities'));
    console.log(chalk.gray('  ├── config/             # Configuration'));
    console.log(chalk.gray('  └── package.json'));
    console.log(chalk.yellow('\n💡 Quick Start Structure: Simple on surface, modular underneath'));
    console.log(chalk.gray('    Uses path aliases to simulate monorepo structure'));
  } else {
    console.log(chalk.gray('  my-scalable-project/'));
    console.log(chalk.gray('  ├── apps/'));
    console.log(chalk.gray('  │   └── web/            # Main application'));
    console.log(chalk.gray('  ├── packages/'));
    console.log(chalk.gray('  │   ├── ui/             # Shared UI components'));
    console.log(chalk.gray('  │   ├── db/             # Database layer'));
    console.log(chalk.gray('  │   └── auth/           # Authentication'));
    console.log(chalk.gray('  ├── turbo.json          # Turborepo config'));
    console.log(chalk.gray('  └── package.json'));
    console.log(chalk.yellow('\n🏗️  Enterprise Structure: Full monorepo with packages'));
  }

  console.log(chalk.blue.bold('\n🚀 Next Steps:'));
  console.log(chalk.white(`  cd ${config.projectName}`));
  console.log(chalk.white('  npm run dev'));
  console.log(chalk.white('  # or yarn dev / pnpm dev / bun dev'));
  
  if (config.projectType === 'quick-prototype') {
    console.log(chalk.blue.bold('\n🔄 Future Scaling:'));
    console.log(chalk.yellow('  When your project grows, run:'));
    console.log(chalk.white('  npx the-architech scale-to-monorepo'));
    console.log(chalk.gray('  This will automatically restructure your project into a full monorepo'));
  }

  console.log(chalk.blue.bold('\n📚 Documentation:'));
  console.log(chalk.white('  https://the-architech.dev'));
  console.log(chalk.gray('  Get help, examples, and advanced features'));
  
  console.log(chalk.green.bold('\n🎯 Happy coding!\n'));
}

function displayError(message: string): void {
  console.log(chalk.red.bold('\n❌ Error:'));
  console.log(chalk.red(message));
  console.log(chalk.yellow('\n💡 Need help? Visit: https://the-architech.dev\n'));
} 