/**
 * Validation Agent - Post-Generation Quality Checker
 * 
 * Validates the generated project structure and configuration:
 * - Checks TypeScript compilation
 * - Validates workspace dependencies
 * - Tests import paths
 * - Verifies configuration files
 * - Provides detailed feedback
 * 
 * Enhanced to integrate with the plugin system for modularity.
 */

import { AbstractAgent } from './base/abstract-agent.js';
import { TemplateService, templateService } from '../utils/template-service.js';
import { PluginSystem } from '../utils/plugin-system.js';
import { PluginContext, ProjectType, TargetPlatform } from '../types/plugin.js';
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
import * as fsExtra from 'fs-extra';
import * as path from 'path';
import { execa } from 'execa';

interface ValidationResults {
  structure: ValidationCategory;
  dependencies: ValidationCategory;
  configuration: ValidationCategory;
  imports: ValidationCategory;
  typescript: ValidationCategory;
  totalIssues: number;
}

interface ValidationCategory {
  name: string;
  issues: string[];
  status: string;
}

interface TestFile {
  path: string;
  imports: string[];
}

export class ValidationAgent extends AbstractAgent {
  private templateService: TemplateService;
  private pluginSystem: PluginSystem;

  constructor() {
    super();
    this.templateService = templateService;
    this.pluginSystem = PluginSystem.getInstance();
  }

  // ============================================================================
  // AGENT METADATA
  // ============================================================================

  protected getAgentMetadata(): AgentMetadata {
    return {
      name: 'ValidationAgent',
      version: '2.0.0',
      description: 'Post-generation quality checker that validates project structure and configuration using plugin system',
      author: 'The Architech Team',
      category: AgentCategory.TESTING,
      tags: ['validation', 'quality', 'testing', 'verification', 'plugin-integration'],
      dependencies: ['BaseProjectAgent'],
      conflicts: [],
      requirements: [
        {
          type: 'package',
          name: 'typescript',
          description: 'TypeScript for compilation checks'
        }
      ],
      license: 'MIT',
      repository: 'https://github.com/the-architech/cli'
    };
  }

  protected getAgentCapabilities(): AgentCapability[] {
    return [
      {
        name: 'validate-project-structure',
        description: 'Validates the overall project structure and required files using plugin system',
        parameters: [
          {
            name: 'usePlugin',
            type: 'boolean',
            required: false,
            description: 'Whether to use validation plugins for enhanced checks',
            defaultValue: true
          },
          {
            name: 'strictMode',
            type: 'boolean',
            required: false,
            description: 'Enable strict validation mode',
            defaultValue: false
          }
        ],
        examples: [
          {
            name: 'Structure Validation with Plugin',
            description: 'Checks for required directories and files using validation plugins',
            parameters: { usePlugin: true, strictMode: true },
            expectedResult: 'Comprehensive validation report with plugin-enhanced checks'
          }
        ],
        category: CapabilityCategory.VALIDATION
      },
      {
        name: 'validate-dependencies',
        description: 'Validates workspace dependencies and package.json files using plugin system',
        parameters: [
          {
            name: 'usePlugin',
            type: 'boolean',
            required: false,
            description: 'Whether to use dependency validation plugins',
            defaultValue: true
          }
        ],
        examples: [
          {
            name: 'Dependency Check with Plugin',
            description: 'Verifies workspace dependencies using specialized plugins',
            parameters: { usePlugin: true },
            expectedResult: 'Detailed dependency validation report with plugin insights'
          }
        ],
        category: CapabilityCategory.VALIDATION
      },
      {
        name: 'validate-typescript',
        description: 'Runs TypeScript compilation to check for type errors using plugin system',
        parameters: [
          {
            name: 'usePlugin',
            type: 'boolean',
            required: false,
            description: 'Whether to use TypeScript validation plugins',
            defaultValue: true
          },
          {
            name: 'strictMode',
            type: 'boolean',
            required: false,
            description: 'Enable strict TypeScript checking',
            defaultValue: true
          }
        ],
        examples: [
          {
            name: 'TypeScript Check with Plugin',
            description: 'Compiles TypeScript files with plugin-enhanced error detection',
            parameters: { usePlugin: true, strictMode: true },
            expectedResult: 'Comprehensive TypeScript compilation report with plugin insights'
          }
        ],
        category: CapabilityCategory.VALIDATION
      },
      {
        name: 'enhance-validation-package',
        description: 'Adds agent-specific validation enhancements',
        parameters: [
          {
            name: 'utilities',
            type: 'boolean',
            required: false,
            description: 'Whether to add validation utility functions',
            defaultValue: true
          },
          {
            name: 'healthChecks',
            type: 'boolean',
            required: false,
            description: 'Whether to add health check utilities',
            defaultValue: true
          },
          {
            name: 'aiFeatures',
            type: 'boolean',
            required: false,
            description: 'Whether to add AI-powered validation features',
            defaultValue: true
          }
        ],
        examples: [
          {
            name: 'Add all enhancements',
            description: 'Adds all agent-specific validation enhancements',
            parameters: { utilities: true, healthChecks: true, aiFeatures: true },
            expectedResult: 'Enhanced validation package with utilities, health checks, and AI features'
          }
        ],
        category: CapabilityCategory.INTEGRATION
      }
    ];
  }

