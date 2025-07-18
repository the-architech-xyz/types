/**
 * Config Agent - Root Configuration Generator
 * 
 * Sets up shared configurations directly in the project root:
 * - ESLint rules for TypeScript and React
 * - Prettier formatting configuration
 * - TypeScript base configuration
 * - Shared development tools
 */

import { AbstractAgent } from './base/abstract-agent.js';
import { AgentContext, AgentResult, ValidationResult, AgentMetadata, AgentCapability, AgentCategory, CapabilityCategory } from '../types/agent.js';
import { TemplateService } from '../utils/template-service.js';
import * as fsExtra from 'fs-extra';
import * as path from 'path';

interface ESLintConfig {
  extends: string[];
  parser?: string;
  plugins?: string[];
  rules?: Record<string, any>;
  env?: Record<string, boolean>;
  ignorePatterns?: string[];
}

interface PrettierConfig {
  printWidth: number;
  tabWidth: number;
  useTabs: boolean;
  semi: boolean;
  singleQuote: boolean;
  quoteProps: string;
  jsxSingleQuote: boolean;
  trailingComma: string;
  bracketSpacing: boolean;
  bracketSameLine: boolean;
  arrowParens: string;
  endOfLine: string;
  plugins: string[];
}

interface TypeScriptConfig {
  extends?: string;
  compilerOptions: {
    target?: string;
    lib?: string[];
    allowJs?: boolean;
    skipLibCheck?: boolean;
    strict?: boolean;
    noEmit?: boolean;
    esModuleInterop?: boolean;
    module?: string;
    moduleResolution?: string;
    resolveJsonModule?: boolean;
    isolatedModules?: boolean;
    jsx?: string;
    incremental?: boolean;
    plugins?: Array<{ name: string }>;
    baseUrl?: string;
    paths?: Record<string, string[]>;
    outDir?: string;
    rootDir?: string;
    declaration?: boolean;
    declarationMap?: boolean;
  };
  include?: string[];
  exclude?: string[];
}

interface VSCodeSettings {
  'typescript.preferences.importModuleSpecifier': string;
  'editor.formatOnSave': boolean;
  'editor.defaultFormatter': string;
  'editor.codeActionsOnSave': Record<string, boolean>;
  'files.associations': Record<string, string>;
  'emmet.includeLanguages': Record<string, string>;
  'tailwindCSS.includeLanguages': Record<string, string>;
}

interface VSCodeExtensions {
  recommendations: string[];
}

export class ConfigAgent extends AbstractAgent {
  private templateService: TemplateService;

  constructor() {
    super();
    this.templateService = new TemplateService('src/templates');
  }

  // ============================================================================
  // AGENT METADATA
  // ============================================================================

