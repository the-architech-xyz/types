/**
 * Question Strategy System
 * 
 * Provides intelligent, contextual questions based on project type and user expertise.
 * Replaces the complex dynamic question generator with a simpler, more effective approach.
 */

import { 
  QuestionStrategy, 
  ProjectContext, 
  Question, 
  Recommendation, 
  ProjectType, 
  UserExpertise 
} from '../../types/questions.js';

// ============================================================================
// BASE QUESTION STRATEGY
// ============================================================================

export abstract class BaseQuestionStrategy implements QuestionStrategy {
  abstract name: string;
  abstract projectType: ProjectType;

  /**
   * Analyze user input to determine project context
   */
  analyzeContext(userInput: string): ProjectContext {
    const type = this.detectProjectType(userInput);
    const expertise = this.detectExpertise(userInput);
    const features = this.extractFeatures(userInput);
    const requirements = this.extractRequirements(userInput);

    return {
      type,
      expertise,
      approach: 'guided', // Will be set by path selector
      description: userInput,
      features,
      requirements
    };
  }

  /**
   * Generate questions based on context
   */
  generateQuestions(context: ProjectContext): Question[] {
    const questions: Question[] = [];

    // Add project-specific questions
    questions.push(...this.getProjectQuestions(context));
    
    // Add feature-specific questions
    questions.push(...this.getFeatureQuestions(context));
    
    // Add expertise-specific questions
    questions.push(...this.getExpertiseQuestions(context));

    // Sort by order
    return questions.sort((a, b) => a.order - b.order);
  }

  /**
   * Get recommendations based on context
   */
  getRecommendations(context: ProjectContext): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Database recommendations
    recommendations.push(this.getDatabaseRecommendation(context));
    
    // Auth recommendations
    recommendations.push(this.getAuthRecommendation(context));
    
    // UI recommendations
    recommendations.push(this.getUIRecommendation(context));

    // Optional recommendations based on features
    if (context.features.includes('payments')) {
      recommendations.push(this.getPaymentRecommendation(context));
    }

    if (context.features.includes('email')) {
      recommendations.push(this.getEmailRecommendation(context));
    }

    return recommendations;
  }

  // ============================================================================
  // ABSTRACT METHODS - TO BE IMPLEMENTED BY SUBCLASSES
  // ============================================================================

  protected abstract getProjectQuestions(context: ProjectContext): Question[];
  protected abstract getFeatureQuestions(context: ProjectContext): Question[];
  protected abstract getDatabaseRecommendation(context: ProjectContext): Recommendation;
  protected abstract getAuthRecommendation(context: ProjectContext): Recommendation;
  protected abstract getUIRecommendation(context: ProjectContext): Recommendation;
  protected abstract getPaymentRecommendation(context: ProjectContext): Recommendation;
  protected abstract getEmailRecommendation(context: ProjectContext): Recommendation;

  // ============================================================================
  // PROTECTED METHODS - SHARED LOGIC
  // ============================================================================

  protected detectProjectType(input: string): ProjectType {
    const lower = input.toLowerCase();
    
    if (lower.includes('ecommerce') || lower.includes('shop') || lower.includes('store')) {
      return 'ecommerce';
    }
    if (lower.includes('blog') || lower.includes('content')) {
      return 'blog';
    }
    if (lower.includes('dashboard') || lower.includes('admin')) {
      return 'dashboard';
    }
    if (lower.includes('api') || lower.includes('backend')) {
      return 'api';
    }
    if (lower.includes('full') || lower.includes('complete')) {
      return 'fullstack';
    }
    
    return 'custom';
  }

  protected detectExpertise(input: string): UserExpertise {
    const lower = input.toLowerCase();
    
    if (lower.includes('beginner') || lower.includes('simple') || lower.includes('basic')) {
      return 'beginner';
    }
    if (lower.includes('expert') || lower.includes('advanced') || lower.includes('custom')) {
      return 'expert';
    }
    
    return 'intermediate';
  }

  protected extractFeatures(input: string): string[] {
    const features: string[] = [];
    const lower = input.toLowerCase();
    
    if (lower.includes('payment') || lower.includes('stripe') || lower.includes('paypal')) {
      features.push('payments');
    }
    if (lower.includes('email') || lower.includes('mail')) {
      features.push('email');
    }
    if (lower.includes('auth') || lower.includes('login') || lower.includes('user')) {
      features.push('auth');
    }
    if (lower.includes('test') || lower.includes('testing')) {
      features.push('testing');
    }
    if (lower.includes('deploy') || lower.includes('hosting')) {
      features.push('deployment');
    }
    
    return features;
  }

  protected extractRequirements(input: string): string[] {
    const requirements: string[] = [];
    const lower = input.toLowerCase();
    
    if (lower.includes('fast') || lower.includes('performance')) {
      requirements.push('performance');
    }
    if (lower.includes('scalable') || lower.includes('scale')) {
      requirements.push('scalability');
    }
    if (lower.includes('secure') || lower.includes('security')) {
      requirements.push('security');
    }
    if (lower.includes('mobile') || lower.includes('responsive')) {
      requirements.push('mobile');
    }
    
    return requirements;
  }

  protected getExpertiseQuestions(context: ProjectContext): Question[] {
    if (context.expertise === 'beginner') {
      return [
        {
          id: 'useRecommendations',
          type: 'confirm',
          message: 'Would you like me to use recommended technologies?',
          description: 'I\'ll choose the best options for your project',
          default: true,
          order: 1
        }
      ];
    }
    
    if (context.expertise === 'expert') {
      return [
        {
          id: 'customizeStack',
          type: 'confirm',
          message: 'Would you like to customize the technology stack?',
          description: 'Choose specific technologies for each category',
          default: false,
          order: 1
        }
      ];
    }
    
    return [];
  }
} 