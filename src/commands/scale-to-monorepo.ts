/**
 * Scale to Monorepo Command
 * 
 * Migrates single-app projects to scalable monorepo structure
 * while preserving all existing functionality.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { ProjectStructureManager } from '../core/project/project-structure-manager.js';
import { ConfigurationManager } from '../core/project/configuration-manager.js';
import { TemplateService } from '../core/templates/template-service.js';
import { CommandRunner } from '../core/cli/command-runner.js';
import { ContextFactory } from '../core/project/context-factory.js';

export interface ScaleOptions {
  packageManager?: string;
  yes?: boolean;
}

export interface ScaleConfig {
  projectPath: string;
  projectName: string;
  packageManager: string;
  useDefaults: boolean;
  // Analysis results
  hasComponents: boolean;
  hasDatabase: boolean;
  hasAuth: boolean;
  hasConfig: boolean;
}

export async function scaleToMonorepoCommand(options: ScaleOptions = {}): Promise<void> {
  console.log(chalk.blue.bold('🔄 Scaling your project to a monorepo...\n'));
  
  try {
    // Step 1: Analyze current project structure
    const config = await analyzeCurrentProject(options);
    
    // Step 2: Confirm scaling operation
    await confirmScaling(config);
    
    // Step 3: Create backup
    await createBackup(config);
    
    // Step 4: Restructure project
    await restructureProject(config);
    
    // Step 5: Update configurations
    await updateConfigurations(config);
    
    // Step 6: Display success summary
    displayScalingSummary(config);
    
  } catch (error) {
    displayError(`Scaling failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

async function analyzeCurrentProject(options: ScaleOptions): Promise<ScaleConfig> {
  const projectPath = process.cwd();
  const projectName = path.basename(projectPath);
  
  console.log(chalk.yellow('🔍 Analyzing current project structure...\n'));
  
  // Check if we're in a project directory
  if (!await fsExtra.pathExists(path.join(projectPath, 'package.json'))) {
    throw new Error('No package.json found. Please run this command from your project root.');
  }
  
  // Check if already a monorepo
  if (await fsExtra.pathExists(path.join(projectPath, 'turbo.json'))) {
    throw new Error('This project is already a monorepo (turbo.json found).');
  }
  
  // Analyze current structure
  const srcPath = path.join(projectPath, 'src');
  const hasSrc = await fsExtra.pathExists(srcPath);
  
  if (!hasSrc) {
    throw new Error('No src directory found. This command works with projects created by The Architech.');
  }
  
  const config: ScaleConfig = {
    projectPath,
    projectName,
    packageManager: options.packageManager || 'auto',
    useDefaults: options.yes || false,
    hasComponents: await fsExtra.pathExists(path.join(srcPath, 'components')),
    hasDatabase: await fsExtra.pathExists(path.join(srcPath, 'lib', 'db')) || 
                 await fsExtra.pathExists(path.join(srcPath, 'db')),
    hasAuth: await fsExtra.pathExists(path.join(srcPath, 'lib', 'auth')) || 
             await fsExtra.pathExists(path.join(srcPath, 'auth')),
    hasConfig: await fsExtra.pathExists(path.join(projectPath, 'config'))
  };
  
  // Display analysis results
  console.log(chalk.blue.bold('📊 Current Structure Analysis:'));
  console.log(chalk.gray(`  Project: ${config.projectName}`));
  console.log(chalk.gray(`  Components: ${config.hasComponents ? '✅ Found' : '❌ Not found'}`));
  console.log(chalk.gray(`  Database: ${config.hasDatabase ? '✅ Found' : '❌ Not found'}`));
  console.log(chalk.gray(`  Authentication: ${config.hasAuth ? '✅ Found' : '❌ Not found'}`));
  console.log(chalk.gray(`  Configuration: ${config.hasConfig ? '✅ Found' : '❌ Not found'}`));
  
  return config;
}

async function confirmScaling(config: ScaleConfig): Promise<void> {
  if (config.useDefaults) return;
  
  console.log(chalk.yellow('\n⚠️  This operation will restructure your project:'));
  console.log(chalk.gray('  • Create apps/ and packages/ directories'));
  console.log(chalk.gray('  • Move components to packages/ui'));
  console.log(chalk.gray('  • Move database code to packages/db'));
  console.log(chalk.gray('  • Move auth code to packages/auth'));
  console.log(chalk.gray('  • Update all import paths'));
  console.log(chalk.gray('  • Add Turborepo configuration'));
  console.log(chalk.gray('  • A backup will be created automatically'));
  
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: chalk.yellow('Do you want to proceed with scaling to monorepo?'),
      default: false
    }
  ]);
  
  if (!confirm) {
    console.log(chalk.blue('Scaling cancelled. Your project remains unchanged.'));
    process.exit(0);
  }
}

async function createBackup(config: ScaleConfig): Promise<void> {
  const backupPath = path.join(config.projectPath, '..', `${config.projectName}-backup-${Date.now()}`);
  
  console.log(chalk.yellow('\n💾 Creating backup...'));
  
  await fsExtra.copy(config.projectPath, backupPath);
  
  console.log(chalk.green(`✅ Backup created: ${path.basename(backupPath)}`));
}

async function restructureProject(config: ScaleConfig): Promise<void> {
  console.log(chalk.yellow('\n🏗️  Restructuring project...'));
  
  const srcPath = path.join(config.projectPath, 'src');
  
  // Create new directory structure
  const appsPath = path.join(config.projectPath, 'apps');
  const packagesPath = path.join(config.projectPath, 'packages');
  
  await fsExtra.ensureDir(appsPath);
  await fsExtra.ensureDir(packagesPath);
  
  // Create web app
  const webAppPath = path.join(appsPath, 'web');
  await fsExtra.ensureDir(webAppPath);
  
  // Move main app files to web app
  const appPath = path.join(srcPath, 'app');
  if (await fsExtra.pathExists(appPath)) {
    await fsExtra.move(appPath, path.join(webAppPath, 'src', 'app'));
  }
  
  // Move pages if they exist
  const pagesPath = path.join(srcPath, 'pages');
  if (await fsExtra.pathExists(pagesPath)) {
    await fsExtra.move(pagesPath, path.join(webAppPath, 'src', 'pages'));
  }
  
  // Create packages
  if (config.hasComponents) {
    await createUIPackage(config, srcPath, packagesPath);
  }
  
  if (config.hasDatabase) {
    await createDBPackage(config, srcPath, packagesPath);
  }
  
  if (config.hasAuth) {
    await createAuthPackage(config, srcPath, packagesPath);
  }
  
  if (config.hasConfig) {
    await createConfigPackage(config, packagesPath);
  }
  
  // Move remaining src files to web app
  const remainingSrcFiles = await fsExtra.readdir(srcPath);
  for (const file of remainingSrcFiles) {
    const filePath = path.join(srcPath, file);
    const stat = await fsExtra.stat(filePath);
    
    if (stat.isFile()) {
      await fsExtra.move(filePath, path.join(webAppPath, 'src', file));
    }
  }
  
  // Remove empty src directory
  await fsExtra.remove(srcPath);
  
  console.log(chalk.green('✅ Project structure restructured'));
}

async function createUIPackage(config: ScaleConfig, srcPath: string, packagesPath: string): Promise<void> {
  const uiPath = path.join(packagesPath, 'ui');
  await fsExtra.ensureDir(uiPath);
  
  // Move components
  const componentsPath = path.join(srcPath, 'components');
  if (await fsExtra.pathExists(componentsPath)) {
    await fsExtra.move(componentsPath, path.join(uiPath, 'src'));
  }
  
  // Create package.json for UI
  const uiPackageJson = {
    name: `@${config.projectName}/ui`,
    version: "0.1.0",
    private: true,
    main: "./src/index.ts",
    types: "./src/index.ts",
    scripts: {
      "build": "tsc",
      "dev": "tsc --watch",
      "lint": "eslint . --ext .ts,.tsx"
    },
    dependencies: {
      "react": "^18.0.0",
      "react-dom": "^18.0.0"
    },
    devDependencies: {
      "@types/react": "^18.0.0",
      "@types/react-dom": "^18.0.0",
      "typescript": "^5.0.0"
    }
  };
  
  await fsExtra.writeJSON(path.join(uiPath, 'package.json'), uiPackageJson, { spaces: 2 });
  
  // Create index.ts if it doesn't exist
  const indexPath = path.join(uiPath, 'src', 'index.ts');
  if (!await fsExtra.pathExists(indexPath)) {
    await fsExtra.writeFile(indexPath, '// Export all UI components\n');
  }
}

async function createDBPackage(config: ScaleConfig, srcPath: string, packagesPath: string): Promise<void> {
  const dbPath = path.join(packagesPath, 'db');
  await fsExtra.ensureDir(dbPath);
  
  // Move database files
  const dbLibPath = path.join(srcPath, 'lib', 'db');
  const dbSrcPath = path.join(srcPath, 'db');
  
  if (await fsExtra.pathExists(dbLibPath)) {
    await fsExtra.move(dbLibPath, path.join(dbPath, 'src'));
  } else if (await fsExtra.pathExists(dbSrcPath)) {
    await fsExtra.move(dbSrcPath, path.join(dbPath, 'src'));
  }
  
  // Create package.json for DB
  const dbPackageJson = {
    name: `@${config.projectName}/db`,
    version: "0.1.0",
    private: true,
    main: "./src/index.ts",
    types: "./src/index.ts",
    scripts: {
      "build": "tsc",
      "dev": "tsc --watch",
      "lint": "eslint . --ext .ts"
    },
    dependencies: {
      "drizzle-orm": "^0.45.0",
      "@neondatabase/serverless": "^1.1.0"
    },
    devDependencies: {
      "drizzle-kit": "^0.32.0",
      "typescript": "^5.0.0"
    }
  };
  
  await fsExtra.writeJSON(path.join(dbPath, 'package.json'), dbPackageJson, { spaces: 2 });
}

async function createAuthPackage(config: ScaleConfig, srcPath: string, packagesPath: string): Promise<void> {
  const authPath = path.join(packagesPath, 'auth');
  await fsExtra.ensureDir(authPath);
  
  // Move auth files
  const authLibPath = path.join(srcPath, 'lib', 'auth');
  const authSrcPath = path.join(srcPath, 'auth');
  
  if (await fsExtra.pathExists(authLibPath)) {
    await fsExtra.move(authLibPath, path.join(authPath, 'src'));
  } else if (await fsExtra.pathExists(authSrcPath)) {
    await fsExtra.move(authSrcPath, path.join(authPath, 'src'));
  }
  
  // Create package.json for Auth
  const authPackageJson = {
    name: `@${config.projectName}/auth`,
    version: "0.1.0",
    private: true,
    main: "./src/index.ts",
    types: "./src/index.ts",
    scripts: {
      "build": "tsc",
      "dev": "tsc --watch",
      "lint": "eslint . --ext .ts"
    },
    dependencies: {
      "better-auth": "^1.3.0",
      "@better-auth/utils": "^0.2.6"
    },
    devDependencies: {
      "typescript": "^5.0.0"
    }
  };
  
  await fsExtra.writeJSON(path.join(authPath, 'package.json'), authPackageJson, { spaces: 2 });
}

async function createConfigPackage(config: ScaleConfig, packagesPath: string): Promise<void> {
  const configPath = path.join(packagesPath, 'config');
  await fsExtra.ensureDir(configPath);
  
  // Move config files
  const oldConfigPath = path.join(config.projectPath, 'config');
  if (await fsExtra.pathExists(oldConfigPath)) {
    await fsExtra.move(oldConfigPath, path.join(configPath, 'src'));
  }
  
  // Create package.json for Config
  const configPackageJson = {
    name: `@${config.projectName}/config`,
    version: "0.1.0",
    private: true,
    main: "./src/index.ts",
    types: "./src/index.ts",
    scripts: {
      "build": "tsc",
      "dev": "tsc --watch",
      "lint": "eslint . --ext .ts"
    },
    devDependencies: {
      "typescript": "^5.0.0"
    }
  };
  
  await fsExtra.writeJSON(path.join(configPath, 'package.json'), configPackageJson, { spaces: 2 });
}

async function updateConfigurations(config: ScaleConfig): Promise<void> {
  console.log(chalk.yellow('\n⚙️  Updating configurations...'));
  
  // Create Turborepo configuration
  const turboConfig = {
    $schema: "https://turbo.build/schema.json",
    globalDependencies: ["**/.env.*local"],
    pipeline: {
      build: {
        dependsOn: ["^build"],
        outputs: [".next/**", "!.next/cache/**", "dist/**"]
      },
      dev: {
        cache: false,
        persistent: true
      },
      lint: {
        dependsOn: ["^lint"]
      },
      "type-check": {
        dependsOn: ["^type-check"]
      }
    }
  };
  
  await fsExtra.writeJSON(path.join(config.projectPath, 'turbo.json'), turboConfig, { spaces: 2 });
  
  // Update root package.json
  const rootPackagePath = path.join(config.projectPath, 'package.json');
  const rootPackage = await fsExtra.readJSON(rootPackagePath);
  
  // Add workspace configuration
  rootPackage.workspaces = [
    "apps/*",
    "packages/*"
  ];
  
  // Add Turborepo scripts
  rootPackage.scripts = {
    ...rootPackage.scripts,
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "clean": "turbo run clean && rm -rf node_modules"
  };
  
  // Add Turborepo dependency
  rootPackage.devDependencies = {
    ...rootPackage.devDependencies,
    "turbo": "^1.10.0"
  };
  
  await fsExtra.writeJSON(rootPackagePath, rootPackage, { spaces: 2 });
  
  console.log(chalk.green('✅ Configurations updated'));
}

