/**
 * Base Project Agent - Foundation Builder
 *
 * Responsible for creating the core project structure using framework-specific
 * generators like create-next-app, create-react-app, etc.
 *
 * Migrated to the new standardized agent interface for robustness and extensibility.
 */
import { existsSync } from 'fs';
import * as path from 'path';
import { AbstractAgent } from './base/abstract-agent.js';
import { AgentCategory, CapabilityCategory } from '../types/agent.js';
export class BaseProjectAgent extends AbstractAgent {
    // ============================================================================
    // AGENT METADATA
    // ============================================================================
    getAgentMetadata() {
        return {
            name: 'BaseProjectAgent',
            version: '1.0.0',
            description: 'Creates the foundational project structure using framework-specific generators',
            author: 'The Architech Team',
            category: AgentCategory.FOUNDATION,
            tags: ['project', 'foundation', 'generator', 'framework'],
            dependencies: [],
            conflicts: [],
            requirements: [
                {
                    type: 'package',
                    name: 'create-next-app',
                    description: 'Next.js project generator'
                },
                {
                    type: 'package',
                    name: 'create-vite',
                    description: 'Vite project generator'
                },
                {
                    type: 'package',
                    name: 'nuxi',
                    description: 'Nuxt project generator'
                }
            ],
            license: 'MIT',
            repository: 'https://github.com/the-architech/cli'
        };
    }
    getAgentCapabilities() {
        return [
            {
                name: 'create-nextjs-project',
                description: 'Creates a Next.js project with TypeScript, Tailwind, and ESLint',
                parameters: [
                    {
                        name: 'template',
                        type: 'string',
                        required: true,
                        description: 'Next.js template version (nextjs-13, nextjs-14)',
                        validation: [
                            {
                                type: 'enum',
                                value: ['nextjs-13', 'nextjs-14'],
                                message: 'Template must be nextjs-13 or nextjs-14'
                            }
                        ]
                    }
                ],
                examples: [
                    {
                        name: 'Create Next.js 14 project',
                        description: 'Creates a modern Next.js 14 project with App Router',
                        parameters: { template: 'nextjs-14' },
                        expectedResult: 'Next.js project with TypeScript, Tailwind, and ESLint'
                    }
                ],
                category: CapabilityCategory.SETUP
            },
            {
                name: 'create-react-vite-project',
                description: 'Creates a React project with Vite for fast development',
                parameters: [],
                examples: [
                    {
                        name: 'Create React + Vite project',
                        description: 'Creates a React project with Vite and TypeScript',
                        parameters: {},
                        expectedResult: 'React project with Vite, TypeScript, and modern tooling'
                    }
                ],
                category: CapabilityCategory.SETUP
            },
            {
                name: 'create-nuxt-project',
                description: 'Creates a Nuxt 3 project with modern Vue.js features',
                parameters: [],
                examples: [
                    {
                        name: 'Create Nuxt 3 project',
                        description: 'Creates a Nuxt 3 project with TypeScript and modern features',
                        parameters: {},
                        expectedResult: 'Nuxt 3 project with TypeScript and Vue 3 features'
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
        const { projectName, projectPath, config } = context;
        const template = config.template;
        context.logger.info(`Creating ${template} project: ${projectName}`);
        try {
            let result;
            switch (template) {
                case 'nextjs-14':
                case 'nextjs-13':
                    result = await this.createNextJSProject(context);
                    break;
                case 'react-vite':
                    result = await this.createReactViteProject(context);
                    break;
                case 'vue-nuxt':
                    result = await this.createNuxtProject(context);
                    break;
                default:
                    return this.createErrorResult('UNSUPPORTED_TEMPLATE', `Unsupported template: ${template}`, [{
                            field: 'template',
                            message: `Template '${template}' is not supported`,
                            code: 'UNSUPPORTED_TEMPLATE',
                            severity: 'error'
                        }]);
            }
            // Verify project structure
            await this.verifyProjectStructure(context);
            context.logger.success(`Project structure created successfully: ${projectName}`);
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            context.logger.error(`Failed to create project: ${errorMessage}`, error);
            return this.createErrorResult('PROJECT_CREATION_FAILED', `Failed to create ${template} project: ${errorMessage}`, [], 0, error);
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
        // Validate template
        const template = context.config.template;
        if (!template) {
            errors.push({
                field: 'template',
                message: 'Template is required',
                code: 'REQUIRED_FIELD',
                severity: 'error'
            });
        }
        else if (!['nextjs-13', 'nextjs-14', 'react-vite', 'vue-nuxt'].includes(template)) {
            errors.push({
                field: 'template',
                message: `Unsupported template: ${template}`,
                code: 'UNSUPPORTED_TEMPLATE',
                severity: 'error'
            });
        }
        // Check if project directory already exists
        if (existsSync(context.projectPath)) {
            if (!context.options.force) {
                errors.push({
                    field: 'projectPath',
                    message: `Project directory already exists: ${context.projectPath}`,
                    code: 'DIRECTORY_EXISTS',
                    severity: 'error'
                });
            }
            else {
                warnings.push(`Project directory already exists and will be overwritten: ${context.projectPath}`);
            }
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    // ============================================================================
    // PROJECT CREATION METHODS
    // ============================================================================
    async createNextJSProject(context) {
        const { projectName, config } = context;
        const template = config.template;
        context.logger.info(`Creating Next.js project with latest best practices...`);
        const options = [
            '--typescript',
            '--tailwind',
            '--eslint',
            '--app', // Use App Router for Next.js 14
            '--src-dir',
            '--import-alias', '@/*',
            '--yes' // Non-interactive
        ];
        // Add git option
        if (context.options.skipGit) {
            options.push('--skip-git');
        }
        try {
            await context.runner.createProject(projectName, 'nextjs', options);
            // Verify project was created
            if (!existsSync(projectName)) {
                throw new Error('Project directory was not created');
            }
            context.logger.success(`Next.js project '${projectName}' created successfully`);
            // Install dependencies if not skipped
            if (!context.options.skipInstall) {
                context.logger.info(`Installing dependencies...`);
                await context.runner.install([], false, projectName);
                context.logger.success(`Dependencies installed`);
            }
            const artifacts = [
                {
                    type: 'directory',
                    path: projectName,
                    metadata: {
                        template,
                        framework: 'nextjs',
                        features: ['typescript', 'tailwind', 'eslint', 'app-router']
                    }
                }
            ];
            return this.createSuccessResult({ projectName, template, framework: 'nextjs' }, artifacts, [
                'Project structure created successfully',
                'Dependencies installed (if not skipped)',
                'Ready for next agent execution'
            ]);
        }
        catch (error) {
            throw new Error(`Failed to create Next.js project: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async createReactViteProject(context) {
        const { projectName } = context;
        context.logger.info(`Creating React + Vite project...`);
        try {
            // Create React app with Vite
            await context.runner.exec('create-vite', [projectName, '--template', 'react-ts']);
            if (!existsSync(projectName)) {
                throw new Error('Project directory was not created');
            }
            context.logger.success(`React + Vite project '${projectName}' created`);
            // Install dependencies if not skipped
            if (!context.options.skipInstall) {
                context.logger.info(`Installing dependencies...`);
                await context.runner.install([], false, projectName);
                context.logger.success(`Dependencies installed`);
            }
            // Initialize git if not skipped
            if (!context.options.skipGit) {
                context.logger.info(`Initializing git repository...`);
                await context.runner.execCommand(['git', 'init'], { cwd: projectName, silent: true });
                context.logger.success(`Git repository initialized`);
            }
            const artifacts = [
                {
                    type: 'directory',
                    path: projectName,
                    metadata: {
                        template: 'react-vite',
                        framework: 'react',
                        bundler: 'vite',
                        features: ['typescript', 'react', 'vite']
                    }
                }
            ];
            return this.createSuccessResult({ projectName, template: 'react-vite', framework: 'react' }, artifacts, [
                'Project structure created successfully',
                'Dependencies installed (if not skipped)',
                'Git repository initialized (if not skipped)',
                'Ready for next agent execution'
            ]);
        }
        catch (error) {
            throw new Error(`Failed to create React + Vite project: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async createNuxtProject(context) {
        const { projectName } = context;
        context.logger.info(`Creating Nuxt 3 project...`);
        try {
            // Create Nuxt 3 app
            await context.runner.exec('nuxi@latest', ['init', projectName]);
            if (!existsSync(projectName)) {
                throw new Error('Project directory was not created');
            }
            context.logger.success(`Nuxt 3 project '${projectName}' created`);
            // Install dependencies if not skipped
            if (!context.options.skipInstall) {
                context.logger.info(`Installing dependencies...`);
                await context.runner.install([], false, projectName);
                context.logger.success(`Dependencies installed`);
            }
            // Initialize git if not skipped
            if (!context.options.skipGit) {
                context.logger.info(`Initializing git repository...`);
                await context.runner.execCommand(['git', 'init'], { cwd: projectName, silent: true });
                context.logger.success(`Git repository initialized`);
            }
            const artifacts = [
                {
                    type: 'directory',
                    path: projectName,
                    metadata: {
                        template: 'vue-nuxt',
                        framework: 'nuxt',
                        version: '3',
                        features: ['vue', 'nuxt', 'typescript']
                    }
                }
            ];
            return this.createSuccessResult({ projectName, template: 'vue-nuxt', framework: 'nuxt' }, artifacts, [
                'Project structure created successfully',
                'Dependencies installed (if not skipped)',
                'Git repository initialized (if not skipped)',
                'Ready for next agent execution'
            ]);
        }
        catch (error) {
            throw new Error(`Failed to create Nuxt project: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    // ============================================================================
    // VERIFICATION
    // ============================================================================
    async verifyProjectStructure(context) {
        const { projectPath, config } = context;
        const template = config.template;
        const requiredFiles = ['package.json'];
        // Add template-specific required files
        if (template.startsWith('nextjs')) {
            requiredFiles.push('tsconfig.json', 'tailwind.config.js');
        }
        else if (template === 'react-vite') {
            requiredFiles.push('vite.config.ts');
        }
        else if (template === 'vue-nuxt') {
            requiredFiles.push('nuxt.config.ts');
        }
        const missingFiles = requiredFiles.filter(file => !existsSync(path.join(projectPath, file)));
        if (missingFiles.length > 0) {
            throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
        }
        context.logger.success(`Project structure verified`);
    }
    // ============================================================================
    // ROLLBACK
    // ============================================================================
    async rollback(context) {
        const { projectPath } = context;
        context.logger.warn(`Rolling back BaseProjectAgent - removing project directory: ${projectPath}`);
        try {
            // Remove the created project directory
            if (existsSync(projectPath)) {
                await context.runner.execCommand(['rm', '-rf', projectPath], { silent: true });
                context.logger.success(`Project directory removed: ${projectPath}`);
            }
        }
        catch (error) {
            context.logger.error(`Failed to remove project directory: ${projectPath}`, error);
        }
    }
}
//# sourceMappingURL=base-project-agent.js.map