/**
 * Base Project Agent - Structure Creator
 * 
 * Responsible for creating the core project structure (monorepo or single-app).
 * Pure structure creator - no framework installation, just structure setup.
 */

import * as path from 'path';
import fsExtra from 'fs-extra';
import { AbstractAgent } from './base/abstract-agent.js';
import { templateService } from '../utils/template-service.js';
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

export class BaseProjectAgent extends AbstractAgent {
  private templateService = templateService;

  // ============================================================================
  // AGENT METADATA
  // ============================================================================

  protected getAgentMetadata(): AgentMetadata {
    return {
      name: 'BaseProjectAgent',
      version: '2.0.0',
      description: 'Creates the foundational project structure (monorepo or single-app)',
      author: 'The Architech Team',
      category: AgentCategory.FOUNDATION,
      tags: ['project', 'foundation', 'structure', 'monorepo', 'single-app'],
      dependencies: [],
      conflicts: [],
      requirements: [
        {
          type: 'package',
          name: 'fs-extra',
          description: 'File system utilities'
        }
      ],
      license: 'MIT',
      repository: 'https://github.com/the-architech/cli'
    };
  }

  protected getAgentCapabilities(): AgentCapability[] {
    return [
      {
        name: 'create-monorepo-structure',
        description: 'Create monorepo structure with apps/ and packages/ directories',
        parameters: [
          {
            name: 'projectName',
            type: 'string',
            required: true,
            description: 'Name of the project to create'
          }
        ],
        examples: [
          {
            name: 'Create monorepo structure',
            description: 'Create apps/, packages/, turbo.json, and workspace config',
            parameters: {
              projectName: 'my-monorepo'
            },
            expectedResult: 'Monorepo structure created successfully'
          }
        ],
        category: CapabilityCategory.SETUP
      },
      {
        name: 'create-single-app-structure',
        description: 'Create single-app structure with basic configuration',
        parameters: [
          {
            name: 'projectName',
            type: 'string',
            required: true,
            description: 'Name of the project to create'
          }
        ],
        examples: [
          {
            name: 'Create single-app structure',
            description: 'Create basic structure with path aliases and config',
            parameters: {
              projectName: 'my-app'
            },
            expectedResult: 'Single-app structure created successfully'
          }
        ],
        category: CapabilityCategory.SETUP
      }
    ];
  }

  // ============================================================================
  // VALIDATION
  // ============================================================================

