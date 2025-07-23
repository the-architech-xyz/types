import { ConfigSchema } from '../../../../types/plugins.js';

export interface StripeConfig {
  // Core Stripe configuration
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  
  // Payment features
  features: {
    enableSubscriptions: boolean;
    enableInvoices: boolean;
    enableTaxes: boolean;
    enableConnect: boolean;
    enablePaymentIntents: boolean;
    enableSetupIntents: boolean;
    enableCheckout: boolean;
    enableBillingPortal: boolean;
  };
  
  // Payment methods
  paymentMethods: {
    enableCards: boolean;
    enableBankTransfers: boolean;
    enableDigitalWallets: boolean;
    enableCrypto: boolean;
    enableLocalPayments: boolean;
  };
  
  // Subscription settings
  subscriptions: {
    enableTrialPeriods: boolean;
    enableProration: boolean;
    enableUsageBasedBilling: boolean;
    enableMeteredBilling: boolean;
    enableQuantityUpdates: boolean;
  };
  
  // Security settings
  security: {
    enable3DSecure: boolean;
    enableSCA: boolean;
    enableFraudDetection: boolean;
    enableDisputeHandling: boolean;
    enableChargebackProtection: boolean;
  };
  
  // Webhook settings
  webhooks: {
    enablePaymentSuccess: boolean;
    enablePaymentFailure: boolean;
    enableSubscriptionEvents: boolean;
    enableInvoiceEvents: boolean;
    enableCustomerEvents: boolean;
  };
  
  // Tax settings
  taxes: {
    enableAutomaticTax: boolean;
    enableTaxCalculation: boolean;
    enableTaxReporting: boolean;
    enableVATHandling: boolean;
  };
  
  // Connect settings (for marketplaces)
  connect: {
    enableExpressAccounts: boolean;
    enableCustomAccounts: boolean;
    enableAccountLinks: boolean;
    enablePayouts: boolean;
  };
  
  // Currency and locale
  currency: string;
  locale: string;
  
  // Rate limiting
  rateLimiting: {
    maxRequestsPerSecond: number;
    maxRequestsPerMinute: number;
    enableRetryLogic: boolean;
    retryAttempts: number;
  };
}

