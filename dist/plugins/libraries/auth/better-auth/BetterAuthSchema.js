/**
 * Better Auth Schema Definitions
 *
 * Contains all configuration schemas and parameter definitions for the Better Auth plugin.
 * Based on: https://better-auth.com/docs
 */
import { AuthProvider, AuthFeature } from '../../../../types/plugin-interfaces.js';
import { PluginCategory } from '../../../../types/plugin.js';
export class BetterAuthSchema {
    static getParameterSchema() {
        return {
            category: PluginCategory.AUTHENTICATION,
            groups: [
                { id: 'providers', name: 'Login Providers', description: 'Configure third-party and credential-based login methods.', order: 1, parameters: ['providers'] },
                { id: 'features', name: 'Security Features', description: 'Enable additional security and user management features.', order: 2, parameters: ['requireEmailVerification', 'enableTwoFactor', 'enableRateLimiting', 'enableAuditLogs'] },
                { id: 'session', name: 'Session Management', description: 'Control how user sessions are handled.', order: 3, parameters: ['sessionDuration'] },
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
                    id: 'requireEmailVerification',
                    name: 'Require Email Verification',
                    type: 'boolean',
                    description: 'Force users to verify their email address before they can log in.',
                    required: true,
                    default: true,
                    group: 'features'
                },
                {
                    id: 'enableTwoFactor',
                    name: 'Enable Two-Factor Authentication',
                    type: 'boolean',
                    description: 'Add an extra layer of security with 2FA.',
                    required: true,
                    default: false,
                    group: 'features'
                },
                {
                    id: 'enableRateLimiting',
                    name: 'Enable Rate Limiting',
                    type: 'boolean',
                    description: 'Protect against brute-force attacks.',
                    required: true,
                    default: true,
                    group: 'features'
                },
                {
                    id: 'enableAuditLogs',
                    name: 'Enable Audit Logs',
                    type: 'boolean',
                    description: 'Log important security events like logins and password changes.',
                    required: true,
                    default: false,
                    group: 'features'
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
                        { type: 'max', value: 365 * 24 * 60 * 60, message: 'Session duration cannot exceed one year.' }
                    ],
                    group: 'session'
                }
            ],
            dependencies: [
                {
                    parameter: 'enableTwoFactor',
                    dependsOn: 'requireEmailVerification',
                    condition: { parameter: 'enableTwoFactor', operator: 'equals', value: true, action: 'require' },
                    message: 'Two-Factor Authentication requires Email Verification to be enabled.'
                }
            ],
            validations: []
        };
    }
    static getAuthProviders() {
        return Object.values(AuthProvider);
    }
    static getAuthFeatures() {
        return [AuthFeature.EMAIL_VERIFICATION, AuthFeature.TWO_FACTOR, AuthFeature.RBAC];
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
//# sourceMappingURL=BetterAuthSchema.js.map