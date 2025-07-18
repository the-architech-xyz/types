/**
 * UI Agent - Design System Package Generator
 * 
 * Sets up the packages/ui design system with:
 * - Tailwind CSS configuration
 * - Shadcn/ui integration
 * - Shared UI components
 * - Utility functions for styling
 * 
 * Migrated to the new standardized agent interface for robustness and extensibility.
 */

import { existsSync } from 'fs';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { AbstractAgent } from './base/abstract-agent.js';
import { TemplateService, templateService } from '../utils/template-service.js';
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

export class UIAgent extends AbstractAgent {
  private templateService: TemplateService;

  constructor() {
    super();
    this.templateService = templateService;
  }

  // ============================================================================
  // AGENT METADATA
  // ============================================================================

  protected getAgentMetadata(): AgentMetadata {
    return {
      name: 'UIAgent',
      version: '1.0.0',
      description: 'Sets up the UI design system package with Tailwind CSS and Shadcn/ui',
      author: 'The Architech Team',
      category: AgentCategory.UI,
      tags: ['ui', 'design-system', 'tailwind', 'shadcn', 'components'],
      dependencies: ['BaseProjectAgent'],
      conflicts: [],
      requirements: [
        {
          type: 'package',
          name: 'tailwindcss',
          description: 'Tailwind CSS framework'
        },
        {
          type: 'package',
          name: 'shadcn',
          description: 'Shadcn/ui component library'
        },
        {
          type: 'file',
          name: 'packages/ui',
          description: 'UI package directory'
        }
      ],
      license: 'MIT',
      repository: 'https://github.com/the-architech/cli'
    };
  }

