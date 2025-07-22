import { PluginCategory, TargetPlatform } from '../../../../types/plugin.js';
import { AgentLogger } from '../../../../core/cli/logger.js';
export class GoogleAnalyticsPlugin {
    logger;
    constructor() {
        this.logger = new AgentLogger(false, 'GoogleAnalyticsPlugin');
    }
    getMetadata() {
        return {
            id: 'google-analytics',
            name: 'Google Analytics',
            version: '1.0.0',
            description: 'Web analytics and tracking with Google Analytics 4',
            author: 'The Architech Team',
            category: PluginCategory.MONITORING,
            tags: ['monitoring', 'analytics', 'tracking', 'google', 'ga4'],
            license: 'MIT',
            repository: 'https://github.com/googleanalytics/ga-dev-tools',
            homepage: 'https://analytics.google.com',
            documentation: 'https://developers.google.com/analytics'
        };
    }
    async validate(context) {
        this.logger.info('Validating Google Analytics plugin configuration');
        const { pluginConfig } = context;
        if (!pluginConfig.measurementId) {
            return {
                valid: false,
                errors: [{
                        field: 'measurementId',
                        message: 'Google Analytics measurement ID is required',
                        code: 'MISSING_MEASUREMENT_ID',
                        severity: 'error'
                    }],
                warnings: []
            };
        }
        return {
            valid: true,
            errors: [],
            warnings: []
        };
    }
    async install(context) {
        this.logger.info('Installing Google Analytics plugin');
        const { pluginConfig, projectPath } = context;
        try {
            // Install dependencies
            await this.installDependencies(projectPath);
            // Generate configuration files
            const files = await this.generateFiles(pluginConfig);
            // Add environment variables
            const envVars = this.generateEnvironmentVariables(pluginConfig);
            return {
                success: true,
                artifacts: files.map(file => ({
                    type: 'file',
                    path: file.path,
                    content: file.content
                })),
                dependencies: [
                    {
                        name: 'gtag',
                        version: '^1.0.0',
                        type: 'production',
                        category: PluginCategory.MONITORING
                    }
                ],
                scripts: [
                    {
                        name: 'analytics:dev',
                        command: 'echo "Google Analytics enabled in development"',
                        description: 'Development analytics status',
                        category: 'dev'
                    },
                    {
                        name: 'analytics:build',
                        command: 'echo "Google Analytics will be active in production"',
                        description: 'Production analytics status',
                        category: 'build'
                    }
                ],
                configs: [],
                errors: [],
                warnings: [],
                duration: 0
            };
        }
        catch (error) {
            this.logger.error('Failed to install Google Analytics plugin:', error);
            return {
                success: false,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [{
                        code: 'INSTALL_FAILED',
                        message: `Failed to setup Google Analytics: ${error}`,
                        severity: 'error'
                    }],
                warnings: [],
                duration: 0
            };
        }
    }
    async uninstall(context) {
        this.logger.info('Uninstalling Google Analytics plugin');
        return {
            success: true,
            artifacts: [],
            dependencies: [],
            scripts: [],
            configs: [],
            errors: [],
            warnings: [],
            duration: 0
        };
    }
    async update(context) {
        this.logger.info('Updating Google Analytics plugin');
        return this.install(context);
    }
    getCompatibility() {
        return {
            frameworks: ['nextjs', 'react', 'vue', 'angular'],
            platforms: [TargetPlatform.WEB],
            nodeVersions: ['>=16.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm'],
            conflicts: []
        };
    }
    getDependencies() {
        return ['gtag'];
    }
    getConflicts() {
        return [];
    }
    getRequirements() {
        return [
            {
                type: 'package',
                name: 'gtag',
                description: 'Google Analytics gtag package',
                version: '^1.0.0'
            }
        ];
    }
    getDefaultConfig() {
        return {
            measurementId: '',
            enableEnhancedEcommerce: false,
            enableCustomEvents: true,
            enableUserTiming: true,
            enableExceptionTracking: true,
            enablePrivacyMode: true,
            enableDebugMode: false
        };
    }
    getConfigSchema() {
        return {
            type: 'object',
            properties: {
                measurementId: {
                    type: 'string',
                    description: 'Google Analytics 4 measurement ID (G-XXXXXXXXXX)',
                    default: ''
                },
                enableEnhancedEcommerce: {
                    type: 'boolean',
                    description: 'Enable enhanced ecommerce tracking',
                    default: false
                },
                enableCustomEvents: {
                    type: 'boolean',
                    description: 'Enable custom event tracking',
                    default: true
                },
                enableUserTiming: {
                    type: 'boolean',
                    description: 'Enable user timing tracking',
                    default: true
                },
                enableExceptionTracking: {
                    type: 'boolean',
                    description: 'Enable exception tracking',
                    default: true
                },
                enablePrivacyMode: {
                    type: 'boolean',
                    description: 'Enable privacy mode (respects DNT)',
                    default: true
                },
                enableDebugMode: {
                    type: 'boolean',
                    description: 'Enable debug mode for development',
                    default: false
                }
            },
            required: ['measurementId']
        };
    }
    async installDependencies(projectPath) {
        this.logger.info('Installing Google Analytics dependencies');
        // This would be handled by the package manager
        // For now, we just log the required packages
        this.logger.info('Required packages: gtag');
    }
    async generateFiles(config) {
        const files = [];
        // Generate analytics configuration
        files.push({
            path: 'src/lib/analytics.ts',
            content: this.generateAnalyticsConfig(config),
            mergeStrategy: 'replace'
        });
        // Generate analytics provider component
        files.push({
            path: 'src/components/providers/analytics-provider.tsx',
            content: this.generateAnalyticsProvider(config),
            mergeStrategy: 'replace'
        });
        // Generate analytics utilities
        files.push({
            path: 'src/lib/analytics-utils.ts',
            content: this.generateAnalyticsUtils(config),
            mergeStrategy: 'replace'
        });
        // Generate Next.js configuration
        files.push({
            path: 'next.config.js',
            content: this.generateNextConfig(config),
            mergeStrategy: 'merge'
        });
        return files;
    }
    generateAnalyticsConfig(config) {
        const enableEnhancedEcommerce = config.enableEnhancedEcommerce === true;
        const enableCustomEvents = config.enableCustomEvents !== false;
        const enableUserTiming = config.enableUserTiming !== false;
        const enableExceptionTracking = config.enableExceptionTracking !== false;
        const enablePrivacyMode = config.enablePrivacyMode !== false;
        const enableDebugMode = config.enableDebugMode === true;
        return `import { gtag } from 'gtag';

// ============================================================================
// GOOGLE ANALYTICS CONFIGURATION
// ============================================================================

export const analyticsConfig = {
  // Measurement ID
  measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '${config.measurementId}',
  
  // Feature flags
  enableEnhancedEcommerce: ${enableEnhancedEcommerce},
  enableCustomEvents: ${enableCustomEvents},
  enableUserTiming: ${enableUserTiming},
  enableExceptionTracking: ${enableExceptionTracking},
  enablePrivacyMode: ${enablePrivacyMode},
  enableDebugMode: ${enableDebugMode},
  
  // Privacy settings
  respectDNT: ${enablePrivacyMode},
  anonymizeIP: ${enablePrivacyMode},
  
  // Debug mode
  debug: process.env.NODE_ENV === 'development' || ${enableDebugMode},
};

// ============================================================================
// ANALYTICS INITIALIZATION
// ============================================================================

export function initializeAnalytics(): void {
  if (typeof window !== 'undefined' && analyticsConfig.measurementId) {
    // Initialize gtag
    window.gtag('js', new Date());
    window.gtag('config', analyticsConfig.measurementId, {
      page_title: document.title,
      page_location: window.location.href,
      anonymize_ip: analyticsConfig.anonymizeIP,
      debug_mode: analyticsConfig.debug,
    });
    
    console.log('📊 Google Analytics initialized');
  }
}

// ============================================================================
// PAGE VIEW TRACKING
// ============================================================================

export function trackPageView(url: string, title?: string): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', analyticsConfig.measurementId, {
      page_title: title || document.title,
      page_location: url,
    });
  }
}

// ============================================================================
// CUSTOM EVENT TRACKING
// ============================================================================

${enableCustomEvents ? `
export function trackEvent(
  eventName: string,
  parameters?: Record<string, any>
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
}

export function trackButtonClick(
  buttonName: string,
  location?: string
): void {
  trackEvent('button_click', {
    button_name: buttonName,
    location: location || window.location.pathname,
  });
}

export function trackFormSubmission(
  formName: string,
  success: boolean
): void {
  trackEvent('form_submission', {
    form_name: formName,
    success,
  });
}

export function trackUserAction(
  action: string,
  category: string,
  label?: string,
  value?: number
): void {
  trackEvent('user_action', {
    action,
    category,
    label,
    value,
  });
}
` : ''}

// ============================================================================
// USER TIMING TRACKING
// ============================================================================

${enableUserTiming ? `
export function trackUserTiming(
  category: string,
  variable: string,
  time: number,
  label?: string
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'timing_complete', {
      name: variable,
      value: time,
      event_category: category,
      event_label: label,
    });
  }
}
` : ''}

// ============================================================================
// EXCEPTION TRACKING
// ============================================================================

${enableExceptionTracking ? `
export function trackException(
  description: string,
  fatal: boolean = false
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'exception', {
      description,
      fatal,
    });
  }
}
` : ''}

// ============================================================================
// ECOMMERCE TRACKING
// ============================================================================

${enableEnhancedEcommerce ? `
export function trackPurchase(
  transactionId: string,
  value: number,
  currency: string = 'USD',
  items?: Array<{
    item_id: string;
    item_name: string;
    price: number;
    quantity: number;
  }>
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value,
      currency,
      items,
    });
  }
}