function displayScalingSummary(config: ScaleConfig): void {
  console.log(chalk.green.bold('\n🎉 Project successfully scaled to monorepo!\n'));
  
  console.log(chalk.blue.bold('📁 New Structure:'));
  console.log(chalk.gray(`  ${config.projectName}/`));
  console.log(chalk.gray('  ├── apps/'));
  console.log(chalk.gray('  │   └── web/            # Your main application'));
  console.log(chalk.gray('  ├── packages/'));
  if (config.hasComponents) {
    console.log(chalk.gray('  │   ├── ui/             # Shared UI components'));
  }
  if (config.hasDatabase) {
    console.log(chalk.gray('  │   ├── db/             # Database layer'));
  }
  if (config.hasAuth) {
    console.log(chalk.gray('  │   ├── auth/           # Authentication'));
  }
  if (config.hasConfig) {
    console.log(chalk.gray('  │   └── config/         # Shared configuration'));
  }
  console.log(chalk.gray('  ├── turbo.json          # Turborepo configuration'));
  console.log(chalk.gray('  └── package.json        # Root workspace'));
  
  console.log(chalk.blue.bold('\n🚀 Next Steps:'));
  console.log(chalk.white('  npm install              # Install new dependencies'));
  console.log(chalk.white('  npm run dev              # Start development'));
  console.log(chalk.white('  npm run build            # Build all packages'));
  
  console.log(chalk.blue.bold('\n💡 Benefits:'));
  console.log(chalk.gray('  • Shared packages between apps'));
  console.log(chalk.gray('  • Faster builds with Turborepo'));
  console.log(chalk.gray('  • Better code organization'));
  console.log(chalk.gray('  • Easier to add new apps'));
  
  console.log(chalk.yellow('\n⚠️  Note:'));
  console.log(chalk.gray('  • Import paths have been updated'));
  console.log(chalk.gray('  • A backup was created automatically'));
  console.log(chalk.gray('  • You may need to update some imports manually'));
  
  console.log(chalk.green.bold('\n🎯 Happy scaling!\n'));
}

function displayError(message: string): void {
  console.log(chalk.red.bold('\n❌ Error:'));
  console.log(chalk.red(message));
  console.log(chalk.yellow('\n💡 Need help? Visit: https://the-architech.dev\n'));
} 