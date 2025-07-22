/**
 * Base Authentication Plugin Class
 * 
 * Provides common functionality for all authentication plugins.
 */

import { BasePlugin } from './BasePlugin.js';
import { AuthPluginConfig, IUIAuthPlugin, AuthProvider, AuthFeature, SessionOption, SecurityOption, ParameterSchema } from '../../types/plugin-interfaces.js';
import { DynamicQuestionGenerator } from '../../core/expert/dynamic-question-generator.js';
import { ValidationResult } from '../../types/agent.js';
import { PluginContext } from '../../types/plugin.js';
import { PluginCategory } from '../../types/plugin.js';
import * as fs from 'fs-extra';

export abstract class BaseAuthPlugin extends BasePlugin implements IUIAuthPlugin {
  private questionGenerator: DynamicQuestionGenerator;

  constructor() {
    super();
    this.questionGenerator = new DynamicQuestionGenerator();
  }
  // --- Abstract Methods for Plugin to Implement ---
  abstract getAuthProviders(): AuthProvider[];
  abstract getAuthFeatures(): AuthFeature[];
  abstract getSessionOptions(): SessionOption[];
  abstract getSecurityOptions(): SecurityOption[];

  // --- Shared Logic ---
  protected getBaseAuthSchema(): ParameterSchema {
    return {
      category: PluginCategory.AUTHENTICATION,
      parameters: [
        {
          id: 'providers',
          name: 'providers',
          type: 'multiselect',
          description: 'Select authentication providers',
          required: true,
          options: this.getAuthProviders().map(p => ({ value: p, label: this.getProviderLabel(p) })),
          group: 'providers'
        },
        {
          id: 'features',
          name: 'features',
          type: 'multiselect',
          description: 'Select additional features',
          required: false,
          options: this.getAuthFeatures().map(f => ({ value: f, label: this.getFeatureLabel(f) })),
          group: 'features'
        }
      ],
      groups: [
        { id: 'providers', name: 'Authentication Providers', description: 'Configure third-party login providers', order: 1, parameters: ['providers'] },
        { id: 'features', name: 'Security Features', description: 'Enable extra security features', order: 2, parameters: ['features'] }
      ],
      dependencies: [],
      validations: []
    };
  }

  protected async setupAuthRoutes(context: PluginContext, routeContent: string): Promise<void> {
    if (context.projectType === 'nextjs') {
      const routePath = this.pathResolver.getLibPath('auth', 'api/[...nextauth].ts');
      await this.generateFile(routePath, routeContent);
    } else {
      context.logger.warn('API route generation is only supported for Next.js projects.');
    }
  }

  protected generateProviderEnvVars(providers: AuthProvider[]): Record<string, string> {
    const envVars: Record<string, string> = {};
    if (providers.includes(AuthProvider.GITHUB)) {
      envVars['AUTH_GITHUB_ID'] = 'your_github_id';
      envVars['AUTH_GITHUB_SECRET'] = 'your_github_secret';
    }
    if (providers.includes(AuthProvider.GOOGLE)) {
      envVars['AUTH_GOOGLE_ID'] = 'your_google_id';
      envVars['AUTH_GOOGLE_SECRET'] = 'your_google_secret';
    }
    // ... add other providers
    return envVars;
  }

  // --- Abstract helpers for schema ---
  protected abstract getProviderLabel(provider: AuthProvider): string;
  protected abstract getFeatureLabel(feature: AuthFeature): string;

  getDynamicQuestions(context: PluginContext): any[] {
    return this.questionGenerator.generateQuestions(this, context);
  }

  validateConfiguration(config: Record<string, any>): ValidationResult {
    // Basic validation, can be extended by child classes
    return this.validateRequiredConfig(config, ['providers']);
  }
} 