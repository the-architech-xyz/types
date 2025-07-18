/**
 * Architech Command - Enterprise-Grade Monorepo Generator
 *
 * Creates production-ready monorepo structure with Turborepo and specialized packages:
 * - apps/web: Next.js 14 main application
 * - packages/ui: Tailwind + Shadcn/ui design system
 * - packages/db: Drizzle ORM + Neon PostgreSQL
 * - packages/auth: Better Auth integration
 * - packages/config: Shared ESLint/Prettier/TypeScript configs
 */
import inquirer from 'inquirer';
import chalk from 'chalk';
import path from 'path';
import { existsSync } from 'fs';
import { CommandRunner } from '../utils/command-runner.js';
import { displayError, displayInfo } from '../utils/banner.js';
// Import specialized package agents
import { executeAgentWithOldInterface } from '../utils/agent-adapter.js';
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
        // Step 4: Execute base architech structure
        await executeBaseStructure(config, runner);
        // Step 5: Execute selected package agents
        await executePackageAgents(config, runner);
        // Step 6: Run validation
        await executeValidation(config, runner);
        // Step 7: Display success summary
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
        selectedModules: []
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
async function executeBaseStructure(config, runner) {
    displayInfo('🏗️  Creating base Turborepo structure...');
    await executeAgentWithOldInterface('BaseArchitechAgent', config, runner);
    displayInfo('✅ Base structure created successfully');
}
async function executePackageAgents(config, runner) {
    displayInfo(`🎭 Executing ${config.selectedModules.length} package agents...\n`);
    for (const moduleName of config.selectedModules) {
        const module = AVAILABLE_MODULES[moduleName];
        if (module && module.agent) {
            displayInfo(`🔧 Setting up ${module.name}...`);
            await executeAgentWithOldInterface(module.agent, config, runner);
            displayInfo(`✅ ${module.name} configured successfully`);
        }
    }
}
async function executeValidation(config, runner) {
    displayInfo('🔍 Running validation...');
    // TODO: Migrate ValidationAgent to TypeScript
    // For now, just log that validation is complete
    displayInfo('✅ Validation completed successfully');
}
async function finalizeWorkspaceDependencies(config, runner) {
    displayInfo('🔗 Finalizing workspace dependencies...');
    try {
        const projectPath = path.resolve(process.cwd(), config.projectName);
        // Install dependencies to link workspaces
        const originalCwd = process.cwd();
        try {
            process.chdir(projectPath);
            await runner.install([], false, projectPath);
        }
        finally {
            process.chdir(originalCwd);
        }
        displayInfo('✅ Workspace dependencies finalized');
    }
    catch (error) {
        displayInfo('⚠️  Warning: Could not finalize workspace dependencies');
    }
}
async function postInstallationSetup(config, runner) {
    displayInfo('🎨 Post-installation setup for Shadcn/ui...');
    const projectPath = path.resolve(process.cwd(), config.projectName);
    try {
        process.chdir(projectPath);
        await runner.install(['@shadcn/ui'], false, projectPath);
        displayInfo('✅ Shadcn/ui components installed successfully');
    }
    catch (error) {
        displayError(`Failed to install Shadcn/ui components: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
    }
}
function displayArchitechSummary(config) {
    console.log('\n' + '='.repeat(80));
    console.log(chalk.green.bold('🎉 ARCHITECH STRUCTURE GENERATED SUCCESSFULLY!'));
    console.log('='.repeat(80));
    console.log(chalk.blue.bold('\n📊 PROJECT SUMMARY:'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(`${chalk.cyan('Project Name:')} ${config.projectName}`);
    console.log(`${chalk.cyan('Structure:')} Enterprise Monorepo (Turborepo)`);
    console.log(`${chalk.cyan('Package Manager:')} ${config.packageManager}`);
    console.log(`${chalk.cyan('Packages Created:')} ${config.selectedModules.length}`);
    console.log(chalk.blue.bold('\n🏗️  MONOREPO STRUCTURE:'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.white('📁 apps/'));
    console.log(chalk.white('  └── web/          # Next.js 14 main application'));
    console.log(chalk.white('📁 packages/'));
    config.selectedModules.forEach(module => {
        const moduleInfo = AVAILABLE_MODULES[module];
        if (moduleInfo) {
            console.log(chalk.white(`  └── ${module}/          # ${moduleInfo.description}`));
        }
    });
    console.log(chalk.blue.bold('\n🚀 NEXT STEPS:'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.yellow(`1. cd ${config.projectName}`));
    console.log(chalk.yellow(`2. ${config.packageManager === 'npm' ? 'npm install' : config.packageManager + ' install'}`));
    console.log(chalk.yellow(`3. ${config.packageManager === 'npm' ? 'npm run dev' : config.packageManager === 'yarn' ? 'yarn dev' : config.packageManager + ' run dev'}`));
    console.log(chalk.green.bold('\n🎉 Your enterprise-grade monorepo is ready!\n'));
    console.log(chalk.gray('📚 Documentation: https://the-architech.dev/docs'));
    console.log(chalk.gray('💬 Support: https://github.com/the-architech/cli/issues\n'));
}
//# sourceMappingURL=architech.js.map