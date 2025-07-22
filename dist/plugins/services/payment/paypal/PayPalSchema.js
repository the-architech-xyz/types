export const PayPalConfigSchema = {
    type: 'object',
    properties: {
        clientId: {
            type: 'string',
            description: 'Your PayPal REST API client ID.',
            default: '',
        },
        clientSecret: {
            type: 'string',
            description: 'Your PayPal REST API client secret.',
            default: '',
        },
        environment: {
            type: 'string',
            description: 'The environment to use for PayPal API requests.',
            enum: ['sandbox', 'live'],
            default: 'sandbox',
        },
        currency: {
            type: 'string',
            description: 'The default currency code for transactions (e.g., USD, EUR).',
            default: 'USD',
        },
        intent: {
            type: 'string',
            description: 'The default payment intent.',
            enum: ['capture', 'authorize'],
            default: 'capture',
        },
        enableSubscriptions: {
            type: 'boolean',
            description: 'Enable support for PayPal Subscriptions.',
            default: false,
        },
        webhookId: {
            type: 'string',
            description: 'Your PayPal webhook ID for receiving event notifications.',
        }
    },
    required: ['clientId', 'clientSecret', 'environment'],
    additionalProperties: false,
};
export const PayPalDefaultConfig = {
    clientId: '',
    clientSecret: '',
    environment: 'sandbox',
    currency: 'USD',
    intent: 'capture',
    enableSubscriptions: false,
};
//# sourceMappingURL=PayPalSchema.js.map