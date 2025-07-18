/**
 * Validation Agent - Post-Generation Quality Checker
 * 
 * Validates the generated project structure and configuration:
 * - Checks TypeScript compilation
 * - Validates workspace dependencies
 * - Tests import paths
 * - Verifies configuration files
 * - Provides detailed feedback
 */

import chalk from 'chalk';
import ora from 'ora';
import fsExtra from 'fs-extra';
import path from 'path';

const { readJSON, pathExists } = fsExtra;

export class ValidationAgent {
  async execute(config, runner) {
    const spinner = ora({
      text: chalk.blue('🔍 Validating project structure and configuration...'),
      color: 'blue'
    }).start();

    try {
      const projectPath = path.resolve(process.cwd(), config.projectName);
      
      // Run validation checks
      const results = await this.runValidationChecks(projectPath, config);
      
      // Display validation results
      this.displayValidationResults(results);
      
      spinner.succeed(chalk.green('✅ Project validation completed'));
      
    } catch (error) {
      spinner.fail(chalk.red('❌ Validation failed'));
      throw error;
    }
  }

  async runValidationChecks(projectPath, config) {
    const results = {
      structure: await this.validateProjectStructure(projectPath),
      dependencies: await this.validateDependencies(projectPath, config),
      configuration: await this.validateConfiguration(projectPath),
      imports: await this.validateImportPaths(projectPath, config),
      typescript: await this.validateTypeScript(projectPath),
      totalIssues: 0
    };

    // Count total issues
    results.totalIssues = Object.values(results).reduce((total, result) => {
      if (typeof result === 'object' && result.issues) {
        return total + result.issues.length;
      }
      return total;
    }, 0);

    return results;
  }

  async validateProjectStructure(projectPath) {
    const issues = [];
    const requiredDirs = [
      'apps/web',
      'packages/ui',
      'packages/db',
      'packages/auth',
      'packages/config'
    ];

    const requiredFiles = [
      'package.json',
      'turbo.json',
      'tsconfig.json',
      '.eslintrc.json',
      '.prettierrc.json',
      'tailwind.config.js',
      'components.json'
    ];

    // Check directories
    for (const dir of requiredDirs) {
      if (!(await pathExists(path.join(projectPath, dir)))) {
        issues.push(`Missing directory: ${dir}`);
      }
    }

    // Check files
    for (const file of requiredFiles) {
      if (!(await pathExists(path.join(projectPath, file)))) {
        issues.push(`Missing file: ${file}`);
      }
    }

    return {
      name: 'Project Structure',
      issues,
      status: issues.length === 0 ? '✅' : '⚠️'
    };
  }

  async validateDependencies(projectPath, config) {
    const issues = [];
    
    try {
      const rootPackageJson = await readJSON(path.join(projectPath, 'package.json'));
      const webPackageJson = await readJSON(path.join(projectPath, 'apps', 'web', 'package.json'));

      // Check workspace dependencies
      const expectedWorkspaceDeps = [
        `@${config.projectName}/ui`,
        `@${config.projectName}/db`,
        `@${config.projectName}/auth`
      ];

      for (const dep of expectedWorkspaceDeps) {
        if (!webPackageJson.dependencies?.[dep]) {
          issues.push(`Missing workspace dependency: ${dep}`);
        }
      }

      // Check required root dependencies
      const requiredRootDeps = ['turbo', 'typescript', 'prettier'];
      for (const dep of requiredRootDeps) {
        if (!rootPackageJson.devDependencies?.[dep]) {
          issues.push(`Missing root dependency: ${dep}`);
        }
      }

    } catch (error) {
      issues.push(`Failed to read package.json: ${error.message}`);
    }

    return {
      name: 'Dependencies',
      issues,
      status: issues.length === 0 ? '✅' : '⚠️'
    };
  }

