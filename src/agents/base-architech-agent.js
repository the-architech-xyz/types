/**
 * Base Architech Agent - Monorepo Foundation Generator
 * 
 * Creates the core Turborepo monorepo structure:
 * - Root configuration (package.json, turbo.json)
 * - apps/web: Next.js 14 application
 * - packages/: Foundation for specialized packages
 * - Workspace configuration and scripts
 */

import chalk from 'chalk';
import ora from 'ora';
import fsExtra from 'fs-extra';
import path from 'path';

const { ensureDir, writeFile, writeJSON } = fsExtra;

export class BaseArchitechAgent {
  async execute(config, runner) {
    const spinner = ora({
      text: chalk.blue('🏗️  Creating Turborepo monorepo structure...'),
      color: 'blue'
    }).start();

    try {
      const projectPath = path.resolve(process.cwd(), config.projectName);
      
      // Create base directories
      await this.createDirectoryStructure(projectPath);
      
      // Create root package.json with workspace configuration
      await this.createRootPackageJson(projectPath, config);
      
      // Create Turborepo configuration
      await this.createTurboConfig(projectPath);
      
      // Create Next.js app
      await this.createNextJSApp(projectPath, config, runner);
      
      // Create package directories
      await this.createPackageDirectories(projectPath);
      
      // Initialize git repository
      if (!config.skipGit) {
        await this.initializeGit(projectPath, runner);
      }
      
      spinner.succeed(chalk.green('✅ Base Architech structure created'));
      
    } catch (error) {
      spinner.fail(chalk.red('❌ Failed to create base structure'));
      throw error;
    }
  }

  async createDirectoryStructure(projectPath) {
    const directories = [
      'apps',
      'apps/web',
      'packages',
      'packages/ui',
      'packages/db', 
      'packages/auth',
      'packages/config'
    ];

    for (const dir of directories) {
      await ensureDir(path.join(projectPath, dir));
    }
  }

  async createRootPackageJson(projectPath, config) {
    const packageJson = {
      name: config.projectName,
      version: "0.1.0",
      private: true,
      description: "Enterprise-grade monorepo created with The Architech",
      workspaces: [
        "apps/*",
        "packages/*"
      ],
      scripts: {
        "build": "turbo run build",
        "dev": "turbo run dev",
        "lint": "turbo run lint",
        "format": "prettier --write \"**/*.{ts,tsx,md}\"",
        "clean": "turbo run clean && rm -rf node_modules .turbo",
        "type-check": "turbo run type-check"
      },
      devDependencies: {
        "turbo": "^1.10.16",
        "prettier": "^3.0.0",
        "@types/node": "^20.0.0",
        "typescript": "^5.0.0"
      },
      packageManager: config.packageManager === 'auto' ? 'npm@9.0.0' : `${config.packageManager}@latest`,
      engines: {
        "node": ">=16.0.0"
      }
    };

    await writeJSON(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 });
  }

  async createTurboConfig(projectPath) {
    const turboConfig = {
      "$schema": "https://turbo.build/schema.json",
      "globalDependencies": ["**/.env.*local"],
      "pipeline": {
        "build": {
          "dependsOn": ["^build"],
          "outputs": [".next/**", "!.next/cache/**", "dist/**"]
        },
        "dev": {
          "cache": false,
          "persistent": true
        },
        "lint": {
          "dependsOn": ["^lint"]
        },
        "type-check": {
          "dependsOn": ["^type-check"]
        },
        "clean": {
          "cache": false
        }
      }
    };

    await writeJSON(path.join(projectPath, 'turbo.json'), turboConfig, { spaces: 2 });
  }

  async createNextJSApp(projectPath, config, runner) {
    const appPath = path.join(projectPath, 'apps', 'web');
    
    // Create Next.js app with create-next-app
    const createNextArgs = [
      'web',
      '--typescript',
      '--tailwind',
      '--eslint',
      '--app',
      '--src-dir',
      '--import-alias', '@/*'
    ];

    // Change to apps directory to run create-next-app
    const originalCwd = process.cwd();
    const appsPath = path.join(projectPath, 'apps');
    
    try {
      process.chdir(appsPath);
      await runner.exec('npx', ['create-next-app@latest', ...createNextArgs, '--yes']);
    } finally {
      process.chdir(originalCwd);
    }

    // Update the web app's package.json for monorepo
    await this.updateWebAppPackageJson(appPath, config);
  }

  async updateWebAppPackageJson(appPath, config) {
    const packageJsonPath = path.join(appPath, 'package.json');
    
    const webPackageJson = {
      name: `@${config.projectName}/web`,
      version: "0.1.0",
      private: true,
      scripts: {
        "build": "next build",
        "dev": "next dev",
        "lint": "next lint",
        "start": "next start",
        "type-check": "tsc --noEmit"
      },
      dependencies: {
        "react": "^18",
        "react-dom": "^18",
        "next": "14.0.0"
      },
      devDependencies: {
        "typescript": "^5",
        "@types/node": "^20",
        "@types/react": "^18",
        "@types/react-dom": "^18",
        "autoprefixer": "^10",
        "postcss": "^8",
        "tailwindcss": "^3",
        "eslint": "^8",
        "eslint-config-next": "14.0.0"
      }
    };

    await writeJSON(packageJsonPath, webPackageJson, { spaces: 2 });
  }

  async createPackageDirectories(projectPath) {
    // Create basic package.json for each package directory
    const packages = ['ui', 'db', 'auth', 'config'];
    
    for (const pkg of packages) {
      const packagePath = path.join(projectPath, 'packages', pkg);
      const packageJson = {
        name: `@${path.basename(projectPath)}/${pkg}`,
        version: "0.1.0",
        private: true,
        description: `${pkg.charAt(0).toUpperCase() + pkg.slice(1)} package for ${path.basename(projectPath)}`,
        main: "index.js",
        types: "index.d.ts",
        scripts: {
          "build": "echo 'Building ${pkg} package...'",
          "dev": "echo 'Development mode for ${pkg} package...'",
          "lint": "echo 'Linting ${pkg} package...'",
          "type-check": "tsc --noEmit"
        }
      };
      
      await writeJSON(path.join(packagePath, 'package.json'), packageJson, { spaces: 2 });
      
      // Create basic index file
      const indexContent = `/**
 * ${pkg.charAt(0).toUpperCase() + pkg.slice(1)} Package
 * 
 * This package will be configured by The Architech ${pkg.charAt(0).toUpperCase() + pkg.slice(1)} Agent.
 */

export default {};
`;
      
      await writeFile(path.join(packagePath, 'index.ts'), indexContent);
    }
  }

  async initializeGit(projectPath, runner) {
    const originalCwd = process.cwd();
    
    try {
      process.chdir(projectPath);
      
      await runner.exec('git', ['init']);
      
      // Create .gitignore
      const gitignoreContent = `# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/

# Production
build/
dist/

# Environment variables
.env*.local
.env

# Vercel
.vercel

# Turbo
.turbo

# IDE
.vscode/
.idea/

# OS
.DS_Store
*.log

# Package managers
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
`;
      
      await writeFile(path.join(projectPath, '.gitignore'), gitignoreContent);
      
    } finally {
      process.chdir(originalCwd);
    }
  }
} 