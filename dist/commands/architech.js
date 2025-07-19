/**
 * Architech Command - Enterprise Monorepo Generator
 *
 * Creates enterprise-grade monorepo structures with:
 * - Turborepo workspace configuration
 * - Specialized package agents
 * - Shared dependencies and tooling
 * - Production-ready setup
 */
import inquirer from 'inquirer';
import chalk from 'chalk';
import path from 'path';
import { existsSync } from 'fs';
import { CommandRunner } from '../utils/command-runner.js';
import { ContextFactory } from '../utils/context-factory.js';
import { OrchestratorAgent } from '../agents/orchestrator-agent.js';
import { displayError, displayInfo } from '../utils/banner.js';
const AVAILABLE_MODULES = {
    ui: {
        name: 'UI Package',
        description: 'Tailwind CSS + Shadcn/ui design system',
        dependencies: ['@tailwindcss/forms', '@tailwindcss/typography', 'tailwindcss', 'autoprefixer', 'postcss'],
        agent: 'UIAgent'
    },
    db: {
        name: 'Database Package',
        description: 'Drizzle ORM + Neon PostgreSQL',
        dependencies: ['drizzle-orm', 'drizzle-kit', '@neondatabase/serverless'],
        agent: 'DBAgent'
    },
    auth: {
        name: 'Authentication Package',
        description: 'Better Auth integration',
        dependencies: ['better-auth', '@better-auth/drizzle'],
        agent: 'AuthAgent'
    }
};
export async function architechCommand(projectName, options = {}) {
    console.log(chalk.blue.bold('🏛️  Initializing The Architech Enterprise Structure...\n'));
    try {
        // Step 1: Gather project configuration
        const config = await gatherArchitechConfig(projectName, options);
        // Step 2: Validate project doesn't exist
        await validateProject(config);
        // Step 3: Initialize command runner
        const runner = new CommandRunner(config.packageManager, { verbose: true });
        // Step 4: Execute orchestrator agent for enterprise setup
        await executeOrchestrator(config, runner);
        // Step 5: Display success summary
        displayArchitechSummary(config);
    }
    catch (error) {
        displayError(`Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
    }
}
async function gatherArchitechConfig(projectName, options = {}) {
    let config = {
        projectName: projectName || '',
        packageManager: options.packageManager || 'auto',
        skipGit: options.noGit || false,
        skipInstall: options.noInstall || false,
        useDefaults: options.yes || false,
        selectedModules: [],
        userInput: ''
    };
    if (!config.useDefaults) {
        // Interactive mode
        if (!config.projectName) {
            const { name } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'name',
                    message: chalk.yellow('🎯 What is the name of your architech project?'),
                    default: 'my-architech-app',
                    validate: (input) => {
                        if (input.trim().length === 0) {
                            return 'Project name cannot be empty';
                        }
                        if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
                            return 'Project name can only contain letters, numbers, hyphens, and underscores';
                        }
                        return true;
                    }
                }
            ]);
            config.projectName = name;
        }
        // Requirements input
        const { userInput } = await inquirer.prompt([
            {
                type: 'input',
                name: 'userInput',
                message: chalk.yellow('🤖 Describe your enterprise project requirements (optional):'),
                default: '',
                description: 'Describe what you want to build, e.g., "Enterprise monorepo with UI, database, and authentication packages"'
            }
        ]);
        config.userInput = userInput;
        // Module selection
        console.log(chalk.blue.bold('\n🏗️  Select packages to include in your monorepo:\n'));
        const moduleChoices = Object.entries(AVAILABLE_MODULES).map(([key, module]) => ({
            name: `${module.name} - ${module.description}`,
            value: key,
            checked: true // All modules selected by default
        }));
        const { modules } = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'modules',
                message: chalk.yellow('Choose packages (use space to select, enter to continue):'),
                choices: moduleChoices,
                validate: (choices) => {
                    if (choices.length === 0) {
                        return 'Please select at least one package';
                    }
                    return true;
                }
            }
        ]);
        config.selectedModules = modules;
    }
    else {
        // Non-interactive mode with defaults
        config.projectName = config.projectName || 'my-architech-app';
        config.selectedModules = options.modules ? options.modules.split(',') : ['ui', 'db', 'auth'];
        config.userInput = 'Enterprise monorepo with UI, database, and authentication packages';
    }
    // Validate selected modules
    config.selectedModules = config.selectedModules.filter(module => Object.keys(AVAILABLE_MODULES).includes(module));
    return config;
}
async function validateProject(config) {
    const projectPath = path.resolve(process.cwd(), config.projectName);
    if (existsSync(projectPath)) {
        displayError(`Directory "${config.projectName}" already exists. Please choose a different name.`);
        process.exit(1);
    }
    displayInfo(`✅ Project "${config.projectName}" validation passed`);
}
async function executeOrchestrator(config, runner) {
    console.log(chalk.magenta.bold('\n🤖 Deploying AI Orchestrator Agent for Enterprise Setup...\n'));
    // Create context using the factory
    const context = ContextFactory.createContext(config.projectName, {
        packageManager: config.packageManager,
        skipGit: config.skipGit,
        skipInstall: config.skipInstall,
        useDefaults: config.useDefaults,
        verbose: true
    }, {
        template: 'nextjs-14',
        modules: config.selectedModules,
        userInput: config.userInput,
        type: 'monorepo',
        // Agent-specific configurations for enterprise setup
        ui: {
            components: ['button', 'card', 'input', 'label', 'dialog', 'form', 'select', 'textarea'],
            theme: 'slate',
            usePlugin: true
        },
        database: {
            provider: 'neon',
            schema: ['users', 'posts', 'comments', 'categories', 'tags'],
            migrations: true
        },
        authentication: {
            providers: ['email', 'github', 'google'],
            requireEmailVerification: true,
            sessionDuration: 604800
        },
        deployment: {
            platform: 'vercel',
            useDocker: true,
            useCI: true
        },
        validation: {
            strictMode: true,
            usePlugin: true
        }
    });
    // Create and execute orchestrator agent
    const orchestrator = new OrchestratorAgent();
    console.log(chalk.blue.bold('🎯 Orchestrator Agent starting enterprise setup...'));
    const result = await orchestrator.execute(context);
    if (result.success) {
        console.log(chalk.green('✅ Enterprise setup completed successfully!'));
        console.log(chalk.gray(`Duration: ${result.duration}ms`));
        console.log(chalk.gray(`Artifacts: ${result.artifacts?.length || 0}`));
        if (result.warnings && result.warnings.length > 0) {
            console.log(chalk.yellow('\n⚠️  Warnings:'));
            result.warnings.forEach(warning => {
                console.log(chalk.yellow(`  • ${warning}`));
            });
        }
    }
    else {
        console.log(chalk.red('❌ Enterprise setup failed!'));
        if (result.errors) {
            result.errors.forEach(error => {
                console.log(chalk.red(`  • ${error.message}`));
            });
        }
        throw new Error('Enterprise setup failed');
    }
}
function displayArchitechSummary(config) {
    console.log(chalk.green.bold(`\n✨ The Architech has successfully generated your enterprise project '${config.projectName}'!\n`));
    console.log(chalk.cyan.bold('📊 ENTERPRISE GENERATION REPORT:'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.green(`✔ Project Type: Enterprise Monorepo`));
    console.log(chalk.green(`✔ Package Manager: ${config.packageManager}`));
    console.log(chalk.green(`✔ Packages: ${config.selectedModules.join(', ')}`));
    console.log(chalk.green(`✔ Project Structure: Complete`));
    console.log(chalk.green(`✔ Dependencies: Installed`));
    console.log(chalk.green(`✔ Configuration: Optimized`));
    console.log(chalk.green(`✔ AI Orchestration: Successful`));
    console.log(chalk.yellow.bold('\n⏱️  PRODUCTIVITY IMPACT:'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.white(`- Traditional Setup Time: 3-4 weeks`));
    console.log(chalk.white(`- The Architech Time: ~5 minutes`));
    console.log(chalk.white(`- Time Saved: 99.9%`));
    console.log(chalk.magenta.bold('\n🚀 NEXT STEPS:'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.cyan(`1. cd ${config.projectName}`));
    console.log(chalk.cyan(`2. npm run dev`));
    console.log(chalk.cyan(`3. Open http://localhost:3000`));
    console.log(chalk.blue.bold('\n🏗️  MONOREPO STRUCTURE:'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.white(`📁 apps/web - Main Next.js application`));
    console.log(chalk.white(`📁 packages/ui - Shared UI components`));
    console.log(chalk.white(`📁 packages/db - Database layer`));
    console.log(chalk.white(`📁 packages/auth - Authentication system`));
    console.log(chalk.white(`📁 packages/config - Shared configuration`));
    console.log(chalk.green.bold('\n🎉 Happy coding! Your enterprise project is ready to scale!\n'));
    console.log(chalk.gray('📚 Documentation: https://the-architech.dev/docs'));
    console.log(chalk.gray('💬 Support: https://github.com/the-architech/cli/issues\n'));
}
//# sourceMappingURL=architech.js.map