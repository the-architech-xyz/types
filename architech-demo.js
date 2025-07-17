#!/usr/bin/env node

// Dependencies to install: npm install inquirer chalk ora cli-progress
// Run with: node architech-demo.js

const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const cliProgress = require('cli-progress');
const fs = require('fs');
const path = require('path');

// ASCII Art for The Architech
const ARCHITECH_LOGO = `
${chalk.cyan.bold('████████╗██╗  ██╗███████╗')}
${chalk.cyan.bold('╚══██╔══╝██║  ██║██╔════╝')}
${chalk.cyan.bold('   ██║   ███████║█████╗  ')}
${chalk.cyan.bold('   ██║   ██╔══██║██╔══╝  ')}
${chalk.cyan.bold('   ██║   ██║  ██║███████╗')}
${chalk.cyan.bold('   ╚═╝   ╚═╝  ╚═╝╚══════╝')}

${chalk.magenta.bold(' █████╗ ██████╗  ██████╗██╗  ██╗██╗████████╗███████╗ ██████╗██╗  ██╗')}
${chalk.magenta.bold('██╔══██╗██╔══██╗██╔════╝██║  ██║██║╚══██╔══╝██╔════╝██╔════╝██║  ██║')}
${chalk.magenta.bold('███████║██████╔╝██║     ███████║██║   ██║   █████╗  ██║     ███████║')}
${chalk.magenta.bold('██╔══██║██╔══██╗██║     ██╔══██║██║   ██║   ██╔══╝  ██║     ██╔══██║')}
${chalk.magenta.bold('██║  ██║██║  ██║╚██████╗██║  ██║██║   ██║   ███████╗╚██████╗██║  ██║')}
${chalk.magenta.bold('╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝   ╚═╝   ╚══════╝ ╚═════╝╚═╝  ╚═╝')}

${chalk.yellow('🚀 Revolutionary AI-Powered Application Generator')}
${chalk.gray('─'.repeat(70))}
`;

// Module configurations
const MODULES = {
  'Authentication Module (with JWT + Social Login)': {
    agent: 'AuthAgent',
    tasks: [
      'Analyzing security requirements...',
      'Generating JWT strategy...',
      'Implementing OAuth providers...',
      'Writing security tests...'
    ]
  },
  'Design System Module (with React + Tailwind CSS)': {
    agent: 'DesignAgent', 
    tasks: [
      'Defining design tokens...',
      'Generating React components...',
      'Ensuring accessibility compliance...',
      'Creating responsive layouts...'
    ]
  },
  'Database Module (with PostgreSQL + ORM)': {
    agent: 'DatabaseAgent',
    tasks: [
      'Choosing optimal schema...',
      'Generating migrations...',
      'Configuring ORM...',
      'Setting up connection pooling...'
    ]
  },
  'Deployment Module (with Docker + CI/CD)': {
    agent: 'DevOpsAgent',
    tasks: [
      'Writing Dockerfile...',
      'Configuring CI/CD pipeline...',
      'Setting up monitoring...',
      'Optimizing build process...'
    ]
  }
};

// Utility functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const randomDelay = () => Math.floor(Math.random() * 2000) + 1000; // 1-3 seconds

function clearConsole() {
  process.stdout.write('\x1B[2J\x1B[0f');
}

async function simulateAgentWork(moduleName, selectedModules) {
  const moduleConfig = MODULES[moduleName];
  const { agent, tasks } = moduleConfig;
  
  console.log(chalk.blue.bold(`\n🤖 ${agent} starting work...\n`));
  
  for (const task of tasks) {
    const spinner = ora({
      text: chalk.cyan(`[${agent}] ${task}`),
      spinner: 'dots12'
    }).start();
    
    await delay(randomDelay());
    
    spinner.succeed(chalk.green(`✔ [${agent}] ${task.replace('...', ' completed!')}`));
  }
  
  console.log(chalk.green.bold(`✨ ${agent} finished successfully!\n`));
}

function createProjectStructure(projectName, selectedModules) {
  const projectPath = path.join(process.cwd(), projectName);
  
  // Create main project directory
  if (!fs.existsSync(projectPath)) {
    fs.mkdirSync(projectPath);
  }
  
  // Create src directory
  const srcPath = path.join(projectPath, 'src');
  if (!fs.existsSync(srcPath)) {
    fs.mkdirSync(srcPath);
  }
  
  // Create modules directory
  const modulesPath = path.join(srcPath, 'modules');
  if (!fs.existsSync(modulesPath)) {
    fs.mkdirSync(modulesPath);
  }
  
  // Create package.json
  const packageJson = {
    name: projectName,
    version: "1.0.0",
    private: true,
    scripts: {
      dev: "echo 'Starting dev server...'",
      build: "echo 'Building project...'",
      test: "echo 'Running tests...'"
    },
    dependencies: {
      react: "^18.0.0"
    }
  };
  
  fs.writeFileSync(
    path.join(projectPath, 'package.json'), 
    JSON.stringify(packageJson, null, 2)
  );
  
  // Create README.md
  const readmeContent = `# Welcome to ${projectName}!

This project was generated by The Architech.

## Next Steps
1. \`npm install\`
2. \`npm run dev\`

## Generated Modules
${selectedModules.map(module => `- ${module}`).join('\n')}

## Architecture
This project follows a modular architecture pattern with:
- Clean separation of concerns
- Scalable folder structure
- Industry best practices
- Security-first design
`;
  
  fs.writeFileSync(path.join(projectPath, 'README.md'), readmeContent);
  
  // Create src/index.js
  const indexContent = `// src/index.js
console.log("Welcome to your new project generated by The Architech!");

// This is your application entry point
// Generated with love by The Architech AI system
`;
  
  fs.writeFileSync(path.join(srcPath, 'index.js'), indexContent);
  
  return projectPath;
}

