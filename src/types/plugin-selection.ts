/**
 * Plugin Selection Types
 * 
 * Defines interfaces for interactive plugin selection and configuration
 * during project generation.
 */

import { 
  DATABASE_PROVIDERS, 
  ORM_LIBRARIES,
  AUTH_PROVIDERS, 
  AUTH_FEATURES,
  UI_LIBRARIES,
  DEPLOYMENT_PLATFORMS,
  EMAIL_SERVICES,
  TESTING_FRAMEWORKS,
  DatabaseProvider,
  ORMLibrary,
  AuthProvider, 
  AuthFeature,
  UILibrary,
  DeploymentPlatform,
  EmailService,
  TestingFramework
} from './shared-config.js';

// ============================================================================
// PLUGIN SELECTION INTERFACES
// ============================================================================

export interface DatabaseSelection {
  enabled: boolean;
  provider: DatabaseProvider;
  orm: ORMLibrary;
  features: Partial<Record<string, boolean>>;
}

export interface AuthSelection {
  enabled: boolean;
  providers: AuthProvider[];
  features: Partial<Record<AuthFeature, boolean>>;
}

export interface UISelection {
  enabled: boolean;
  library: UILibrary;
  features: Partial<Record<string, boolean>>;
}

export interface DeploymentSelection {
  enabled: boolean;
  platform: DeploymentPlatform;
  features: Partial<Record<string, boolean>>;
}

export interface EmailSelection {
  enabled: boolean;
  service: EmailService;
  features: Partial<Record<string, boolean>>;
}

export interface TestingSelection {
  enabled: boolean;
  framework: TestingFramework;
  features: Partial<Record<string, boolean>>;
}

// New categories
export interface MonitoringSelection {
  enabled: boolean;
  services: string[]; // 'sentry', 'vercel-analytics', 'google-analytics'
  features: Partial<Record<string, boolean>>;
}

export interface PaymentSelection {
  enabled: boolean;
  providers: string[]; // 'stripe', 'paypal'
  features: Partial<Record<string, boolean>>;
}

export interface BlockchainSelection {
  enabled: boolean;
  networks: string[]; // 'ethereum', 'polygon', 'solana'
  features: Partial<Record<string, boolean>>;
}

export interface PluginSelection {
  database: DatabaseSelection;
  authentication: AuthSelection;
  ui: UISelection;
  deployment: DeploymentSelection;
  email: EmailSelection;
  testing: TestingSelection;
  monitoring: MonitoringSelection;
  payment: PaymentSelection;
  blockchain: BlockchainSelection;
}

// ============================================================================
// DEFAULT SELECTIONS
// ============================================================================

export const DEFAULT_DATABASE_SELECTION: DatabaseSelection = {
  enabled: true,
  provider: DATABASE_PROVIDERS.NEON,
  orm: ORM_LIBRARIES.DRIZZLE,
  features: {
    migrations: true,
    seeding: false,
    studio: true
  }
};

export const DEFAULT_AUTH_SELECTION: AuthSelection = {
  enabled: true,
  providers: [AUTH_PROVIDERS.EMAIL],
  features: {
    [AUTH_FEATURES.EMAIL_VERIFICATION]: true,
    [AUTH_FEATURES.PASSWORD_RESET]: true,
    [AUTH_FEATURES.SOCIAL_LOGIN]: false,
    [AUTH_FEATURES.SESSION_MANAGEMENT]: true
  }
};

export const DEFAULT_UI_SELECTION: UISelection = {
  enabled: true,
  library: UI_LIBRARIES.SHADCN_UI,
  features: {
    components: true,
    theming: true,
    responsive: true
  }
};

export const DEFAULT_DEPLOYMENT_SELECTION: DeploymentSelection = {
  enabled: false,
  platform: DEPLOYMENT_PLATFORMS.VERCEL,
  features: {
    autoDeploy: true,
    preview: true,
    analytics: false
  }
};

export const DEFAULT_EMAIL_SELECTION: EmailSelection = {
  enabled: false,
  service: EMAIL_SERVICES.RESEND,
  features: {
    templates: true,
    tracking: false,
    analytics: false
  }
};

export const DEFAULT_TESTING_SELECTION: TestingSelection = {
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
export const DEFAULT_MONITORING_SELECTION: MonitoringSelection = {
  enabled: false,
  services: [],
  features: {
    errorTracking: false,
    performanceMonitoring: false,
    analytics: false
  }
};

export const DEFAULT_PAYMENT_SELECTION: PaymentSelection = {
  enabled: false,
  providers: [],
  features: {
    subscriptions: false,
    oneTimePayments: false,
    invoices: false
  }
};

export const DEFAULT_BLOCKCHAIN_SELECTION: BlockchainSelection = {
  enabled: false,
  networks: [],
  features: {
    smartContracts: false,
    nftSupport: false,
    defiIntegration: false
  }
};

export const DEFAULT_PLUGIN_SELECTION: PluginSelection = {
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

// ============================================================================
// PLUGIN RECOMMENDATION INTERFACES
// ============================================================================

export interface PluginRecommendation {
  pluginId: string;
  reason: string;
  confidence: 'low' | 'medium' | 'high';
  benefits: string[];
  complexity: 'low' | 'medium' | 'high';
  popularity: 'low' | 'medium' | 'high';
}

export interface PluginCompatibility {
  compatible: boolean;
  conflicts: string[];
  dependencies: string[];
  warnings: string[];
  recommendations: string[];
}

// ============================================================================
// INTERACTIVE PROMPT INTERFACES
// ============================================================================

export interface PluginPrompt {
  type: 'select' | 'confirm' | 'input' | 'checkbox';
  name: string;
  message: string;
  choices?: PluginChoice[];
  default?: any;
  when?: (answers: any) => boolean;
  validate?: (input: any) => boolean | string;
  description?: string;
}

export interface PluginChoice {
  name: string;
  value: any;
  description?: string;
  recommended?: boolean;
  disabled?: boolean;
}

// ============================================================================
// CONFIGURATION PARAMETER INTERFACES
// ============================================================================

export interface ConfigParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect';
  label: string;
  description: string;
  required: boolean;
  default?: any;
  options?: ConfigOption[];
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    custom?: (value: any) => boolean | string;
  };
}

export interface ConfigOption {
  label: string;
  value: any;
  description?: string;
}

export interface PluginConfiguration {
  pluginId: string;
  parameters: ConfigParameter[];
  values: Record<string, any>;
} 