export const StripeConfigSchema: ConfigSchema = {
  type: 'object',
  properties: {
    publishableKey: {
      type: 'string',
      description: 'Stripe publishable key for client-side operations',
      default: ''
    },
    secretKey: {
      type: 'string',
      description: 'Stripe secret key for server-side operations',
      default: ''
    },
    webhookSecret: {
      type: 'string',
      description: 'Stripe webhook endpoint secret',
      default: ''
    },
    features: {
      type: 'object',
      description: 'Payment feature configuration',
      properties: {
        enableSubscriptions: {
          type: 'boolean',
          description: 'Enable subscription management',
          default: true
        },
        enableInvoices: {
          type: 'boolean',
          description: 'Enable invoice generation',
          default: true
        },
        enableTaxes: {
          type: 'boolean',
          description: 'Enable tax calculation',
          default: false
        },
        enableConnect: {
          type: 'boolean',
          description: 'Enable Stripe Connect for marketplaces',
          default: false
        },
        enablePaymentIntents: {
          type: 'boolean',
          description: 'Enable payment intents',
          default: true
        },
        enableSetupIntents: {
          type: 'boolean',
          description: 'Enable setup intents for saved payment methods',
          default: true
        },
        enableCheckout: {
          type: 'boolean',
          description: 'Enable Stripe Checkout',
          default: true
        },
        enableBillingPortal: {
          type: 'boolean',
          description: 'Enable customer billing portal',
          default: true
        }
      },
      default: {
        enableSubscriptions: true,
        enableInvoices: true,
        enableTaxes: false,
        enableConnect: false,
        enablePaymentIntents: true,
        enableSetupIntents: true,
        enableCheckout: true,
        enableBillingPortal: true
      }
    },
    paymentMethods: {
      type: 'object',
      description: 'Payment method configuration',
      properties: {
        enableCards: {
          type: 'boolean',
          description: 'Enable credit/debit card payments',
          default: true
        },
        enableBankTransfers: {
          type: 'boolean',
          description: 'Enable bank transfer payments',
          default: false
        },
        enableDigitalWallets: {
          type: 'boolean',
          description: 'Enable digital wallet payments (Apple Pay, Google Pay)',
          default: true
        },
        enableCrypto: {
          type: 'boolean',
          description: 'Enable cryptocurrency payments',
          default: false
        },
        enableLocalPayments: {
          type: 'boolean',
          description: 'Enable local payment methods',
          default: false
        }
      },
      default: {
        enableCards: true,
        enableBankTransfers: false,
        enableDigitalWallets: true,
        enableCrypto: false,
        enableLocalPayments: false
      }
    },
    subscriptions: {
      type: 'object',
      description: 'Subscription configuration',
      properties: {
        enableTrialPeriods: {
          type: 'boolean',
          description: 'Enable trial periods for subscriptions',
          default: true
        },
        enableProration: {
          type: 'boolean',
          description: 'Enable proration for subscription changes',
          default: true
        },
        enableUsageBasedBilling: {
          type: 'boolean',
          description: 'Enable usage-based billing',
          default: false
        },
        enableMeteredBilling: {
          type: 'boolean',
          description: 'Enable metered billing',
          default: false
        },
        enableQuantityUpdates: {
          type: 'boolean',
          description: 'Enable quantity updates for subscriptions',
          default: true
        }
      },
      default: {
        enableTrialPeriods: true,
        enableProration: true,
        enableUsageBasedBilling: false,
        enableMeteredBilling: false,
        enableQuantityUpdates: true
      }
    },
    security: {
      type: 'object',
      description: 'Security configuration',
      properties: {
        enable3DSecure: {
          type: 'boolean',
          description: 'Enable 3D Secure authentication',
          default: true
        },
        enableSCA: {
          type: 'boolean',
          description: 'Enable Strong Customer Authentication',
          default: true
        },
        enableFraudDetection: {
          type: 'boolean',
          description: 'Enable fraud detection',
          default: true
        },
        enableDisputeHandling: {
          type: 'boolean',
          description: 'Enable dispute handling',
          default: true
        },
        enableChargebackProtection: {
          type: 'boolean',
          description: 'Enable chargeback protection',
          default: false
        }
      },
      default: {
        enable3DSecure: true,
        enableSCA: true,
        enableFraudDetection: true,
        enableDisputeHandling: true,
        enableChargebackProtection: false
      }
    },
    webhooks: {
      type: 'object',
      description: 'Webhook configuration',
      properties: {
        enablePaymentSuccess: {
          type: 'boolean',
          description: 'Enable payment success webhooks',
          default: true
        },
        enablePaymentFailure: {
          type: 'boolean',
          description: 'Enable payment failure webhooks',
          default: true
        },
        enableSubscriptionEvents: {
          type: 'boolean',
          description: 'Enable subscription event webhooks',
          default: true
        },
        enableInvoiceEvents: {
          type: 'boolean',
          description: 'Enable invoice event webhooks',
          default: true
        },
        enableCustomerEvents: {
          type: 'boolean',
          description: 'Enable customer event webhooks',
          default: true
        }
      },
      default: {
        enablePaymentSuccess: true,
        enablePaymentFailure: true,
        enableSubscriptionEvents: true,
        enableInvoiceEvents: true,
        enableCustomerEvents: true
      }
    },
    taxes: {
      type: 'object',
      description: 'Tax configuration',
      properties: {
        enableAutomaticTax: {
          type: 'boolean',
          description: 'Enable automatic tax calculation',
          default: false
        },
        enableTaxCalculation: {
          type: 'boolean',
          description: 'Enable tax calculation',
          default: false
        },
        enableTaxReporting: {
          type: 'boolean',
          description: 'Enable tax reporting',
          default: false
        },
        enableVATHandling: {
          type: 'boolean',
          description: 'Enable VAT handling',
          default: false
        }
      },
      default: {
        enableAutomaticTax: false,
        enableTaxCalculation: false,
        enableTaxReporting: false,
        enableVATHandling: false
      }
    },
    connect: {
      type: 'object',
      description: 'Stripe Connect configuration',
      properties: {
        enableExpressAccounts: {
          type: 'boolean',
          description: 'Enable Express accounts',
          default: false
        },
        enableCustomAccounts: {
          type: 'boolean',
          description: 'Enable Custom accounts',
          default: false
        },
        enableAccountLinks: {
          type: 'boolean',
          description: 'Enable account links',
          default: false
        },
        enablePayouts: {
          type: 'boolean',
          description: 'Enable payouts',
          default: false
        }
      },
      default: {
        enableExpressAccounts: false,
        enableCustomAccounts: false,
        enableAccountLinks: false,
        enablePayouts: false
      }
    },
    currency: {
      type: 'string',
      description: 'Default currency for payments',
      default: 'usd',
      enum: ['usd', 'eur', 'gbp', 'cad', 'aud', 'jpy', 'chf', 'sek', 'nok', 'dkk']
    },
    locale: {
      type: 'string',
      description: 'Default locale for payments',
      default: 'en',
      enum: ['en', 'es', 'fr', 'de', 'it', 'ja', 'zh', 'ko']
    },
    rateLimiting: {
      type: 'object',
      description: 'Rate limiting configuration',
      properties: {
        maxRequestsPerSecond: {
          type: 'number',
          description: 'Maximum requests per second',
          default: 100,
          minimum: 1,
          maximum: 1000
        },
        maxRequestsPerMinute: {
          type: 'number',
          description: 'Maximum requests per minute',
          default: 6000,
          minimum: 10,
          maximum: 60000
        },
        enableRetryLogic: {
          type: 'boolean',
          description: 'Enable retry logic for failed requests',
          default: true
        },
        retryAttempts: {
          type: 'number',
          description: 'Number of retry attempts',
          default: 3,
          minimum: 1,
          maximum: 10
        }
      },
      default: {
        maxRequestsPerSecond: 100,
        maxRequestsPerMinute: 6000,
        enableRetryLogic: true,
        retryAttempts: 3
      }
    }
  },
  required: ['publishableKey', 'secretKey'],
  additionalProperties: false
};