async function showProgressBar(label, duration = 3000) {
  const progressBar = new cliProgress.SingleBar({
    format: chalk.cyan(label) + ' |' + chalk.green('{bar}') + '| {percentage}% | {value}/{total}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  });
  
  const steps = 50;
  progressBar.start(steps, 0);
  
  for (let i = 0; i <= steps; i++) {
    progressBar.update(i);
    await delay(duration / steps);
  }
  
  progressBar.stop();
}

async function main() {
  try {
    // Step 1: Welcome & Project Name
    clearConsole();
    console.log(ARCHITECH_LOGO);
    
    const { projectName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: chalk.yellow('🎯 What is the name of your project?'),
        default: 'my-awesome-app',
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
    
    // Step 2: Module Selection
    console.log(chalk.blue.bold('\n🔧 Select the modules you want to include:\n'));
    
    const { selectedModules } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedModules',
        message: chalk.yellow('Choose modules (use space to select, enter to continue):'),
        choices: Object.keys(MODULES),
        validate: (choices) => {
          if (choices.length === 0) {
            return 'Please select at least one module';
          }
          return true;
        }
      }
    ]);
    
    console.log(chalk.green.bold(`\n✅ Selected ${selectedModules.length} modules for generation\n`));
    
    // Step 3: The "Magic" Generation Process
    console.log(chalk.magenta.bold('🎭 Initializing Specialized AI Agents...\n'));
    
    for (const module of selectedModules) {
      await simulateAgentWork(module, selectedModules);
      await delay(500); // Brief pause between agents
    }
    
    // Step 4: File Generation & Dependency Installation
    console.log(chalk.blue.bold('📁 Creating project structure...\n'));
    
    await showProgressBar('🔨 Generating project files...', 2000);
    console.log(chalk.green('✅ Project files generated successfully!\n'));
    
    await showProgressBar('📦 Installing dependencies (npm install)...', 3000);
    console.log(chalk.green('✅ Dependencies installed successfully!\n'));
    
    // Actually create the project structure
    const projectPath = createProjectStructure(projectName, selectedModules);
    
    // Step 5: Final Success Output
    clearConsole();
    
    const stats = {
      filesGenerated: 42,
      linesOfCode: 2347,
      testsCreated: 58,
      testCoverage: 98,
      timeSaved: '3 weeks'
    };
    
    console.log(chalk.green.bold(`\n✨ The Architech has successfully generated your project '${projectName}'!\n`));
    
    console.log(chalk.cyan.bold('📊 GENERATION REPORT:'));
    console.log(chalk.gray('─'.repeat(45)));
    console.log(chalk.green(`✔ Modules Generated: ${selectedModules.map(m => m.split(' ')[0]).join(', ')}`));
    console.log(chalk.green(`✔ Code Generated: ${stats.linesOfCode.toLocaleString()} lines in ${stats.filesGenerated} files`));
    console.log(chalk.green(`✔ Tests Created: ${stats.testsCreated} (${stats.testCoverage}% coverage)`));
    console.log(chalk.green(`✔ Security Vulnerabilities: 0 found`));
    console.log(chalk.green(`✔ Deployment Ready: Yes (Docker + GitHub Actions)`));
    
    console.log(chalk.yellow.bold('\n⏱️  TIME SAVED (ESTIMATED):'));
    console.log(chalk.gray('─'.repeat(45)));
    console.log(chalk.white(`- Manual Setup Time: ${stats.timeSaved}`));
    console.log(chalk.white(`- The Architech Time: 94 seconds`));
    console.log(chalk.white(`- Productivity Gain: ~100x`));
    
    console.log(chalk.magenta.bold('\n🚀 WHAT\'S NEXT:'));
    console.log(chalk.gray('─'.repeat(45)));
    console.log(chalk.cyan(`1. cd ${projectName}`));
    console.log(chalk.cyan(`2. npm install`));
    console.log(chalk.cyan(`3. npm run dev`));
    
    console.log(chalk.green.bold('\n🎉 Happy coding! Your AI-generated project is ready to go!\n'));
    
  } catch (error) {
    console.error(chalk.red.bold('\n❌ An error occurred:'), error.message);
    process.exit(1);
  }
}

// Run the demo
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main }; 