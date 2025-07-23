/**
 * Question System Exports
 * 
 * Centralized exports for the new question generation system.
 */

// Core components
export { PathSelector } from './path-selector.js';
export { BaseQuestionStrategy } from './question-strategy.js';
export { ProgressiveFlow } from './progressive-flow.js';
export { RecommendationEngine } from './recommendation-engine.js';

// Project-specific strategies
export { EcommerceStrategy } from './strategies/ecommerce-strategy.js';
export { BlogStrategy } from './strategies/blog-strategy.js';
export { DashboardStrategy } from './strategies/dashboard-strategy.js';

// Types
export type {
  Question,
  QuestionChoice,
  ProjectContext,
  ProjectType,
  UserExpertise,
  ApproachType,
  QuestionStrategy,
  Recommendation,
  RecommendationSet,
  QuestionFlow,
  FlowResult,
  PathOption,
  ValidationResult,
  ValidationError,
  QuestionGenerator,
  RecommendationGenerator,
  ValidationFunction
} from '../../types/questions.js';

export { PATH_OPTIONS } from '../../types/questions.js'; 