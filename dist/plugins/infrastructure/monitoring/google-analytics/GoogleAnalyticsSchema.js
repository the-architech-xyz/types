export const GoogleAnalyticsConfigSchema = {
    type: 'object',
    properties: {
        measurementId: {
            type: 'string',
            description: 'Your Google Analytics 4 Measurement ID (e.g., G-XXXXXXXXXX).',
            default: '',
        },
        enableEcommerce: {
            type: 'boolean',
            description: 'Enable e-commerce tracking features.',
            default: false,
        },
        debugMode: {
            type: 'boolean',
            description: 'Enable debug mode to see events in the DebugView.',
            default: false,
        },
    },
    required: ['measurementId'],
    additionalProperties: false,
};
export const GoogleAnalyticsDefaultConfig = {
    measurementId: '',
    enableEcommerce: false,
    debugMode: false,
};
//# sourceMappingURL=GoogleAnalyticsSchema.js.map