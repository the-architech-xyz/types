/**
 * Base Authentication Plugin Class
 *
 * Provides common functionality for all authentication plugins.
 */
import { BasePlugin } from './BasePlugin.js';
import { AuthProvider } from '../../types/plugin-interfaces.js';
import { DynamicQuestionGenerator } from '../../core/expert/dynamic-question-generator.js';
import { PluginCategory } from '../../types/plugin.js';
export class BaseAuthPlugin extends BasePlugin {
    questionGenerator;
    constructor() {
        super();
        this.questionGenerator = new DynamicQuestionGenerator();
    }
    // --- Shared Logic ---
    getBaseAuthSchema() {
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
    async setupAuthRoutes(context, routeContent) {
        if (context.projectType === 'nextjs') {
            const routePath = this.pathResolver.getLibPath('auth', 'api/[...nextauth].ts');
            await this.generateFile(routePath, routeContent);
        }
        else {
            context.logger.warn('API route generation is only supported for Next.js projects.');
        }
    }
    generateProviderEnvVars(providers) {
        const envVars = {};
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
    getDynamicQuestions(context) {
        return this.questionGenerator.generateQuestions(this, context);
    }
    validateConfiguration(config) {
        // Basic validation, can be extended by child classes
        return this.validateRequiredConfig(config, ['providers']);
    }
}
//# sourceMappingURL=BaseAuthPlugin.js.map