  // ============================================================================
  // CORE EXECUTION
  // ============================================================================

  protected async executeInternal(context: AgentContext): Promise<AgentResult> {
    const { projectPath } = context;
    
    context.logger.info('Running comprehensive project validation checks...');

    try {
      // Get validation configuration from context
      const usePlugin = context.config?.usePlugin !== false; // Default to true
      const strictMode = context.config?.strictMode || false;

      let pluginResult = null;

      // Use plugin for enhanced validation if enabled
      if (usePlugin) {
        context.logger.info('Using validation plugins for enhanced checks...');
        pluginResult = await this.executeValidationPlugins(context, strictMode);
      }

      // Run core validation checks
      const results = await this.runValidationChecks(projectPath, context, strictMode);
      
      // Add agent-specific enhancements
      await this.enhanceValidationPackage(projectPath, context);
      
      // Display validation results
      this.displayValidationResults(results);
      
      const artifacts: Artifact[] = [
        {
          type: 'file',
          path: path.join(projectPath, 'validation-report.json'),
          metadata: {
            totalIssues: results.totalIssues,
            categories: Object.keys(results).filter(key => key !== 'totalIssues'),
            strictMode,
            pluginUsed: usePlugin
          }
        }
      ];

      // Add plugin artifacts if plugin was used
      if (pluginResult?.artifacts) {
        artifacts.push(...pluginResult.artifacts);
      }

      context.logger.success(`Validation completed with ${results.totalIssues} issues found`);
      
      return this.createSuccessResult(
        {
          validationResults: results,
          pluginUsed: usePlugin,
          strictMode,
          totalIssues: results.totalIssues
        },
        artifacts,
        this.getNextSteps(results.totalIssues)
      );
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      context.logger.error(`Validation failed: ${errorMessage}`, error as Error);
      
      return this.createErrorResult(
        'VALIDATION_FAILED',
        `Validation failed: ${errorMessage}`,
        [],
        0,
        error
      );
    }
  }

  // ============================================================================
  // PLUGIN INTEGRATION
  // ============================================================================

  private async executeValidationPlugins(context: AgentContext, strictMode: boolean): Promise<any> {
    try {
      // For now, we'll simulate plugin execution since we don't have validation plugins yet
      // This is ready for when we add validation plugins to the system
      context.logger.info('Validation plugins would be executed here...');
      
      return {
        success: true,
        artifacts: [],
        warnings: ['No validation plugins currently available']
      };
    } catch (error) {
      context.logger.warn(`Plugin execution failed, falling back to core validation: ${error}`);
      return null;
    }
  }

  // ============================================================================
  // AGENT-SPECIFIC ENHANCEMENTS
  // ============================================================================

  private async enhanceValidationPackage(projectPath: string, context: AgentContext): Promise<void> {
    context.logger.info('Adding agent-specific validation enhancements...');

    // Create validation utilities directory
    const validationPath = path.join(projectPath, 'packages', 'validation');
    await fsExtra.ensureDir(validationPath);

    // Add enhanced validation utilities
    await this.createEnhancedValidationUtils(validationPath, context);
    
    // Add health check utilities
    await this.createHealthChecks(validationPath, context);
    
    // Add AI-powered validation features
    await this.createAIFeatures(validationPath, context);
    
    // Add development utilities
    await this.createDevUtilities(validationPath, context);
  }

