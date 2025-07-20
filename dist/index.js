#!/usr/bin/env node
/**
 * The Architech CLI - Revolutionary AI-Powered Application Generator
 *
 * Entry point for the CLI tool that transforms weeks of development work
 * into minutes through intelligent project generation and automation.
 */
import { program } from 'commander';
import chalk from 'chalk';
import { newCommand } from './commands/new.js';
import { scaleToMonorepoCommand } from './commands/scale-to-monorepo.js';
import { displayBanner } from './utils/banner.js';
// Async IIFE to handle dynamic imports
(async () => {
    // Try to import plugins command with error handling
    let pluginsCommand;
    try {
        const pluginsModule = await import('./commands/plugins.js');
        pluginsCommand = pluginsModule.pluginsCommand;
        console.log('Plugins command imported successfully');
    }
    catch (error) {
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
        .option('--project-type <type>', 'Project type (quick-prototype, scalable-monorepo)', 'scalable-monorepo')
        .option('--no-git', 'Skip git repository initialization')
        .option('--no-install', 'Skip dependency installation')
        .option('-y, --yes', 'Skip interactive prompts and use defaults', false)
        .action(newCommand);
    // Scale to monorepo command - Migrate single-app to monorepo
    program
        .command('scale-to-monorepo')
        .description('📈 Scale a single-app project to enterprise monorepo structure')
        .option('-p, --package-manager <pm>', 'Package manager (npm, yarn, pnpm, bun)', 'auto')
        .option('-y, --yes', 'Skip interactive prompts and use defaults')
        .action(scaleToMonorepoCommand);
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
            console.log('  • react-vite    - React with Vite');
            console.log('  • vue-nuxt      - Vue with Nuxt 3');
        }
        if (options.modules) {
            console.log(chalk.blue('\n🧩 Available Modules:'));
            console.log('  • auth          - Authentication (NextAuth.js)');
            console.log('  • database      - Database (Prisma + PostgreSQL)');
            console.log('  • payments      - Payments (Stripe)');
            console.log('  • admin         - Admin Dashboard');
            console.log('  • analytics     - Analytics (Google Analytics)');
        }
    });
    // Info command - Show project information
    program
        .command('info')
        .description('ℹ️  Show information about the current project')
        .action(() => {
        console.log(chalk.yellow('🚧 The "info" command is coming soon!'));
        console.log(chalk.gray('This will show details about the current project and its modules.'));
    });
    // Error handling for unknown commands
    program.on('command:*', (operands) => {
        console.log(chalk.red(`\n❌ Unknown command: ${operands[0]}`));
        console.log(chalk.yellow('💡 Run "architech --help" to see available commands.\n'));
        process.exit(1);
    });
    // Custom help
    program.on('--help', () => {
        console.log(chalk.blue('\n🎯 Examples:'));
        console.log('  $ architech new my-app');
        console.log('  $ architech new my-app --project-type scalable-monorepo');
        console.log('  $ architech scale-to-monorepo');
        console.log('  $ architech plugins list');
        console.log('  $ architech plugins info shadcn-ui');
        console.log('  $ architech add auth');
        console.log('  $ architech list --templates');
        console.log(chalk.blue('\n🚀 Get started:'));
        console.log('  Run "architech new" and follow the interactive prompts!');
        console.log(chalk.gray('\n  For more information, visit: https://the-architech.dev\n'));
    });
    // Handle no arguments - show help
    if (!process.argv.slice(2).length) {
        program.outputHelp();
        process.exit(0);
    }
    // Parse command line arguments
    program.parse(process.argv);
    // Handle unknown flags
    const options = program.opts();
    if (Object.keys(options).length === 0 && process.argv.length === 2) {
        program.outputHelp();
    }
})().catch(error => {
    console.error('Failed to start CLI:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map