/**
 * Keyword Analyzer
 *
 * Simple but effective keyword-based template recommendation system.
 * Analyzes user input to suggest the most appropriate workflow template.
 */
import { WorkflowTemplate } from './workflow-templates.js';
export interface TemplateSuggestion {
    template: WorkflowTemplate;
    confidence: number;
    reason: string;
    keywords: string[];
}
export declare class KeywordAnalyzer {
    /**
     * Analyze user input and suggest templates
     */
    static analyzeInput(userInput: string): TemplateSuggestion[];
    /**
     * Get default suggestions when no input is provided
     */
    static getDefaultSuggestions(): TemplateSuggestion[];
    /**
     * Calculate confidence score based on keyword matches
     */
    private static calculateConfidence;
    /**
     * Generate human-readable reason for suggestion
     */
    private static generateReason;
    /**
     * Get template suggestions by complexity level
     */
    static getSuggestionsByComplexity(complexity: 'beginner' | 'intermediate' | 'expert'): TemplateSuggestion[];
    /**
     * Get template suggestions by target audience
     */
    static getSuggestionsByAudience(audience: string): TemplateSuggestion[];
    /**
     * Extract key themes from user input
     */
    static extractThemes(userInput: string): string[];
    /**
     * Check if user input suggests custom setup
     */
    static suggestsCustomSetup(userInput: string): boolean;
}
