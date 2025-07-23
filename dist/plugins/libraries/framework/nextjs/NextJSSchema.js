/**
 * Next.js Schema Definitions
 *
 * Contains all configuration schemas and parameter definitions for the Next.js plugin.
 * Based on: https://nextjs.org/
 */
import { PluginCategory } from '../../../../types/plugins.js';
import { FrameworkOption, BuildOption, DeploymentOption } from '../../../../types/core.js';
export class NextJSSchema {
    static getParameterSchema() {
        return {
            category: PluginCategory.FRAMEWORK,
            groups: [
                { id: 'framework', name: 'Framework Configuration', description: 'Configure the Next.js framework.', order: 1, parameters: ['framework'] },
                { id: 'build', name: 'Build Configuration', description: 'Configure the build process.', order: 2, parameters: ['buildTool'] },
                { id: 'deployment', name: 'Deployment Configuration', description: 'Configure deployment options.', order: 3, parameters: ['deploymentTarget'] },
                { id: 'features', name: 'Features', description: 'Enable additional features.', order: 4, parameters: ['appRouter', 'importAlias', 'typescript', 'eslint', 'tailwind'] },
            ],
            parameters: [
                {
                    id: 'framework',
                    name: 'Framework',
                    type: 'select',
                    description: 'Select the framework to use.',
                    required: true,
                    default: FrameworkOption.NEXTJS,
                    options: [
                        { value: FrameworkOption.NEXTJS, label: 'Next.js', description: 'React framework for production' }
                    ],
                    group: 'framework'
                },
                {
                    id: 'buildTool',
                    name: 'Build Tool',
                    type: 'select',
                    description: 'Select the build tool to use.',
                    required: true,
                    default: BuildOption.WEBPACK,
                    options: [
                        { value: BuildOption.WEBPACK, label: 'Webpack', description: 'Default Next.js bundler' },
                        { value: BuildOption.TURBOPACK, label: 'Turbopack', description: 'Next.js new bundler (experimental)' }
                    ],
                    group: 'build'
                },
                {
                    id: 'deploymentTarget',
                    name: 'Deployment Target',
                    type: 'select',
                    description: 'Select the deployment target.',
                    required: true,
                    default: DeploymentOption.SSR,
                    options: [
                        { value: DeploymentOption.SSR, label: 'Vercel', description: 'Next.js creator platform' },
                        { value: DeploymentOption.SERVERLESS, label: 'Railway', description: 'Modern deployment platform' },
                        { value: DeploymentOption.STATIC, label: 'Netlify', description: 'Static site hosting' }
                    ],
                    group: 'deployment'
                },
                {
                    id: 'appRouter',
                    name: 'App Router',
                    type: 'boolean',
                    description: 'Use the new App Router (recommended for new projects).',
                    required: true,
                    default: true,
                    group: 'features'
                },
                {
                    id: 'importAlias',
                    name: 'Import Alias',
                    type: 'boolean',
                    description: 'Enable import alias (@/ for src directory).',
                    required: true,
                    default: true,
                    group: 'features'
                },
                {
                    id: 'typescript',
                    name: 'TypeScript',
                    type: 'boolean',
                    description: 'Enable TypeScript support.',
                    required: true,
                    default: true,
                    group: 'features'
                },
                {
                    id: 'eslint',
                    name: 'ESLint',
                    type: 'boolean',
                    description: 'Enable ESLint for code linting.',
                    required: true,
                    default: true,
                    group: 'features'
                },
                {
                    id: 'tailwind',
                    name: 'Tailwind CSS',
                    type: 'boolean',
                    description: 'Enable Tailwind CSS for styling.',
                    required: true,
                    default: true,
                    group: 'features'
                }
            ],
            dependencies: [],
            validations: []
        };
    }
    static getFrameworkOptions() {
        return [FrameworkOption.NEXTJS];
    }
    static getBuildOptions() {
        return [BuildOption.WEBPACK, BuildOption.TURBOPACK];
    }
    static getDeploymentOptions() {
        return [DeploymentOption.SSR, DeploymentOption.SERVERLESS, DeploymentOption.STATIC];
    }
}
//# sourceMappingURL=NextJSSchema.js.map