export function trackAddToCart(
  itemId: string,
  itemName: string,
  price: number,
  quantity: number = 1,
  currency: string = 'USD'
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency,
      value: price * quantity,
      items: [{
        item_id: itemId,
        item_name: itemName,
        price,
        quantity,
      }],
    });
  }
}
` : ''}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

declare global {
  interface Window {
    gtag: (
      command: 'js' | 'config' | 'event',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
  }
}
`;
    }
    generateAnalyticsProvider(config) {
        return `'use client';

import { useEffect } from 'react';
import { initializeAnalytics, trackPageView } from '../../lib/analytics';

// ============================================================================
// ANALYTICS PROVIDER COMPONENT
// ============================================================================

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  useEffect(() => {
    // Initialize analytics on client side
    initializeAnalytics();
  }, []);

  useEffect(() => {
    // Track page views on route changes
    const handleRouteChange = (url: string) => {
      trackPageView(url);
    };

    // Listen for route changes (Next.js)
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', () => {
        handleRouteChange(window.location.href);
      });
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('popstate', () => {
          handleRouteChange(window.location.href);
        });
      }
    };
  }, []);

  return <>{children}</>;
}

// ============================================================================
// ANALYTICS HOOKS
// ============================================================================

export function useAnalytics() {
  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, parameters);
    }
  };

  const trackPageView = (url: string, title?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
        page_title: title || document.title,
        page_location: url,
      });
    }
  };

  const trackButtonClick = (buttonName: string, location?: string) => {
    trackEvent('button_click', {
      button_name: buttonName,
      location: location || window.location.pathname,
    });
  };

  const trackFormSubmission = (formName: string, success: boolean) => {
    trackEvent('form_submission', {
      form_name: formName,
      success,
    });
  };

  return {
    trackEvent,
    trackPageView,
    trackButtonClick,
    trackFormSubmission,
  };
}
`;
    }
    generateAnalyticsUtils(config) {
        const enableCustomEvents = config.enableCustomEvents !== false;
        const enableEnhancedEcommerce = config.enableEnhancedEcommerce === true;
        return `// ============================================================================
// ANALYTICS UTILITIES
// ============================================================================

/**
 * Check if analytics is available
 */
export function isAnalyticsAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.gtag;
}

/**
 * Get analytics instance
 */
export function getAnalytics() {
  if (typeof window !== 'undefined') {
    return window.gtag;
  }
  return null;
}

/**
 * Track custom events
 */
${enableCustomEvents ? `
export function trackCustomEvent(
  eventName: string,
  parameters?: Record<string, any>
): void {
  if (isAnalyticsAvailable()) {
    window.gtag!('event', eventName, parameters);
  }
}

export function trackUserAction(
  action: string,
  category: string,
  label?: string,
  value?: number
): void {
  trackCustomEvent('user_action', {
    action,
    category,
    label,
    value,
  });
}

export function trackError(
  error: Error,
  context?: Record<string, any>
): void {
  trackCustomEvent('error', {
    message: error.message,
    stack: error.stack,
    context,
  });
}
` : ''}

/**
 * Track performance metrics
 */
export function trackPerformance(
  metricName: string,
  value: number,
  category: string = 'performance'
): void {
  if (isAnalyticsAvailable()) {
    window.gtag!('event', 'timing_complete', {
      name: metricName,
      value,
      event_category: category,
    });
  }
}

/**
 * Track user engagement
 */
export function trackEngagement(
  type: 'scroll' | 'click' | 'hover' | 'focus',
  element: string,
  duration?: number
): void {
  if (isAnalyticsAvailable()) {
    window.gtag!('event', 'engagement', {
      type,
      element,
      duration,
    });
  }
}

${enableEnhancedEcommerce ? `
/**
 * Ecommerce tracking utilities
 */
export function trackProductView(
  productId: string,
  productName: string,
  price: number,
  category?: string,
  currency: string = 'USD'
): void {
  if (isAnalyticsAvailable()) {
    window.gtag!('event', 'view_item', {
      currency,
      value: price,
      items: [{
        item_id: productId,
        item_name: productName,
        price,
        item_category: category,
      }],
    });
  }
}

export function trackAddToCart(
  productId: string,
  productName: string,
  price: number,
  quantity: number = 1,
  currency: string = 'USD'
): void {
  if (isAnalyticsAvailable()) {
    window.gtag!('event', 'add_to_cart', {
      currency,
      value: price * quantity,
      items: [{
        item_id: productId,
        item_name: productName,
        price,
        quantity,
      }],
    });
  }
}

export function trackPurchase(
  transactionId: string,
  value: number,
  currency: string = 'USD',
  items?: Array<{
    item_id: string;
    item_name: string;
    price: number;
    quantity: number;
  }>
): void {
  if (isAnalyticsAvailable()) {
    window.gtag!('event', 'purchase', {
      transaction_id: transactionId,
      value,
      currency,
      items,
    });
  }
}
` : ''}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

declare global {
  interface Window {
    gtag: (
      command: 'js' | 'config' | 'event',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
  }
}
`;
    }
    generateNextConfig(config) {
        return `// Google Analytics configuration
const nextConfig = {
  // Your existing Next.js configuration
  experimental: {
    // Enable analytics in experimental features
  },
  
  // Head configuration for Google Analytics
  async head() {
    return [
      {
        script: [
          {
            src: \`https://www.googletagmanager.com/gtag/js?id=\${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '${config.measurementId}'}\`,
            async: true,
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
`;
    }
    generateEnvironmentVariables(config) {
        return {
            NEXT_PUBLIC_GA_MEASUREMENT_ID: config.measurementId,
            NEXT_PUBLIC_ENABLE_ANALYTICS: 'true',
            NEXT_PUBLIC_ANALYTICS_DEBUG: process.env.NODE_ENV === 'development' ? 'true' : 'false'
        };
    }
}
//# sourceMappingURL=google-analytics.plugin.js.map