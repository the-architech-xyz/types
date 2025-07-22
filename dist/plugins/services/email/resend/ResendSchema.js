export const ResendConfigSchema = {
    type: 'object',
    properties: {
        apiKey: {
            type: 'string',
            description: 'Resend API key',
            default: ''
        },
        fromEmail: {
            type: 'string',
            description: 'Default sender email address',
            default: 'noreply@yourdomain.com'
        },
        fromName: {
            type: 'string',
            description: 'Default sender name',
            default: 'Your App'
        },
        replyTo: {
            type: 'string',
            description: 'Reply-to email address',
            default: 'support@yourdomain.com'
        },
        webhookUrl: {
            type: 'string',
            description: 'Webhook URL for email events',
            default: ''
        },
        sandboxMode: {
            type: 'boolean',
            description: 'Enable sandbox mode for testing',
            default: true
        },
        templates: {
            type: 'object',
            description: 'Email template configuration',
            properties: {
                welcome: {
                    type: 'boolean',
                    description: 'Enable welcome email template',
                    default: true
                },
                verification: {
                    type: 'boolean',
                    description: 'Enable email verification template',
                    default: true
                },
                resetPassword: {
                    type: 'boolean',
                    description: 'Enable password reset template',
                    default: true
                },
                notification: {
                    type: 'boolean',
                    description: 'Enable notification template',
                    default: true
                },
                marketing: {
                    type: 'boolean',
                    description: 'Enable marketing template',
                    default: false
                },
                orderConfirmation: {
                    type: 'boolean',
                    description: 'Enable order confirmation template',
                    default: false
                },
                invoice: {
                    type: 'boolean',
                    description: 'Enable invoice template',
                    default: false
                },
                newsletter: {
                    type: 'boolean',
                    description: 'Enable newsletter template',
                    default: false
                }
            },
            default: {
                welcome: true,
                verification: true,
                resetPassword: true,
                notification: true,
                marketing: false,
                orderConfirmation: false,
                invoice: false,
                newsletter: false
            }
        },
        features: {
            type: 'object',
            description: 'Feature configuration',
            properties: {
                analytics: {
                    type: 'boolean',
                    description: 'Enable email analytics',
                    default: true
                },
                webhooks: {
                    type: 'boolean',
                    description: 'Enable webhook support',
                    default: true
                },
                templates: {
                    type: 'boolean',
                    description: 'Enable email templates',
                    default: true
                },
                validation: {
                    type: 'boolean',
                    description: 'Enable email validation',
                    default: true
                },
                scheduling: {
                    type: 'boolean',
                    description: 'Enable email scheduling',
                    default: false
                },
                attachments: {
                    type: 'boolean',
                    description: 'Enable file attachments',
                    default: true
                },
                tracking: {
                    type: 'boolean',
                    description: 'Enable email tracking',
                    default: true
                }
            },
            default: {
                analytics: true,
                webhooks: true,
                templates: true,
                validation: true,
                scheduling: false,
                attachments: true,
                tracking: true
            }
        },
        delivery: {
            type: 'object',
            description: 'Delivery settings',
            properties: {
                retryAttempts: {
                    type: 'number',
                    description: 'Number of retry attempts',
                    default: 3,
                    minimum: 0,
                    maximum: 10
                },
                retryDelay: {
                    type: 'number',
                    description: 'Delay between retries in seconds',
                    default: 60,
                    minimum: 10,
                    maximum: 3600
                },
                timeout: {
                    type: 'number',
                    description: 'Request timeout in seconds',
                    default: 30,
                    minimum: 5,
                    maximum: 300
                },
                priority: {
                    type: 'string',
                    description: 'Email priority level',
                    enum: ['high', 'normal', 'low'],
                    default: 'normal'
                },
                batchSize: {
                    type: 'number',
                    description: 'Batch size for bulk emails',
                    default: 100,
                    minimum: 1,
                    maximum: 1000
                }
            },
            default: {
                retryAttempts: 3,
                retryDelay: 60,
                timeout: 30,
                priority: 'normal',
                batchSize: 100
            }
        },
        security: {
            type: 'object',
            description: 'Security settings',
            properties: {
                enableDKIM: {
                    type: 'boolean',
                    description: 'Enable DKIM signing',
                    default: true
                },
                enableSPF: {
                    type: 'boolean',
                    description: 'Enable SPF records',
                    default: true
                },
                enableDMARC: {
                    type: 'boolean',
                    description: 'Enable DMARC policy',
                    default: true
                },
                enableTLS: {
                    type: 'boolean',
                    description: 'Enable TLS encryption',
                    default: true
                },
                requireAuthentication: {
                    type: 'boolean',
                    description: 'Require authentication for API access',
                    default: true
                }
            },
            default: {
                enableDKIM: true,
                enableSPF: true,
                enableDMARC: true,
                enableTLS: true,
                requireAuthentication: true
            }
        },
        analytics: {
            type: 'object',
            description: 'Analytics and tracking settings',
            properties: {
                enableOpenTracking: {
                    type: 'boolean',
                    description: 'Enable open tracking',
                    default: true
                },
                enableClickTracking: {
                    type: 'boolean',
                    description: 'Enable click tracking',
                    default: true
                },
                enableUnsubscribeTracking: {
                    type: 'boolean',
                    description: 'Enable unsubscribe tracking',
                    default: true
                },
                enableBounceTracking: {
                    type: 'boolean',
                    description: 'Enable bounce tracking',
                    default: true
                },
                enableSpamTracking: {
                    type: 'boolean',
                    description: 'Enable spam tracking',
                    default: true
                }
            },
            default: {
                enableOpenTracking: true,
                enableClickTracking: true,
                enableUnsubscribeTracking: true,
                enableBounceTracking: true,
                enableSpamTracking: true
            }
        },
        rateLimiting: {
            type: 'object',
            description: 'Rate limiting settings',
            properties: {
                maxEmailsPerSecond: {
                    type: 'number',
                    description: 'Maximum emails per second',
                    default: 10,
                    minimum: 1,
                    maximum: 100
                },
                maxEmailsPerMinute: {
                    type: 'number',
                    description: 'Maximum emails per minute',
                    default: 600,
                    minimum: 10,
                    maximum: 6000
                },
                maxEmailsPerHour: {
                    type: 'number',
                    description: 'Maximum emails per hour',
                    default: 36000,
                    minimum: 100,
                    maximum: 360000
                },
                maxEmailsPerDay: {
                    type: 'number',
                    description: 'Maximum emails per day',
                    default: 864000,
                    minimum: 1000,
                    maximum: 8640000
                }
            },
            default: {
                maxEmailsPerSecond: 10,
                maxEmailsPerMinute: 600,
                maxEmailsPerHour: 36000,
                maxEmailsPerDay: 864000
            }
        }
    },
    required: ['apiKey', 'fromEmail'],
    additionalProperties: false
};
export const ResendDefaultConfig = {
    // Core configuration
    apiKey: '',
    fromEmail: 'noreply@yourdomain.com',
    fromName: 'Your App',
    replyTo: 'support@yourdomain.com',
    webhookUrl: '',
    sandboxMode: true,
    // Email templates
    templates: {
        welcome: true,
        verification: true,
        resetPassword: true,
        notification: true,
        marketing: false,
        orderConfirmation: false,
        invoice: false,
        newsletter: false
    },
    // Features
    features: {
        analytics: true,
        webhooks: true,
        templates: true,
        validation: true,
        scheduling: false,
        attachments: true,
        tracking: true
    },
    // Delivery settings
    delivery: {
        retryAttempts: 3,
        retryDelay: 60,
        timeout: 30,
        priority: 'normal',
        batchSize: 100
    },
    // Security settings
    security: {
        enableDKIM: true,
        enableSPF: true,
        enableDMARC: true,
        enableTLS: true,
        requireAuthentication: true
    },
    // Analytics and monitoring
    analytics: {
        enableOpenTracking: true,
        enableClickTracking: true,
        enableUnsubscribeTracking: true,
        enableBounceTracking: true,
        enableSpamTracking: true
    },
    // Rate limiting
    rateLimiting: {
        maxEmailsPerSecond: 10,
        maxEmailsPerMinute: 600,
        maxEmailsPerHour: 36000,
        maxEmailsPerDay: 864000
    }
};
//# sourceMappingURL=ResendSchema.js.map