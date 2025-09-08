/**
 * Orchestrator Agent
 *
 * Main orchestrator that coordinates all agents
 * Reads YAML recipe and delegates to appropriate agents
 */
import { DecentralizedPathHandler } from '../core/services/path/decentralized-path-handler.js';
import { AdapterLoader } from '../core/services/adapter/adapter-loader.js';
import { IntegrationRegistry } from '../core/services/integration/integration-registry.js';
import { IntegrationExecutor } from '../core/services/integration/integration-executor.js';
import { BlueprintExecutor } from '../core/services/blueprint/blueprint-executor.js';
import * as path from 'path';
import { FrameworkAgent } from './core/framework-agent.js';
import { DatabaseAgent } from './core/database-agent.js';
import { AuthAgent } from './core/auth-agent.js';
import { UIAgent } from './core/ui-agent.js';
import { TestingAgent } from './core/testing-agent.js';
import { DeploymentAgent } from './core/deployment-agent.js';
import { StateAgent } from './core/state-agent.js';
import { PaymentAgent } from './core/payment-agent.js';
import { EmailAgent } from './core/email-agent.js';
import { ObservabilityAgent } from './core/observability-agent.js';
import { ContentAgent } from './core/content-agent.js';
import { BlockchainAgent } from './core/blockchain-agent.js';
import { VFSManager } from '../core/services/file-engine/vfs-manager.js';
export class OrchestratorAgent {
    projectManager;
    pathHandler;
    decentralizedPathHandler = null;
    adapterLoader;
    agents;
    integrationRegistry;
    integrationExecutor;
    vfsManager = null;
    constructor(projectManager) {
        this.projectManager = projectManager;
        this.pathHandler = projectManager.getPathHandler();
        this.adapterLoader = new AdapterLoader();
        this.agents = new Map();
        // Initialize integration services
        this.integrationRegistry = new IntegrationRegistry();
        // Initialize agents (will be reconfigured with decentralized path handler)
        this.initializeAgents();
    }
    /**
     * Initialize all agents
     */
    initializeAgents() {
        this.agents.set('framework', new FrameworkAgent(this.pathHandler));
        this.agents.set('database', new DatabaseAgent(this.pathHandler));
        this.agents.set('auth', new AuthAgent(this.pathHandler));
        this.agents.set('ui', new UIAgent(this.pathHandler));
        this.agents.set('testing', new TestingAgent(this.pathHandler));
        this.agents.set('deployment', new DeploymentAgent(this.pathHandler));
        this.agents.set('state', new StateAgent(this.pathHandler));
        this.agents.set('payment', new PaymentAgent(this.pathHandler));
        this.agents.set('email', new EmailAgent(this.pathHandler));
        this.agents.set('observability', new ObservabilityAgent(this.pathHandler));
        this.agents.set('content', new ContentAgent(this.pathHandler));
        this.agents.set('blockchain', new BlockchainAgent(this.pathHandler));
    }
    /**
     * Reconfigure all agents with the decentralized path handler and shared VFS
     */
    reconfigureAgents() {
        if (!this.decentralizedPathHandler) {
            throw new Error('Decentralized path handler not initialized');
        }
        if (!this.vfsManager) {
            throw new Error('VFS manager not initialized');
        }
        // Update all agents to use the decentralized path handler and shared VFS
        this.agents.set('framework', new FrameworkAgent(this.decentralizedPathHandler, this.vfsManager));
        this.agents.set('database', new DatabaseAgent(this.decentralizedPathHandler, this.vfsManager));
        this.agents.set('auth', new AuthAgent(this.decentralizedPathHandler, this.vfsManager));
        this.agents.set('ui', new UIAgent(this.decentralizedPathHandler, this.vfsManager));
        this.agents.set('testing', new TestingAgent(this.decentralizedPathHandler, this.vfsManager));
        this.agents.set('deployment', new DeploymentAgent(this.decentralizedPathHandler, this.vfsManager));
        this.agents.set('state', new StateAgent(this.decentralizedPathHandler, this.vfsManager));
        this.agents.set('payment', new PaymentAgent(this.decentralizedPathHandler, this.vfsManager));
        this.agents.set('email', new EmailAgent(this.decentralizedPathHandler, this.vfsManager));
        this.agents.set('observability', new ObservabilityAgent(this.decentralizedPathHandler, this.vfsManager));
        this.agents.set('content', new ContentAgent(this.decentralizedPathHandler, this.vfsManager));
        this.agents.set('blockchain', new BlockchainAgent(this.decentralizedPathHandler, this.vfsManager));
    }
    /**
     * Execute a complete recipe
     */
    async executeRecipe(recipe) {
        console.log(`🎯 Orchestrator Agent executing recipe: ${recipe.project.name}`);
        const results = [];
        const errors = [];
        const warnings = [];
        try {
            // 1. Initialize shared VFS manager
            this.vfsManager = VFSManager.getInstance(this.pathHandler.getProjectRoot());
            console.log(`🗂️ Shared VFS initialized for project: ${this.pathHandler.getProjectRoot()}`);
            // 2. Identify framework adapter and create decentralized path handler
            const frameworkModule = recipe.modules.find(m => m.category === 'framework');
            if (!frameworkModule) {
                throw new Error('No framework module found in recipe. Framework adapter is required.');
            }
            console.log(`🏗️ Loading framework adapter: ${frameworkModule.id}`);
            // Extract adapter ID from module ID (e.g., "framework/nextjs" -> "nextjs")
            const adapterId = frameworkModule.id.split('/').pop() || frameworkModule.id;
            const frameworkAdapter = await this.adapterLoader.loadAdapter(frameworkModule.category, adapterId);
            // 3. Create decentralized path handler with framework's path declarations
            this.decentralizedPathHandler = new DecentralizedPathHandler(frameworkAdapter.config, this.pathHandler.getProjectRoot());
            console.log(`📁 Framework paths configured:`, this.decentralizedPathHandler.getAllPaths());
            // 4. Reconfigure all agents with the new path handler and shared VFS
            this.reconfigureAgents();
            // 4. Only create the project directory structure
            // Framework modules will handle all project setup
            await this.projectManager.initializeProject();
            console.log('📋 Project directory created - framework modules will handle setup');
            // 2. Execute modules sequentially
            for (let i = 0; i < recipe.modules.length; i++) {
                const module = recipe.modules[i];
                if (!module) {
                    errors.push(`Module at index ${i} is undefined`);
                    break;
                }
                console.log(`🚀 [${i + 1}/${recipe.modules.length}] Executing module: ${module.id} (${module.category})`);
                try {
                    // Get the appropriate agent
                    const agent = this.agents.get(module.category);
                    if (!agent) {
                        const error = `No agent found for category: ${module.category}`;
                        errors.push(error);
                        console.error(`❌ ${error}`);
                        break;
                    }
                    // Load adapter for this module
                    // Extract adapter ID from module ID (e.g., "auth/better-auth" -> "better-auth")
                    const moduleAdapterId = module.id.split('/').pop() || module.id;
                    const adapter = await this.adapterLoader.loadAdapter(module.category, moduleAdapterId);
                    // Create project context with decentralized path handler and adapter
                    const context = {
                        project: {
                            ...recipe.project,
                            path: this.pathHandler.getProjectRoot()
                        },
                        module: module,
                        pathHandler: this.decentralizedPathHandler,
                        adapter: adapter.config,
                        framework: recipe.project.framework
                    };
                    // Execute the module with the agent
                    const moduleResult = await agent.execute(module, context);
                    if (moduleResult.success) {
                        results.push(...moduleResult.files);
                        warnings.push(...moduleResult.warnings);
                        console.log(`✅ Module ${module.id} completed successfully`);
                    }
                    else {
                        errors.push(...moduleResult.errors);
                        console.error(`❌ Module ${module.id} failed: ${moduleResult.errors.join(', ')}`);
                        // Stop on first failure
                        break;
                    }
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    errors.push(`Module ${module.id}: ${errorMessage}`);
                    console.error(`❌ Module ${module.id} failed: ${errorMessage}`);
                    // Stop on first failure
                    break;
                }
            }
            const success = errors.length === 0;
            if (success) {
                console.log(`🎉 Recipe orchestrated successfully! ${results.length} files created`);
                // Execute integration adapters if any are specified
                if (recipe.integrations && recipe.integrations.length > 0) {
                    console.log(`🔗 Executing ${recipe.integrations.length} integration adapters...`);
                    await this.executeIntegrationAdapters(recipe, results, errors, warnings);
                }
                // Create architech.json file
                await this.createArchitechConfig(recipe);
                // Flush all VFS changes to disk
                console.log('💾 Flushing all changes to disk...');
                await this.vfsManager.flushToDisk();
                console.log('✅ All files written to disk successfully');
                // Final step: Install all dependencies
                if (!recipe.options?.skipInstall) {
                    console.log('📦 Installing dependencies...');
                    await this.installDependencies();
                }
            }
            else {
                console.error(`💥 Recipe orchestration failed with ${errors.length} errors`);
            }
            return {
                success,
                modulesExecuted: success ? recipe.modules.length : 0,
                errors,
                warnings
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`💥 Orchestration failed: ${errorMessage}`);
            return {
                success: false,
                modulesExecuted: 0,
                errors: [errorMessage],
                warnings: []
            };
        }
    }
    /**
     * Get available agents
     */
    getAvailableAgents() {
        return Array.from(this.agents.keys());
    }
    /**
     * Get agent by category
     */
    getAgent(category) {
        return this.agents.get(category);
    }
    /**
     * Create architech.json configuration file
     */
    async createArchitechConfig(recipe) {
        try {
            const config = {
                version: '1.0',
                project: {
                    name: recipe.project.name,
                    framework: recipe.project.framework,
                    description: recipe.project.description,
                    path: recipe.project.path
                },
                modules: recipe.modules.map(module => ({
                    id: module.id,
                    category: module.category,
                    version: module.version,
                    parameters: module.parameters,
                    features: module.features || []
                })),
                options: recipe.options || {}
            };
            const configPath = path.join(this.pathHandler.getProjectRoot(), 'architech.json');
            const fs = await import('fs/promises');
            await fs.writeFile(configPath, JSON.stringify(config, null, 2));
            console.log('📋 Created architech.json configuration file');
        }
        catch (error) {
            console.error('❌ Failed to create architech.json:', error);
        }
    }
    /**
     * Execute integration features
     */
    async executeIntegrationAdapters(recipe, results, errors, warnings) {
        try {
            // Initialize integration executor with shared VFS
            const blueprintExecutor = new BlueprintExecutor(recipe.project.path || '.', this.vfsManager.getEngine());
            this.integrationExecutor = new IntegrationExecutor(blueprintExecutor);
            // Get available modules for validation (extract adapter IDs)
            const availableModules = recipe.modules.map(m => m.id.split('/').pop() || m.id);
            for (const integrationConfig of recipe.integrations) {
                console.log(`🔗 Executing integration adapter: ${integrationConfig.name}`);
                // Load integration adapter
                const integration = await this.integrationRegistry.get(integrationConfig.name);
                if (!integration) {
                    const error = `Integration adapter not found: ${integrationConfig.name}`;
                    errors.push(error);
                    console.error(`❌ ${error}`);
                    continue;
                }
                // Validate requirements
                if (!this.integrationExecutor.validateRequirements(integration, availableModules)) {
                    const error = `Integration ${integrationConfig.name} requirements not met`;
                    errors.push(error);
                    console.error(`❌ ${error}`);
                    continue;
                }
                // Validate features
                if (!this.integrationExecutor.validateFeatures(integration, integrationConfig.features)) {
                    const error = `Integration ${integrationConfig.name} features validation failed`;
                    errors.push(error);
                    console.error(`❌ ${error}`);
                    continue;
                }
                // Create context for integration
                const context = {
                    project: {
                        ...recipe.project,
                        path: this.pathHandler.getProjectRoot()
                    },
                    module: {
                        id: integrationConfig.name,
                        category: 'integration',
                        version: '1.0.0',
                        parameters: {}
                    },
                    pathHandler: this.decentralizedPathHandler,
                    adapter: { id: integrationConfig.name },
                    framework: recipe.project.framework
                };
                // Execute integration with sub-features
                await this.integrationExecutor.executeIntegration(integration, context, integrationConfig.features);
                // Add created files to results
                results.push(...integration.provides.files);
                console.log(`✅ Integration adapter ${integrationConfig.name} completed successfully`);
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            errors.push(`Integration execution failed: ${errorMessage}`);
            console.error(`❌ Integration execution failed: ${errorMessage}`);
        }
    }
    /**
     * Install dependencies (delegated to project manager)
     */
    async installDependencies() {
        try {
            console.log('📦 Installing dependencies...');
            const { exec } = await import('child_process');
            const { promisify } = await import('util');
            const execAsync = promisify(exec);
            await execAsync('npm install', {
                cwd: this.pathHandler.getProjectRoot()
            });
            console.log('✅ Dependencies installed successfully');
        }
        catch (error) {
            console.warn('⚠️ Failed to install dependencies automatically. Please run "npm install" manually.');
            console.warn(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
//# sourceMappingURL=orchestrator-agent.js.map