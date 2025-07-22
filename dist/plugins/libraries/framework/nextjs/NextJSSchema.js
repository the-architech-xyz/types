import { PluginCategory } from '../../../../types/plugin.js';
export class NextJSSchema {
    static getParameterSchema() {
        return {
            category: PluginCategory.FRAMEWORK,
            groups: [
                { id: 'core', name: 'Core Framework', description: 'Configure the main Next.js settings.', order: 1, parameters: ['typescript', 'appRouter', 'srcDir'] },
                { id: 'styling', name: 'Styling & UI', description: 'Configure styling and UI options.', order: 2, parameters: ['tailwind', 'importAlias'] },
                { id: 'development', name: 'Development Tools', description: 'Configure development and linting tools.', order: 3, parameters: ['eslint', 'skipInstall'] },
            ],
            parameters: [
                {
                    id: 'typescript',
                    name: 'TypeScript',
                    type: 'boolean',
                    description: 'Enable TypeScript support for better type safety.',
                    required: true,
                    default: true,
                    group: 'core'
                },
                {
                    id: 'appRouter',
                    name: 'App Router',
                    type: 'boolean',
                    description: 'Use the new App Router (recommended for new projects).',
                    required: true,
                    default: true,
                    group: 'core'
                },
                {
                    id: 'srcDir',
                    name: 'Source Directory',
                    type: 'boolean',
                    description: 'Use src/ directory for better organization.',
                    required: true,
                    default: true,
                    group: 'core'
                },
                {
                    id: 'tailwind',
                    name: 'Tailwind CSS',
                    type: 'boolean',
                    description: 'Include Tailwind CSS for utility-first styling.',
                    required: true,
                    default: true,
                    group: 'styling'
                },
                {
                    id: 'importAlias',
                    name: 'Import Alias',
                    type: 'string',
                    description: 'Configure import alias for cleaner imports (e.g., @/*).',
                    required: false,
                    default: '@/*',
                    group: 'styling'
                },
                {
                    id: 'eslint',
                    name: 'ESLint',
                    type: 'boolean',
                    description: 'Include ESLint for code linting and quality.',
                    required: true,
                    default: true,
                    group: 'development'
                },
                {
                    id: 'skipInstall',
                    name: 'Skip Installation',
                    type: 'boolean',
                    description: 'Skip automatic dependency installation.',
                    required: true,
                    default: false,
                    group: 'development'
                }
            ],
            dependencies: [],
            validations: []
        };
    }
    static getFrameworkOptions() {
        return [
            { name: 'Next.js', value: 'nextjs', label: 'Next.js', description: 'React framework for production' }
        ];
    }
    static getBuildOptions() {
        return [
            { name: 'Webpack', value: 'webpack', label: 'Webpack', description: 'Default Next.js bundler' },
            { name: 'Turbopack', value: 'turbopack', label: 'Turbopack', description: 'Next.js new bundler (experimental)' }
        ];
    }
    static getDeploymentOptions() {
        return [
            { name: 'Vercel', value: 'vercel', label: 'Vercel', description: 'Next.js creator platform' },
            { name: 'Railway', value: 'railway', label: 'Railway', description: 'Modern deployment platform' },
            { name: 'Netlify', value: 'netlify', label: 'Netlify', description: 'Static site hosting' }
        ];
    }
}
//# sourceMappingURL=NextJSSchema.js.map