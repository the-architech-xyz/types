/**
 * Abstract Base Agent Class
 *
 * Provides a foundation for all Architech agents with common functionality:
 * - Lifecycle management
 * - Error handling
 * - Performance monitoring
 * - State management
 * - Logging
 * - Question generation support
 * - Standardized plugin execution
 */
import chalk from 'chalk';
import { performance } from 'perf_hooks';
import * as crypto from 'crypto';
import { AGENT_ERROR_CODES, AGENT_INTERFACE_VERSION } from '../../types/agents.js';
import { PluginSystem } from '../../core/plugin/plugin-system.js';
import { ProjectType, TargetPlatform } from '../../types/plugins.js';
import { structureService } from '../../core/project/structure-service.js';
import * as fsExtra from 'fs-extra';
import * as path from 'path';
// New question generation system imports
import { ProgressiveFlow, EcommerceStrategy, BlogStrategy, DashboardStrategy } from '../../core/questions/index.js';
// Dynamic import for ora
let oraModule = null;
async function getOra() {
    if (!oraModule) {
        oraModule = await import('ora');
    }
    return oraModule.default;
}
export class AbstractAgent {
    spinner = null;
    startTime = 0;
    currentState = undefined;
    pluginSystem;
    progressiveFlow;
    constructor() {
        this.pluginSystem = PluginSystem.getInstance();
        this.progressiveFlow = new ProgressiveFlow();
    }
    // ============================================================================
    // CORE EXECUTION
    // ============================================================================
    async execute(context) {
        const startTime = performance.now();
        this.startTime = startTime;
        try {
            // Initialize logging context
            context.logger.info(`Starting agent: ${this.getMetadata().name}`, {
                agent: this.getMetadata().name,
                category: this.getMetadata().category
            });
            // Pre-execution validation
            const validation = await this.validate(context);
            if (!validation.valid) {
                return this.createErrorResult(AGENT_ERROR_CODES.VALIDATION_FAILED, 'Validation failed', validation.errors, startTime);
            }
            // Preparation phase
            await this.prepare?.(context);
            // Main execution
            const result = await this.executeInternal(context);
            // Cleanup phase
            await this.cleanup?.(context);
            // Calculate metrics
            const metrics = this.calculateMetrics(startTime);
            const finalResult = {
                ...result,
                duration: performance.now() - startTime,
                metrics
            };
            if (this.currentState) {
                finalResult.state = this.currentState;
            }
            return finalResult;
        }
        catch (error) {
            context.logger.error(`Agent execution failed: ${this.getMetadata().name}`, error);
            // Attempt rollback if available
            try {
                await this.rollback?.(context);
            }
            catch (rollbackError) {
                context.logger.error('Rollback failed', rollbackError);
            }
            return this.createErrorResult(AGENT_ERROR_CODES.EXECUTION_FAILED, error instanceof Error ? error.message : 'Unknown error', [], startTime, error);
        }
    }
    // ============================================================================
    // QUESTION GENERATION SYSTEM
    // ============================================================================
    /**
     * Execute the question flow to gather user input and generate configuration
     */
    async executeQuestionFlow(userInput) {
        const strategy = this.getQuestionStrategy(userInput);
        return await this.progressiveFlow.execute(userInput, strategy);
    }
    /**
     * Get the appropriate question strategy based on project type
     */
    getQuestionStrategy(userInput) {
        const context = this.analyzeProjectContext(userInput);
        switch (context.type) {
            case 'ecommerce':
                return new EcommerceStrategy();
            case 'blog':
                return new BlogStrategy();
            case 'dashboard':
                return new DashboardStrategy();
            default:
                // Default to ecommerce for now, can be enhanced later
                return new EcommerceStrategy();
        }
    }
    /**
     * Analyze user input to determine project context
     */
    analyzeProjectContext(userInput) {
        const lower = userInput.toLowerCase();
        if (lower.includes('ecommerce') || lower.includes('shop') || lower.includes('store')) {
            return { type: 'ecommerce' };
        }
        if (lower.includes('blog') || lower.includes('content')) {
            return { type: 'blog' };
        }
        if (lower.includes('dashboard') || lower.includes('admin')) {
            return { type: 'dashboard' };
        }
        if (lower.includes('api') || lower.includes('backend')) {
            return { type: 'api' };
        }
        if (lower.includes('full') || lower.includes('complete')) {
            return { type: 'fullstack' };
        }
        return { type: 'custom' };
    }
    // ============================================================================
    // STANDARDIZED PLUGIN EXECUTION
    // ============================================================================
    /**
     * Execute a plugin with standardized error handling and validation
     */
    async executePlugin(pluginId, context, pluginConfig, installPath) {
        const plugin = this.pluginSystem.getRegistry().get(pluginId);
        if (!plugin) {
            throw new Error(`Plugin not found: ${pluginId}`);
        }
        const pluginContext = {
            ...context,
            projectPath: installPath || context.projectPath,
            pluginId,
            pluginConfig,
            installedPlugins: [],
            projectType: ProjectType.NEXTJS,
            targetPlatform: [TargetPlatform.WEB, TargetPlatform.SERVER]
        };
        // Validate plugin
        context.logger.info(`Validating ${pluginId} plugin...`);
        const validation = await plugin.validate(pluginContext);
        if (!validation.valid) {
            throw new Error(`Plugin validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
        }
        context.logger.info(`${pluginId} plugin validation passed`);
        // Execute plugin
        context.logger.info(`Executing ${pluginId} plugin...`);
        const result = await plugin.install(pluginContext);
        if (!result.success) {
            throw new Error(`${pluginId} plugin execution failed: ${result.errors.map((e) => e.message).join(', ')}`);
        }
        context.logger.info(`${pluginId} plugin execution completed successfully`);
        return result;
    }
    /**
     * Validate unified interface files for a module
     */
    async validateUnifiedInterface(moduleName, context, pluginName) {
        const structure = context.projectStructure;
        const unifiedPath = structureService.getUnifiedInterfacePath(context.projectPath, structure, moduleName);
        // Check for unified interface files
        const requiredFiles = [
            'index.ts',
            'utils.ts'
        ];
        for (const file of requiredFiles) {
            const filePath = path.join(unifiedPath, file);
            if (!await fsExtra.pathExists(filePath)) {
                throw new Error(`Missing unified interface file: ${filePath}`);
            }
        }
        context.logger.success(`✅ ${pluginName} unified interface validation passed`);
    }
    /**
     * Get selected plugin based on context and user preferences
     */
    getSelectedPlugin(context, category) {
        // Check for template-based selection
        const pluginSelection = context.state.get('pluginSelection');
        if (pluginSelection?.[category]?.library || pluginSelection?.[category]?.provider) {
            return pluginSelection[category].library || pluginSelection[category].provider;
        }
        // Check for user preference
        const userPreference = context.state.get(`${category}Technology`);
        if (userPreference) {
            context.logger.info(`Using user preference for ${category}: ${userPreference}`);
            return userPreference;
        }
        // Return default based on category
        const defaults = {
            ui: 'shadcn-ui',
            database: 'drizzle',
            auth: 'better-auth',
            deployment: 'vercel',
            testing: 'vitest',
            email: 'resend',
            monitoring: 'sentry',
            payment: 'stripe',
            blockchain: 'ethereum'
        };
        return defaults[category] || 'default';
    }
    // ============================================================================
    // LIFECYCLE METHODS
    // ============================================================================
    async validate(context) {
        const errors = [];
        const warnings = [];
        // Basic validation
        if (!context.projectName) {
            errors.push({
                field: 'projectName',
                message: 'Project name is required',
                code: 'REQUIRED_FIELD',
                severity: 'error'
            });
        }
        if (!context.projectPath) {
            errors.push({
                field: 'projectPath',
                message: 'Project path is required',
                code: 'REQUIRED_FIELD',
                severity: 'error'
            });
        }
        // Validate dependencies
        for (const dependency of this.getAgentMetadata().dependencies) {
            if (!context.dependencies.includes(dependency)) {
                warnings.push(`Dependency '${dependency}' is recommended but not available`);
            }
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    async prepare(context) {
        // Don't start spinner automatically - only during actual work
        context.logger.info(`Preparing agent: ${this.getMetadata().name}`);
    }
    async cleanup(context) {
        // Stop spinner if it's running
        if (this.spinner) {
            this.spinner.stop();
            this.spinner = null;
        }
        context.logger.info(`Cleaned up agent: ${this.getMetadata().name}`);
    }
    // ============================================================================
    // ERROR HANDLING & RECOVERY
    // ============================================================================
    async rollback(context) {
        context.logger.warn(`Rolling back agent: ${this.getMetadata().name}`);
        // Default rollback behavior - can be overridden by subclasses
        if (this.currentState) {
            this.setState(this.currentState);
        }
    }
    async retry(context, attempt) {
        const maxRetries = 3;
        if (attempt >= maxRetries) {
            return this.createErrorResult(AGENT_ERROR_CODES.EXECUTION_FAILED, `Max retries (${maxRetries}) exceeded`, [], this.startTime);
        }
        context.logger.warn(`Retrying agent: ${this.getMetadata().name} (attempt ${attempt + 1}/${maxRetries})`);
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.execute(context);
    }
    // ============================================================================
    // METADATA & CAPABILITIES
    // ============================================================================
    getMetadata() {
        const baseMetadata = this.getAgentMetadata();
        return {
            ...baseMetadata,
            version: baseMetadata.version || '1.0.0',
            author: baseMetadata.author || 'The Architech Team',
            license: baseMetadata.license || 'MIT',
            requirements: baseMetadata.requirements || []
        };
    }
    getCapabilities() {
        return this.getAgentCapabilities();
    }
    // ============================================================================
    // STATE MANAGEMENT
    // ============================================================================
    getState() {
        return this.currentState;
    }
    setState(state) {
        this.currentState = {
            ...state,
            timestamp: new Date(),
            checksum: this.calculateStateChecksum(state)
        };
    }
    updateState(data) {
        const currentData = this.currentState?.data || {};
        const newData = { ...currentData, ...data };
        this.setState({
            version: AGENT_INTERFACE_VERSION,
            data: newData,
            timestamp: new Date(),
            checksum: this.calculateStateChecksum({ version: AGENT_INTERFACE_VERSION, data: newData })
        });
    }
    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    createSuccessResult(data, artifacts, nextSteps) {
        const result = {
            success: true,
            duration: performance.now() - this.startTime,
            errors: [],
            warnings: []
        };
        if (data !== undefined) {
            result.data = data;
        }
        if (artifacts !== undefined) {
            result.artifacts = artifacts;
        }
        if (nextSteps !== undefined) {
            result.nextSteps = nextSteps;
        }
        return result;
    }
    createErrorResult(code, message, errors = [], startTime = 0, originalError) {
        const agentError = {
            code,
            message,
            details: originalError,
            recoverable: this.isRecoverableError(code),
            suggestion: this.getErrorSuggestion(code),
            timestamp: new Date()
        };
        return {
            success: false,
            errors: [agentError, ...errors],
            warnings: [],
            duration: performance.now() - startTime,
            artifacts: [],
            nextSteps: this.getErrorNextSteps(code)
        };
    }
    calculateMetrics(startTime) {
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        return {
            executionTime,
            memoryUsage: process.memoryUsage().heapUsed,
            cpuUsage: 0, // Would need additional monitoring
            networkRequests: 0, // Would need to track in subclasses
            artifactsGenerated: 0, // Would need to track in subclasses
            filesCreated: 0, // Would need to track in subclasses
            dependenciesInstalled: 0 // Would need to track in subclasses
        };
    }
    calculateStateChecksum(state) {
        const dataString = JSON.stringify(state.data || {});
        return crypto.createHash('sha256').update(dataString).digest('hex');
    }
    isRecoverableError(code) {
        const recoverableCodes = [
            AGENT_ERROR_CODES.VALIDATION_FAILED,
            AGENT_ERROR_CODES.DEPENDENCY_MISSING,
            AGENT_ERROR_CODES.TIMEOUT
        ];
        return recoverableCodes.includes(code);
    }
    getErrorSuggestion(code) {
        const suggestions = {
            [AGENT_ERROR_CODES.VALIDATION_FAILED]: 'Check your configuration and try again',
            [AGENT_ERROR_CODES.DEPENDENCY_MISSING]: 'Install required dependencies first',
            [AGENT_ERROR_CODES.PERMISSION_DENIED]: 'Check file permissions and try again',
            [AGENT_ERROR_CODES.TIMEOUT]: 'Try again or increase timeout settings',
            [AGENT_ERROR_CODES.ROLLBACK_FAILED]: 'Manual intervention may be required',
            [AGENT_ERROR_CODES.UNKNOWN_ERROR]: 'Check logs for more details'
        };
        return suggestions[code] || 'Please check the documentation for troubleshooting';
    }
    getErrorNextSteps(code) {
        const nextSteps = {
            [AGENT_ERROR_CODES.VALIDATION_FAILED]: [
                'Review the validation errors above',
                'Update your configuration',
                'Run the command again'
            ],
            [AGENT_ERROR_CODES.DEPENDENCY_MISSING]: [
                'Install the missing dependencies',
                'Check your package manager configuration',
                'Verify network connectivity'
            ],
            [AGENT_ERROR_CODES.PERMISSION_DENIED]: [
                'Check file and directory permissions',
                'Run with elevated privileges if needed',
                'Verify your user has write access'
            ]
        };
        return nextSteps[code] || ['Check the logs for more information'];
    }
    // ============================================================================
    // SPINNER MANAGEMENT
    // ============================================================================
    async startSpinner(text, context) {
        if (context.options.verbose && !this.spinner) {
            this.spinner = (await getOra())({
                text: chalk.blue(text),
                color: 'blue'
            }).start();
        }
    }
    async stopSpinner() {
        if (this.spinner) {
            this.spinner.stop();
            this.spinner = null;
        }
    }
    updateSpinner(text) {
        if (this.spinner) {
            this.spinner.text = chalk.blue(text);
        }
    }
    succeedSpinner(text) {
        if (this.spinner) {
            this.spinner.succeed(chalk.green(text));
            this.spinner = null;
        }
    }
    failSpinner(text) {
        if (this.spinner) {
            this.spinner.fail(chalk.red(text));
            this.spinner = null;
        }
    }
}
//# sourceMappingURL=abstract-agent.js.map