  protected getAgentMetadata(): AgentMetadata {
    return {
      name: 'ConfigAgent',
      version: '1.0.0',
      description: 'Sets up shared configurations directly in the project root',
      author: 'The Architech Team',
      category: AgentCategory.FOUNDATION,
      tags: ['config', 'eslint', 'prettier', 'typescript', 'vscode'],
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
          name: 'typescript',
          description: 'TypeScript for type checking'
        }
      ],
      license: 'MIT',
      repository: 'https://github.com/the-architech/cli'
    };
  }

  protected getAgentCapabilities(): AgentCapability[] {
    return [
      {
        name: 'eslint-configuration',
        description: 'Creates ESLint configuration for TypeScript and React',
        parameters: [],
        examples: [
          {
            name: 'ESLint Setup',
            description: 'Sets up ESLint with TypeScript and React rules',
            parameters: {},
            expectedResult: 'ESLint configuration with modern rules'
          }
        ],
        category: CapabilityCategory.CONFIGURATION
      },
      {
        name: 'prettier-configuration',
        description: 'Creates Prettier configuration for consistent formatting',
        parameters: [],
        examples: [
          {
            name: 'Prettier Setup',
            description: 'Sets up Prettier with Tailwind CSS plugin',
            parameters: {},
            expectedResult: 'Prettier configuration with Tailwind support'
          }
        ],
        category: CapabilityCategory.CONFIGURATION
      },
      {
        name: 'typescript-configuration',
        description: 'Creates TypeScript configuration for the project',
        parameters: [],
        examples: [
          {
            name: 'TypeScript Setup',
            description: 'Sets up TypeScript with strict mode and path mapping',
            parameters: {},
            expectedResult: 'TypeScript configuration with modern settings'
          }
        ],
        category: CapabilityCategory.CONFIGURATION
      },
      {
        name: 'vscode-configuration',
        description: 'Creates VS Code settings and extensions recommendations',
        parameters: [],
        examples: [
          {
            name: 'VS Code Setup',
            description: 'Sets up VS Code for optimal development experience',
            parameters: {},
            expectedResult: 'VS Code settings and extensions configuration'
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
    
    context.logger.info('Setting up project configurations in root directory');

    try {
      // Create ESLint configuration
      await this.createESLintConfig(projectPath);
      
      // Create Prettier configuration
      await this.createPrettierConfig(projectPath);
      
      // Create TypeScript configuration
      await this.createTypeScriptConfig(projectPath);
      
      // Create VS Code configuration
      await this.createVSCodeConfig(projectPath);
      
      // Create GitHub workflows
      await this.createGitHubWorkflows(projectPath);
      
      context.logger.success('Project configurations created successfully');
      
      return this.createSuccessResult(
        { projectPath },
        [
          { type: 'config', path: '.eslintrc.json', metadata: { name: 'ESLint Config' } },
          { type: 'config', path: '.prettierrc', metadata: { name: 'Prettier Config' } },
          { type: 'config', path: 'tsconfig.json', metadata: { name: 'TypeScript Config' } },
          { type: 'config', path: '.vscode/settings.json', metadata: { name: 'VS Code Settings' } }
        ],
        [
          'ESLint, Prettier, and TypeScript configurations are now set up',
          'VS Code settings are configured for optimal development',
          'GitHub workflows are ready for CI/CD'
        ]
      );
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      context.logger.error(`Failed to create configurations: ${errorMessage}`, error as Error);
      
      return this.createErrorResult(
        'CONFIG_SETUP_FAILED',
        `Failed to create project configurations: ${errorMessage}`,
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

    // Check if project path exists
    if (!(await fsExtra.pathExists(context.projectPath))) {
      errors.push({
        field: 'projectPath',
        message: 'Project path does not exist',
        code: 'MISSING_DIRECTORY',
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
  // CONFIGURATION CREATION METHODS
  // ============================================================================

  private async createESLintConfig(projectPath: string): Promise<void> {
    const eslintConfig: ESLintConfig = {
      extends: [
        "next/core-web-vitals",
        "@typescript-eslint/recommended",
        "prettier"
      ],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint", "import"],
      rules: {
        "@typescript-eslint/no-unused-vars": [
          "error",
          { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
        ],
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/prefer-const": "error",
        "@typescript-eslint/no-non-null-assertion": "warn",
        "import/order": [
          "error",
          {
            groups: [
              "builtin",
              "external", 
              "internal",
              "parent",
              "sibling",
              "index"
            ],
            "newlines-between": "always",
            alphabetize: { order: "asc", caseInsensitive: true }
          }
        ],
        "import/no-duplicates": "error",
        "import/no-unused-modules": "warn",
        "prefer-const": "error",
        "no-var": "error",
        "no-console": ["warn", { allow: ["warn", "error"] }],
        "eqeqeq": ["error", "always"]
      },
      ignorePatterns: [
        "node_modules/",
        ".next/",
        "dist/",
        "build/",
        "*.config.js",
        "*.config.ts"
      ]
    };

    await fsExtra.writeJSON(path.join(projectPath, '.eslintrc.json'), eslintConfig, { spaces: 2 });
  }

  private async createPrettierConfig(projectPath: string): Promise<void> {
    const prettierConfig: PrettierConfig = {
      printWidth: 80,
      tabWidth: 2,
      useTabs: false,
      semi: true,
      singleQuote: true,
      quoteProps: "as-needed",
      jsxSingleQuote: true,
      trailingComma: "es5",
      bracketSpacing: true,
      bracketSameLine: false,
      arrowParens: "avoid",
      endOfLine: "lf",
      plugins: ["prettier-plugin-tailwindcss"]
    };

    await fsExtra.writeJSON(path.join(projectPath, '.prettierrc'), prettierConfig, { spaces: 2 });
  }

  private async createTypeScriptConfig(projectPath: string): Promise<void> {
    const tsConfig: TypeScriptConfig = {
      extends: "./tsconfig.base.json",
      compilerOptions: {
        target: "ES2022",
        lib: ["dom", "dom.iterable", "es6"],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "preserve",
        incremental: true,
        plugins: [
          {
            name: "next"
          }
        ],
        baseUrl: ".",
        paths: {
          "@/*": ["./src/*"],
          "@/components/*": ["./src/components/*"],
          "@/lib/*": ["./src/lib/*"],
          "@/types/*": ["./src/types/*"]
        }
      },
      include: [
        "next-env.d.ts",
        "**/*.ts",
        "**/*.tsx",
        ".next/types/**/*.ts"
      ],
      exclude: [
        "node_modules"
      ]
    };

    await fsExtra.writeJSON(path.join(projectPath, 'tsconfig.json'), tsConfig, { spaces: 2 });
  }

  private async createVSCodeConfig(projectPath: string): Promise<void> {
    const vscodePath = path.join(projectPath, '.vscode');
    await fsExtra.ensureDir(vscodePath);

    const settings: VSCodeSettings = {
      "typescript.preferences.importModuleSpecifier": "relative",
      "editor.formatOnSave": true,
      "editor.defaultFormatter": "esbenp.prettier-vscode",
      "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true,
        "source.organizeImports": true
      },
      "files.associations": {
        "*.css": "tailwindcss"
      },
      "emmet.includeLanguages": {
        "typescript": "html",
        "typescriptreact": "html"
      },
      "tailwindCSS.includeLanguages": {
        "typescript": "html",
        "typescriptreact": "html"
      }
    };

    const extensions: VSCodeExtensions = {
      recommendations: [
        "esbenp.prettier-vscode",
        "dbaeumer.vscode-eslint",
        "bradlc.vscode-tailwindcss",
        "ms-vscode.vscode-typescript-next",
        "formulahendry.auto-rename-tag",
        "christian-kohler.path-intellisense"
      ]
    };

    await fsExtra.writeJSON(path.join(vscodePath, 'settings.json'), settings, { spaces: 2 });
    await fsExtra.writeJSON(path.join(vscodePath, 'extensions.json'), extensions, { spaces: 2 });
  }

  private async createGitHubWorkflows(projectPath: string): Promise<void> {
    const workflowsPath = path.join(projectPath, '.github', 'workflows');
    await fsExtra.ensureDir(workflowsPath);

    // Use template service to render GitHub CI workflow
    await this.templateService.renderAndWrite(
      'config',
      'github-ci.yml.ejs',
      path.join(workflowsPath, 'ci.yml'),
      {
        projectName: path.basename(projectPath)
      }
    );
  }
} 