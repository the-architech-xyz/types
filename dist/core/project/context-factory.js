/**
 * Context Factory
 *
 * Creates and manages execution contexts for agents and plugins.
 * Provides a consistent interface for context creation across the system.
 */
import * as path from 'path';
import * as os from 'os';
import { CommandRunner } from '../cli/command-runner.js';
import { structureService } from './structure-service.js';
// Helper function to get environment info
function getEnvironmentInfo() {
    return {
        nodeVersion: process.version,
        platform: os.platform(),
        arch: os.arch(),
        cwd: process.cwd(),
        env: Object.fromEntries(Object.entries(process.env).filter(([_, value]) => value !== undefined))
    };
}
export class ContextFactory {
    /**
     * Creates a context for agent execution
     */
    static createContext(projectName, options = {}, config = {}, dependencies = []) {
        const projectPath = path.resolve(process.cwd(), projectName);
        // Create command runner
        const runner = new CommandRunner(options.packageManager || 'auto', {
            verbose: options.verbose || false
        });
        // Create logger
        const logger = {
            info: (message) => console.log(`ℹ️  ${message}`),
            success: (message) => console.log(`✅ ${message}`),
            warn: (message) => console.log(`⚠️  ${message}`),
            error: (message, error) => {
                console.error(`❌ ${message}`);
                if (error && options.verbose) {
                    console.error(error);
                }
            },
            debug: (message) => {
                if (options.verbose) {
                    console.log(`🔍 ${message}`);
                }
            },
            log: (level, message, context) => {
                console.log(`[${level.toUpperCase()}] ${message}`, context || '');
            }
        };
        // Create execution options
        const executionOptions = {
            verbose: options.verbose || false,
            skipGit: options.skipGit || false,
            skipInstall: options.skipInstall || false,
            useDefaults: options.useDefaults || false,
            force: options.force || false
        };
        // Get environment info
        const environment = getEnvironmentInfo();
        // Create structure info using the centralized service
        const userPreference = config.projectType || 'quick-prototype';
        const structureInfo = structureService.createStructureInfo(userPreference, config.template || 'nextjs-14');
        // Create context
        const context = {
            projectName,
            projectPath,
            packageManager: runner.getPackageManager(),
            options: executionOptions,
            config,
            runner,
            logger,
            state: new Map(),
            dependencies,
            environment,
            // Use the centralized structure service
            projectStructure: structureInfo
        };
        return context;
    }
    /**
     * Creates a context for plugin execution
     */
    static createPluginContext(projectName, projectPath, pluginId, pluginConfig, structure, options = {}) {
        const runner = new CommandRunner('auto', {
            verbose: options.verbose || false
        });
        const logger = {
            info: (message) => console.log(`[${pluginId}] ℹ️  ${message}`),
            success: (message) => console.log(`[${pluginId}] ✅ ${message}`),
            warn: (message) => console.log(`[${pluginId}] ⚠️  ${message}`),
            error: (message, error) => {
                console.error(`[${pluginId}] ❌ ${message}`);
                if (error && options.verbose) {
                    console.error(error);
                }
            },
            debug: (message) => {
                if (options.verbose) {
                    console.log(`[${pluginId}] 🔍 ${message}`);
                }
            },
            log: (level, message, context) => {
                console.log(`[${pluginId}] [${level.toUpperCase()}] ${message}`, context || '');
            }
        };
        return {
            projectName,
            projectPath,
            packageManager: runner.getPackageManager(),
            options,
            config: pluginConfig,
            runner,
            logger,
            state: new Map(),
            dependencies: [],
            environment: getEnvironmentInfo(),
            pluginId,
            pluginConfig,
            installedPlugins: [],
            projectType: 'nextjs',
            targetPlatform: ['web'],
            // Use the centralized structure service
            projectStructure: structure
        };
    }
    /**
     * Creates a context for the traditional create workflow
     */
    static createTraditionalContext(projectName, template, modules, options = {}) {
        const config = {
            template,
            modules,
            isMonorepo: false,
            structure: 'single-app'
        };
        return this.createContext(projectName, options, config, modules);
    }
}
//# sourceMappingURL=context-factory.js.map