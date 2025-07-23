/**
 * Progressive Question Flow
 *
 * Orchestrates the entire question flow from path selection to final configuration.
 * Provides a smooth, intelligent user experience.
 */
import { FlowResult } from '../../types/questions.js';
import { BaseQuestionStrategy } from './question-strategy.js';
export declare class ProgressiveFlow {
    private pathSelector;
    private recommendationEngine;
    constructor();
    /**
     * Execute the complete question flow
     */
    execute(userInput: string, strategy: BaseQuestionStrategy): Promise<FlowResult>;
    /**
     * Present recommendations to user
     */
    private presentRecommendations;
    /**
     * Ask questions progressively
     */
    private askQuestions;
    /**
     * Choose alternative technology
     */
    private chooseAlternative;
    /**
     * Build final configuration from answers and recommendations
     */
    private buildConfiguration;
}
