/**
 * Question Strategy System
 *
 * Provides intelligent, contextual questions based on project type and user expertise.
 * Replaces the complex dynamic question generator with a simpler, more effective approach.
 */
import { QuestionStrategy, ProjectContext, Question, Recommendation, ProjectType, UserExpertise } from '../../types/questions.js';
export declare abstract class BaseQuestionStrategy implements QuestionStrategy {
    abstract name: string;
    abstract projectType: ProjectType;
    /**
     * Analyze user input to determine project context
     */
    analyzeContext(userInput: string): ProjectContext;
    /**
     * Generate questions based on context
     */
    generateQuestions(context: ProjectContext): Question[];
    /**
     * Get recommendations based on context
     */
    getRecommendations(context: ProjectContext): Recommendation[];
    protected abstract getProjectQuestions(context: ProjectContext): Question[];
    protected abstract getFeatureQuestions(context: ProjectContext): Question[];
    protected abstract getDatabaseRecommendation(context: ProjectContext): Recommendation;
    protected abstract getAuthRecommendation(context: ProjectContext): Recommendation;
    protected abstract getUIRecommendation(context: ProjectContext): Recommendation;
    protected abstract getPaymentRecommendation(context: ProjectContext): Recommendation;
    protected abstract getEmailRecommendation(context: ProjectContext): Recommendation;
    protected detectProjectType(input: string): ProjectType;
    protected detectExpertise(input: string): UserExpertise;
    protected extractFeatures(input: string): string[];
    protected extractRequirements(input: string): string[];
    protected getExpertiseQuestions(context: ProjectContext): Question[];
}
