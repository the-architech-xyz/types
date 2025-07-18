/**
 * Base Architech Agent - Monorepo Foundation Generator
 *
 * Creates the core Turborepo monorepo structure:
 * - Root configuration (package.json, turbo.json)
 * - Root-level ESLint, TypeScript, and Tailwind configs
 * - apps/web: Next.js 14 application
 * - packages/: Foundation for specialized packages
 * - Workspace configuration and scripts
 *
 * Migrated to the new standardized agent interface for robustness and extensibility.
 */
import { existsSync } from 'fs';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { AbstractAgent } from './base/abstract-agent.js';
import { templateService } from '../utils/template-service.js';
import { AgentCategory, CapabilityCategory } from '../types/agent.js';
export class BaseArchitechAgent extends AbstractAgent {
    // ============================================================================
    // AGENT METADATA
    // ============================================================================
    getAgentMetadata() {
        return {
            name: 'BaseArchitechAgent',
            version: '1.0.0',
            description: 'Creates the core Turborepo monorepo structure',
            author: 'The Architech Team',
            category: AgentCategory.FOUNDATION,
            tags: ['monorepo', 'turborepo', 'nextjs', 'typescript', 'workspace'],
            dependencies: [],
            conflicts: [],
            requirements: [
                {
                    type: 'package',
                    name: 'turbo',
                    description: 'Turborepo for monorepo management'
                },
                {
                    type: 'package',
                    name: 'next',
                    description: 'Next.js framework'
                },
                {
                    type: 'file',
                    name: 'apps/web',
                    description: 'Next.js application directory'
                },
                {
                    type: 'file',
                    name: 'packages',
                    description: 'Shared packages directory'
                }
            ],
            license: 'MIT',
            repository: 'https://github.com/the-architech/cli'
        };
    }
    getAgentCapabilities() {
        return [
            {
                name: 'create-monorepo',
                description: 'Creates a complete Turborepo monorepo structure',
                parameters: [
                    {
                        name: 'projectName',
                        type: 'string',
                        required: true,
                        description: 'Name of the monorepo project',
                        validation: [
                            {
                                type: 'regex',
                                value: '^[a-zA-Z0-9-_]+$',
                                message: 'Project name can only contain letters, numbers, hyphens, and underscores'
                            }
                        ]
                    },
                    {
                        name: 'packageManager',
                        type: 'string',
                        required: false,
                        description: 'Package manager to use',
                        defaultValue: 'auto',
                        validation: [
                            {
                                type: 'enum',
                                value: ['auto', 'npm', 'yarn', 'pnpm', 'bun'],
                                message: 'Package manager must be auto, npm, yarn, pnpm, or bun'
                            }
                        ]
                    }
                ],
                examples: [
                    {
                        name: 'Create basic monorepo',
                        description: 'Creates a Turborepo monorepo with Next.js app',
                        parameters: { projectName: 'my-monorepo' },
                        expectedResult: 'Complete monorepo structure with apps/web and packages directory'
                    },
                    {
                        name: 'Create monorepo with specific package manager',
                        description: 'Creates monorepo using yarn as package manager',
                        parameters: { projectName: 'my-monorepo', packageManager: 'yarn' },
                        expectedResult: 'Monorepo configured for yarn with workspace dependencies'
                    }
                ],
                category: CapabilityCategory.SETUP
            }
        ];
    }
    // ============================================================================
    // CORE EXECUTION
    // ============================================================================
    async executeInternal(context) {
        const { projectName, projectPath } = context;
        context.logger.info(`Creating Turborepo monorepo structure: ${projectName}`);
        try {
            // Create base directories
            await this.createDirectoryStructure(projectPath);
            // Create root package.json with workspace configuration
            await this.createRootPackageJson(projectPath, context);
            // Create Turborepo configuration
            await this.createTurboConfig(projectPath, context);
            // Create Next.js app
            await this.createNextJSApp(projectPath, context);
            // Create package directories
            await this.createPackageDirectories(projectPath);
            // Create root-level configuration files
            await this.createRootConfigFiles(projectPath, context);
            // Initialize git repository
            if (!context.options.skipGit) {
                await this.initializeGit(projectPath, context);
            }
            // Create README
            await this.createReadme(projectPath, context);
            const artifacts = [
                {
                    type: 'directory',
                    path: projectPath,
                    metadata: {
                        type: 'monorepo',
                        structure: 'turborepo',
                        packages: ['apps/web', 'packages/ui', 'packages/db', 'packages/auth']
                    }
                },
                {
                    type: 'file',
                    path: path.join(projectPath, 'package.json'),
                    metadata: { type: 'root-package-config' }
                },
                {
                    type: 'file',
                    path: path.join(projectPath, 'turbo.json'),
                    metadata: { type: 'turborepo-config' }
                },
                {
                    type: 'file',
                    path: path.join(projectPath, 'apps/web/package.json'),
                    metadata: { type: 'nextjs-app-config' }
                }
            ];
            context.logger.success(`Turborepo monorepo structure created successfully`);
            return this.createSuccessResult({
                projectPath,
                structure: 'turborepo',
                packages: ['apps/web', 'packages/ui', 'packages/db', 'packages/auth']
            }, artifacts, [
                'Monorepo directory structure created',
                'Turborepo configuration set up',
                'Next.js application initialized',
                'Package directories prepared',
                'Root configuration files created',
                'Git repository initialized (if enabled)'
            ]);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            context.logger.error(`Failed to create monorepo structure: ${errorMessage}`, error);
            return this.createErrorResult('MONOREPO_CREATION_FAILED', `Failed to create monorepo structure: ${errorMessage}`, [], 0, error);
        }
    }
    // ============================================================================
    // VALIDATION
    // ============================================================================
    async validate(context) {
        const baseValidation = await super.validate(context);
        if (!baseValidation.valid) {
            return baseValidation;
        }
        const errors = [];
        const warnings = [];
        // Check if project directory already exists
        if (existsSync(context.projectPath)) {
            errors.push({
                field: 'projectPath',
                message: `Project directory already exists: ${context.projectPath}`,
                code: 'DIRECTORY_EXISTS',
                severity: 'error'
            });
        }
        // Validate project name format
        if (!/^[a-zA-Z0-9-_]+$/.test(context.projectName)) {
            errors.push({
                field: 'projectName',
                message: 'Project name can only contain letters, numbers, hyphens, and underscores',
                code: 'INVALID_PROJECT_NAME',
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
    // PRIVATE METHODS
    // ============================================================================
    async createDirectoryStructure(projectPath) {
        const directories = [
            'apps/web',
            'packages/ui',
            'packages/db',
            'packages/auth',
            'packages/config'
        ];
        for (const dir of directories) {
            await fsExtra.ensureDir(path.join(projectPath, dir));
        }
    }
    async createRootPackageJson(projectPath, context) {
        await templateService.renderAndWrite('base-architech', 'package.json.ejs', path.join(projectPath, 'package.json'), {
            projectName: context.projectName,
            packageManager: context.packageManager
        }, { logger: context.logger });
    }
    async createTurboConfig(projectPath, context) {
        await templateService.renderAndWrite('base-architech', 'turbo.json.ejs', path.join(projectPath, 'turbo.json'), {}, { logger: context.logger });
    }
    async createNextJSApp(projectPath, context) {
        const appPath = path.join(projectPath, 'apps', 'web');
        // Create Next.js app package.json
        await templateService.renderAndWrite('base-architech', 'apps/web/package.json.ejs', path.join(appPath, 'package.json'), { projectName: context.projectName }, { logger: context.logger });
        // Create Next.js configuration
        await templateService.renderAndWrite('base-architech', 'apps/web/next.config.js.ejs', path.join(appPath, 'next.config.js'), { projectName: context.projectName }, { logger: context.logger });
        // Create TypeScript configuration
        await templateService.renderAndWrite('base-architech', 'apps/web/tsconfig.json.ejs', path.join(appPath, 'tsconfig.json'), { projectName: context.projectName }, { logger: context.logger });
        // Create basic app structure
        await fsExtra.ensureDir(path.join(appPath, 'src', 'app'));
        // Create page.tsx
        await templateService.renderAndWrite('base-architech', 'apps/web/src/app/page.tsx.ejs', path.join(appPath, 'src', 'app', 'page.tsx'), { projectName: context.projectName }, { logger: context.logger });
        // Create layout.tsx
        await templateService.renderAndWrite('base-architech', 'apps/web/src/app/layout.tsx.ejs', path.join(appPath, 'src', 'app', 'layout.tsx'), { projectName: context.projectName }, { logger: context.logger });
        // Create globals.css
        await templateService.renderAndWrite('base-architech', 'apps/web/src/app/globals.css.ejs', path.join(appPath, 'src', 'app', 'globals.css'), {}, { logger: context.logger });
    }
    async createPackageDirectories(projectPath) {
        const packages = [
            { name: 'ui', description: 'UI components and design system' },
            { name: 'db', description: 'Database layer and ORM' },
            { name: 'auth', description: 'Authentication and authorization' },
            { name: 'config', description: 'Shared configuration' }
        ];
        for (const pkg of packages) {
            const packagePath = path.join(projectPath, 'packages', pkg.name);
            const packageJson = {
                name: `@${path.basename(projectPath)}/${pkg.name}`,
                version: "0.1.0",
                private: true,
                description: pkg.description,
                main: "index.ts",
                types: "index.ts",
                scripts: {
                    "build": "tsc",
                    "dev": "tsc --watch",
                    "lint": "eslint . --ext .ts",
                    "type-check": "tsc --noEmit"
                },
                devDependencies: {
                    "typescript": "^5.0.0"
                }
            };
            await fsExtra.writeJSON(path.join(packagePath, 'package.json'), packageJson, { spaces: 2 });
            // Create TypeScript config for package
            const tsConfig = {
                extends: "../../tsconfig.json",
                compilerOptions: {
                    outDir: "./dist",
                    rootDir: "./",
                    declaration: true
                },
                include: ["**/*.ts", "**/*.tsx"],
                exclude: ["node_modules", "dist"]
            };
            await fsExtra.writeJSON(path.join(packagePath, 'tsconfig.json'), tsConfig, { spaces: 2 });
            // Create index file
            await fsExtra.writeFile(path.join(packagePath, 'index.ts'), `// ${pkg.name} package exports\n`);
        }
    }
    async createRootConfigFiles(projectPath, context) {
        // Create root TypeScript configuration
        const rootTsConfig = {
            compilerOptions: {
                target: "es2020",
                lib: ["es2020"],
                allowJs: true,
                skipLibCheck: true,
                strict: true,
                forceConsistentCasingInFileNames: true,
                noEmit: true,
                esModuleInterop: true,
                module: "esnext",
                moduleResolution: "node",
                resolveJsonModule: true,
                isolatedModules: true,
                jsx: "preserve",
                incremental: true,
                baseUrl: ".",
                paths: {
                    [`@${context.projectName}/*`]: ["packages/*"]
                }
            },
            include: ["**/*.ts", "**/*.tsx"],
            exclude: ["node_modules", "dist", ".next"]
        };
        await fsExtra.writeJSON(path.join(projectPath, 'tsconfig.json'), rootTsConfig, { spaces: 2 });
        // Create root ESLint configuration
        const rootEslintConfig = {
            extends: [
                "next/core-web-vitals",
                "@typescript-eslint/recommended",
                "prettier"
            ],
            parser: "@typescript-eslint/parser",
            plugins: ["@typescript-eslint"],
            rules: {
                "@typescript-eslint/no-unused-vars": "error",
                "@typescript-eslint/no-explicit-any": "warn"
            }
        };
        await fsExtra.writeJSON(path.join(projectPath, '.eslintrc.json'), rootEslintConfig, { spaces: 2 });
        // Create root Prettier configuration
        const rootPrettierConfig = {
            semi: true,
            trailingComma: "es5",
            singleQuote: true,
            printWidth: 80,
            tabWidth: 2,
            useTabs: false
        };
        await fsExtra.writeJSON(path.join(projectPath, '.prettierrc.json'), rootPrettierConfig, { spaces: 2 });
    }
    async initializeGit(projectPath, context) {
        try {
            context.logger.info('Initializing git repository...');
            // Initialize git repository
            await context.runner.execCommand(['git', 'init'], { cwd: projectPath, silent: true });
            // Create .gitignore
            const gitignore = `# Dependencies
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

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Turbo
.turbo

# IDE
.vscode/
.idea/
`;
            await fsExtra.writeFile(path.join(projectPath, '.gitignore'), gitignore);
            context.logger.success('Git repository initialized');
        }
        catch (error) {
            context.logger.warn(`Could not initialize git: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async createReadme(projectPath, context) {
        const readmeContent = `# ${context.projectName}

Enterprise-grade monorepo built with Turborepo and Next.js.

## 🏗️ Structure

\`\`\`
${context.projectName}/
├── apps/
│   └── web/          # Next.js 14 application
├── packages/
│   ├── ui/           # UI components and design system
│   ├── db/           # Database layer and ORM
│   ├── auth/         # Authentication and authorization
│   └── config/       # Shared configuration
└── turbo.json        # Turborepo configuration
\`\`\`

## 🚀 Getting Started

1. Install dependencies:
   \`\`\`bash
   ${context.packageManager === 'auto' ? 'npm' : context.packageManager} install
   \`\`\`

2. Start development server:
   \`\`\`bash
   ${context.packageManager === 'auto' ? 'npm' : context.packageManager} run dev
   \`\`\`

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Available Scripts

- \`dev\` - Start development server
- \`build\` - Build all packages and apps
- \`lint\` - Run ESLint on all packages
- \`type-check\` - Run TypeScript type checking
- \`format\` - Format code with Prettier
- \`clean\` - Clean all build artifacts

## 🏛️ Enterprise Features

- **Turborepo** - Incremental builds and caching
- **TypeScript** - Full type safety across the monorepo
- **ESLint & Prettier** - Consistent code quality
- **Workspace Dependencies** - Shared packages with proper linking
- **Next.js 14** - Latest React framework with App Router

## 📚 Documentation

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run \`npm run lint\` and \`npm run type-check\`
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
`;
        await fsExtra.writeFile(path.join(projectPath, 'README.md'), readmeContent);
    }
    // ============================================================================
    // ROLLBACK
    // ============================================================================
    async rollback(context) {
        context.logger.info('Rolling back BaseArchitechAgent changes...');
        try {
            // Remove the entire project directory
            if (await fsExtra.pathExists(context.projectPath)) {
                await fsExtra.remove(context.projectPath);
                context.logger.success('Project directory removed');
            }
        }
        catch (error) {
            context.logger.error('Failed to rollback BaseArchitechAgent', error);
        }
    }
}
//# sourceMappingURL=base-architech-agent.js.map