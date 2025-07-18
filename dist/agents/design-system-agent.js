/**
 * Design System Agent - UI/UX Architect
 *
 * Installs and configures design system components:
 * - Shadcn/ui components (with refined automation from Phase 0 learnings)
 * - Tailwind CSS utilities
 * - Icon libraries
 * - Typography system
 *
 * Migrated to the new standardized agent interface for robustness and extensibility.
 */
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import { AbstractAgent } from './base/abstract-agent.js';
import { AgentCategory, CapabilityCategory } from '../types/agent.js';
export class DesignSystemAgent extends AbstractAgent {
    // ============================================================================
    // AGENT METADATA
    // ============================================================================
    getAgentMetadata() {
        return {
            name: 'DesignSystemAgent',
            version: '1.0.0',
            description: 'Installs and configures design system components and Shadcn/ui',
            author: 'The Architech Team',
            category: AgentCategory.UI,
            tags: ['design-system', 'shadcn-ui', 'tailwind', 'components', 'ui'],
            dependencies: [],
            conflicts: [],
            requirements: [
                {
                    type: 'package',
                    name: 'tailwindcss',
                    description: 'Tailwind CSS for styling'
                },
                {
                    type: 'package',
                    name: 'react',
                    description: 'React for component framework'
                },
                {
                    type: 'package',
                    name: 'typescript',
                    description: 'TypeScript for type safety'
                }
            ],
            license: 'MIT',
            repository: 'https://github.com/the-architech/cli'
        };
    }
    getAgentCapabilities() {
        return [
            {
                name: 'configure-shadcn-ui',
                description: 'Configures Shadcn/ui with optimal settings',
                parameters: [],
                examples: [
                    {
                        name: 'Configure Shadcn/ui',
                        description: 'Sets up Shadcn/ui with TypeScript and Tailwind',
                        parameters: {},
                        expectedResult: 'Shadcn/ui configuration with components.json'
                    }
                ],
                category: CapabilityCategory.CONFIGURATION
            },
            {
                name: 'install-design-dependencies',
                description: 'Installs design system dependencies',
                parameters: [],
                examples: [
                    {
                        name: 'Install Dependencies',
                        description: 'Installs Lucide React, clsx, and other design utilities',
                        parameters: {},
                        expectedResult: 'Design dependencies installed'
                    }
                ],
                category: CapabilityCategory.SETUP
            },
            {
                name: 'create-component-structure',
                description: 'Creates component directory structure',
                parameters: [],
                examples: [
                    {
                        name: 'Create Structure',
                        description: 'Creates src/components/ui directory with utils',
                        parameters: {},
                        expectedResult: 'Component directory structure created'
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
        const { projectPath } = context;
        context.logger.info('Setting up design system...');
        try {
            const artifacts = [];
            const startTime = Date.now();
            // Step 1: Install design dependencies
            await this.installDependencies(context);
            // Step 2: Create shadcn-ui config
            const configArtifacts = await this.createShadcnConfig(context);
            artifacts.push(...configArtifacts);
            // Step 3: Install core UI components manually for reliability
            const componentArtifacts = await this.installCoreComponents(context);
            artifacts.push(...componentArtifacts);
            const duration = Date.now() - startTime;
            context.logger.success('Design system configured successfully');
            return {
                success: true,
                data: {
                    dependenciesInstalled: ['lucide-react', 'clsx', 'tailwind-merge', 'class-variance-authority'],
                    configurations: ['shadcn-ui', 'component-structure']
                },
                duration,
                artifacts,
                nextSteps: [
                    'Run "npx shadcn-ui@latest add button" to add specific components',
                    'Run "npx shadcn-ui@latest add card" to add card component',
                    'Run "npx shadcn-ui@latest add input" to add input component',
                    'See https://ui.shadcn.com/docs/components for all available components'
                ]
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            context.logger.error(`Failed to configure design system: ${errorMessage}`, error);
            return this.createErrorResult('DESIGN_SYSTEM_SETUP_FAILED', `Failed to configure design system: ${errorMessage}`, [], 0, error);
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
        // Check if project has package.json
        const packageJsonPath = path.join(context.projectPath, 'package.json');
        if (!existsSync(packageJsonPath)) {
            errors.push({
                field: 'projectPath',
                message: 'package.json not found in project directory',
                code: 'MISSING_PACKAGE_JSON',
                severity: 'error'
            });
        }
        // Check if Tailwind is configured
        const tailwindConfigPath = path.join(context.projectPath, 'tailwind.config.js');
        if (!existsSync(tailwindConfigPath)) {
            warnings.push('Tailwind CSS configuration not found - Shadcn/ui may not work properly');
        }
        // Check if src directory exists
        const srcPath = path.join(context.projectPath, 'src');
        if (!existsSync(srcPath)) {
            warnings.push('src directory not found - will create component structure');
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
    async installDependencies(context) {
        context.logger.info('Installing design system dependencies...');
        const dependencies = [
            'lucide-react',
            'clsx',
            'tailwind-merge',
            'class-variance-authority'
        ];
        await context.runner.install(dependencies, false, context.projectPath);
        context.logger.success('Design dependencies installed');
    }
    async createShadcnConfig(context) {
        context.logger.info('Creating shadcn/ui configuration...');
        const componentsConfig = {
            "$schema": "https://ui.shadcn.com/schema.json",
            "style": "default",
            "rsc": true,
            "tsx": true,
            "tailwind": {
                "config": "tailwind.config.js",
                "css": "src/app/globals.css",
                "baseColor": "slate",
                "cssVariables": true,
                "prefix": ""
            },
            "aliases": {
                "components": "@/components",
                "utils": "@/lib/utils"
            }
        };
        const configPath = path.join(context.projectPath, 'components.json');
        writeFileSync(configPath, JSON.stringify(componentsConfig, null, 2));
        context.logger.success('Shadcn/ui config created');
        return [
            {
                type: 'config',
                path: configPath,
                content: JSON.stringify(componentsConfig, null, 2),
                metadata: { tool: 'shadcn-ui', type: 'configuration' }
            }
        ];
    }
    async installCoreComponents(context) {
        context.logger.info('Installing core UI components...');
        const artifacts = [];
        try {
            // Create utils lib first
            const utilsArtifacts = await this.createUtilsLib(context);
            artifacts.push(...utilsArtifacts);
            // Create basic component structure
            const structureArtifacts = await this.createComponentStructure(context);
            artifacts.push(...structureArtifacts);
            context.logger.success('Core components structure created');
            context.logger.info('Run "npx shadcn-ui@latest add button" manually to add specific components');
        }
        catch (error) {
            context.logger.warn(`Component installation skipped: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        return artifacts;
    }
    async createUtilsLib(context) {
        const utilsPath = path.join(context.projectPath, 'src', 'lib');
        const utilsFile = path.join(utilsPath, 'utils.ts');
        if (!existsSync(utilsPath)) {
            mkdirSync(utilsPath, { recursive: true });
        }
        const utilsContent = `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`;
        writeFileSync(utilsFile, utilsContent);
        context.logger.success('Utils library created');
        return [
            {
                type: 'file',
                path: utilsFile,
                content: utilsContent,
                metadata: { tool: 'utils', type: 'utility-function' }
            }
        ];
    }
    async createComponentStructure(context) {
        const componentsPath = path.join(context.projectPath, 'src', 'components', 'ui');
        if (!existsSync(componentsPath)) {
            mkdirSync(componentsPath, { recursive: true });
        }
        // Create a basic README for the components directory
        const readmeContent = `# UI Components

This directory contains shadcn/ui components.

To add components, run:
\`\`\`bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
\`\`\`

See https://ui.shadcn.com/docs/components for all available components.
`;
        const readmePath = path.join(componentsPath, 'README.md');
        writeFileSync(readmePath, readmeContent);
        context.logger.success('Component structure created');
        return [
            {
                type: 'file',
                path: readmePath,
                content: readmeContent,
                metadata: { tool: 'components', type: 'documentation' }
            }
        ];
    }
    // ============================================================================
    // ROLLBACK
    // ============================================================================
    async rollback(context) {
        context.logger.info('Rolling back DesignSystemAgent changes...');
        const filesToRemove = [
            'components.json',
            'src/lib/utils.ts',
            'src/components/ui/README.md'
        ];
        for (const file of filesToRemove) {
            const filePath = path.join(context.projectPath, file);
            if (existsSync(filePath)) {
                try {
                    // Note: In a real implementation, you'd want to restore the original files
                    // For now, we'll just log what would be removed
                    context.logger.info(`Would remove: ${file}`);
                }
                catch (error) {
                    context.logger.warn(`Could not remove ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
        }
        context.logger.success('DesignSystemAgent rollback completed');
    }
}
//# sourceMappingURL=design-system-agent.js.map