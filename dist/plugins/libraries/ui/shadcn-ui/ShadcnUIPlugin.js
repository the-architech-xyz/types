/**
 * Shadcn/ui Plugin - Updated with Latest Best Practices
 *
 * Provides Shadcn/ui design system integration using the official shadcn CLI.
 * Follows latest Shadcn/ui documentation and TypeScript best practices.
 *
 * References:
 * - https://ui.shadcn.com/docs/installation
 * - https://ui.shadcn.com/docs/components
 * - https://ui.shadcn.com/docs/themes
 */
import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginCategory } from '../../../../types/plugins.js';
import { ShadcnUISchema } from './ShadcnUISchema.js';
import { ShadcnUIGenerator } from './ShadcnUIGenerator.js';
export class ShadcnUIPlugin extends BasePlugin {
    generator;
    constructor() {
        super();
        this.generator = new ShadcnUIGenerator();
    }
    // ============================================================================
    // METADATA
    // ============================================================================
    getMetadata() {
        return {
            id: 'shadcn-ui',
            name: 'Shadcn/UI',
            version: '1.0.0',
            description: 'Beautifully designed components that you can copy and paste into your apps.',
            author: 'The Architech Team',
            category: PluginCategory.DESIGN_SYSTEM,
            tags: ['ui', 'tailwind', 'radix', 'design-system'],
            license: 'MIT',
        };
    }
    // ============================================================================
    // ENHANCED PLUGIN INTERFACE IMPLEMENTATION
    // ============================================================================
    getParameterSchema() {
        return ShadcnUISchema.getParameterSchema();
    }
    validateConfiguration(config) {
        const errors = [];
        const warnings = [];
        // Validate required fields
        if (!config.components || config.components.length === 0) {
            errors.push({
                field: 'components',
                message: 'At least one component is required',
                code: 'MISSING_FIELD',
                severity: 'error'
            });
        }
        // Validate theme configuration
        if (config.theme && !['light', 'dark', 'system'].includes(config.theme)) {
            warnings.push('Theme should be one of: light, dark, system');
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    generateUnifiedInterface(config) {
        const generated = this.generator.generateUnifiedIndex(config);
        return {
            category: PluginCategory.DESIGN_SYSTEM,
            exports: [
                {
                    name: 'Button',
                    type: 'class',
                    implementation: 'Button component',
                    documentation: 'Reusable button component',
                    examples: ['<Button>Click me</Button>']
                },
                {
                    name: 'Card',
                    type: 'class',
                    implementation: 'Card component',
                    documentation: 'Card container component',
                    examples: ['<Card><CardContent>Content</CardContent></Card>']
                }
            ],
            types: [
                {
                    name: 'ButtonProps',
                    type: 'interface',
                    definition: 'interface ButtonProps { variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"; size?: "default" | "sm" | "lg" | "icon"; }',
                    documentation: 'Button component props'
                }
            ],
            utilities: [
                {
                    name: 'cn',
                    type: 'function',
                    implementation: 'Class name utility',
                    documentation: 'Merge class names with clsx and tailwind-merge',
                    parameters: [],
                    returnType: 'string',
                    examples: ['cn("base-class", conditional && "conditional-class")']
                }
            ],
            constants: [
                {
                    name: 'THEME_STORAGE_KEY',
                    value: '"ui-theme"',
                    documentation: 'Local storage key for theme preference',
                    type: 'string'
                }
            ],
            documentation: generated.content || 'Shadcn/UI unified interface for design system'
        };
    }
    // ============================================================================
    // UI PLUGIN INTERFACE IMPLEMENTATION
    // ============================================================================
    getUILibraries() {
        return ['shadcn-ui'];
    }
    getComponentOptions() {
        return ['button', 'card', 'input', 'select', 'dialog', 'dropdown-menu', 'form', 'table'];
    }
    getThemeOptions() {
        return ['light', 'dark', 'system'];
    }
    getStylingOptions() {
        return ['tailwind', 'css-modules', 'styled-components'];
    }
    // ============================================================================
    // PLUGIN INSTALLATION
    // ============================================================================
    async install(context) {
        const startTime = Date.now();
        try {
            // Initialize path resolver
            this.initializePathResolver(context);
            // Get configuration from context
            const config = context.pluginConfig;
            // Validate configuration
            const validation = this.validateConfiguration(config);
            if (!validation.valid) {
                return this.createErrorResult('Configuration validation failed', validation.errors, startTime);
            }
            // Install dependencies
            const dependencies = this.getDependencies();
            const devDependencies = this.getDevDependencies();
            await this.installDependencies(dependencies, devDependencies);
            // Generate files
            const allFiles = this.generator.generateAllFiles(config);
            for (const file of allFiles) {
                let filePath;
                if (file.path.startsWith('components/')) {
                    filePath = this.pathResolver.getUIComponentPath(file.path.replace('components/', ''));
                }
                else if (file.path === 'utils.ts') {
                    filePath = this.pathResolver.getLibPath('common', 'utils.ts');
                }
                else if (file.path === 'globals.css') {
                    filePath = this.pathResolver.getStylePath(file.path);
                }
                else {
                    filePath = this.pathResolver.getConfigPath(file.path);
                }
                await this.generateFile(filePath, file.content);
            }
            // Add scripts
            await this.addScripts({
                "ui:add": "pnpm dlx shadcn-ui@latest add"
            });
            return this.createSuccessResult([
                { type: 'config', path: 'components.json', description: 'Shadcn/UI configuration' },
                { type: 'components', path: 'src/components/ui', description: 'UI components' },
                { type: 'interface', path: this.pathResolver.getUnifiedInterfacePath('ui'), description: 'Unified UI interface' }
            ], dependencies, ['ui:add'], [], validation.warnings, startTime);
        }
        catch (error) {
            return this.createErrorResult('Shadcn/UI plugin installation failed', [error], startTime);
        }
    }
    // ============================================================================
    // DEPENDENCIES AND CONFIGURATION
    // ============================================================================
    getDependencies() {
        return [
            'tailwind-merge',
            'class-variance-authority',
            'clsx',
            'lucide-react',
            'tailwindcss-animate'
        ];
    }
    getDevDependencies() {
        return ['tailwindcss', 'postcss', 'autoprefixer'];
    }
    getCompatibility() {
        return {
            frameworks: ['nextjs', 'react', 'vue', 'svelte'],
            platforms: ['node', 'browser'],
            nodeVersions: ['>=16.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm'],
            conflicts: ['mui', 'chakra-ui', 'antd']
        };
    }
    getConflicts() {
        return ['mui', 'chakra-ui', 'antd'];
    }
    getRequirements() {
        return [
            { type: 'framework', name: 'React, Vue, or Svelte' },
            { type: 'node', version: '>=16.0.0' }
        ];
    }
    getDefaultConfig() {
        return {
            components: ['button', 'card'],
            theme: 'system',
            styling: 'tailwind'
        };
    }
    getConfigSchema() {
        return {
            type: 'object',
            properties: {
                components: { type: 'array', items: { type: 'string' } },
                theme: { type: 'string', enum: ['light', 'dark', 'system'] },
                styling: { type: 'string', enum: ['tailwind', 'css-modules', 'styled-components'] }
            },
            required: ['components']
        };
    }
}
//# sourceMappingURL=ShadcnUIPlugin.js.map