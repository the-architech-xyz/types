/**
 * Configuration Manager
 *
 * Centralizes all project configuration handling, making the CLI
 * framework-agnostic and structure-agnostic.
 */
import * as path from 'path';
import fsExtra from 'fs-extra';
export class ConfigurationManager {
    logger;
    constructor(logger) {
        if (logger) {
            this.logger = logger;
        }
    }
    /**
     * Create project configuration from user input
     */
    createConfiguration(projectName, framework, structure, options, userInput) {
        this.logger?.info(`Creating configuration for ${projectName} (${framework}, ${structure})`);
        const baseConfig = {
            // Basic project info
            name: projectName,
            version: '0.1.0',
            description: `Generated with The Architech - Revolutionary AI-Powered Application Generator`,
            author: 'The Architech Team',
            license: 'MIT',
            // Project structure
            structure,
            framework,
            // Package management
            packageManager: 'npm',
            // Features and modules
            features: this.getDefaultFeatures(framework),
            modules: this.getDefaultModules(structure),
            // Framework-specific config
            frameworkConfig: this.getFrameworkConfig(framework),
            // Build and development
            scripts: this.getDefaultScripts(structure),
            dependencies: this.getDefaultDependencies(framework),
            devDependencies: this.getDefaultDevDependencies(framework),
            // Tooling configuration
            typescript: true,
            eslint: true,
            prettier: true,
            tailwind: true,
            // Deployment
            deployment: {
                platform: 'vercel',
                useDocker: true,
                useCI: true
            },
            // Metadata
            metadata: {
                generatedBy: 'The Architech',
                generatedAt: new Date().toISOString(),
                userInput,
                options
            }
        };
        // Add workspaces for monorepo
        if (structure === 'monorepo') {
            return {
                ...baseConfig,
                workspaces: ['apps/*', 'packages/*']
            };
        }
        return baseConfig;
    }
    /**
     * Get structure configuration for project structure manager
     */
    getStructureConfig(config) {
        const structureConfig = {
            type: config.structure,
            framework: config.framework,
            rootConfig: true,
            sharedConfig: config.structure === 'monorepo'
        };
        // Add optional properties only if they exist
        if (config.structure === 'monorepo') {
            structureConfig.packages = config.modules;
            structureConfig.apps = ['web'];
        }
        return structureConfig;
    }
    /**
     * Get template data for rendering
     */
    getTemplateData(config) {
        return {
            projectName: config.name,
            packageManager: config.packageManager,
            template: config.framework,
            isMonorepo: config.structure === 'monorepo',
            framework: config.framework,
            features: config.features,
            modules: config.modules,
            scripts: config.scripts,
            dependencies: config.dependencies,
            devDependencies: config.devDependencies,
            workspaces: config.workspaces,
            typescript: config.typescript,
            eslint: config.eslint,
            prettier: config.prettier,
            tailwind: config.tailwind,
            deployment: config.deployment,
            metadata: config.metadata
        };
    }
    /**
     * Validate configuration
     */
    validateConfiguration(config) {
        const errors = [];
        // Validate required fields
        if (!config.name)
            errors.push('Project name is required');
        if (!config.framework)
            errors.push('Framework is required');
        if (!config.structure)
            errors.push('Project structure is required');
        // Validate framework
        if (!this.isValidFramework(config.framework)) {
            errors.push(`Unsupported framework: ${config.framework}`);
        }
        // Validate structure
        if (!this.isValidStructure(config.structure)) {
            errors.push(`Unsupported structure: ${config.structure}`);
        }
        // Validate package manager
        if (!this.isValidPackageManager(config.packageManager)) {
            errors.push(`Unsupported package manager: ${config.packageManager}`);
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
    /**
     * Save configuration to file
     */
    async saveConfiguration(projectPath, config) {
        const configPath = path.join(projectPath, '.architech.json');
        try {
            await fsExtra.writeJson(configPath, config, { spaces: 2 });
            this.logger?.success(`Configuration saved to ${configPath}`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger?.error(`Failed to save configuration: ${errorMessage}`, error);
            throw error;
        }
    }
    /**
     * Load configuration from file
     */
    async loadConfiguration(projectPath) {
        const configPath = path.join(projectPath, '.architech.json');
        try {
            if (await fsExtra.pathExists(configPath)) {
                const config = await fsExtra.readJson(configPath);
                this.logger?.success(`Configuration loaded from ${configPath}`);
                return config;
            }
            return null;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger?.error(`Failed to load configuration: ${errorMessage}`, error);
            return null;
        }
    }
    /**
     * Get default features for framework
     */
    getDefaultFeatures(framework) {
        const features = {
            'nextjs': ['typescript', 'tailwind', 'eslint', 'prettier', 'app-router'],
            'nextjs-14': ['typescript', 'tailwind', 'eslint', 'prettier', 'app-router'],
            'react': ['typescript', 'tailwind', 'eslint', 'prettier'],
            'vue': ['typescript', 'tailwind', 'eslint', 'prettier']
        };
        return features[framework] || ['typescript', 'eslint', 'prettier'];
    }
    /**
     * Get default modules for structure
     */
    getDefaultModules(structure) {
        if (structure === 'monorepo') {
            return ['ui', 'db', 'auth', 'config'];
        }
        return [];
    }
    /**
     * Get framework-specific configuration
     */
    getFrameworkConfig(framework) {
        const configs = {
            'nextjs': {
                appDir: true,
                experimental: {
                    appDir: true,
                    serverActions: true
                }
            },
            'nextjs-14': {
                appDir: true,
                experimental: {
                    appDir: true,
                    serverActions: true,
                    typedRoutes: true
                }
            },
            'react': {
                jsx: 'react-jsx',
                strict: true
            },
            'vue': {
                jsx: 'preserve',
                strict: true
            }
        };
        return configs[framework] || {};
    }
    /**
     * Get default scripts for structure
     */
    getDefaultScripts(structure) {
        if (structure === 'monorepo') {
            return {
                'build': 'turbo run build',
                'dev': 'turbo run dev',
                'lint': 'turbo run lint',
                'lint:fix': 'turbo run lint:fix',
                'type-check': 'turbo run type-check',
                'format': 'turbo run format',
                'format:check': 'turbo run format:check',
                'clean': 'turbo run clean',
                'test': 'turbo run test',
                'test:watch': 'turbo run test:watch',
                'test:coverage': 'turbo run test:coverage'
            };
        }
        else {
            return {
                'dev': 'next dev',
                'build': 'next build',
                'start': 'next start',
                'lint': 'next lint',
                'lint:fix': 'next lint --fix',
                'type-check': 'tsc --noEmit',
                'format': 'prettier --write .',
                'format:check': 'prettier --check .',
                'clean': 'rm -rf .next out dist'
            };
        }
    }
    /**
     * Get default dependencies for framework
     */
    getDefaultDependencies(framework) {
        const dependencies = {
            'nextjs': {
                'next': '^14.2.0',
                'react': '^18.3.0',
                'react-dom': '^18.3.0'
            },
            'nextjs-14': {
                'next': '^14.2.0',
                'react': '^18.3.0',
                'react-dom': '^18.3.0'
            },
            'react': {
                'react': '^18.3.0',
                'react-dom': '^18.3.0'
            },
            'vue': {
                'vue': '^3.4.0'
            }
        };
        return dependencies[framework] || {};
    }
    /**
     * Get default dev dependencies for framework
     */
    getDefaultDevDependencies(framework) {
        const devDependencies = {
            'nextjs': {
                '@types/node': '^20.0.0',
                '@types/react': '^18.0.0',
                '@types/react-dom': '^18.0.0',
                'typescript': '^5.4.0',
                'eslint': '^8.57.0',
                'prettier': '^3.2.0',
                'tailwindcss': '^3.4.0',
                'autoprefixer': '^10.4.0',
                'postcss': '^8.4.0'
            },
            'nextjs-14': {
                '@types/node': '^20.0.0',
                '@types/react': '^18.0.0',
                '@types/react-dom': '^18.0.0',
                'typescript': '^5.4.0',
                'eslint': '^8.57.0',
                'prettier': '^3.2.0',
                'tailwindcss': '^3.4.0',
                'autoprefixer': '^10.4.0',
                'postcss': '^8.4.0'
            },
            'react': {
                '@types/node': '^20.0.0',
                '@types/react': '^18.0.0',
                '@types/react-dom': '^18.0.0',
                'typescript': '^5.4.0',
                'eslint': '^8.57.0',
                'prettier': '^3.2.0',
                'tailwindcss': '^3.4.0',
                'autoprefixer': '^10.4.0',
                'postcss': '^8.4.0'
            },
            'vue': {
                '@types/node': '^20.0.0',
                'typescript': '^5.4.0',
                'eslint': '^8.57.0',
                'prettier': '^3.2.0',
                'tailwindcss': '^3.4.0',
                'autoprefixer': '^10.4.0',
                'postcss': '^8.4.0'
            }
        };
        return devDependencies[framework] || {};
    }
    /**
     * Validate framework
     */
    isValidFramework(framework) {
        const validFrameworks = ['nextjs', 'nextjs-14', 'react', 'vue'];
        return validFrameworks.includes(framework);
    }
    /**
     * Validate structure
     */
    isValidStructure(structure) {
        return structure === 'single-app' || structure === 'monorepo';
    }
    /**
     * Validate package manager
     */
    isValidPackageManager(packageManager) {
        const validPackageManagers = ['npm', 'yarn', 'pnpm', 'bun', 'auto'];
        return validPackageManagers.includes(packageManager);
    }
}
//# sourceMappingURL=configuration-manager.js.map