/**
 * Best Practices Agent - Code Quality Guardian
 * 
 * Installs and configures industry-standard code quality tools:
 * - ESLint with strict rules
 * - Prettier for code formatting
 * - Husky for git hooks
 * - TypeScript strict mode
 * - Import sorting and other optimizations
 */

import chalk from 'chalk';
import path from 'path';
import { writeFileSync, readFileSync, existsSync } from 'fs';

export class BestPracticesAgent {
  constructor(commandRunner) {
    this.runner = commandRunner;
    this.name = 'BestPracticesAgent';
  }

  async execute(config) {
    const { projectPath } = config;
    
    console.log(chalk.cyan(`🔧 [${this.name}] Setting up code quality tools...`));
    
    try {
      // Step 1: Install development dependencies
      await this.installDependencies(projectPath);
      
      // Step 2: Configure Prettier
      await this.configurePrettier(projectPath);
      
      // Step 3: Enhance ESLint configuration
      await this.configureESLint(projectPath);
      
      // Step 4: Set up Husky git hooks
      await this.configureHusky(projectPath);
      
      // Step 5: Configure TypeScript strict mode
      await this.configureTypeScript(projectPath);
      
      // Step 6: Add npm scripts
      await this.addNpmScripts(projectPath);
      
      console.log(chalk.green(`✅ [${this.name}] Code quality tools configured successfully`));
      
    } catch (error) {
      console.log(chalk.red(`❌ [${this.name}] Failed: ${error.message}`));
      throw error;
    }
  }

  async installDependencies(projectPath) {
    console.log(chalk.blue(`📦 Installing code quality dependencies...`));
    
    const devDependencies = [
      'prettier',
      'eslint-config-prettier',
      'eslint-plugin-prettier',
      'husky',
      'lint-staged',
      '@typescript-eslint/eslint-plugin',
      '@typescript-eslint/parser',
      'eslint-plugin-import',
      'eslint-plugin-unused-imports',
      'eslint-plugin-simple-import-sort'
    ];
    
    await this.runner.install(devDependencies, true, projectPath);
    console.log(chalk.green(`✅ Dependencies installed`));
  }

  async configurePrettier(projectPath) {
    console.log(chalk.blue(`🎨 Configuring Prettier...`));
    
    const prettierConfig = {
      semi: true,
      trailingComma: 'es5',
      singleQuote: true,
      printWidth: 80,
      tabWidth: 2,
      useTabs: false,
      bracketSpacing: true,
      bracketSameLine: false,
      arrowParens: 'avoid',
      endOfLine: 'lf'
    };
    
    const prettierIgnore = `
# Dependencies
node_modules/
.pnp
.pnp.js

# Production builds
.next/
out/
dist/
build/

# Environment files
.env*

# Logs
*.log

# Package manager files
package-lock.json
yarn.lock
pnpm-lock.yaml

# IDE files
.vscode/
.idea/

# OS files
.DS_Store
Thumbs.db
`.trim();
    
    writeFileSync(
      path.join(projectPath, '.prettierrc.json'),
      JSON.stringify(prettierConfig, null, 2)
    );
    
    writeFileSync(
      path.join(projectPath, '.prettierignore'),
      prettierIgnore
    );
    
    console.log(chalk.green(`✅ Prettier configured`));
  }

  async configureESLint(projectPath) {
    console.log(chalk.blue(`📋 Enhancing ESLint configuration...`));
    
    const eslintConfigPath = path.join(projectPath, '.eslintrc.json');
    let eslintConfig = {};
    
    // Read existing ESLint config if it exists
    if (existsSync(eslintConfigPath)) {
      try {
        const configContent = readFileSync(eslintConfigPath, 'utf8');
        eslintConfig = JSON.parse(configContent);
      } catch (error) {
        console.log(chalk.yellow(`⚠️  Could not parse existing ESLint config, creating new one`));
      }
    }
    
    // Enhanced ESLint configuration
    const enhancedConfig = {
      ...eslintConfig,
      extends: [
        'next/core-web-vitals',
        '@typescript-eslint/recommended',
        'prettier'
      ],
      plugins: [
        '@typescript-eslint',
        'import',
        'unused-imports',
        'simple-import-sort'
      ],
      rules: {
        ...eslintConfig.rules,
        // TypeScript rules
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-empty-function': 'warn',
        
        // Import rules
        'import/first': 'error',
        'import/newline-after-import': 'error',
        'import/no-duplicates': 'error',
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
        
        // Unused imports
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': [
          'warn',
          {
            vars: 'all',
            varsIgnorePattern: '^_',
            args: 'after-used',
            argsIgnorePattern: '^_'
          }
        ],
        
        // General best practices
        'no-console': 'warn',
        'no-debugger': 'error',
        'prefer-const': 'error',
        'no-var': 'error'
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    };
    
    writeFileSync(
      eslintConfigPath,
      JSON.stringify(enhancedConfig, null, 2)
    );
    
    console.log(chalk.green(`✅ ESLint configuration enhanced`));
  }

  async configureHusky(projectPath) {
    console.log(chalk.blue(`🐕 Setting up Husky git hooks...`));
    
    try {
      // Initialize Husky
      await this.runner.exec('husky', ['init'], projectPath);
      
      // Configure pre-commit hook with lint-staged
      const preCommitHook = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
`;
      
      writeFileSync(
        path.join(projectPath, '.husky', 'pre-commit'),
        preCommitHook
      );
      
      // Configure lint-staged
      const packageJsonPath = path.join(projectPath, 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      
      packageJson['lint-staged'] = {
        '*.{js,jsx,ts,tsx}': [
          'eslint --fix',
          'prettier --write'
        ],
        '*.{json,md,css,scss}': [
          'prettier --write'
        ]
      };
      
      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      
      console.log(chalk.green(`✅ Husky git hooks configured`));
      
    } catch (error) {
      console.log(chalk.yellow(`⚠️  Husky setup skipped: ${error.message}`));
    }
  }

  async configureTypeScript(projectPath) {
    console.log(chalk.blue(`📘 Configuring TypeScript strict mode...`));
    
    const tsconfigPath = path.join(projectPath, 'tsconfig.json');
    
    if (existsSync(tsconfigPath)) {
      try {
        const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf8'));
        
        // Enable strict mode and additional checks
        tsconfig.compilerOptions = {
          ...tsconfig.compilerOptions,
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noImplicitReturns: true,
          noFallthroughCasesInSwitch: true,
          noUncheckedIndexedAccess: true,
          exactOptionalPropertyTypes: true
        };
        
        writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
        console.log(chalk.green(`✅ TypeScript strict mode enabled`));
        
      } catch (error) {
        console.log(chalk.yellow(`⚠️  Could not update TypeScript config: ${error.message}`));
      }
    }
  }

  async addNpmScripts(projectPath) {
    console.log(chalk.blue(`📝 Adding npm scripts...`));
    
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    
    // Add quality assurance scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      'lint': 'eslint . --ext .js,.jsx,.ts,.tsx',
      'lint:fix': 'eslint . --ext .js,.jsx,.ts,.tsx --fix',
      'format': 'prettier --write .',
      'format:check': 'prettier --check .',
      'type-check': 'tsc --noEmit',
      'quality': 'npm run lint && npm run format:check && npm run type-check'
    };
    
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(chalk.green(`✅ npm scripts added`));
  }
} 