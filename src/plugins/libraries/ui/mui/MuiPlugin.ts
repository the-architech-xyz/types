/**
 * MUI (Material-UI) Plugin - Pure Technology Implementation
 * 
 * Provides MUI component library integration using the latest v6.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */

import { IPlugin, PluginMetadata, PluginArtifact, ValidationResult, PluginCategory, PluginContext, PluginResult, TargetPlatform, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../../types/plugin.js';
import { TemplateService, templateService } from '../../../core/templates/template-service.js';
import { CommandRunner } from '../../../core/cli/command-runner.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { structureService, StructureInfo } from '../../../core/project/structure-service.js';
import { MuiConfig, MuiConfigSchema, MuiDefaultConfig } from './MuiSchema.js';
import { MuiGenerator } from './MuiGenerator.js';

export class MuiPlugin implements IPlugin {
  private templateService: TemplateService;
  private runner: CommandRunner;

  constructor() {
    this.templateService = templateService;
    this.runner = new CommandRunner();
  }

  // ============================================================================
  // PLUGIN METADATA
  // ============================================================================

  getMetadata(): PluginMetadata {
    return {
      id: 'mui',
      name: 'Material-UI (MUI)',
      version: '1.0.0',
      description: 'React component library implementing Google\'s Material Design',
      author: 'The Architech Team',
      category: PluginCategory.UI_LIBRARY,
      tags: ['ui', 'components', 'material-design', 'react', 'enterprise'],
      license: 'MIT',
      repository: 'https://github.com/mui/material-ui',
      homepage: 'https://mui.com'
    };
  }

  // ============================================================================
  // PLUGIN LIFECYCLE - Pure Technology Implementation
  // ============================================================================

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      const { projectPath, pluginConfig } = context;
      
      context.logger.info('Installing Material-UI component library...');

      // Step 1: Install dependencies
      await this.installDependencies(context);

      // Step 2: Create MUI configuration
      await this.createMuiConfig(context);

      // Step 3: Create UI components structure
      await this.createUIComponents(context);

      // Step 4: Create package exports
      await this.createPackageExports(context);

      // Step 5: Generate unified interface files
      await this.generateUnifiedInterfaceFiles(context);

      const duration = Date.now() - startTime;

      return {
        success: true,
        artifacts: [
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'ui', 'index.ts')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'ui', 'theme.ts')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'components', 'ui', 'button.tsx')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'components', 'ui', 'card.tsx')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'components', 'ui', 'input.tsx')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'components', 'ui', 'form.tsx')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'components', 'ui', 'dialog.tsx')
          }
        ],
        dependencies: [
          {
            name: '@mui/material',
            version: '^6.0.0',
            type: 'production',
            category: PluginCategory.UI_LIBRARY
          },
          {
            name: '@mui/icons-material',
            version: '^6.0.0',
            type: 'production',
            category: PluginCategory.UI_LIBRARY
          },
          {
            name: '@emotion/react',
            version: '^11.11.0',
            type: 'production',
            category: PluginCategory.UI_LIBRARY
          },
          {
            name: '@emotion/styled',
            version: '^11.11.0',
            type: 'production',
            category: PluginCategory.UI_LIBRARY
          },
          {
            name: '@mui/system',
            version: '^6.0.0',
            type: 'production',
            category: PluginCategory.UI_LIBRARY
          }
        ],
        scripts: [
          {
            name: 'storybook',
            command: 'storybook dev -p 6006',
            description: 'Start Storybook for component development',
            category: 'dev'
          }
        ],
        configs: [
          {
            file: 'mui.config.ts',
            content: MuiGenerator.generateThemeConfig(pluginConfig as MuiConfig),
            mergeStrategy: 'replace'
          }
        ],
        errors: [],
        warnings: [],
        duration
      };
    } catch (error) {
      return this.createErrorResult(
        'Failed to install Material-UI',
        startTime,
        [],
        error
      );
    }
  }

  async uninstall(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      const { projectPath } = context;
      
      context.logger.info('Uninstalling Material-UI...');

      // Remove MUI dependencies
      await this.runner.execCommand(['npm', 'uninstall', '@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled', '@mui/system'], { cwd: projectPath });

      // Remove configuration files
      const configPath = path.join(projectPath, 'mui.config.ts');
      if (await fsExtra.pathExists(configPath)) {
        await fsExtra.remove(configPath);
      }

      // Remove UI components
      const uiPath = path.join(projectPath, 'src', 'components', 'ui');
      if (await fsExtra.pathExists(uiPath)) {
        await fsExtra.remove(uiPath);
      }

      // Remove unified interface files
      const unifiedPath = path.join(projectPath, 'src', 'lib', 'ui');
      if (await fsExtra.pathExists(unifiedPath)) {
        await fsExtra.remove(unifiedPath);
      }

      const duration = Date.now() - startTime;

      return {
        success: true,
        artifacts: [],
        dependencies: [],
        scripts: [],
        configs: [],
        errors: [],
        warnings: [],
        duration
      };
    } catch (error) {
      return this.createErrorResult(
        'Failed to uninstall Material-UI',
        startTime,
        [],
        error
      );
    }
  }

  async update(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      const { projectPath } = context;
      
      context.logger.info('Updating Material-UI...');

      // Update MUI dependencies
      await this.runner.execCommand(['npm', 'update', '@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled', '@mui/system'], { cwd: projectPath });

      const duration = Date.now() - startTime;

      return {
        success: true,
        artifacts: [],
        dependencies: [],
        scripts: [],
        configs: [],
        errors: [],
        warnings: [],
        duration
      };
    } catch (error) {
      return this.createErrorResult(
        'Failed to update Material-UI',
        startTime,
        [],
        error
      );
    }
  }

  async validate(context: PluginContext): Promise<ValidationResult> {
    const errors: any[] = [];
    const warnings: string[] = [];

    try {
      const { projectPath } = context;

      // Check if package.json exists
      const packageJsonPath = path.join(projectPath, 'package.json');
      if (!await fsExtra.pathExists(packageJsonPath)) {
        errors.push({
          code: 'MISSING_PACKAGE_JSON',
          message: 'package.json not found in project directory',
          severity: 'error'
        });
      }

      // Check if it's a React project
      const packageJson = await fsExtra.readJson(packageJsonPath);
      if (!packageJson.dependencies?.react && !packageJson.dependencies?.['@types/react']) {
        errors.push({
          code: 'NOT_REACT_PROJECT',
          message: 'Material-UI requires a React project',
          severity: 'error'
        });
      }

      // Check Node.js version
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion?.slice(1).split('.')[0] || '16');
      if (majorVersion < 16) {
        errors.push({
          code: 'NODE_VERSION_TOO_OLD',
          message: 'Node.js 16 or higher is required for Material-UI',
          severity: 'error'
        });
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      errors.push({
        code: 'VALIDATION_ERROR',
        message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });

      return {
        valid: false,
        errors,
        warnings
      };
    }
  }

  getCompatibility(): CompatibilityMatrix {
    return {
      frameworks: ['nextjs', 'react', 'vite'],
      platforms: [TargetPlatform.WEB, TargetPlatform.MOBILE],
      nodeVersions: ['>=16.0.0'],
      packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
      databases: [],
      uiLibraries: [],
      conflicts: ['shadcn-ui', 'tamagui', 'chakra-ui'] // Conflicts with other UI libraries
    };
  }

  getDependencies(): string[] {
    return ['react', '@types/react'];
  }

  getConflicts(): string[] {
    return ['shadcn-ui', 'tamagui', 'chakra-ui'];
  }

  getRequirements(): PluginRequirement[] {
    return [
      {
        type: 'package',
        name: 'react',
        description: 'React 18 or higher',
        version: '^18.0.0'
      },
      {
        type: 'package',
        name: '@types/react',
        description: 'React TypeScript definitions',
        version: '^18.0.0'
      },
      {
        type: 'binary',
        name: 'node',
        description: 'Node.js 16 or higher',
        version: '>=16.0.0'
      }
    ];
  }

  getDefaultConfig(): Record<string, any> {
    return MuiDefaultConfig;
  }

  getConfigSchema(): ConfigSchema {
    return MuiConfigSchema;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private async installDependencies(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Installing Material-UI dependencies...');

    const dependencies = [
      '@mui/material@^6.0.0',
      '@mui/icons-material@^6.0.0',
      '@emotion/react@^11.11.0',
      '@emotion/styled@^11.11.0',
      '@mui/system@^6.0.0'
    ];

    await this.runner.execCommand(['npm', 'install', ...dependencies], { cwd: projectPath });
  }

  private async createMuiConfig(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    context.logger.info('Creating Material-UI configuration...');

    const configContent = MuiGenerator.generateThemeConfig(pluginConfig as MuiConfig);
    await fsExtra.writeFile(path.join(projectPath, 'mui.config.ts'), configContent);
  }

  private async createUIComponents(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    context.logger.info('Creating Material-UI components...');

    const componentsPath = path.join(projectPath, 'src', 'components', 'ui');
    await fsExtra.ensureDir(componentsPath);

    // Create Button component
    await this.createButtonComponent(componentsPath);

    // Create Card component
    await this.createCardComponent(componentsPath);

    // Create Input component
    await this.createInputComponent(componentsPath);

    // Create Form component
    await this.createFormComponent(componentsPath);

    // Create Dialog component
    await this.createDialogComponent(componentsPath);
  }

  private async createButtonComponent(componentsPath: string): Promise<void> {
    const buttonContent = MuiGenerator.generateComponentExamples({} as MuiConfig);
    await fsExtra.writeFile(path.join(componentsPath, 'button.tsx'), buttonContent);
  }

  private async createCardComponent(componentsPath: string): Promise<void> {
    const cardContent = MuiGenerator.generateComponentExamples({} as MuiConfig);
    await fsExtra.writeFile(path.join(componentsPath, 'card.tsx'), cardContent);
  }

  private async createInputComponent(componentsPath: string): Promise<void> {
    const inputContent = MuiGenerator.generateComponentExamples({} as MuiConfig);
    await fsExtra.writeFile(path.join(componentsPath, 'input.tsx'), inputContent);
  }

  private async createFormComponent(componentsPath: string): Promise<void> {
    const formContent = MuiGenerator.generateComponentExamples({} as MuiConfig);
    await fsExtra.writeFile(path.join(componentsPath, 'form.tsx'), formContent);
  }

  private async createDialogComponent(componentsPath: string): Promise<void> {
    const dialogContent = MuiGenerator.generateComponentExamples({} as MuiConfig);
    await fsExtra.writeFile(path.join(componentsPath, 'dialog.tsx'), dialogContent);
  }

  private async createPackageExports(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Creating package exports...');

    const exportsContent = MuiGenerator.generateUnifiedIndex();
    await fsExtra.writeFile(path.join(projectPath, 'src', 'lib', 'ui', 'exports.ts'), exportsContent);
  }

  private async generateUnifiedInterfaceFiles(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    const structure = context.projectStructure!;
    
    // For monorepo projects, generate files directly in the package directory
    // For single app projects, use the structure service to get the correct path
    let unifiedPath: string;
    if (structure.isMonorepo) {
      // In monorepo, we're already in the package directory (packages/ui)
      unifiedPath = projectPath;
    } else {
      // In single app, use the structure service to get the correct path
      unifiedPath = structureService.getUnifiedInterfacePath(projectPath, structure, 'ui');
    }
    
    await fsExtra.ensureDir(unifiedPath);

    // Create index.ts for the unified interface
    const indexContent = MuiGenerator.generateUnifiedIndex();
    await fsExtra.writeFile(path.join(unifiedPath, 'index.ts'), indexContent);

    // Create theme.ts for the unified interface
    const themeContent = MuiGenerator.generateThemeConfig(pluginConfig as MuiConfig);
    await fsExtra.writeFile(path.join(unifiedPath, 'theme.ts'), themeContent);

    // Create utils.ts for the unified interface
    const utilsContent = MuiGenerator.generateEnvConfig(pluginConfig as MuiConfig);
    await fsExtra.writeFile(path.join(unifiedPath, 'utils.ts'), utilsContent);
  }

  private createErrorResult(
    message: string,
    startTime: number,
    errors: any[] = [],
    originalError?: any
  ): PluginResult {
    const duration = Date.now() - startTime;
    
    if (originalError) {
      errors.push({
        code: 'MUI_INSTALL_ERROR',
        message: originalError instanceof Error ? originalError.message : String(originalError),
        severity: 'error',
        details: originalError
      });
    }

    return {
      success: false,
      artifacts: [],
      dependencies: [],
      scripts: [],
      configs: [],
      errors,
      warnings: [],
      duration
    };
  }
} 