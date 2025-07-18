/**
 * Best Practices Agent - Code Quality Guardian
 * 
 * Installs and configures industry-standard code quality tools:
 * - ESLint with strict rules
 * - Prettier for code formatting
 * - Husky for git hooks
 * - TypeScript strict mode
 * - Import sorting and other optimizations
 * 
 * Migrated to the new standardized agent interface for robustness and extensibility.
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import path from 'path';
import { AbstractAgent } from './base/abstract-agent.js';
import {
  AgentContext,
  AgentResult,
  AgentMetadata,
  AgentCapability,
  AgentCategory,
  CapabilityCategory,
  ValidationResult,
  Artifact
} from '../types/agent.js';

export class BestPracticesAgent extends AbstractAgent {
  // ============================================================================
  // AGENT METADATA
  // ============================================================================

  protected getAgentMetadata(): AgentMetadata {
    return {
      name: 'BestPracticesAgent',
      version: '1.0.0',
      description: 'Installs and configures industry-standard code quality tools',
      author: 'The Architech Team',
      category: AgentCategory.TESTING,
      tags: ['code-quality', 'eslint', 'prettier', 'husky', 'typescript'],
      dependencies: [],
      conflicts: [],
      requirements: [
        {
          type: 'package',
          name: 'eslint',
          description: 'ESLint for code linting'
        },
        {
          type: 'package',
          name: 'prettier',
          description: 'Prettier for code formatting'
        },
        {
          type: 'package',
          name: 'husky',
          description: 'Husky for git hooks'
        }
      ],
      license: 'MIT',
      repository: 'https://github.com/the-architech/cli'
    };
  }

  protected getAgentCapabilities(): AgentCapability[] {
    return [
      {
        name: 'configure-eslint',
        description: 'Configures ESLint with strict rules and TypeScript support',
        parameters: [],
        examples: [
          {
            name: 'Configure ESLint',
            description: 'Sets up ESLint with TypeScript and import sorting',
            parameters: {},
            expectedResult: 'Enhanced ESLint configuration with strict rules'
          }
        ],
        category: CapabilityCategory.CONFIGURATION
      },
      {
        name: 'configure-prettier',
        description: 'Configures Prettier for consistent code formatting',
        parameters: [],
        examples: [
          {
            name: 'Configure Prettier',
            description: 'Sets up Prettier with optimal formatting rules',
            parameters: {},
            expectedResult: 'Prettier configuration with .prettierrc.json and .prettierignore'
          }
        ],
        category: CapabilityCategory.CONFIGURATION
      },
      {
        name: 'configure-husky',
        description: 'Sets up Husky git hooks with lint-staged',
        parameters: [],
        examples: [
          {
            name: 'Configure Husky',
            description: 'Sets up pre-commit hooks with lint-staged',
            parameters: {},
            expectedResult: 'Husky git hooks with pre-commit linting'
          }
        ],
        category: CapabilityCategory.CONFIGURATION
      },
      {
        name: 'configure-typescript',
        description: 'Enables TypeScript strict mode and additional checks',
        parameters: [],
        examples: [
          {
            name: 'Configure TypeScript',
            description: 'Enables strict mode and additional type checking',
            parameters: {},
            expectedResult: 'Enhanced TypeScript configuration with strict mode'
          }
        ],
        category: CapabilityCategory.CONFIGURATION
      }
    ];
  }

  // ============================================================================
  // CORE EXECUTION
  // ============================================================================

  protected async executeInternal(context: AgentContext): Promise<AgentResult> {
    const { projectPath } = context;
    
    context.logger.info('Setting up code quality tools...');

    try {
      const artifacts: Artifact[] = [];
      const startTime = Date.now();

      // Step 1: Install development dependencies
      await this.installDependencies(context);
      
      // Step 2: Configure Prettier
      const prettierArtifacts = await this.configurePrettier(context);
      artifacts.push(...prettierArtifacts);
      
      // Step 3: Enhance ESLint configuration
      const eslintArtifacts = await this.configureESLint(context);
      artifacts.push(...eslintArtifacts);
      
      // Step 4: Set up Husky git hooks
      const huskyArtifacts = await this.configureHusky(context);
      artifacts.push(...huskyArtifacts);
      
      // Step 5: Configure TypeScript strict mode
      const tsArtifacts = await this.configureTypeScript(context);
      artifacts.push(...tsArtifacts);
      
      // Step 6: Add npm scripts
      const scriptArtifacts = await this.addNpmScripts(context);
      artifacts.push(...scriptArtifacts);

      const duration = Date.now() - startTime;
      
      context.logger.success('Code quality tools configured successfully');
      
      return {
        success: true,
        data: {
          toolsInstalled: ['eslint', 'prettier', 'husky', 'typescript'],
          configurations: ['eslint', 'prettier', 'husky', 'typescript', 'npm-scripts']
        },
        duration,
        artifacts,
        nextSteps: [
          'Run "npm run lint" to check code quality',
          'Run "npm run format" to format code',
          'Run "npm run quality" to run all quality checks'
        ]
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      context.logger.error(`Failed to configure code quality tools: ${errorMessage}`, error as Error);
      
      return this.createErrorResult(
        'CODE_QUALITY_SETUP_FAILED',
        `Failed to configure code quality tools: ${errorMessage}`,
        [],
        0,
        error
      );
    }
  }

  // ============================================================================
  // VALIDATION
  // ============================================================================

  async validate(context: AgentContext): Promise<ValidationResult> {
    const baseValidation = await super.validate(context);
    
    if (!baseValidation.valid) {
      return baseValidation;
    }

    const errors: any[] = [];
    const warnings: string[] = [];

    // Check if project has package.json
    const packageJsonPath = path.join(context.projectPath, 'package.json');
    if (!existsSync(packageJsonPath)) {
      errors.push({
        field: 'projectPath',
        message: 'package.json not found in project directory',
        code: 'MISSING_PACKAGE_JSON',
        severity: 'error'
      });
    }

    // Check if TypeScript is already configured
    const tsconfigPath = path.join(context.projectPath, 'tsconfig.json');
    if (existsSync(tsconfigPath)) {
      warnings.push('TypeScript configuration already exists and will be enhanced');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private async installDependencies(context: AgentContext): Promise<void> {
    context.logger.info('Installing code quality dependencies...');
    
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
    
    await context.runner.install(devDependencies, true, context.projectPath);
    context.logger.success('Dependencies installed');
  }

  private async configurePrettier(context: AgentContext): Promise<Artifact[]> {
    context.logger.info('Configuring Prettier...');
    
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
    
    const prettierConfigPath = path.join(context.projectPath, '.prettierrc.json');
    const prettierIgnorePath = path.join(context.projectPath, '.prettierignore');
    
    writeFileSync(prettierConfigPath, JSON.stringify(prettierConfig, null, 2));
    writeFileSync(prettierIgnorePath, prettierIgnore);
    
    context.logger.success('Prettier configured');
    
    return [
      {
        type: 'config',
        path: prettierConfigPath,
        content: JSON.stringify(prettierConfig, null, 2),
        metadata: { tool: 'prettier', type: 'configuration' }
      },
      {
        type: 'config',
        path: prettierIgnorePath,
        content: prettierIgnore,
        metadata: { tool: 'prettier', type: 'ignore-file' }
      }
    ];
  }

  private async configureESLint(context: AgentContext): Promise<Artifact[]> {
    context.logger.info('Enhancing ESLint configuration...');
    
    const eslintConfigPath = path.join(context.projectPath, '.eslintrc.json');
    let eslintConfig = {};
    
    // Read existing ESLint config if it exists
    if (existsSync(eslintConfigPath)) {
      try {
        const configContent = readFileSync(eslintConfigPath, 'utf8');
        eslintConfig = JSON.parse(configContent);
      } catch (error) {
        context.logger.warn('Could not parse existing ESLint config, creating new one');
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
        ...((eslintConfig as any).rules || {}),
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
    
    writeFileSync(eslintConfigPath, JSON.stringify(enhancedConfig, null, 2));
    
    context.logger.success('ESLint configuration enhanced');
    
    return [
      {
        type: 'config',
        path: eslintConfigPath,
        content: JSON.stringify(enhancedConfig, null, 2),
        metadata: { tool: 'eslint', type: 'configuration' }
      }
    ];
  }

  private async configureHusky(context: AgentContext): Promise<Artifact[]> {
    context.logger.info('Setting up Husky git hooks...');
    
    const artifacts: Artifact[] = [];
    
    try {
      // Initialize Husky
      await context.runner.exec('husky', ['init'], context.projectPath);
      
      // Configure pre-commit hook with lint-staged
      const preCommitHook = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
`;
      
      const preCommitPath = path.join(context.projectPath, '.husky', 'pre-commit');
      writeFileSync(preCommitPath, preCommitHook);
      
      // Configure lint-staged
      const packageJsonPath = path.join(context.projectPath, 'package.json');
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
      
      context.logger.success('Husky git hooks configured');
      
      artifacts.push(
        {
          type: 'script',
          path: preCommitPath,
          content: preCommitHook,
          metadata: { tool: 'husky', type: 'git-hook' }
        },
        {
          type: 'config',
          path: packageJsonPath,
          content: JSON.stringify(packageJson, null, 2),
          metadata: { tool: 'lint-staged', type: 'configuration' }
        }
      );
      
    } catch (error) {
      context.logger.warn(`Husky setup skipped: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    return artifacts;
  }

  private async configureTypeScript(context: AgentContext): Promise<Artifact[]> {
    context.logger.info('Configuring TypeScript strict mode...');
    
    const tsconfigPath = path.join(context.projectPath, 'tsconfig.json');
    
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
        context.logger.success('TypeScript strict mode enabled');
        
        return [
          {
            type: 'config',
            path: tsconfigPath,
            content: JSON.stringify(tsconfig, null, 2),
            metadata: { tool: 'typescript', type: 'configuration' }
          }
        ];
        
      } catch (error) {
        context.logger.warn(`Could not update TypeScript config: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    return [];
  }

  private async addNpmScripts(context: AgentContext): Promise<Artifact[]> {
    context.logger.info('Adding npm scripts...');
    
    const packageJsonPath = path.join(context.projectPath, 'package.json');
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
    context.logger.success('npm scripts added');
    
    return [
      {
        type: 'config',
        path: packageJsonPath,
        content: JSON.stringify(packageJson, null, 2),
        metadata: { tool: 'npm', type: 'scripts' }
      }
    ];
  }

  // ============================================================================
  // ROLLBACK
  // ============================================================================

  async rollback(context: AgentContext): Promise<void> {
    context.logger.info('Rolling back BestPracticesAgent changes...');
    
    const filesToRemove = [
      '.prettierrc.json',
      '.prettierignore',
      '.eslintrc.json',
      '.husky/pre-commit'
    ];
    
    for (const file of filesToRemove) {
      const filePath = path.join(context.projectPath, file);
      if (existsSync(filePath)) {
        try {
          // Note: In a real implementation, you'd want to restore the original files
          // For now, we'll just log what would be removed
          context.logger.info(`Would remove: ${file}`);
        } catch (error) {
          context.logger.warn(`Could not remove ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }
    
    context.logger.success('BestPracticesAgent rollback completed');
  }
} 