  async validateConfiguration(projectPath) {
    const issues = [];
    
    try {
      // Validate TypeScript config
      const tsConfig = await readJSON(path.join(projectPath, 'tsconfig.json'));
      if (!tsConfig.compilerOptions?.paths) {
        issues.push('TypeScript paths not configured');
      }

      // Validate ESLint config
      const eslintConfig = await readJSON(path.join(projectPath, '.eslintrc.json'));
      if (!eslintConfig.extends?.includes('@typescript-eslint/recommended')) {
        issues.push('ESLint TypeScript rules not configured');
      }

      // Validate Prettier config
      const prettierConfig = await readJSON(path.join(projectPath, '.prettierrc.json'));
      if (!prettierConfig.plugins?.includes('prettier-plugin-tailwindcss')) {
        issues.push('Prettier Tailwind plugin not configured');
      }

      // Validate Tailwind config
      const tailwindConfigPath = path.join(projectPath, 'tailwind.config.js');
      if (!(await pathExists(tailwindConfigPath))) {
        issues.push('Tailwind config missing');
      }

      // Validate Shadcn config
      const componentsConfig = await readJSON(path.join(projectPath, 'components.json'));
      if (!componentsConfig.aliases?.components) {
        issues.push('Shadcn components alias not configured');
      }

    } catch (error) {
      issues.push(`Configuration validation failed: ${error.message}`);
    }

    return {
      name: 'Configuration',
      issues,
      status: issues.length === 0 ? '✅' : '⚠️'
    };
  }

  async validateImportPaths(projectPath, config) {
    const issues = [];
    
    try {
      // Check if import paths work by testing a simple import
      const testFiles = [
        {
          path: path.join(projectPath, 'apps', 'web', 'src', 'app', 'page.tsx'),
          imports: [
            `import { Button } from "@/ui";`,
            `import { db } from "@/db";`,
            `import { auth } from "@/auth";`
          ]
        }
      ];

      for (const testFile of testFiles) {
        if (await pathExists(testFile.path)) {
          const content = await fsExtra.readFile(testFile.path, 'utf8');
          for (const importStatement of testFile.imports) {
            if (!content.includes(importStatement.split(' from ')[0])) {
              issues.push(`Import path not tested: ${importStatement}`);
            }
          }
        }
      }

    } catch (error) {
      issues.push(`Import validation failed: ${error.message}`);
    }

    return {
      name: 'Import Paths',
      issues,
      status: issues.length === 0 ? '✅' : '⚠️'
    };
  }

  async validateTypeScript(projectPath) {
    const issues = [];
    
    try {
      // Check if TypeScript can compile the project
      const originalCwd = process.cwd();
      
      try {
        process.chdir(projectPath);
        
        // Try to run TypeScript check
        const { execa } = await import('execa');
        await execa('npx', ['tsc', '--noEmit'], { 
          timeout: 30000,
          stdio: 'pipe'
        });
        
      } catch (error) {
        if (error.exitCode !== 0) {
          issues.push(`TypeScript compilation failed: ${error.stderr?.slice(0, 200)}...`);
        }
      } finally {
        process.chdir(originalCwd);
      }

    } catch (error) {
      issues.push(`TypeScript validation failed: ${error.message}`);
    }

    return {
      name: 'TypeScript',
      issues,
      status: issues.length === 0 ? '✅' : '⚠️'
    };
  }

  displayValidationResults(results) {
    console.log(chalk.blue.bold('\n🔍 VALIDATION RESULTS'));
    console.log(chalk.gray('─'.repeat(50)));

    const categories = [
      results.structure,
      results.dependencies,
      results.configuration,
      results.imports,
      results.typescript
    ];

    for (const category of categories) {
      console.log(`${category.status} ${chalk.cyan(category.name)}`);
      
      if (category.issues.length > 0) {
        for (const issue of category.issues) {
          console.log(chalk.yellow(`  • ${issue}`));
        }
      } else {
        console.log(chalk.green(`  All checks passed`));
      }
      console.log('');
    }

    // Summary
    if (results.totalIssues === 0) {
      console.log(chalk.green.bold('🎉 All validations passed! Your project is ready to use.'));
    } else {
      console.log(chalk.yellow.bold(`⚠️  Found ${results.totalIssues} issue(s) that may need attention.`));
      console.log(chalk.gray('Most issues can be resolved by running the suggested commands.'));
    }

    // Next steps
    console.log(chalk.blue.bold('\n🚀 NEXT STEPS:'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.yellow('1. cd your-project-name'));
    console.log(chalk.yellow('2. npm install (or your preferred package manager)'));
    console.log(chalk.yellow('3. npm run dev'));
    console.log(chalk.yellow('4. Open http://localhost:3000'));
    
    if (results.totalIssues > 0) {
      console.log(chalk.yellow('\n🔧 If you encounter issues:'));
      console.log(chalk.gray('• Check the validation results above'));
      console.log(chalk.gray('• Run npm run type-check for TypeScript issues'));
      console.log(chalk.gray('• Run npm run lint for code quality issues'));
    }
  }
} 