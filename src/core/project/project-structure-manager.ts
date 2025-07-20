/**
 * Project Structure Manager
 * 
 * Abstracts project structure handling to make the CLI framework-agnostic
 * and structure-agnostic. Supports both single-app and monorepo structures.
 */

import * as path from 'path';
import fsExtra from 'fs-extra';
import { Logger } from '../../types/agent.js';
import { TemplateService } from '../templates/template-service.js';

export type ProjectStructure = 'single-app' | 'monorepo';

export interface StructureConfig {
  type: ProjectStructure;
  framework: string;
  packages?: string[];
  apps?: string[];
  rootConfig?: boolean;
  sharedConfig?: boolean;
}

export interface DirectoryStructure {
  root: string[];
  apps: Record<string, string[]>;
  packages: Record<string, string[]>;
  shared: string[];
}

export interface FileStructure {
  root: string[];
  apps: Record<string, string[]>;
  packages: Record<string, string[]>;
  shared: string[];
}

export class ProjectStructureManager {
  private logger?: Logger;
  private templateService: TemplateService;

  constructor(templateService: TemplateService, logger?: Logger) {
    this.templateService = templateService;
    if (logger) {
      this.logger = logger;
    }
  }

  /**
   * Create project structure based on configuration
   */
  async createStructure(
    projectPath: string,
    config: StructureConfig,
    templateData: Record<string, any>
  ): Promise<void> {
    this.logger?.info(`Creating ${config.type} structure for ${config.framework}`);

    try {
      // Create base project directory
      await fsExtra.ensureDir(projectPath);

      // Get structure definitions
      const directories = this.getDirectoryStructure(config);
      const files = this.getFileStructure(config);

      // Create directories
      await this.createDirectories(projectPath, directories);

      // Create files
      await this.createFiles(projectPath, files, config, templateData);

      this.logger?.success(`Project structure created successfully`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger?.error(`Failed to create project structure: ${errorMessage}`, error as Error);
      throw error;
    }
  }

  /**
   * Get directory structure based on configuration
   */
  private getDirectoryStructure(config: StructureConfig): DirectoryStructure {
    const structure: DirectoryStructure = {
      root: [],
      apps: {},
      packages: {},
      shared: []
    };

    if (config.type === 'monorepo') {
      // Monorepo structure
      structure.root = [
        'apps',
        'packages',
        'docs',
        '.github',
        '.github/workflows'
      ];

      // App directories - only the web app needs the full src structure
      if (config.apps) {
        for (const app of config.apps) {
          structure.apps[app] = [
            'src',
            'src/app',
            'src/components',
            'src/lib',
            'src/types',
            'public'
          ];
        }
      } else {
        // Default web app
        structure.apps['web'] = [
          'src',
          'src/app',
          'src/components',
          'src/lib',
          'src/types',
          'public'
        ];
      }

      // Package directories - minimal structure, no unnecessary src subdirectories
      if (config.packages) {
        for (const pkg of config.packages) {
          // Only create the package root directory, no src subdirectories
          structure.packages[pkg] = [];
        }
      } else {
        // Default packages - minimal structure
        structure.packages = {
          'ui': [],
          'db': [],
          'auth': [],
          'config': []
        };
      }

    } else {
      // Single app structure
      structure.root = [
        'src',
        'src/app',
        'src/components',
        'src/lib',
        'src/types',
        'public',
        '.github',
        '.github/workflows'
      ];
    }

    return structure;
  }

  /**
   * Get file structure based on configuration
   */
  private getFileStructure(config: StructureConfig): FileStructure {
    const structure: FileStructure = {
      root: [],
      apps: {},
      packages: {},
      shared: []
    };

    // Root files (common to both structures)
    structure.root = [
      'package.json',
      'tsconfig.json',
      '.eslintrc.json',
      '.prettierrc.json',
      '.gitignore',
      'README.md'
    ];

    if (config.type === 'monorepo') {
      // Monorepo-specific root files
      structure.root.push('turbo.json');
      structure.root.push('components.json');

      // App files
      if (config.apps) {
        for (const app of config.apps) {
          structure.apps[app] = [
            'package.json',
            'tsconfig.json',
            'next.config.js',
            'tailwind.config.ts',
            'postcss.config.js',
            'next-env.d.ts',
            '.eslintrc.json',
            '.gitignore',
            'README.md'
          ];
        }
      } else {
        // Default web app files
        structure.apps['web'] = [
          'package.json',
          'tsconfig.json',
          'next.config.js',
          'tailwind.config.ts',
          'postcss.config.js',
          'next-env.d.ts',
          '.eslintrc.json',
          '.gitignore',
          'README.md'
        ];
      }

      // Package files
      if (config.packages) {
        for (const pkg of config.packages) {
          structure.packages[pkg] = [
            'package.json',
            'tsconfig.json',
            'index.ts',
            'README.md'
          ];
        }
      } else {
        // Default package files
        structure.packages = {
          'ui': ['package.json', 'tsconfig.json', 'index.ts', 'README.md'],
          'db': ['package.json', 'tsconfig.json', 'index.ts', 'README.md'],
          'auth': ['package.json', 'tsconfig.json', 'index.ts', 'README.md'],
          'config': ['package.json', 'tsconfig.json', 'index.ts', 'README.md']
        };
      }

    } else {
      // Single app files
      structure.root.push('next.config.js');
      structure.root.push('tailwind.config.ts');
      structure.root.push('postcss.config.js');
      structure.root.push('next-env.d.ts');
      structure.root.push('components.json');
    }

    return structure;
  }

  /**
   * Create directories recursively
   */
  private async createDirectories(projectPath: string, structure: DirectoryStructure): Promise<void> {
    // Create root directories
    for (const dir of structure.root) {
      await fsExtra.ensureDir(path.join(projectPath, dir));
    }

    // Create app directories
    for (const [appName, dirs] of Object.entries(structure.apps)) {
      for (const dir of dirs) {
        await fsExtra.ensureDir(path.join(projectPath, 'apps', appName, dir));
      }
    }

    // Create package directories - ensure package root directories exist even if empty
    for (const [pkgName, dirs] of Object.entries(structure.packages)) {
      // Always create the package root directory
      await fsExtra.ensureDir(path.join(projectPath, 'packages', pkgName));
      
      // Create subdirectories if any are specified
      for (const dir of dirs) {
        await fsExtra.ensureDir(path.join(projectPath, 'packages', pkgName, dir));
      }
    }

    // Create shared directories
    for (const dir of structure.shared) {
      await fsExtra.ensureDir(path.join(projectPath, dir));
    }
  }

  /**
   * Create files using templates
   */
  private async createFiles(
    projectPath: string,
    structure: FileStructure,
    config: StructureConfig,
    templateData: Record<string, any>
  ): Promise<void> {
    // Create root files
    await this.createRootFiles(projectPath, structure.root, config, templateData);

    // Create app files
    await this.createAppFiles(projectPath, structure.apps, config, templateData);

    // Create package files
    await this.createPackageFiles(projectPath, structure.packages, config, templateData);

    // Create shared files
    await this.createSharedFiles(projectPath, structure.shared, config, templateData);

    // Create framework-specific files for single-app structure
    if (config.type === 'single-app') {
      await this.createSingleAppFrameworkFiles(projectPath, config.framework, templateData);
    }
  }

  /**
   * Create root-level files
   */
  private async createRootFiles(
    projectPath: string,
    files: string[],
    config: StructureConfig,
    templateData: Record<string, any>
  ): Promise<void> {
    const isMonorepo = config.type === 'monorepo';
    const templateVars = {
      ...templateData,
      isMonorepo,
      framework: config.framework
    };

    this.logger?.info(`Creating ${files.length} root files for ${config.type} structure`);

    for (const file of files) {
      const outputPath = path.join(projectPath, file);
      
      try {
        this.logger?.info(`Creating root file: ${file}`);
        
        if (file === 'package.json') {
          const templatePath = isMonorepo ? 'shared/scripts/monorepo-package.json.ejs' : 'shared/scripts/package.json.ejs';
          this.logger?.info(`Using template: ${templatePath}`);
          try {
            await this.templateService.renderAndWriteNew('shared', templatePath, outputPath, templateVars);
            this.logger?.success(`Created package.json at ${outputPath}`);
          } catch (templateError) {
            this.logger?.warn(`Template failed, creating basic package.json: ${templateError instanceof Error ? templateError.message : 'Unknown error'}`);
            // Create a basic package.json as fallback
            const basicPackageJson = {
              name: templateData.projectName || 'my-app',
              version: '0.1.0',
              private: true,
              scripts: {
                dev: 'next dev',
                build: 'next build',
                start: 'next start',
                lint: 'next lint'
              },
              dependencies: {
                next: '^14.2.0',
                react: '^18.3.0',
                'react-dom': '^18.3.0'
              },
              devDependencies: {
                '@types/node': '^20.0.0',
                '@types/react': '^18.0.0',
                '@types/react-dom': '^18.0.0',
                typescript: '^5.4.0'
              }
            };
            await fsExtra.writeJson(outputPath, basicPackageJson, { spaces: 2 });
            this.logger?.success(`Created fallback package.json at ${outputPath}`);
          }
        } else if (file === 'tsconfig.json') {
          await this.templateService.renderAndWriteNew('shared', 'config/tsconfig.json.ejs', outputPath, templateVars);
        } else if (file === '.eslintrc.json') {
          await this.templateService.renderAndWriteNew('shared', 'config/eslint.config.js.ejs', outputPath, templateVars);
        } else if (file === '.prettierrc.json') {
          await this.templateService.renderAndWriteNew('shared', 'config/prettier.config.js.ejs', outputPath, templateVars);
        } else if (file === '.gitignore') {
          await this.templateService.renderAndWriteNew('shared', 'config/gitignore.ejs', outputPath, templateVars);
        } else if (file === 'README.md') {
          await this.templateService.renderAndWriteNew('shared', 'docs/README.md.ejs', outputPath, templateVars);
        } else if (file === 'turbo.json') {
          await this.templateService.renderAndWriteNew('shared', 'config/turbo.json.ejs', outputPath, templateVars);
        } else if (file === 'components.json') {
          await this.templateService.renderAndWriteNew('shared', 'config/components.json.ejs', outputPath, templateVars);
        } else if (file === 'tailwind.config.ts') {
          await this.templateService.renderAndWriteNew('shared', 'config/tailwind.config.ts.ejs', outputPath, templateVars);
        } else if (file === 'next.config.js') {
          await this.templateService.renderAndWriteNew('frameworks', 'nextjs/config/next.config.js.ejs', outputPath, templateVars);
        } else if (file === 'postcss.config.js') {
          await this.templateService.renderAndWriteNew('frameworks', 'nextjs/config/postcss.config.js.ejs', outputPath, templateVars);
        } else if (file === 'next-env.d.ts') {
          // Create empty next-env.d.ts file
          await fsExtra.writeFile(outputPath, '/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n');
        }
      } catch (error) {
        this.logger?.error(`Failed to create root file ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`, error as Error);
      }
    }
  }

  /**
   * Create app-specific files
   */
  private async createAppFiles(
    projectPath: string,
    apps: Record<string, string[]>,
    config: StructureConfig,
    templateData: Record<string, any>
  ): Promise<void> {
    for (const [appName, files] of Object.entries(apps)) {
      const appPath = path.join(projectPath, 'apps', appName);
      const templateVars = {
        ...templateData,
        appName,
        isMonorepo: config.type === 'monorepo',
        framework: config.framework
      };

      for (const file of files) {
        const outputPath = path.join(appPath, file);
        
        try {
          if (file === 'package.json') {
            await this.templateService.renderAndWriteNew('shared', 'scripts/package.json.ejs', outputPath, templateVars);
          } else if (file === 'tsconfig.json') {
            await this.templateService.renderAndWriteNew('shared', 'config/tsconfig.json.ejs', outputPath, templateVars);
          } else if (file === 'next.config.js') {
            await this.templateService.renderAndWriteNew('frameworks', 'nextjs/config/next.config.js.ejs', outputPath, templateVars);
          } else if (file === 'tailwind.config.ts') {
            await this.templateService.renderAndWriteNew('shared', 'config/tailwind.config.ts.ejs', outputPath, templateVars);
          } else if (file === 'postcss.config.js') {
            await this.templateService.renderAndWriteNew('frameworks', 'nextjs/config/postcss.config.js.ejs', outputPath, templateVars);
          } else if (file === 'next-env.d.ts') {
            await fsExtra.writeFile(outputPath, '/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n');
          } else if (file === '.eslintrc.json') {
            await this.templateService.renderAndWriteNew('shared', 'config/eslint.config.js.ejs', outputPath, templateVars);
          } else if (file === '.gitignore') {
            await this.templateService.renderAndWriteNew('shared', 'config/gitignore.ejs', outputPath, templateVars);
          } else if (file === 'README.md') {
            await this.templateService.renderAndWriteNew('shared', 'docs/README.md.ejs', outputPath, templateVars);
          }
        } catch (error) {
          this.logger?.warn(`Failed to create app file ${appName}/${file}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Create framework-specific app files
      await this.createFrameworkAppFiles(appPath, config.framework, templateVars);
    }
  }

  /**
   * Create framework-specific app files
   */
  private async createFrameworkAppFiles(
    appPath: string,
    framework: string,
    templateData: Record<string, any>
  ): Promise<void> {
    if (framework === 'nextjs' || framework === 'nextjs-14') {
      // Create Next.js app files
      const appSrcPath = path.join(appPath, 'src', 'app');
      
      try {
        await this.templateService.renderAndWriteNew('frameworks', 'nextjs/app/layout.tsx.ejs', path.join(appSrcPath, 'layout.tsx'), templateData);
        await this.templateService.renderAndWriteNew('frameworks', 'nextjs/app/page.tsx.ejs', path.join(appSrcPath, 'page.tsx'), templateData);
        await this.templateService.renderAndWriteNew('frameworks', 'nextjs/app/globals.css.ejs', path.join(appSrcPath, 'globals.css'), templateData);
      } catch (error) {
        this.logger?.warn(`Failed to create Next.js app files: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Create framework-specific app files for single-app structure
   */
  private async createSingleAppFrameworkFiles(
    projectPath: string,
    framework: string,
    templateData: Record<string, any>
  ): Promise<void> {
    if (framework === 'nextjs' || framework === 'nextjs-14') {
      // Create Next.js app files in root src/app
      const appSrcPath = path.join(projectPath, 'src', 'app');
      
      try {
        await this.templateService.renderAndWriteNew('frameworks', 'nextjs/app/layout.tsx.ejs', path.join(appSrcPath, 'layout.tsx'), templateData);
        await this.templateService.renderAndWriteNew('frameworks', 'nextjs/app/page.tsx.ejs', path.join(appSrcPath, 'page.tsx'), templateData);
        await this.templateService.renderAndWriteNew('frameworks', 'nextjs/app/globals.css.ejs', path.join(appSrcPath, 'globals.css'), templateData);
      } catch (error) {
        this.logger?.warn(`Failed to create Next.js app files: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Create package-specific files
   */
  private async createPackageFiles(
    projectPath: string,
    packages: Record<string, string[]>,
    config: StructureConfig,
    templateData: Record<string, any>
  ): Promise<void> {
    for (const [pkgName, files] of Object.entries(packages)) {
      const pkgPath = path.join(projectPath, 'packages', pkgName);
      const templateVars = {
        ...templateData,
        packageName: pkgName,
        isMonorepo: config.type === 'monorepo',
        framework: config.framework
      };

      for (const file of files) {
        const outputPath = path.join(pkgPath, file);
        
        try {
          if (file === 'package.json') {
            // Create package-specific package.json
            const packageDependencies = this.getPackageDependencies(pkgName);
            await this.templateService.renderAndWriteNew('shared', 'scripts/package.json.ejs', outputPath, {
              ...templateVars,
              dependencies: packageDependencies
            });
          } else if (file === 'tsconfig.json') {
            await this.templateService.renderAndWriteNew('shared', 'config/tsconfig.json.ejs', outputPath, templateVars);
          } else if (file === 'index.ts') {
            await this.templateService.renderAndWriteNew('shared', 'packages/index.ts.ejs', outputPath, templateVars);
          } else if (file === 'README.md') {
            await this.templateService.renderAndWriteNew('shared', 'docs/README.md.ejs', outputPath, templateVars);
          }
        } catch (error) {
          this.logger?.warn(`Failed to create package file ${pkgName}/${file}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }
  }

  /**
   * Create shared files
   */
  private async createSharedFiles(
    projectPath: string,
    files: string[],
    config: StructureConfig,
    templateData: Record<string, any>
  ): Promise<void> {
    // Currently no shared files, but this is where they would go
    // This could include things like shared utilities, types, etc.
  }

  /**
   * Get package-specific dependencies
   */
  private getPackageDependencies(packageName: string): Record<string, string> {
    const dependencies: Record<string, Record<string, string>> = {
      ui: {
        'react': '^18.3.0',
        'react-dom': '^18.3.0',
        'tailwindcss': '^3.4.0',
        'tailwindcss-animate': '^1.0.7',
        'class-variance-authority': '^0.7.0',
        'clsx': '^2.1.0',
        'lucide-react': '^0.400.0',
        'tailwind-merge': '^2.2.0'
      },
      db: {
        'drizzle-orm': '^0.30.0',
        'drizzle-kit': '^0.21.0',
        '@neondatabase/serverless': '^0.9.0'
      },
      auth: {
        'better-auth': '^0.20.0',
        '@better-auth/drizzle': '^0.20.0'
      },
      config: {
        '@types/node': '^20.0.0',
        'typescript': '^5.4.0'
      }
    };

    return dependencies[packageName] || {};
  }

  /**
   * Validate project structure
   */
  async validateStructure(projectPath: string, config: StructureConfig): Promise<boolean> {
    try {
      const directories = this.getDirectoryStructure(config);
      const files = this.getFileStructure(config);

      // Validate directories
      for (const dir of directories.root) {
        if (!await fsExtra.pathExists(path.join(projectPath, dir))) {
          this.logger?.error(`Missing root directory: ${dir}`);
          return false;
        }
      }

      // Validate app directories (only for monorepo)
      if (config.type === 'monorepo') {
        for (const [appName, dirs] of Object.entries(directories.apps)) {
          for (const dir of dirs) {
            if (!await fsExtra.pathExists(path.join(projectPath, 'apps', appName, dir))) {
              this.logger?.error(`Missing app directory: apps/${appName}/${dir}`);
              return false;
            }
          }
        }

        // Validate package directories (only for monorepo)
        for (const [pkgName, dirs] of Object.entries(directories.packages)) {
          for (const dir of dirs) {
            if (!await fsExtra.pathExists(path.join(projectPath, 'packages', pkgName, dir))) {
              this.logger?.error(`Missing package directory: packages/${pkgName}/${dir}`);
              return false;
            }
          }
        }
      }

      // Validate files
      for (const file of files.root) {
        if (!await fsExtra.pathExists(path.join(projectPath, file))) {
          this.logger?.error(`Missing root file: ${file}`);
          return false;
        }
      }

      // Validate framework-specific files for single-app
      if (config.type === 'single-app') {
        const appFiles = ['src/app/layout.tsx', 'src/app/page.tsx', 'src/app/globals.css'];
        for (const file of appFiles) {
          if (!await fsExtra.pathExists(path.join(projectPath, file))) {
            this.logger?.error(`Missing app file: ${file}`);
            return false;
          }
        }
      }

      this.logger?.success('Project structure validation passed');
      return true;

    } catch (error) {
      this.logger?.error(`Structure validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }
} 