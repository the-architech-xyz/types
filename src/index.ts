#!/usr/bin/env node

/**
 * The Architech CLI - Main Entry Point
 * 
 * Revolutionary AI-Powered Application Generator
 * Transforming weeks of work into minutes
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { newCommand } from './commands/new.js';
import { scaleCommand } from './commands/scale.js';
import { displayBanner } from './core/cli/banner.js';

// Async IIFE to handle dynamic imports
(async () => {
  // Try to import plugins command with error handling
  let pluginsCommand: any;
  try {
    const pluginsModule = await import('./commands/plugins.js');
    pluginsCommand = pluginsModule.pluginsCommand;
    console.log('Plugins command imported successfully');
  } catch (error) {
    console.error('Failed to import plugins command:', error);
    pluginsCommand = () => {
      const { Command } = require('commander');
      return new Command('plugins')
        .description('Manage The Architech plugins (not available)')
        .action(() => {
          console.log('Plugins command is not available');
        });
    };
  }

  // Display banner for all commands
  displayBanner();

  // Define CLI program
  const program = new Command();
  program
    .name('architech')
    .description('🚀 Revolutionary AI-Powered Application Generator')
    .version('0.1.0', '-v, --version', 'Show The Architech version')
    .helpOption('-h, --help', 'Show help information');

  // New command - Unified project generation with guided decision making
  program
    .command('new')
    .description('🎭 Create a new project with guided decision making')
    .argument('[project-name]', 'Name of the project to create')
    .option('-p, --package-manager <pm>', 'Package manager (npm, yarn, pnpm, bun)', 'auto')
    .option('--project-type <type>', 'Project type (quick-prototype, scalable-monorepo)', 'quick-prototype')
    .option('--template <template>', 'Template to use (quick-start, blog-platform, ecommerce, saas, enterprise, custom)')
    .option('--no-git', 'Skip git repository initialization')
    .option('--no-install', 'Skip dependency installation')
    .option('-y, --yes', 'Skip interactive prompts and use defaults', false)
    .action(newCommand);

  // Scale command - Transform single app to monorepo (the killer feature)
  program
    .command('scale')
    .description('🚀 Scale your single app to a scalable monorepo structure')
    .option('-p, --package-manager <pm>', 'Package manager (npm, yarn, pnpm, bun)', 'auto')
    .option('-y, --yes', 'Skip interactive prompts and use defaults')
    .action(scaleCommand);

  // Plugins command - Plugin management
  console.log('Registering plugins command...');
  const pluginsCmd = pluginsCommand();
  console.log('Plugins command created:', pluginsCmd.name());
  program.addCommand(pluginsCmd);
  console.log('Plugins command registered');

  // Add command - Future: Add modules to existing projects
  program
    .command('add')
    .description('➕ Add modules to an existing project')
    .argument('<module>', 'Module to add (auth, payments, admin, etc.)')
    .option('-f, --force', 'Force installation even if conflicts exist')
    .action((module, options) => {
      console.log(chalk.yellow('🚧 The "add" command is coming soon!'));
      console.log(chalk.gray(`Module: ${module}`));
      if (options.force) {
        console.log(chalk.gray('Force mode: enabled'));
      }
    });

  // List command - Show available templates and modules
  program
    .command('list')
    .alias('ls')
    .description('📋 List available templates and modules')
    .option('-t, --templates', 'Show available templates')
    .option('-m, --modules', 'Show available modules')
    .action((options) => {
      console.log(chalk.yellow('🚧 The "list" command is coming soon!'));
      if (options.templates) {
        console.log(chalk.blue('\n📦 Available Templates:'));
        console.log('  • nextjs-14     - Next.js 14 with App Router');
        console.log('  • nextjs-13     - Next.js 13 with Pages Router');
        console.log('  • react-18      - React 18 with Vite');
        console.log('  • vue-3         - Vue 3 with Composition API');
      } else if (options.modules) {
        console.log(chalk.blue('\n🔧 Available Modules:'));
        console.log('  • auth          - Authentication (Better Auth)');
        console.log('  • database      - Database (Drizzle ORM)');
        console.log('  • ui            - UI Components (Shadcn/ui)');
        console.log('  • payments      - Payment processing');
        console.log('  • admin         - Admin dashboard');
        console.log('  • email         - Email services');
        console.log('  • monitoring    - Application monitoring');
      } else {
        console.log(chalk.blue('\n🎯 Quick Start:'));
        console.log('  architech new my-app          # Create a new project');
        console.log('  architech scale               # Scale to monorepo');
        console.log('  architech add auth            # Add authentication');
        console.log('  architech list --templates    # Show templates');
        console.log('  architech list --modules      # Show modules');
      }
    });

  // Info command - Show project information
  program
    .command('info')
    .description('ℹ️  Show project information and status')
    .action(() => {
      console.log(chalk.blue('\n📊 Project Information:'));
      console.log(chalk.gray('This command will show:'));
      console.log('  • Project structure (single-app vs monorepo)');
      console.log('  • Installed modules and plugins');
      console.log('  • Dependencies and versions');
      console.log('  • Configuration status');
      console.log(chalk.yellow('\n🚧 Coming soon!'));
    });

  // Update command - Update The Architech CLI
  program
    .command('update')
    .description('🔄 Update The Architech CLI to the latest version')
    .action(() => {
      console.log(chalk.blue('\n🔄 Updating The Architech CLI...'));
      console.log(chalk.gray('This will update the CLI to the latest version.'));
      console.log(chalk.yellow('\n🚧 Coming soon!'));
    });

  // Parse command line arguments
  try {
    await program.parseAsync();
  } catch (error) {
    console.error(chalk.red('❌ An error occurred:'), error);
    process.exit(1);
  }
})(); 