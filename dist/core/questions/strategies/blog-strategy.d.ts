/**
 * Blog Question Strategy
 *
 * Provides intelligent questions and recommendations specifically for blog projects.
 */
import { BaseQuestionStrategy } from '../question-strategy.js';
import { ProjectContext, Question, Recommendation } from '../../../types/questions.js';
export declare class BlogStrategy extends BaseQuestionStrategy {
    name: string;
    projectType: "blog";
    protected getProjectQuestions(context: ProjectContext): Question[];
    protected getFeatureQuestions(context: ProjectContext): Question[];
    protected getDatabaseRecommendation(context: ProjectContext): Recommendation;
    protected getAuthRecommendation(context: ProjectContext): Recommendation;
    protected getUIRecommendation(context: ProjectContext): Recommendation;
    protected getPaymentRecommendation(context: ProjectContext): Recommendation;
    protected getEmailRecommendation(context: ProjectContext): Recommendation;
}
