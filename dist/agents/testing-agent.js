/**
 * Testing Agent - Testing Framework Orchestrator
 *
 * Pure orchestrator for testing framework setup using unified interfaces.
 * Handles user interaction, decision making, and coordinates testing plugins through unified interfaces.
 * No direct installation logic - delegates everything to plugins through adapters.
 */
import { AbstractAgent } from './base/abstract-agent.js';
import { ProjectType, TargetPlatform } from '../types/plugin.js';
import { AgentCategory, CapabilityCategory } from '../types/agent.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
export class TestingAgent extends AbstractAgent {
    // ============================================================================
    // AGENT METADATA
    // ============================================================================
    getAgentMetadata() {
        return {
            name: 'Testing Agent',
            version: '1.0.0',
            description: 'Orchestrates testing framework setup using unified interfaces',
            author: 'The Architech Team',
            category: AgentCategory.TESTING,
            tags: ['testing', 'vitest', 'jest', 'playwright', 'unified-interface'],
            dependencies: ['base-project', 'framework'],
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
                id: 'testing-setup',
                name: 'Testing Setup',
                description: 'Setup testing framework with unified interfaces',
                category: CapabilityCategory.SETUP,
                parameters: [
                    {
                        name: 'framework',
                        type: 'string',
                        description: 'Testing framework',
                        required: false,
                        defaultValue: 'vitest'
                    },
                    {
                        name: 'coverage',
                        type: 'boolean',
                        description: 'Enable code coverage',
                        required: false,
                        defaultValue: true
                    },
                    {
                        name: 'e2e',
                        type: 'boolean',
                        description: 'Enable end-to-end testing',
                        required: false,
                        defaultValue: false
                    },
                    {
                        name: 'unitTesting',
                        type: 'boolean',
                        description: 'Enable unit testing',
                        required: false,
                        defaultValue: true
                    },
                    {
                        name: 'integrationTesting',
                        type: 'boolean',
                        description: 'Enable integration testing',
                        required: false,
                        defaultValue: true
                    }
                ],
                examples: [
                    {
                        name: 'Setup Vitest with coverage',
                        description: 'Creates testing setup with Vitest and coverage reporting using unified interfaces',
                        parameters: { framework: 'vitest', coverage: true, unitTesting: true },
                        expectedResult: 'Complete testing setup with Vitest via unified interface'
                    },
                    {
                        name: 'Setup Playwright for E2E',
                        description: 'Creates testing setup with Playwright for end-to-end testing using unified interfaces',
                        parameters: { framework: 'playwright', e2e: true, unitTesting: false },
                        expectedResult: 'Testing setup with Playwright E2E via unified interface'
                    }
                ]
            },
            {
                id: 'testing-validation',
                name: 'Testing Validation',
                description: 'Validate testing setup',
                category: CapabilityCategory.VALIDATION,
                parameters: [],
                examples: [
                    {
                        name: 'Validate testing setup',
                        description: 'Validates the testing setup using unified interfaces',
                        parameters: {},
                        expectedResult: 'Testing setup validation report'
                    }
                ]
            }
        ];
    }
    // ============================================================================
    // CORE EXECUTION - Pure Plugin Orchestration with Unified Interfaces
    // ============================================================================
    async executeInternal(context) {
        const startTime = Date.now();
        try {
            context.logger.info('Setting up testing for project: ' + context.projectName);
            // Get testing configuration
            const testingConfig = await this.getTestingConfig(context);
            // Skip if testing is disabled
            if (!testingConfig.framework || testingConfig.framework === 'none') {
                context.logger.info('Testing disabled, skipping setup');
                return {
                    success: true,
                    data: { testing: 'disabled' },
                    artifacts: [],
                    warnings: ['Testing setup skipped'],
                    duration: Date.now() - startTime
                };
            }
            // Select testing plugin based on user preferences or project requirements
            const selectedPlugin = await this.selectTestingPlugin(context, testingConfig);
            // Execute testing plugin through unified interface
            context.logger.info(`Executing ${selectedPlugin} plugin through unified interface...`);
            const result = await this.executeTestingPluginUnified(context, selectedPlugin, testingConfig);
            // Validate the setup using unified interface
            await this.validateTestingSetupUnified(context, selectedPlugin);
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: result.artifacts || [],
                data: {
                    plugin: selectedPlugin,
                    framework: testingConfig.framework,
                    coverage: testingConfig.coverage,
                    e2e: testingConfig.e2e,
                    features: testingConfig.features,
                    unifiedInterface: true
                },
                errors: [],
                warnings: result.warnings || [],
                duration
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            context.logger.error(`Testing setup failed: ${errorMessage}`);
            return this.createErrorResult('TESTING_SETUP_FAILED', `Failed to setup testing: ${errorMessage}`, [], startTime, error);
        }
    }
    // ============================================================================
    // UNIFIED INTERFACE EXECUTION
    // ============================================================================
    async executeTestingPluginUnified(context, pluginName, testingConfig) {
        try {
            context.logger.info(`Starting unified execution of ${pluginName} plugin...`);
            // Get the selected plugin
            const plugin = this.pluginSystem.getRegistry().get(pluginName);
            if (!plugin) {
                throw new Error(`${pluginName} plugin not found in registry`);
            }
            context.logger.info(`Found ${pluginName} plugin in registry`);
            // Prepare plugin context
            const pluginContext = {
                ...context,
                pluginId: pluginName,
                pluginConfig: this.getPluginConfig(testingConfig, pluginName),
                installedPlugins: [],
                projectType: ProjectType.NEXTJS,
                targetPlatform: [TargetPlatform.WEB, TargetPlatform.SERVER]
            };
            context.logger.info(`Plugin context prepared for ${pluginName}`);
            // Validate plugin compatibility
            context.logger.info(`Validating ${pluginName} plugin...`);
            const validation = await plugin.validate(pluginContext);
            if (!validation.valid) {
                throw new Error(`${pluginName} plugin validation failed: ${validation.errors.map((e) => e.message).join(', ')}`);
            }
            context.logger.info(`${pluginName} plugin validation passed`);
            // Execute the plugin
            context.logger.info(`Executing ${pluginName} plugin...`);
            const result = await plugin.install(pluginContext);
            if (!result.success) {
                throw new Error(`${pluginName} plugin execution failed: ${result.errors.map((e) => e.message).join(', ')}`);
            }
            context.logger.info(`${pluginName} plugin execution completed successfully`);
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to execute testing plugin ${pluginName}: ${errorMessage}`);
        }
    }
    async validateTestingSetupUnified(context, pluginName) {
        try {
            context.logger.info(`Validating testing setup using unified interface for ${pluginName}...`);
            // Get the plugin and validate it
            const plugin = this.pluginSystem.getRegistry().get(pluginName);
            if (!plugin) {
                throw new Error(`Testing plugin not found: ${pluginName}`);
            }
            const pluginContext = {
                ...context,
                pluginId: pluginName,
                pluginConfig: {},
                installedPlugins: [],
                projectType: ProjectType.NEXTJS,
                targetPlatform: [TargetPlatform.WEB, TargetPlatform.SERVER]
            };
            const validation = await plugin.validate(pluginContext);
            if (!validation.valid) {
                const errorMessages = validation.errors.map((e) => e.message).join(', ');
                throw new Error(`Testing plugin validation failed: ${errorMessages}`);
            }
            context.logger.success(`Testing plugin ${pluginName} validation passed`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Testing plugin validation failed: ${errorMessage}`);
        }
    }
    // ============================================================================
    // PLUGIN SELECTION
    // ============================================================================
    async selectTestingPlugin(context, testingConfig) {
        // Get plugin selection from context to determine which testing to use
        const pluginSelection = context.state.get('pluginSelection');
        const selectedTesting = pluginSelection?.testing?.framework;
        if (selectedTesting && selectedTesting !== 'none') {
            context.logger.info(`Using user selection for testing: ${selectedTesting}`);
            return selectedTesting;
        }
        // Check if user has specified a preference
        const userPreference = context.state.get('testingFramework');
        if (userPreference) {
            context.logger.info(`Using user preference for testing: ${userPreference}`);
            return userPreference;
        }
        // Check if project has specified testing framework
        const projectTesting = context.config.testing?.framework;
        if (projectTesting) {
            context.logger.info(`Using project testing framework: ${projectTesting}`);
            return projectTesting;
        }
        // Default to Vitest for modern projects
        context.logger.info('Using default testing framework: vitest');
        return 'vitest';
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
        // Check if testing plugins are available
        const availablePlugins = ['vitest', 'jest', 'playwright'];
        for (const pluginName of availablePlugins) {
            const plugin = this.pluginSystem.getRegistry().get(pluginName);
            if (!plugin) {
                warnings.push(`${pluginName} testing plugin not found in registry`);
            }
        }
        // Check if project is ready for testing
        const packageJsonPath = path.join(context.projectPath, 'package.json');
        if (!await fsExtra.pathExists(packageJsonPath)) {
            errors.push({
                field: 'project',
                message: 'Project package.json not found',
                code: 'PROJECT_NOT_READY',
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
    // PRIVATE METHODS - Testing Setup
    // ============================================================================
    async getTestingConfig(context) {
        // Get configuration from context or use defaults
        const userConfig = context.config.testing || {};
        const pluginSelection = context.state.get('pluginSelection');
        const testingSelection = pluginSelection?.testing;
        return {
            framework: testingSelection?.framework || userConfig.framework || 'vitest',
            coverage: testingSelection?.coverage ?? userConfig.coverage ?? true,
            e2e: testingSelection?.e2e ?? userConfig.e2e ?? false,
            features: {
                unitTesting: testingSelection?.features?.unitTesting ?? userConfig.unitTesting ?? true,
                integrationTesting: testingSelection?.features?.integrationTesting ?? userConfig.integrationTesting ?? true,
                e2eTesting: testingSelection?.features?.e2eTesting ?? userConfig.e2eTesting ?? false,
                coverageReporting: testingSelection?.features?.coverageReporting ?? userConfig.coverageReporting ?? true,
                testUtilities: testingSelection?.features?.testUtilities ?? userConfig.testUtilities ?? true
            }
        };
    }
    getPluginConfig(testingConfig, pluginName) {
        const config = {
            framework: testingConfig.framework,
            coverage: testingConfig.coverage,
            e2e: testingConfig.e2e,
            features: testingConfig.features
        };
        // Add specific plugin-specific configurations if needed
        if (pluginName === 'vitest') {
            config.configFile = 'vitest.config.ts';
            config.testPattern = '**/*.{test,spec}.{js,ts,jsx,tsx}';
        }
        else if (pluginName === 'jest') {
            config.configFile = 'jest.config.js';
            config.testPattern = '**/*.{test,spec}.{js,ts,jsx,tsx}';
        }
        else if (pluginName === 'playwright') {
            config.configFile = 'playwright.config.ts';
            config.testDir = 'tests';
        }
        return config;
    }
    // ============================================================================
    // ROLLBACK
    // ============================================================================
    async rollback(context) {
        context.logger.warn('Rolling back testing setup...');
        try {
            // Get the testing plugin for uninstallation
            const testingConfig = await this.getTestingConfig(context);
            const pluginName = await this.selectTestingPlugin(context, testingConfig);
            const plugin = this.pluginSystem.getRegistry().get(pluginName);
            if (plugin) {
                const pluginContext = {
                    ...context,
                    pluginId: pluginName,
                    pluginConfig: this.getPluginConfig(testingConfig, pluginName),
                    installedPlugins: [],
                    projectType: ProjectType.NEXTJS,
                    targetPlatform: [TargetPlatform.WEB, TargetPlatform.SERVER]
                };
                await plugin.uninstall(pluginContext);
            }
            context.logger.success('Testing setup rollback completed');
        }
        catch (error) {
            context.logger.error('Testing rollback failed', error);
        }
    }
}
//# sourceMappingURL=testing-agent.js.map