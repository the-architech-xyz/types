/**
 * Base Project Agent - Foundation Builder
 * 
 * Responsible for creating the core project structure using framework-specific
 * generators like create-next-app, create-react-app, etc.
 */

import chalk from 'chalk';
import path from 'path';
import { existsSync } from 'fs';

export class BaseProjectAgent {
  constructor(commandRunner) {
    this.runner = commandRunner;
    this.name = 'BaseProjectAgent';
  }

  async execute(config) {
    const { projectName, projectPath, template, skipGit, skipInstall } = config;
    
    console.log(chalk.cyan(`🔧 [${this.name}] Initializing ${template} project...`));
    
    try {
      switch (template) {
        case 'nextjs-14':
        case 'nextjs-13':
          await this.createNextJSProject(projectName, template, skipGit, skipInstall);
          break;
        case 'react-vite':
          await this.createReactViteProject(projectName, skipGit, skipInstall);
          break;
        case 'vue-nuxt':
          await this.createNuxtProject(projectName, skipGit, skipInstall);
          break;
        default:
          throw new Error(`Unsupported template: ${template}`);
      }
      
      console.log(chalk.green(`✅ [${this.name}] Project structure created successfully`));
      
    } catch (error) {
      console.log(chalk.red(`❌ [${this.name}] Failed: ${error.message}`));
      throw error;
    }
  }

  async createNextJSProject(projectName, template, skipGit, skipInstall) {
    console.log(chalk.blue(`📦 Creating Next.js project with latest best practices...`));
    
    const options = [
      '--typescript',
      '--tailwind',
      '--eslint',
      '--app', // Use App Router for Next.js 14
      '--src-dir',
      '--import-alias', '@/*',
      '--yes' // Non-interactive
    ];

    // Add git option
    if (skipGit) {
      options.push('--skip-git');
    }

    try {
      await this.runner.initProject(projectName, 'nextjs', options);
      
      // Verify project was created
      if (!existsSync(projectName)) {
        throw new Error('Project directory was not created');
      }
      
      console.log(chalk.green(`✅ Next.js project '${projectName}' created successfully`));
      
      // Install dependencies if not skipped
      if (!skipInstall) {
        console.log(chalk.blue(`📦 Installing dependencies...`));
        await this.runner.install([], false, projectName);
        console.log(chalk.green(`✅ Dependencies installed`));
      }
      
    } catch (error) {
      throw new Error(`Failed to create Next.js project: ${error.message}`);
    }
  }

  async createReactViteProject(projectName, skipGit, skipInstall) {
    console.log(chalk.blue(`📦 Creating React + Vite project...`));
    
    try {
      // Create React app with Vite
      await this.runner.exec('create-vite', [projectName, '--template', 'react-ts']);
      
      if (!existsSync(projectName)) {
        throw new Error('Project directory was not created');
      }
      
      console.log(chalk.green(`✅ React + Vite project '${projectName}' created`));
      
      // Install dependencies if not skipped
      if (!skipInstall) {
        console.log(chalk.blue(`📦 Installing dependencies...`));
        await this.runner.install([], false, projectName);
        console.log(chalk.green(`✅ Dependencies installed`));
      }
      
      // Initialize git if not skipped
      if (!skipGit) {
        console.log(chalk.blue(`📝 Initializing git repository...`));
        await this.runner.execCommand(['git', 'init'], { cwd: projectName, silent: true });
        console.log(chalk.green(`✅ Git repository initialized`));
      }
      
    } catch (error) {
      throw new Error(`Failed to create React + Vite project: ${error.message}`);
    }
  }

  async createNuxtProject(projectName, skipGit, skipInstall) {
    console.log(chalk.blue(`📦 Creating Nuxt 3 project...`));
    
    try {
      // Create Nuxt 3 app
      await this.runner.exec('nuxi@latest', ['init', projectName]);
      
      if (!existsSync(projectName)) {
        throw new Error('Project directory was not created');
      }
      
      console.log(chalk.green(`✅ Nuxt 3 project '${projectName}' created`));
      
      // Install dependencies if not skipped
      if (!skipInstall) {
        console.log(chalk.blue(`📦 Installing dependencies...`));
        await this.runner.install([], false, projectName);
        console.log(chalk.green(`✅ Dependencies installed`));
      }
      
      // Initialize git if not skipped
      if (!skipGit) {
        console.log(chalk.blue(`📝 Initializing git repository...`));
        await this.runner.execCommand(['git', 'init'], { cwd: projectName, silent: true });
        console.log(chalk.green(`✅ Git repository initialized`));
      }
      
    } catch (error) {
      throw new Error(`Failed to create Nuxt project: ${error.message}`);
    }
  }

  async verifyProjectStructure(projectPath) {
    const requiredFiles = [
      'package.json',
      'tsconfig.json',
      'tailwind.config.js'
    ];
    
    const missingFiles = requiredFiles.filter(file => 
      !existsSync(path.join(projectPath, file))
    );
    
    if (missingFiles.length > 0) {
      throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
    }
    
    console.log(chalk.green(`✅ Project structure verified`));
  }
} 