/**
 * Plugin Selection Types
 *
 * Defines interfaces for interactive plugin selection and configuration
 * during project generation.
 */
import { DATABASE_PROVIDERS, ORM_LIBRARIES, AUTH_PROVIDERS, AUTH_FEATURES, UI_LIBRARIES, DEPLOYMENT_PLATFORMS, EMAIL_SERVICES, TESTING_FRAMEWORKS } from './shared-config.js';
// ============================================================================
// DEFAULT SELECTIONS
// ============================================================================
export const DEFAULT_DATABASE_SELECTION = {
    enabled: true,
    provider: DATABASE_PROVIDERS.NEON,
    orm: ORM_LIBRARIES.DRIZZLE,
    features: {
        migrations: true,
        seeding: false,
        studio: true
    }
};
export const DEFAULT_AUTH_SELECTION = {
    enabled: true,
    providers: [AUTH_PROVIDERS.EMAIL],
    features: {
        [AUTH_FEATURES.EMAIL_VERIFICATION]: true,
        [AUTH_FEATURES.PASSWORD_RESET]: true,
        [AUTH_FEATURES.SOCIAL_LOGIN]: false,
        [AUTH_FEATURES.SESSION_MANAGEMENT]: true
    }
};
export const DEFAULT_UI_SELECTION = {
    enabled: true,
    library: UI_LIBRARIES.SHADCN_UI,
    features: {
        components: true,
        theming: true,
        responsive: true
    }
};
export const DEFAULT_DEPLOYMENT_SELECTION = {
    enabled: false,
    platform: DEPLOYMENT_PLATFORMS.VERCEL,
    features: {
        autoDeploy: true,
        preview: true,
        analytics: false
    }
};
export const DEFAULT_EMAIL_SELECTION = {
    enabled: false,
    service: EMAIL_SERVICES.RESEND,
    features: {
        templates: true,
        tracking: false,
        analytics: false
    }
};
export const DEFAULT_TESTING_SELECTION = {
    enabled: true,
    framework: TESTING_FRAMEWORKS.VITEST,
    features: {
        unit: true,
        integration: false,
        e2e: false,
        coverage: true
    }
};
// New default selections
export const DEFAULT_MONITORING_SELECTION = {
    enabled: false,
    services: [],
    features: {
        errorTracking: false,
        performanceMonitoring: false,
        analytics: false
    }
};
export const DEFAULT_PAYMENT_SELECTION = {
    enabled: false,
    providers: [],
    features: {
        subscriptions: false,
        oneTimePayments: false,
        invoices: false
    }
};
export const DEFAULT_BLOCKCHAIN_SELECTION = {
    enabled: false,
    networks: [],
    features: {
        smartContracts: false,
        nftSupport: false,
        defiIntegration: false
    }
};
export const DEFAULT_PLUGIN_SELECTION = {
    database: DEFAULT_DATABASE_SELECTION,
    authentication: DEFAULT_AUTH_SELECTION,
    ui: DEFAULT_UI_SELECTION,
    deployment: DEFAULT_DEPLOYMENT_SELECTION,
    email: DEFAULT_EMAIL_SELECTION,
    testing: DEFAULT_TESTING_SELECTION,
    monitoring: DEFAULT_MONITORING_SELECTION,
    payment: DEFAULT_PAYMENT_SELECTION,
    blockchain: DEFAULT_BLOCKCHAIN_SELECTION
};
//# sourceMappingURL=plugin-selection.js.map