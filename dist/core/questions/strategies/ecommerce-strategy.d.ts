/**
 * E-commerce Question Strategy
 *
 * Provides intelligent questions and recommendations specifically for e-commerce projects.
 */
import { BaseQuestionStrategy } from '../question-strategy.js';
import { ProjectContext, Question, Recommendation } from '../../../types/questions.js';
export declare class EcommerceStrategy extends BaseQuestionStrategy {
    name: string;
    projectType: "ecommerce";
    protected getProjectQuestions(context: ProjectContext): Question[];
    protected getFeatureQuestions(context: ProjectContext): Question[];
    protected getDatabaseRecommendation(context: ProjectContext): Recommendation;
    protected getAuthRecommendation(context: ProjectContext): Recommendation;
    protected getUIRecommendation(context: ProjectContext): Recommendation;
    protected getPaymentRecommendation(context: ProjectContext): Recommendation;
    protected getEmailRecommendation(context: ProjectContext): Recommendation;
}
