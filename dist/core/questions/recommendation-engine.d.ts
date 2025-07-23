/**
 * Recommendation Engine
 *
 * Provides intelligent technology recommendations based on project context,
 * requirements, and best practices. This is the core intelligence of the system.
 */
import { ProjectContext, Recommendation, RecommendationSet } from '../../types/questions.js';
export declare class RecommendationEngine {
    /**
     * Get recommendations for a project context
     */
    getRecommendations(context: ProjectContext): RecommendationSet;
    /**
     * Get alternatives for a category
     */
    getAlternatives(category: string): Recommendation[];
    private getDatabaseRecommendation;
    private getAuthRecommendation;
    private getUIRecommendation;
    private getPaymentRecommendation;
    private getEmailRecommendation;
    private getTestingRecommendation;
    private getDeploymentRecommendation;
}
