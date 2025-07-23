/**
 * Progressive Question Flow
 * 
 * Orchestrates the entire question flow from path selection to final configuration.
 * Provides a smooth, intelligent user experience.
 */

import { 
  ProjectContext, 
  Question, 
  QuestionFlow, 
  FlowResult, 
  RecommendationSet,
  ApproachType 
} from '../../types/questions.js';
import { PathSelector } from './path-selector.js';
import { BaseQuestionStrategy } from './question-strategy.js';
import { RecommendationEngine } from './recommendation-engine.js';
import inquirer from 'inquirer';

export class ProgressiveFlow {
  private pathSelector: PathSelector;
  private recommendationEngine: RecommendationEngine;

  constructor() {
    this.pathSelector = new PathSelector();
    this.recommendationEngine = new RecommendationEngine();
  }

  /**
   * Execute the complete question flow
   */
  async execute(userInput: string, strategy: BaseQuestionStrategy): Promise<FlowResult> {
    try {
      // Step 1: Analyze context
      const context = strategy.analyzeContext(userInput);
      
      // Step 2: Select approach (guided vs selective)
      const approach = await this.pathSelector.selectPath();
      context.approach = approach;
      
      // Step 3: Get recommendations
      const recommendations = this.recommendationEngine.getRecommendations(context);
      
      // Step 4: Present recommendations and get user feedback
      const acceptedRecommendations = await this.presentRecommendations(recommendations, context);
      
      // Step 5: Generate contextual questions
      const questions = strategy.generateQuestions(context);
      
      // Step 6: Ask questions progressively
      const answers = await this.askQuestions(questions, acceptedRecommendations);
      
      // Step 7: Build final configuration
      const configuration = this.buildConfiguration(answers, acceptedRecommendations);
      
      return {
        success: true,
        configuration,
        recommendations,
        warnings: [],
        errors: []
      };
      
    } catch (error) {
      return {
        success: false,
        configuration: {},
        recommendations: {} as RecommendationSet,
        warnings: [],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Present recommendations to user
   */
  private async presentRecommendations(
    recommendations: RecommendationSet, 
    context: ProjectContext
  ): Promise<Partial<RecommendationSet>> {
    const accepted: Partial<RecommendationSet> = {};
    
    if (context.approach === 'guided') {
      // In guided mode, present recommendations with ability to change
      console.log('\n🎯 Here are my recommendations for your project:\n');
      
      for (const [category, recommendation] of Object.entries(recommendations)) {
        const { accept } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'accept',
            message: `${category.toUpperCase()}: ${recommendation.plugin} - ${recommendation.reason}`,
            default: true
          }
        ]);
        
        if (accept) {
          accepted[category as keyof RecommendationSet] = recommendation;
        } else {
          // Allow user to choose alternative
          const alternative = await this.chooseAlternative(category, recommendation);
          accepted[category as keyof RecommendationSet] = alternative;
        }
      }
    } else {
      // In selective mode, let user choose everything
      for (const [category, recommendation] of Object.entries(recommendations)) {
        const choice = await this.chooseAlternative(category, recommendation);
        accepted[category as keyof RecommendationSet] = choice;
      }
    }
    
    return accepted;
  }

  /**
   * Ask questions progressively
   */
  private async askQuestions(
    questions: Question[], 
    recommendations: Partial<RecommendationSet>
  ): Promise<Record<string, any>> {
    const answers: Record<string, any> = {};
    
    for (const question of questions) {
      // Check if question should be shown
      if (question.when && !question.when(answers)) {
        continue;
      }
      
      // Ask the question
      const result = await inquirer.prompt([
        {
          type: question.type,
          name: question.id,
          message: question.message,
          description: question.description,
          default: question.default,
          choices: question.choices,
          validate: question.validate
        }
      ]);
      
      answers[question.id] = result[question.id];
    }
    
    return answers;
  }

  /**
   * Choose alternative technology
   */
  private async chooseAlternative(category: string, current: any): Promise<any> {
    const alternatives = this.recommendationEngine.getAlternatives(category);
    
    const { choice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'choice',
        message: `Choose ${category} technology:`,
        choices: alternatives.map(alt => ({
          name: `${alt.plugin} - ${alt.reason}`,
          value: alt,
          description: alt.reason
        }))
      }
    ]);
    
    return choice;
  }

  /**
   * Build final configuration from answers and recommendations
   */
  private buildConfiguration(
    answers: Record<string, any>, 
    recommendations: Partial<RecommendationSet>
  ): Record<string, any> {
    const configuration: Record<string, any> = {};
    
    // Add recommendations to configuration
    for (const [category, recommendation] of Object.entries(recommendations)) {
      configuration[category] = {
        plugin: recommendation.plugin,
        provider: recommendation.provider,
        ...answers[`${category}_config`] || {}
      };
    }
    
    // Add general answers
    configuration.general = {
      projectName: answers.projectName,
      description: answers.description,
      features: answers.features || [],
      ...answers
    };
    
    return configuration;
  }
} 