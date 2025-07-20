/**
 * Plugin Selection Types
 * 
 * Defines interfaces for interactive plugin selection and configuration
 * during project generation.
 */

// ============================================================================
// PLUGIN SELECTION INTERFACES
// ============================================================================

export interface PluginSelection {
  // Core technology choices
  database: DatabaseSelection;
  authentication: AuthSelection;
  ui: UISelection;
  deployment: DeploymentSelection;
  
  // Optional features
  testing: TestingSelection;
  monitoring: MonitoringSelection;
  email: EmailSelection;
  
  // Advanced options
  advanced: AdvancedSelection;
}

export interface DatabaseSelection {
  enabled: boolean;
  type: 'drizzle' | 'prisma' | 'none';
  provider: 'neon' | 'supabase' | 'local' | 'vercel';
  features: {
    migrations: boolean;
    seeding: boolean;
    backup: boolean;
  };
  configuration?: Record<string, any>;
}

export interface AuthSelection {
  enabled: boolean;
  type: 'better-auth' | 'next-auth' | 'none';
  providers: ('email' | 'github' | 'google' | 'discord' | 'twitter')[];
  features: {
    emailVerification: boolean;
    passwordReset: boolean;
    socialLogin: boolean;
    sessionManagement: boolean;
  };
  configuration?: Record<string, any>;
}

export interface UISelection {
  enabled: boolean;
  type: 'shadcn' | 'radix' | 'none';
  theme: 'light' | 'dark' | 'system';
  components: string[];
  features: {
    animations: boolean;
    icons: boolean;
    responsive: boolean;
  };
  configuration?: Record<string, any>;
}

export interface DeploymentSelection {
  enabled: boolean;
  platform: 'vercel' | 'railway' | 'netlify' | 'aws' | 'none';
  environment: 'development' | 'staging' | 'production';
  features: {
    autoDeploy: boolean;
    previewDeployments: boolean;
    customDomain: boolean;
  };
}

export interface TestingSelection {
  enabled: boolean;
  framework: 'jest' | 'vitest' | 'playwright' | 'none';
  coverage: boolean;
  e2e: boolean;
}

export interface MonitoringSelection {
  enabled: boolean;
  service: 'sentry' | 'logrocket' | 'none';
  features: {
    errorTracking: boolean;
    performance: boolean;
    analytics: boolean;
  };
}

export interface EmailSelection {
  enabled: boolean;
  provider: 'resend' | 'sendgrid' | 'mailgun' | 'none';
  features: {
    transactional: boolean;
    marketing: boolean;
    templates: boolean;
  };
}

export interface AdvancedSelection {
  // Development tools
  linting: boolean;
  formatting: boolean;
  gitHooks: boolean;
  
  // Performance
  bundling: 'webpack' | 'vite' | 'turbopack';
  optimization: boolean;
  
  // Security
  security: boolean;
  rateLimiting: boolean;
}

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