/**
 * NextAuth Schema Definitions
 *
 * Contains all configuration schemas and parameter definitions for the NextAuth plugin.
 * Based on: https://next-auth.js.org/configuration
 */
import { AuthProvider, AuthFeature } from '../../../../types/plugin-interfaces.js';
import { PluginCategory } from '../../../../types/plugin.js';
export class NextAuthSchema {
    static getParameterSchema() {
        return {
            category: PluginCategory.AUTHENTICATION,
            groups: [
                { id: 'providers', name: 'Login Providers', description: 'Configure third-party and credential-based login methods.', order: 1, parameters: ['providers'] },
                { id: 'session', name: 'Session Strategy', description: 'Configure how user sessions are stored and managed.', order: 2, parameters: ['sessionStrategy', 'sessionDuration'] },
                { id: 'features', name: 'Security Features', description: 'Enable additional security features.', order: 3, parameters: ['requireEmailVerification'] },
            ],
            parameters: [
                {
                    id: 'providers',
                    name: 'Authentication Providers',
                    type: 'multiselect',
                    description: 'Select the login providers to enable.',
                    required: true,
                    default: [AuthProvider.CREDENTIALS, AuthProvider.GOOGLE, AuthProvider.GITHUB],
                    options: Object.values(AuthProvider).map(p => ({ value: p, label: this.getProviderLabel(p) })),
                    group: 'providers'
                },
                {
                    id: 'sessionStrategy',
                    name: 'Session Strategy',
                    type: 'select',
                    description: 'Choose between JWT and database-backed sessions.',
                    required: true,
                    default: 'jwt',
                    options: [
                        { value: 'jwt', label: 'JWT', description: 'Stateless sessions stored in a JSON Web Token.' },
                        { value: 'database', label: 'Database', description: 'Stateful sessions stored in the database.' }
                    ],
                    group: 'session'
                },
                {
                    id: 'sessionDuration',
                    name: 'Session Duration (seconds)',
                    type: 'number',
                    description: 'The duration for which a user session is valid.',
                    required: true,
                    default: 30 * 24 * 60 * 60, // 30 days
                    validation: [
                        { type: 'min', value: 60, message: 'Session duration must be at least 60 seconds.' },
                    ],
                    group: 'session'
                },
                {
                    id: 'requireEmailVerification',
                    name: 'Require Email Verification',
                    type: 'boolean',
                    description: 'Force users to verify their email address before they can log in.',
                    required: true,
                    default: true,
                    group: 'features'
                },
            ],
            dependencies: [],
            validations: []
        };
    }
    static getAuthProviders() {
        return Object.values(AuthProvider);
    }
    static getAuthFeatures() {
        return [AuthFeature.EMAIL_VERIFICATION, AuthFeature.RBAC];
    }
    static getProviderLabel(provider) {
        const labels = {
            [AuthProvider.CREDENTIALS]: 'Email & Password',
            [AuthProvider.GOOGLE]: 'Google',
            [AuthProvider.GITHUB]: 'GitHub',
            [AuthProvider.DISCORD]: 'Discord',
            [AuthProvider.TWITTER]: 'Twitter (X)',
            [AuthProvider.FACEBOOK]: 'Facebook',
            [AuthProvider.APPLE]: 'Apple'
        };
        return labels[provider];
    }
}
//# sourceMappingURL=NextAuthSchema.js.map