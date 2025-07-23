/**
 * Expert Mode Service
 *
 * Handles expert mode detection and provides advanced configuration options
 * for power users who want full control over their project setup.
 */
import { AgentContext } from "../../types/agents.js";
export interface PluginPrompt {
    id?: string;
    type: string;
    name: string;
    message: string;
    choices?: PluginChoice[];
    default?: any;
    when?: (answers: any) => boolean;
    validate?: (input: any) => boolean | string;
}
export interface PluginChoice {
    name: string;
    value: any;
    description?: string;
}
export interface ExpertModeOptions {
    expertMode: boolean;
    verbose: boolean;
    interactive: boolean;
    customConfig: boolean;
}
export declare class ExpertModeService {
    private questionGenerator;
    private pluginSystem;
    constructor();
    /**
     * Check if expert mode is enabled
     */
    isExpertMode(context: AgentContext): boolean;
    /**
     * Get expert mode options from context
     */
    getExpertModeOptions(context: AgentContext): ExpertModeOptions;
    /**
     * Get expert questions for a specific category
     */
    getExpertQuestions(category: string): PluginPrompt[];
    /**
     * Get dynamic questions from a specific plugin
     */
    getDynamicQuestions(pluginId: string, context: AgentContext): Promise<PluginPrompt[]>;
    /**
     * Get dynamic questions for a category when no specific plugin is selected
     */
    getCategoryDynamicQuestions(category: string): PluginPrompt[];
    /**
     * Validate expert mode choices
     */
    validateExpertChoices(choices: any, category: string): {
        valid: boolean;
        errors: string[];
    };
    private getDatabaseExpertQuestions;
    private getAuthenticationExpertQuestions;
    private getUIExpertQuestions;
    private getDeploymentExpertQuestions;
    private getTestingExpertQuestions;
    private getEmailExpertQuestions;
    private getMonitoringExpertQuestions;
    private getPaymentExpertQuestions;
    private getBlockchainExpertQuestions;
    /**
     * Convert PluginQuestion to PluginPrompt for compatibility
     */
    private convertToPluginPrompts;
    /**
     * Check if plugin implements enhanced interface
     */
    private isEnhancedPlugin;
    /**
     * Get category from plugin ID
     */
    private getCategoryFromPluginId;
}