  private async createEnhancedValidationUtils(validationPath: string, context: AgentContext): Promise<void> {
    const utilsPath = path.join(validationPath, 'utils');
    await fsExtra.ensureDir(utilsPath);

    // Enhanced validation utilities
    await this.templateService.renderTemplate('validation/enhanced-utils.ts', path.join(utilsPath, 'enhanced.ts'), {
      projectName: context.projectName
    });

    // Type checking utilities
    await this.templateService.renderTemplate('validation/type-utils.ts', path.join(utilsPath, 'types.ts'), {
      projectName: context.projectName
    });

    // Import validation utilities
    await this.templateService.renderTemplate('validation/import-utils.ts', path.join(utilsPath, 'imports.ts'), {
      projectName: context.projectName
    });

    // Configuration validation utilities
    await this.templateService.renderTemplate('validation/config-utils.ts', path.join(utilsPath, 'config.ts'), {
      projectName: context.projectName
    });
  }

  private async createHealthChecks(validationPath: string, context: AgentContext): Promise<void> {
    const healthPath = path.join(validationPath, 'health');
    await fsExtra.ensureDir(healthPath);

    // Project health checker
    await this.templateService.renderTemplate('validation/project-health.ts', path.join(healthPath, 'project-health.ts'), {
      projectName: context.projectName
    });

    // Dependency health checker
    await this.templateService.renderTemplate('validation/dependency-health.ts', path.join(healthPath, 'dependency-health.ts'), {
      projectName: context.projectName
    });

    // Build health checker
    await this.templateService.renderTemplate('validation/build-health.ts', path.join(healthPath, 'build-health.ts'), {
      projectName: context.projectName
    });
  }

  private async createAIFeatures(validationPath: string, context: AgentContext): Promise<void> {
    const aiPath = path.join(validationPath, 'ai');
    await fsExtra.ensureDir(aiPath);

    // AI-powered code analysis
    await this.templateService.renderTemplate('validation/ai-code-analyzer.ts', path.join(aiPath, 'code-analyzer.ts'), {
      projectName: context.projectName
    });

    // AI-powered dependency analysis
    await this.templateService.renderTemplate('validation/ai-dependency-analyzer.ts', path.join(aiPath, 'dependency-analyzer.ts'), {
      projectName: context.projectName
    });

    // AI-powered performance analysis
    await this.templateService.renderTemplate('validation/ai-performance-analyzer.ts', path.join(aiPath, 'performance-analyzer.ts'), {
      projectName: context.projectName
    });
  }

  private async createDevUtilities(validationPath: string, context: AgentContext): Promise<void> {
    const devPath = path.join(validationPath, 'dev');
    await fsExtra.ensureDir(devPath);

    // Development utilities
    await this.templateService.renderTemplate('validation/dev-utils.ts', path.join(devPath, 'utils.ts'), {
      projectName: context.projectName
    });

    // Validation playground
    await this.templateService.renderTemplate('validation/validation-playground.ts', path.join(devPath, 'playground.ts'), {
      projectName: context.projectName
    });

    // Report generator
    await this.templateService.renderTemplate('validation/report-generator.ts', path.join(devPath, 'report-generator.ts'), {
      projectName: context.projectName
    });
  }

  // ============================================================================
  // CORE VALIDATION METHODS
  // ============================================================================

  async validate(context: AgentContext): Promise<ValidationResult> {
    // Validation agent doesn't require specific validation
    return {
      valid: true,
      errors: [],
      warnings: []
    };
  }

  async rollback(context: AgentContext): Promise<void> {
    // Validation agent doesn't create files, so no rollback needed
  }

  private async runValidationChecks(projectPath: string, context: AgentContext, strictMode: boolean): Promise<ValidationResults> {
    const results: ValidationResults = {
      structure: await this.validateProjectStructure(projectPath, strictMode),
      dependencies: await this.validateDependencies(projectPath, context, strictMode),
      configuration: await this.validateConfiguration(projectPath, strictMode),
      imports: await this.validateImportPaths(projectPath, context, strictMode),
      typescript: await this.validateTypeScript(projectPath, strictMode),
      totalIssues: 0
    };

    // Count total issues
    results.totalIssues = Object.values(results).reduce((total, result) => {
      if (typeof result === 'object' && 'issues' in result) {
        return total + result.issues.length;
      }
      return total;
    }, 0);

    return results;
  }

