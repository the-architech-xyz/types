/**
 * Plugin Selection Service
 *
 * Handles interactive plugin selection and parameter collection
 * during project generation. This is the bridge between user input
 * and plugin configuration.
 */
import { Logger } from '../../types/agent.js';
import { PluginSelection } from '../../types/plugin-selection.js';
export declare class PluginSelectionService {
    private logger;
    private pluginSystem;
    constructor(logger: Logger);
    /**
     * Main method to select plugins interactively
     */
    selectPlugins(projectType: string, userInput: string): Promise<PluginSelection>;
    /**
     * Collect plugin-specific parameters
     */
    collectPluginParameters(pluginId: string): Promise<Record<string, any>>;
    /**
     * Database selection
     */
    private selectDatabase;
    /**
     * Authentication selection
     */
    private selectAuthentication;
    /**
     * UI selection
     */
    private selectUI;
    /**
     * Deployment selection
     */
    private selectDeployment;
    /**
     * Testing selection
     */
    private selectTesting;
    /**
     * Monitoring selection
     */
    private selectMonitoring;
    /**
     * Email selection
     */
    private selectEmail;
    /**
     * Advanced options selection
     */
    private selectAdvanced;
    /**
     * Prompt for a single parameter
     */
    private promptParameter;
    /**
     * Map property type to prompt type
     */
    private mapPropertyTypeToPromptType;
}
