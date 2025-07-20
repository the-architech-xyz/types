/**
 * Base Project Agent - Structure Creator
 *
 * Responsible for creating the core project structure (monorepo or single-app).
 * Pure structure creator - no framework installation, just structure setup.
 */
import * as path from 'path';
import fsExtra from 'fs-extra';
import { AbstractAgent } from './base/abstract-agent.js';
import { AgentCategory, CapabilityCategory } from '../types/agent.js';
export class BaseProjectAgent extends AbstractAgent {
    // ============================================================================
    // AGENT METADATA
    // ============================================================================
    getAgentMetadata() {
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
    getAgentCapabilities() {
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
    async validate(context) {
        const errors = [];
        const warnings = [];
        // Validate project name
        if (!context.projectName || context.projectName.trim().length === 0) {
            errors.push({
                field: 'projectName',
                message: 'Project name is required',
                code: 'REQUIRED_FIELD',
                severity: 'error'
            });
        }
        else if (!/^[a-zA-Z0-9-_]+$/.test(context.projectName)) {
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
    async executeInternal(context) {
        const { projectName, projectPath, projectStructure } = context;
        const structure = projectStructure?.type || context.config.structure || 'single-app';
        context.logger.info(`Creating ${structure} structure for ${projectName}`);
        context.logger.info(`User preference: ${projectStructure?.userPreference || 'not specified'}`);
        try {
            // Start spinner for actual work
            await this.startSpinner(`🔧 Creating ${structure} structure for ${projectName}...`, context);
            // Step 1: Create the appropriate project structure
            if (structure === 'monorepo') {
                await this.createMonorepoStructure(context);
            }
            else {
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
        }
        catch (error) {
            await this.failSpinner(`❌ Failed to create project structure`);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return this.createErrorResult('PROJECT_CREATION_FAILED', `Failed to create project structure: ${errorMessage}`, [], this.startTime, error);
        }
    }
    // ============================================================================
    // PRIVATE METHODS - Structure Creation
    // ============================================================================
    async createMonorepoStructure(context) {
        const { projectPath, projectName } = context;
        context.logger.info('Creating monorepo structure...');
        // Create monorepo directories
        const appsPath = path.join(projectPath, 'apps');
        const packagesPath = path.join(projectPath, 'packages');
        await fsExtra.ensureDir(appsPath);
        await fsExtra.ensureDir(packagesPath);
        // Create Turborepo configuration
        const turboConfig = {
            $schema: "https://turbo.build/schema.json",
            globalDependencies: ["**/.env.*local"],
            pipeline: {
                build: {
                    dependsOn: ["^build"],
                    outputs: [".next/**", "!.next/cache/**", "dist/**"]
                },
                dev: {
                    cache: false,
                    persistent: true
                },
                lint: {
                    dependsOn: ["^lint"]
                },
                "type-check": {
                    dependsOn: ["^type-check"]
                }
            }
        };
        await fsExtra.writeJSON(path.join(projectPath, 'turbo.json'), turboConfig, { spaces: 2 });
        // Create root package.json
        const rootPackage = {
            name: projectName,
            version: "0.1.0",
            private: true,
            workspaces: [
                "apps/*",
                "packages/*"
            ],
            scripts: {
                "build": "turbo run build",
                "dev": "turbo run dev",
                "lint": "turbo run lint",
                "type-check": "turbo run type-check",
                "clean": "turbo run clean && rm -rf node_modules"
            },
            devDependencies: {
                "turbo": "^1.10.0"
            },
            packageManager: context.packageManager
        };
        await fsExtra.writeJSON(path.join(projectPath, 'package.json'), rootPackage, { spaces: 2 });
        // Create README
        const readme = `# ${projectName}

This is a monorepo built with Turborepo.

## Apps

- \`apps/web\` - Main web application

## Packages

- \`packages/ui\` - Shared UI components
- \`packages/db\` - Database layer
- \`packages/auth\` - Authentication

## Development

\`\`\`bash
npm install
npm run dev
\`\`\`
`;
        await fsExtra.writeFile(path.join(projectPath, 'README.md'), readme);
        context.logger.success('Monorepo structure created successfully');
    }
    async createSingleAppStructure(context) {
        const { projectPath, projectName } = context;
        context.logger.info('Creating single-app structure...');
        // For single-app, we only create the project directory
        // FrameworkAgent will handle creating the Next.js project structure
        await fsExtra.ensureDir(projectPath);
        // Create README
        const readme = `# ${projectName}

This is a single-app project.

## Development

\`\`\`bash
npm install
npm run dev
\`\`\`
`;
        await fsExtra.writeFile(path.join(projectPath, 'README.md'), readme);
        context.logger.success('Single-app structure created successfully');
    }
    async createProjectConfiguration(context, structure) {
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
        const configPath = path.join(projectPath, '.architech.json');
        await fsExtra.writeJSON(configPath, architechConfig, { spaces: 2 });
    }
}
//# sourceMappingURL=base-project-agent.js.map