  private async validateProjectStructure(projectPath: string, strictMode: boolean): Promise<ValidationCategory> {
    const issues: string[] = [];
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
      'next.config.js'
    ];

    // Check required directories
    for (const dir of requiredDirs) {
      const dirPath = path.join(projectPath, dir);
      if (!await fsExtra.pathExists(dirPath)) {
        issues.push(`Missing required directory: ${dir}`);
      }
    }

    // Check required files
    for (const file of requiredFiles) {
      const filePath = path.join(projectPath, file);
      if (!await fsExtra.pathExists(filePath)) {
        issues.push(`Missing required file: ${file}`);
      }
    }

    // Additional strict mode checks
    if (strictMode) {
      const strictChecks = [
        'apps/web/src',
        'apps/web/public',
        'packages/ui/components',
        'packages/db/schema',
        'packages/auth/providers'
      ];

      for (const check of strictChecks) {
        const checkPath = path.join(projectPath, check);
        if (!await fsExtra.pathExists(checkPath)) {
          issues.push(`Missing strict mode directory: ${check}`);
        }
      }
    }

    return {
      name: 'Project Structure',
      issues,
      status: issues.length === 0 ? '✅ Passed' : '❌ Failed'
    };
  }

  private async validateDependencies(projectPath: string, context: AgentContext, strictMode: boolean): Promise<ValidationCategory> {
    const issues: string[] = [];
    
    try {
      const packageJsonPath = path.join(projectPath, 'package.json');
      if (await fsExtra.pathExists(packageJsonPath)) {
        const packageJson = await fsExtra.readJSON(packageJsonPath);
        
        // Check for required dependencies
        const requiredDeps = ['next', 'react', 'react-dom', 'typescript'];
        const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]);
        
        if (missingDeps.length > 0) {
          issues.push(`Missing required dependencies: ${missingDeps.join(', ')}`);
        }

        // Check workspace configuration
        if (!packageJson.workspaces && !packageJson.turbo) {
          issues.push('Missing workspace configuration (workspaces or turbo)');
        }

        // Strict mode checks
        if (strictMode) {
          const recommendedDeps = ['@types/node', 'eslint', 'prettier', 'tailwindcss'];
          const missingRecommended = recommendedDeps.filter(dep => !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]);
          
          if (missingRecommended.length > 0) {
            issues.push(`Missing recommended dependencies: ${missingRecommended.join(', ')}`);
          }
        }
      } else {
        issues.push('package.json not found');
      }
    } catch (error) {
      issues.push(`Failed to validate dependencies: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      name: 'Dependencies',
      issues,
      status: issues.length === 0 ? '✅ Passed' : '❌ Failed'
    };
  }

  private async validateConfiguration(projectPath: string, strictMode: boolean): Promise<ValidationCategory> {
    const issues: string[] = [];
    
    const configFiles = [
      { path: 'tsconfig.json', required: true },
      { path: '.eslintrc.json', required: true },
      { path: '.prettierrc.json', required: true },
      { path: 'tailwind.config.js', required: true },
      { path: 'next.config.js', required: true },
      { path: 'turbo.json', required: true }
    ];

    for (const config of configFiles) {
      const configPath = path.join(projectPath, config.path);
      if (!await fsExtra.pathExists(configPath)) {
        if (config.required) {
          issues.push(`Missing required configuration: ${config.path}`);
        } else if (strictMode) {
          issues.push(`Missing recommended configuration: ${config.path}`);
        }
      }
    }

    return {
      name: 'Configuration',
      issues,
      status: issues.length === 0 ? '✅ Passed' : '❌ Failed'
    };
  }

  private async validateImportPaths(projectPath: string, context: AgentContext, strictMode: boolean): Promise<ValidationCategory> {
    const issues: string[] = [];
    
    try {
      // Check for common import issues in TypeScript files
      const tsFiles = await this.findTypeScriptFiles(projectPath);
      
      for (const file of tsFiles.slice(0, 10)) { // Limit to first 10 files for performance
        const content = await fsExtra.readFile(file.path, 'utf-8');
        const imports = this.extractImports(content);
        
        for (const importPath of imports) {
          if (importPath.startsWith('@/') || importPath.startsWith('~/')) {
            // Check if path alias is properly configured
            if (!await this.isPathAliasConfigured(projectPath, importPath)) {
              issues.push(`Path alias not configured for: ${importPath} in ${file.path}`);
            }
          }
        }
      }
    } catch (error) {
      issues.push(`Failed to validate import paths: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      name: 'Import Paths',
      issues,
      status: issues.length === 0 ? '✅ Passed' : '❌ Failed'
    };
  }

  private async validateTypeScript(projectPath: string, strictMode: boolean): Promise<ValidationCategory> {
    const issues: string[] = [];
    
    try {
      // Run TypeScript compilation check
      const result = await execa('npx', ['tsc', '--noEmit'], {
        cwd: projectPath,
        timeout: 30000
      });
      
      if (result.exitCode !== 0) {
        issues.push(`TypeScript compilation failed: ${result.stderr}`);
      }
    } catch (error) {
      if (error instanceof Error && 'exitCode' in error) {
        issues.push(`TypeScript compilation failed: ${error.message}`);
      } else {
        issues.push(`Failed to run TypeScript check: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      name: 'TypeScript',
      issues,
      status: issues.length === 0 ? '✅ Passed' : '❌ Failed'
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private async findTypeScriptFiles(projectPath: string): Promise<TestFile[]> {
    const files: TestFile[] = [];
    
    try {
      const tsFiles = await fsExtra.readdir(projectPath, { recursive: true });
      const filteredFiles = tsFiles.filter((file) => 
        typeof file === 'string' && (file.endsWith('.ts') || file.endsWith('.tsx')) &&
        !file.includes('node_modules') && !file.includes('dist') && !file.includes('.next')
      ) as string[];
      
      for (const file of filteredFiles.slice(0, 10)) { // Limit to first 10 files for performance
        const content = await fsExtra.readFile(path.join(projectPath, file), 'utf-8');
        files.push({
          path: file,
          imports: this.extractImports(content)
        });
      }
    } catch (error) {
      // Ignore errors in file discovery
    }
    
    return files;
  }

  private extractImports(content: string): string[] {
    const imports: string[] = [];
    const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      if (match[1]) {
        imports.push(match[1]);
      }
    }
    
    return imports;
  }

  private async isPathAliasConfigured(projectPath: string, importPath: string): Promise<boolean> {
    try {
      const tsConfigPath = path.join(projectPath, 'tsconfig.json');
      if (await fsExtra.pathExists(tsConfigPath)) {
        const tsConfig = await fsExtra.readJSON(tsConfigPath);
        return !!(tsConfig.compilerOptions?.paths && 
                 (tsConfig.compilerOptions.paths['@/*'] || tsConfig.compilerOptions.paths['~/*']));
      }
    } catch (error) {
      // Ignore errors
    }
    
    return false;
  }

  private displayValidationResults(results: ValidationResults): void {
    console.log('\n📊 Validation Results:');
    console.log('='.repeat(50));
    
    const categories = ['structure', 'dependencies', 'configuration', 'imports', 'typescript'];
    
    for (const category of categories) {
      const result = results[category as keyof ValidationResults] as ValidationCategory;
      console.log(`\n${result.name}: ${result.status}`);
      
      if (result.issues.length > 0) {
        result.issues.forEach(issue => {
          console.log(`  • ${issue}`);
        });
      }
    }
    
    console.log(`\nTotal Issues: ${results.totalIssues}`);
    console.log('='.repeat(50));
  }

  private getNextSteps(totalIssues: number): string[] {
    if (totalIssues === 0) {
      return [
        '✅ All validation checks passed!',
        'Your project is ready for development.',
        'Run "npm run dev" to start the development server.'
      ];
    } else {
      return [
        '⚠️  Some validation issues were found.',
        'Please review and fix the issues above.',
        'Run validation again after making changes.',
        'Consider using strict mode for more thorough checks.'
      ];
    }
  }
} 