/**
 * Dynamic Question Generator Service
 *
 * Converts plugin parameter schemas into interactive questions for expert mode.
 * Enables plugins to drive their own configuration questions dynamically.
 */
import { PluginContext, IEnhancedPlugin, PluginQuestion } from '../../types/plugins.js';
export declare class DynamicQuestionGenerator {
    /**
     * Generate questions from a plugin's parameter schema
     */
    generateQuestions(plugin: IEnhancedPlugin, context: PluginContext): PluginQuestion[];
    /**
     * Generate questions for a specific category when no plugin is selected
     */
    generateCategoryQuestions(category: string): PluginQuestion[];
    /**
     * Create a question from a parameter definition
     */
    private createQuestion;
    /**
     * Create question choices from parameter options
     */
    private createChoices;
    /**
     * Evaluate parameter conditions
     */
    private evaluateConditions;
    /**
     * Check if parameter should be shown based on conditions
     */
    private shouldShowParameter;
    /**
     * Validate parameter input
     */
    private validateParameter;
    /**
     * Apply a validation rule
     */
    private applyValidationRule;
    /**
     * Validate JSON input
     */
    private validateJSON;
    /**
     * Sort parameters by group and order
     */
    private sortParametersByGroup;
    private getGenericDatabaseQuestions;
    private getGenericAuthQuestions;
    private getGenericUIQuestions;
    private getGenericDeploymentQuestions;
    private getGenericTestingQuestions;
    private getGenericEmailQuestions;
    private getGenericMonitoringQuestions;
    private getGenericPaymentQuestions;
    private getGenericBlockchainQuestions;
}