export const StripeDefaultConfig: StripeConfig = {
  // Core Stripe configuration
  publishableKey: '',
  secretKey: '',
  webhookSecret: '',
  
  // Payment features
  features: {
    enableSubscriptions: true,
    enableInvoices: true,
    enableTaxes: false,
    enableConnect: false,
    enablePaymentIntents: true,
    enableSetupIntents: true,
    enableCheckout: true,
    enableBillingPortal: true
  },
  
  // Payment methods
  paymentMethods: {
    enableCards: true,
    enableBankTransfers: false,
    enableDigitalWallets: true,
    enableCrypto: false,
    enableLocalPayments: false
  },
  
  // Subscription settings
  subscriptions: {
    enableTrialPeriods: true,
    enableProration: true,
    enableUsageBasedBilling: false,
    enableMeteredBilling: false,
    enableQuantityUpdates: true
  },
  
  // Security settings
  security: {
    enable3DSecure: true,
    enableSCA: true,
    enableFraudDetection: true,
    enableDisputeHandling: true,
    enableChargebackProtection: false
  },
  
  // Webhook settings
  webhooks: {
    enablePaymentSuccess: true,
    enablePaymentFailure: true,
    enableSubscriptionEvents: true,
    enableInvoiceEvents: true,
    enableCustomerEvents: true
  },
  
  // Tax settings
  taxes: {
    enableAutomaticTax: false,
    enableTaxCalculation: false,
    enableTaxReporting: false,
    enableVATHandling: false
  },
  
  // Connect settings (for marketplaces)
  connect: {
    enableExpressAccounts: false,
    enableCustomAccounts: false,
    enableAccountLinks: false,
    enablePayouts: false
  },
  
  // Currency and locale
  currency: 'usd',
  locale: 'en',
  
  // Rate limiting
  rateLimiting: {
    maxRequestsPerSecond: 100,
    maxRequestsPerMinute: 6000,
    enableRetryLogic: true,
    retryAttempts: 3
  }
}; 