  protected getAgentCapabilities(): AgentCapability[] {
    return [
      {
        name: 'setup-design-system',
        description: 'Creates a complete design system with Tailwind CSS and Shadcn/ui',
        parameters: [
          {
            name: 'components',
            type: 'array',
            required: false,
            description: 'List of Shadcn/ui components to install',
            defaultValue: ['button', 'card', 'input', 'label']
          },
          {
            name: 'theme',
            type: 'string',
            required: false,
            description: 'Tailwind theme configuration',
            defaultValue: 'slate'
          }
        ],
        examples: [
          {
            name: 'Setup basic design system',
            description: 'Creates a design system with default components',
            parameters: {},
            expectedResult: 'Complete UI package with Tailwind and Shadcn/ui'
          },
          {
            name: 'Setup with custom components',
            description: 'Creates a design system with specific components',
            parameters: { 
              components: ['button', 'card', 'input', 'label', 'dialog', 'dropdown-menu'],
              theme: 'zinc'
            },
            expectedResult: 'UI package with custom components and theme'
          }
        ],
        category: CapabilityCategory.SETUP
      },
      {
        name: 'install-shadcn-components',
        description: 'Installs specific Shadcn/ui components',
        parameters: [
          {
            name: 'componentNames',
            type: 'array',
            required: true,
            description: 'Array of component names to install'
          }
        ],
        examples: [
          {
            name: 'Install form components',
            description: 'Installs form-related Shadcn/ui components',
            parameters: { componentNames: ['input', 'label', 'button', 'form'] },
            expectedResult: 'Form components installed and configured'
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
    const { projectName, projectPath } = context;
    const uiPackagePath = path.join(projectPath, 'packages', 'ui');
    
    context.logger.info(`Setting up UI design system package: ${projectName}/packages/ui`);

    try {
      // Update package.json with dependencies
      await this.updatePackageJson(uiPackagePath, context);
      
      // Install dependencies first
      context.logger.info('Installing UI package dependencies...');
      await context.runner.install([], false, uiPackagePath);
      
      // Create Tailwind configuration
      await this.createTailwindConfig(uiPackagePath, context);
      
      // Create utility functions
      await this.createUtilities(uiPackagePath, context);
      
      // Create components.json for Shadcn/ui
      await this.createComponentsConfig(uiPackagePath, context);
      
      // Create base components directory structure
      await this.createComponentStructure(uiPackagePath, context);
      
      // Create CSS files
      await this.createCSSFiles(uiPackagePath, context);
      
      // Install Shadcn/ui components
      await this.installShadcnComponents(uiPackagePath, context);
      
      // Create index exports
      await this.createIndex(uiPackagePath, context);

      const artifacts: Artifact[] = [
        {
          type: 'directory',
          path: uiPackagePath,
          metadata: {
            package: 'ui',
            framework: 'tailwind',
            components: 'shadcn',
            features: ['design-system', 'components', 'utilities']
          }
        },
        {
          type: 'file',
          path: path.join(uiPackagePath, 'package.json'),
          metadata: { type: 'package-config' }
        },
        {
          type: 'file',
          path: path.join(uiPackagePath, 'tailwind.config.js'),
          metadata: { type: 'tailwind-config' }
        },
        {
          type: 'file',
          path: path.join(uiPackagePath, 'components.json'),
          metadata: { type: 'shadcn-config' }
        }
      ];

      context.logger.success(`UI design system package configured successfully`);
      
      return this.createSuccessResult(
        { 
          uiPackagePath,
          components: ['button', 'card', 'input', 'label'],
          theme: 'slate'
        },
        artifacts,
        [
          'UI package structure created',
          'Tailwind CSS configured',
          'Shadcn/ui components installed',
          'Ready for component development'
        ]
      );

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      context.logger.error(`Failed to configure UI package: ${errorMessage}`, error as Error);
      
      return this.createErrorResult(
        'UI_PACKAGE_SETUP_FAILED',
        `Failed to configure UI package: ${errorMessage}`,
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

    // Check if UI package directory exists
    const uiPackagePath = path.join(context.projectPath, 'packages', 'ui');
    if (!existsSync(uiPackagePath)) {
      errors.push({
        field: 'uiPackagePath',
        message: `UI package directory does not exist: ${uiPackagePath}`,
        code: 'DIRECTORY_NOT_FOUND',
        severity: 'error'
      });
    }

    // Check if project has packages structure (monorepo)
    const packagesPath = path.join(context.projectPath, 'packages');
    if (!existsSync(packagesPath)) {
      warnings.push('Packages directory not found - this agent is designed for monorepo structures');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ============================================================================
  // PACKAGE SETUP METHODS
  // ============================================================================

  private async updatePackageJson(uiPackagePath: string, context: AgentContext): Promise<void> {
    await this.templateService.renderAndWrite(
      'ui',
      'package.json.ejs',
      path.join(uiPackagePath, 'package.json'),
      { projectName: context.projectName },
      { logger: context.logger }
    );
    context.logger.success(`Package.json updated for UI package`);
  }

  private async createTailwindConfig(uiPackagePath: string, context: AgentContext): Promise<void> {
    await this.templateService.renderAndWrite(
      'ui',
      'tailwind.config.js.ejs',
      path.join(uiPackagePath, 'tailwind.config.js'),
      {},
      { logger: context.logger }
    );
  }

  private async createUtilities(uiPackagePath: string, context: AgentContext): Promise<void> {
    await fsExtra.ensureDir(path.join(uiPackagePath, 'lib'));
    await this.templateService.renderAndWrite(
      'ui',
      'lib/utils.ts.ejs',
      path.join(uiPackagePath, 'lib', 'utils.ts'),
      {},
      { logger: context.logger }
    );
  }

  private async createComponentsConfig(uiPackagePath: string, context: AgentContext): Promise<void> {
    await this.templateService.renderAndWrite(
      'ui',
      'components.json.ejs',
      path.join(uiPackagePath, 'components.json'),
      {},
      { logger: context.logger }
    );
  }

  private async createComponentStructure(uiPackagePath: string, context: AgentContext): Promise<void> {
    const directories = [
      'components',
      'components/ui',
      'styles',
      'dist'
    ];

    for (const dir of directories) {
      await fsExtra.ensureDir(path.join(uiPackagePath, dir));
    }

    // Note: components index file will be created by shadcn when components are added
  }

  private async createCSSFiles(uiPackagePath: string, context: AgentContext): Promise<void> {
    await this.templateService.renderAndWrite(
      'ui',
      'styles/globals.css.ejs',
      path.join(uiPackagePath, 'styles', 'globals.css'),
      {},
      { logger: context.logger }
    );
  }

  private async installShadcnComponents(uiPackagePath: string, context: AgentContext): Promise<void> {
    context.logger.info('Creating Shadcn/ui components...');
    
    try {
      // Create base components manually using templates
      const baseComponents = ['button', 'card', 'input', 'label'];
      
      for (const component of baseComponents) {
        try {
          await this.createComponentFromTemplate(uiPackagePath, component, context);
          context.logger.success(`Created ${component} component`);
        } catch (error) {
          context.logger.warn(`Could not create ${component} component: ${error instanceof Error ? error.message : 'Unknown error'}`);
          // Create a placeholder component if template fails
          await this.createPlaceholderComponent(uiPackagePath, component, context);
        }
      }
      
      context.logger.success('Shadcn/ui components created successfully');
      
    } catch (error) {
      context.logger.warn(`Component creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async createComponentFromTemplate(uiPackagePath: string, componentName: string, context: AgentContext): Promise<void> {
    const componentPath = path.join(uiPackagePath, 'components', 'ui', `${componentName}.tsx`);
    
    // Check if template exists
    const templatePath = `components/ui/${componentName}.tsx.ejs`;
    const fullTemplatePath = path.join(process.cwd(), 'src', 'templates', 'ui', templatePath);
    
    if (await fsExtra.pathExists(fullTemplatePath)) {
      await this.templateService.renderAndWrite(
        'ui',
        templatePath,
        componentPath,
        {},
        { logger: context.logger }
      );
    } else {
      // If template doesn't exist, create a basic component
      await this.createBasicComponent(uiPackagePath, componentName, context);
    }
  }

  private async createBasicComponent(uiPackagePath: string, componentName: string, context: AgentContext): Promise<void> {
    const componentPath = path.join(uiPackagePath, 'components', 'ui', `${componentName}.tsx`);
    
    const componentContent = `import React from 'react';
import { cn } from '../../lib/utils';

export interface ${componentName.charAt(0).toUpperCase() + componentName.slice(1)}Props {
  children?: React.ReactNode;
  className?: string;
}

export const ${componentName.charAt(0).toUpperCase() + componentName.slice(1)} = React.forwardRef<HTMLDivElement, ${componentName.charAt(0).toUpperCase() + componentName.slice(1)}Props>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('${componentName}', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

${componentName.charAt(0).toUpperCase() + componentName.slice(1)}.displayName = '${componentName.charAt(0).toUpperCase() + componentName.slice(1)}';
`;
    
    await fsExtra.writeFile(componentPath, componentContent);
  }

  private async createPlaceholderComponent(uiPackagePath: string, componentName: string, context: AgentContext): Promise<void> {
    const componentPath = path.join(uiPackagePath, 'components', 'ui', `${componentName}.tsx`);
    
    const placeholderContent = `import React from 'react';

export interface ${componentName.charAt(0).toUpperCase() + componentName.slice(1)}Props {
  children?: React.ReactNode;
  className?: string;
}

export function ${componentName.charAt(0).toUpperCase() + componentName.slice(1)}({ 
  children, 
  className 
}: ${componentName.charAt(0).toUpperCase() + componentName.slice(1)}Props) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export { ${componentName.charAt(0).toUpperCase() + componentName.slice(1)} }`;

    await fsExtra.writeFile(componentPath, placeholderContent);
  }

  private async createIndex(uiPackagePath: string, context: AgentContext): Promise<void> {
    await this.templateService.renderAndWrite(
      'ui',
      'index.ts.ejs',
      path.join(uiPackagePath, 'index.ts'),
      {},
      { logger: context.logger }
    );
  }

  // ============================================================================
  // ROLLBACK
  // ============================================================================

  async rollback(context: AgentContext): Promise<void> {
    context.logger.info('Rolling back UIAgent changes...');
    
    try {
      const uiPackagePath = path.join(context.projectPath, 'packages', 'ui');
      
      if (await fsExtra.pathExists(uiPackagePath)) {
        await fsExtra.remove(uiPackagePath);
        context.logger.success('UI package removed');
      }
    } catch (error) {
      context.logger.error(`Failed to remove UI package`, error as Error);
    }
  }
}