/**
 * Dynamic Question Generator Service
 *
 * Converts plugin parameter schemas into interactive questions for expert mode.
 * Enables plugins to drive their own configuration questions dynamically.
 */
export class DynamicQuestionGenerator {
    /**
     * Generate questions from a plugin's parameter schema
     */
    generateQuestions(plugin, context) {
        const schema = plugin.getParameterSchema();
        const questions = [];
        // Sort parameters by group and order
        const sortedParameters = this.sortParametersByGroup(schema);
        // Generate questions for each parameter
        for (const param of sortedParameters) {
            const question = this.createQuestion(param, schema, context);
            if (question) {
                questions.push(question);
            }
        }
        return questions;
    }
    /**
     * Generate questions for a specific category when no plugin is selected
     */
    generateCategoryQuestions(category) {
        // Return generic category questions when no specific plugin is selected
        switch (category) {
            case 'database':
                return this.getGenericDatabaseQuestions();
            case 'authentication':
                return this.getGenericAuthQuestions();
            case 'ui':
                return this.getGenericUIQuestions();
            case 'deployment':
                return this.getGenericDeploymentQuestions();
            case 'testing':
                return this.getGenericTestingQuestions();
            case 'email':
                return this.getGenericEmailQuestions();
            case 'monitoring':
                return this.getGenericMonitoringQuestions();
            case 'payment':
                return this.getGenericPaymentQuestions();
            case 'blockchain':
                return this.getGenericBlockchainQuestions();
            default:
                return [];
        }
    }
    /**
     * Create a question from a parameter definition
     */
    createQuestion(param, schema, context) {
        // Check if parameter should be shown based on conditions
        if (!this.shouldShowParameter(param, context)) {
            return null;
        }
        // Create base question properties
        const baseProps = {
            id: param.id,
            name: param.name,
            message: param.description,
            description: param.description,
            default: param.default,
            order: param.order || 0,
            when: (answers) => this.evaluateConditions(param.conditions || [], answers)
        };
        // Add optional properties
        if (param.group) {
            baseProps.group = param.group;
        }
        // Add type-specific properties
        switch (param.type) {
            case 'string':
            case 'number':
                return {
                    ...baseProps,
                    type: 'input',
                    validate: (input) => this.validateParameter(param, input, {})
                };
            case 'boolean':
                return {
                    ...baseProps,
                    type: 'confirm'
                };
            case 'select':
                return {
                    ...baseProps,
                    type: 'select',
                    choices: this.createChoices(param.options || [])
                };
            case 'multiselect':
                return {
                    ...baseProps,
                    type: 'checkbox',
                    choices: this.createChoices(param.options || [])
                };
            case 'array':
                return {
                    ...baseProps,
                    type: 'checkbox',
                    choices: this.createChoices(param.options || [])
                };
            case 'object':
                // For object types, we might need to generate nested questions
                // This is a simplified version - could be enhanced for complex objects
                return {
                    ...baseProps,
                    type: 'input',
                    message: `${param.description} (JSON format)`,
                    validate: (input) => this.validateJSON(input)
                };
            default:
                return null;
        }
    }
    /**
     * Create question choices from parameter options
     */
    createChoices(options) {
        return options.map(option => ({
            name: option.label,
            value: option.value,
            description: option.description,
            recommended: option.recommended,
            disabled: option.disabled
        }));
    }
    /**
     * Evaluate parameter conditions
     */
    evaluateConditions(conditions, // Changed type to any[] to match original
    answers) {
        if (conditions.length === 0) {
            return true;
        }
        return conditions.every(condition => {
            const value = answers[condition.parameter];
            switch (condition.operator) {
                case 'equals':
                    return value === condition.value;
                case 'not_equals':
                    return value !== condition.value;
                case 'contains':
                    return Array.isArray(value) ? value.includes(condition.value) : value?.includes?.(condition.value);
                case 'greater_than':
                    return typeof value === 'number' && value > condition.value;
                case 'less_than':
                    return typeof value === 'number' && value < condition.value;
                case 'in':
                    return Array.isArray(condition.value) && condition.value.includes(value);
                case 'not_in':
                    return Array.isArray(condition.value) && !condition.value.includes(value);
                default:
                    return true;
            }
        });
    }
    /**
     * Check if parameter should be shown based on conditions
     */
    shouldShowParameter(param, context) {
        // For now, always show parameters
        // This could be enhanced to check against current context
        return true;
    }
    /**
     * Validate parameter input
     */
    validateParameter(param, // Changed type to any to match original
    input, answers) {
        // Check required validation
        if (param.required && (input === undefined || input === null || input === '')) {
            return `${param.name} is required`;
        }
        // Apply custom validation rules
        if (param.validation) {
            for (const rule of param.validation) {
                const result = this.applyValidationRule(rule, input, answers);
                if (result !== true) {
                    return result;
                }
            }
        }
        return true;
    }
    /**
     * Apply a validation rule
     */
    applyValidationRule(rule, input, answers) {
        switch (rule.type) {
            case 'required':
                return input !== undefined && input !== null && input !== '' ? true : rule.message;
            case 'pattern':
                if (typeof input === 'string' && rule.value) {
                    const regex = new RegExp(rule.value);
                    return regex.test(input) ? true : rule.message;
                }
                return true;
            case 'min':
                if (typeof input === 'number' && input < rule.value) {
                    return rule.message;
                }
                return true;
            case 'max':
                if (typeof input === 'number' && input > rule.value) {
                    return rule.message;
                }
                return true;
            case 'minLength':
                if (typeof input === 'string' && input.length < rule.value) {
                    return rule.message;
                }
                return true;
            case 'maxLength':
                if (typeof input === 'string' && input.length > rule.value) {
                    return rule.message;
                }
                return true;
            case 'custom':
                if (rule.validator) {
                    const result = rule.validator(input, answers);
                    return result === true ? true : rule.message;
                }
                return true;
            default:
                return true;
        }
    }
    /**
     * Validate JSON input
     */
    validateJSON(input) {
        try {
            JSON.parse(input);
            return true;
        }
        catch {
            return 'Please enter valid JSON';
        }
    }
    /**
     * Sort parameters by group and order
     */
    sortParametersByGroup(schema) {
        const sorted = []; // Changed type to any[] to match original
        // Sort groups by order
        const sortedGroups = schema.groups.sort((a, b) => a.order - b.order);
        // Add parameters from each group
        for (const group of sortedGroups) {
            const groupParams = schema.parameters
                .filter(param => param.group === group.id)
                .sort((a, b) => (a.order || 0) - (b.order || 0));
            sorted.push(...groupParams);
        }
        // Add parameters without groups
        const ungroupedParams = schema.parameters
            .filter(param => !param.group)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
        sorted.push(...ungroupedParams);
        return sorted;
    }
    // ============================================================================
    // GENERIC CATEGORY QUESTIONS
    // ============================================================================
    getGenericDatabaseQuestions() {
        return [
            {
                id: 'database_enabled',
                type: 'confirm',
                name: 'enabled',
                message: 'Would you like to add a database to your project?',
                default: true
            },
            {
                id: 'database_provider',
                type: 'select',
                name: 'provider',
                message: 'Select database provider:',
                choices: [
                    { name: 'Neon (PostgreSQL - Recommended)', value: 'neon' },
                    { name: 'Supabase (PostgreSQL)', value: 'supabase' },
                    { name: 'MongoDB Atlas', value: 'mongodb' },
                    { name: 'PlanetScale (MySQL)', value: 'planetscale' },
                    { name: 'Local PostgreSQL', value: 'local' }
                ],
                default: 'neon',
                when: (answers) => answers.enabled
            }
        ];
    }
    getGenericAuthQuestions() {
        return [
            {
                id: 'auth_enabled',
                type: 'confirm',
                name: 'enabled',
                message: 'Would you like to add authentication to your project?',
                default: true
            },
            {
                id: 'auth_providers',
                type: 'checkbox',
                name: 'providers',
                message: 'Select authentication providers:',
                choices: [
                    { name: 'Email/Password', value: 'credentials' },
                    { name: 'Google OAuth', value: 'google' },
                    { name: 'GitHub OAuth', value: 'github' },
                    { name: 'Discord OAuth', value: 'discord' },
                    { name: 'Twitter OAuth', value: 'twitter' },
                    { name: 'Facebook OAuth', value: 'facebook' },
                    { name: 'Apple OAuth', value: 'apple' }
                ],
                default: ['credentials'],
                when: (answers) => answers.enabled
            }
        ];
    }
    getGenericUIQuestions() {
        return [
            {
                id: 'ui_enabled',
                type: 'confirm',
                name: 'enabled',
                message: 'Would you like to add a UI library to your project?',
                default: true
            },
            {
                id: 'ui_library',
                type: 'select',
                name: 'library',
                message: 'Select UI library:',
                choices: [
                    { name: 'Shadcn/ui (Recommended)', value: 'shadcn-ui' },
                    { name: 'Chakra UI', value: 'chakra-ui' },
                    { name: 'Material-UI (MUI)', value: 'mui' },
                    { name: 'Tamagui', value: 'tamagui' },
                    { name: 'Ant Design', value: 'antd' },
                    { name: 'Radix UI (Headless)', value: 'radix' }
                ],
                default: 'shadcn-ui',
                when: (answers) => answers.enabled
            }
        ];
    }
    getGenericDeploymentQuestions() {
        return [
            {
                id: 'deployment_enabled',
                type: 'confirm',
                name: 'enabled',
                message: 'Would you like to configure deployment?',
                default: false
            },
            {
                id: 'deployment_platform',
                type: 'select',
                name: 'platform',
                message: 'Select deployment platform:',
                choices: [
                    { name: 'Vercel (Recommended for Next.js)', value: 'vercel' },
                    { name: 'Railway', value: 'railway' },
                    { name: 'Netlify', value: 'netlify' },
                    { name: 'AWS', value: 'aws' },
                    { name: 'Google Cloud', value: 'gcp' },
                    { name: 'Docker', value: 'docker' }
                ],
                default: 'vercel',
                when: (answers) => answers.enabled
            }
        ];
    }
    getGenericTestingQuestions() {
        return [
            {
                id: 'testing_enabled',
                type: 'confirm',
                name: 'enabled',
                message: 'Would you like to add testing to your project?',
                default: true
            },
            {
                id: 'testing_framework',
                type: 'select',
                name: 'framework',
                message: 'Select testing framework:',
                choices: [
                    { name: 'Vitest (Recommended)', value: 'vitest' },
                    { name: 'Jest', value: 'jest' },
                    { name: 'Playwright (E2E)', value: 'playwright' },
                    { name: 'Cypress (E2E)', value: 'cypress' }
                ],
                default: 'vitest',
                when: (answers) => answers.enabled
            }
        ];
    }
    getGenericEmailQuestions() {
        return [
            {
                id: 'email_enabled',
                type: 'confirm',
                name: 'enabled',
                message: 'Would you like to add email functionality?',
                default: false
            },
            {
                id: 'email_service',
                type: 'select',
                name: 'service',
                message: 'Select email service:',
                choices: [
                    { name: 'Resend (Recommended)', value: 'resend' },
                    { name: 'SendGrid', value: 'sendgrid' },
                    { name: 'Mailgun', value: 'mailgun' },
                    { name: 'AWS SES', value: 'ses' }
                ],
                default: 'resend',
                when: (answers) => answers.enabled
            }
        ];
    }
    getGenericMonitoringQuestions() {
        return [
            {
                id: 'monitoring_enabled',
                type: 'confirm',
                name: 'enabled',
                message: 'Would you like to add monitoring and analytics?',
                default: false
            },
            {
                id: 'monitoring_services',
                type: 'checkbox',
                name: 'services',
                message: 'Select monitoring services:',
                choices: [
                    { name: 'Sentry (Error Tracking)', value: 'sentry' },
                    { name: 'Vercel Analytics', value: 'vercelAnalytics' },
                    { name: 'Google Analytics', value: 'googleAnalytics' },
                    { name: 'PostHog', value: 'posthog' },
                    { name: 'Mixpanel', value: 'mixpanel' }
                ],
                when: (answers) => answers.enabled
            }
        ];
    }
    getGenericPaymentQuestions() {
        return [
            {
                id: 'payment_enabled',
                type: 'confirm',
                name: 'enabled',
                message: 'Would you like to add payment processing?',
                default: false
            },
            {
                id: 'payment_providers',
                type: 'checkbox',
                name: 'providers',
                message: 'Select payment providers:',
                choices: [
                    { name: 'Stripe (Recommended)', value: 'stripe' },
                    { name: 'PayPal', value: 'paypal' },
                    { name: 'Square', value: 'square' },
                    { name: 'Paddle', value: 'paddle' }
                ],
                when: (answers) => answers.enabled
            }
        ];
    }
    getGenericBlockchainQuestions() {
        return [
            {
                id: 'blockchain_enabled',
                type: 'confirm',
                name: 'enabled',
                message: 'Would you like to add blockchain integration?',
                default: false
            },
            {
                id: 'blockchain_networks',
                type: 'checkbox',
                name: 'networks',
                message: 'Select blockchain networks:',
                choices: [
                    { name: 'Ethereum', value: 'ethereum' },
                    { name: 'Polygon', value: 'polygon' },
                    { name: 'Solana', value: 'solana' },
                    { name: 'Binance Smart Chain', value: 'bsc' }
                ],
                when: (answers) => answers.enabled
            }
        ];
    }
}
//# sourceMappingURL=dynamic-question-generator.js.map