  async validate(context: AgentContext): Promise<ValidationResult> {
    const errors: any[] = [];
    const warnings: string[] = [];

    // Validate project name
    if (!context.projectName || context.projectName.trim().length === 0) {
      errors.push({
        field: 'projectName',
        message: 'Project name is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      });
    } else if (!/^[a-zA-Z0-9-_]+$/.test(context.projectName)) {
      errors.push({
        field: 'projectName',
        message: 'Project name can only contain letters, numbers, hyphens, and underscores',
        code: 'INVALID_FORMAT',
        severity: 'error'
      });
    }

    // Validate project path
    if (await fsExtra.pathExists(context.projectPath)) {
      errors.push({
        field: 'projectPath',
        message: `Project directory already exists: ${context.projectPath}`,
        code: 'DIRECTORY_EXISTS',
        severity: 'error'
      });
    }

    // Validate project structure
    if (!context.projectStructure) {
      errors.push({
        field: 'projectStructure',
        message: 'Project structure information is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ============================================================================
  // CORE EXECUTION - Pure Structure Creation
  // ============================================================================

  protected async executeInternal(context: AgentContext): Promise<AgentResult> {
    const { projectName, projectPath, projectStructure } = context;
    
    const structure = projectStructure?.type || context.config.structure as 'single-app' | 'monorepo' || 'single-app';
    
    context.logger.info(`Creating ${structure} structure for ${projectName}`);
    context.logger.info(`User preference: ${projectStructure?.userPreference || 'not specified'}`);

    try {
      // Start spinner for actual work
      await this.startSpinner(`🔧 Creating ${structure} structure for ${projectName}...`, context);

      // Step 1: Create the appropriate project structure
      if (structure === 'monorepo') {
        await this.createMonorepoStructure(context);
      } else {
        await this.createSingleAppStructure(context);
      }

      // Step 2: Create project configuration file
      await this.createProjectConfiguration(context, structure);

      await this.succeedSpinner(`✅ Project structure created successfully`);

      return {
        success: true,
        data: {
          projectName,
          structure,
          userPreference: projectStructure?.userPreference,
          artifacts: ['project-structure', 'configuration']
        },
        artifacts: [
          {
            type: 'directory',
            path: projectPath,
            metadata: { structure, type: 'project-root' }
          }
        ],
        duration: Date.now() - this.startTime
      };

    } catch (error) {
      await this.failSpinner(`❌ Failed to create project structure`);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult(
        'PROJECT_CREATION_FAILED',
        `Failed to create project structure: ${errorMessage}`,
        [],
        this.startTime,
        error
      );
    }
  }

  // ============================================================================
  // PRIVATE METHODS - Structure Creation
  // ============================================================================

  private async createMonorepoStructure(context: AgentContext): Promise<void> {
    const { projectPath, projectName } = context;
    
    context.logger.info('Creating monorepo structure...');
    
    // Create monorepo directories
    const appsPath = path.join(projectPath, 'apps');
    const packagesPath = path.join(projectPath, 'packages');
    
    await fsExtra.ensureDir(appsPath);
    await fsExtra.ensureDir(packagesPath);
    
    // Create package directories (removed config package)
    const uiPath = path.join(packagesPath, 'ui');
    const dbPath = path.join(packagesPath, 'db');
    const authPath = path.join(packagesPath, 'auth');
    
    await fsExtra.ensureDir(uiPath);
    await fsExtra.ensureDir(dbPath);
    await fsExtra.ensureDir(authPath);
    
    // Use template system for root-level configurations
    await this.createRootConfigurations(context);
    
    // Use template system for package configurations
    await this.createPackageConfigurations(context);
    
    context.logger.success('Monorepo structure created successfully');
  }

  private async createRootConfigurations(context: AgentContext): Promise<void> {
    const { projectPath, projectName, packageManager } = context;
    
    // Get user preferences for technologies (defaults to current stack)
    const dbTechnology = context.state.get('dbTechnology') || 'drizzle';
    const authTechnology = context.state.get('authTechnology') || 'better-auth';
    
    // Create root package.json using template
    const rootPackageJson = await this.templateService.render('shared/config/package.json.ejs', {
      projectName,
      packageManager
    });
    await fsExtra.writeFile(path.join(projectPath, 'package.json'), rootPackageJson);
    
    // Create turbo.json using template
    const turboJson = await this.templateService.render('shared/config/turbo.json.ejs', {});
    await fsExtra.writeFile(path.join(projectPath, 'turbo.json'), turboJson);
    
    // Create base tsconfig.json using template
    const tsconfigBase = await this.templateService.render('shared/config/tsconfig.base.json.ejs', {});
    await fsExtra.writeFile(path.join(projectPath, 'tsconfig.base.json'), tsconfigBase);
    
    // Create .env.example using template
    const envExample = await this.templateService.render('shared/config/.env.example.ejs', {
      dbTechnology,
      authTechnology
    });
    await fsExtra.writeFile(path.join(projectPath, '.env.example'), envExample);
    
    // Create README
    const readme = `# ${projectName}

This is a monorepo built with Turborepo.

## Apps

- \`apps/web\` - Main web application

## Packages

- \`packages/ui\` - Shared UI components and design system
- \`packages/db\` - Database layer (${dbTechnology})
- \`packages/auth\` - Authentication system (${authTechnology})

## Development

\`\`\`bash
npm install
npm run dev
\`\`\`

## Available Scripts

- \`dev\` - Start development server
- \`build\` - Build all packages and apps
- \`lint\` - Lint all packages and apps
- \`type-check\` - Type check all packages and apps
- \`clean\` - Clean all build artifacts
`;
    
    await fsExtra.writeFile(path.join(projectPath, 'README.md'), readme);
  }

  private async createPackageConfigurations(context: AgentContext): Promise<void> {
    const { projectPath, projectName } = context;
    const packagesPath = path.join(projectPath, 'packages');
    
    // Get user preferences for technologies
    const dbTechnology = context.state.get('dbTechnology') || 'drizzle';
    const authTechnology = context.state.get('authTechnology') || 'better-auth';
    
    // Create package configurations using dynamic templates (removed config package)
    const packages = [
      { name: 'ui', type: 'ui' },
      { name: 'db', type: 'db', technology: dbTechnology },
      { name: 'auth', type: 'auth', technology: authTechnology }
    ];
    
    for (const pkg of packages) {
      const packagePath = path.join(packagesPath, pkg.name);
      
      // Create package.json using dynamic template
      const packageJson = await this.templateService.render('shared/packages/package.json.ejs', {
        projectName,
        packageName: pkg.name,
        packageType: pkg.type,
        dbTechnology: pkg.technology || dbTechnology,
        authTechnology: pkg.technology || authTechnology
      });
      await fsExtra.writeFile(path.join(packagePath, 'package.json'), packageJson);
      
      // Create tsconfig.json using dynamic template
      const tsconfig = await this.templateService.render('shared/packages/tsconfig.json.ejs', {
        packageType: pkg.type
      });
      await fsExtra.writeFile(path.join(packagePath, 'tsconfig.json'), tsconfig);
      
      // Create index.ts using dynamic template
      const indexTs = await this.templateService.render('shared/packages/index.ts.ejs', {
        packageType: pkg.type,
        dbTechnology: pkg.technology || dbTechnology,
        authTechnology: pkg.technology || authTechnology
      });
      
      // Create src directory and index.ts
      const srcPath = path.join(packagePath, 'src');
      await fsExtra.ensureDir(srcPath);
      await fsExtra.writeFile(path.join(srcPath, 'index.ts'), indexTs);
    }
  }

  private async createSingleAppStructure(context: AgentContext): Promise<void> {
    const { projectPath, projectName } = context;
    
    context.logger.info('Creating single-app structure...');
    
    // For single-app, we DON'T create the project directory
    // FrameworkAgent will handle creating the complete Next.js project structure
    // This avoids conflicts with create-next-app
    
    // Only create the parent directory if it doesn't exist
    const parentDir = path.dirname(projectPath);
    await fsExtra.ensureDir(parentDir);
    
    context.logger.info('Single-app structure prepared - FrameworkAgent will create the project directory');
    context.logger.success('Single-app structure created successfully');
  }

  private async createProjectConfiguration(context: AgentContext, structure: 'single-app' | 'monorepo'): Promise<void> {
    const { projectPath, projectName, projectStructure } = context;
    
    // Create architech configuration file
    const architechConfig = {
      name: projectName,
      version: '0.1.0',
      structure,
      userPreference: projectStructure?.userPreference,
      framework: projectStructure?.template,
      packageManager: context.packageManager,
      createdAt: new Date().toISOString(),
      plugins: [],
      agents: []
    };

    if (structure === 'monorepo') {
      // For monorepo, create the config file immediately
      const configPath = path.join(projectPath, '.architech.json');
      await fsExtra.writeJSON(configPath, architechConfig, { spaces: 2 });
    } else {
      // For single-app, store the config to be created after FrameworkAgent runs
      context.state.set('architechConfig', architechConfig);
      context.state.set('architechConfigPath', path.join(projectPath, '.architech.json'));
    }
  }
} 