import { BasePlugin } from './BasePlugin.js';
import { PluginCategory } from '../../types/plugins.js';
import { FrameworkOption, BuildOption, DeploymentOption } from '../../types/plugins.js';
export class BaseFrameworkPlugin extends BasePlugin {
    // ============================================================================
    // SHARED LOGIC - Common framework functionality
    // ============================================================================
    getFrameworkOptions() {
        return Object.values(FrameworkOption);
    }
    getBuildOptions() {
        return Object.values(BuildOption);
    }
    getDeploymentOptions() {
        return Object.values(DeploymentOption);
    }
    // ============================================================================
    // PARAMETER SCHEMA
    // ============================================================================
    getBaseFrameworkSchema() {
        return {
            category: PluginCategory.FRAMEWORK,
            parameters: [
                {
                    id: 'framework',
                    name: 'Framework',
                    type: 'select',
                    description: 'The main framework to use.',
                    required: true,
                    default: FrameworkOption.NEXTJS,
                    options: this.getFrameworkOptions().map(opt => ({ value: opt, label: opt })),
                    group: 'core'
                },
                {
                    id: 'typescript',
                    name: 'TypeScript',
                    type: 'boolean',
                    description: 'Enable TypeScript support.',
                    required: true,
                    default: true,
                    group: 'core'
                },
                {
                    id: 'eslint',
                    name: 'ESLint',
                    type: 'boolean',
                    description: 'Enable ESLint for code linting.',
                    required: true,
                    default: true,
                    group: 'core'
                },
                {
                    id: 'buildTool',
                    name: 'Build Tool',
                    type: 'select',
                    description: 'The build tool to use.',
                    required: true,
                    default: BuildOption.VITE,
                    options: this.getBuildOptions().map(opt => ({ value: opt, label: opt })),
                    group: 'build'
                },
                {
                    id: 'optimization',
                    name: 'Optimization',
                    type: 'boolean',
                    description: 'Enable build optimizations.',
                    required: true,
                    default: true,
                    group: 'build'
                },
                {
                    id: 'deploymentPlatform',
                    name: 'Deployment Platform',
                    type: 'select',
                    description: 'The platform to deploy to.',
                    required: false,
                    default: DeploymentOption.STATIC,
                    options: this.getDeploymentOptions().map(opt => ({ value: opt, label: opt })),
                    group: 'deployment'
                }
            ],
            dependencies: [],
            validations: []
        };
    }
    generateFrameworkConfig(config) {
        return {
            framework: config.framework,
            buildTool: config.buildTool,
            deploymentTarget: config.deploymentTarget,
            bundler: config.bundler,
            transpiler: config.transpiler,
            minifier: config.minifier,
            sourceMaps: config.sourceMaps,
            optimization: config.optimization
        };
    }
    addFrameworkScripts(config) {
        const scripts = {
            'dev': 'next dev',
            'build': 'next build',
            'start': 'next start',
            'lint': 'next lint'
        };
        if (config.typescript) {
            scripts['type-check'] = 'tsc --noEmit';
        }
        return scripts;
    }
    // ============================================================================
    // IMPLEMENTED METHODS FROM IEnhancedPlugin
    // ============================================================================
    getDynamicQuestions(context) {
        // Framework plugins typically don't need dynamic questions
        return [];
    }
    validateConfiguration(config) {
        const errors = [];
        const warnings = [];
        if (!config.framework) {
            errors.push({
                field: 'framework',
                message: 'Framework is required',
                code: 'MISSING_FRAMEWORK',
                severity: 'error'
            });
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
}
//# sourceMappingURL=BaseFrameworkPlugin.js.map