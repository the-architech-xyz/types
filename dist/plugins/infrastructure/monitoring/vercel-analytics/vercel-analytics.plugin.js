import { PluginCategory, TargetPlatform } from '../../../../types/plugin.js';
import { AgentLogger } from '../../../../core/cli/logger.js';
export class VercelAnalyticsPlugin {
    logger;
    constructor() {
        this.logger = new AgentLogger(false, 'VercelAnalyticsPlugin');
    }
    getMetadata() {
        return {
            id: 'vercel-analytics',
            name: 'Vercel Analytics',
            version: '1.0.0',
            description: 'Web analytics and performance monitoring with Vercel Analytics',
            author: 'The Architech Team',
            category: PluginCategory.MONITORING,
            tags: ['monitoring', 'analytics', 'performance', 'vercel', 'web-vitals'],
            license: 'MIT',
            repository: 'https://github.com/vercel/analytics',
            homepage: 'https://vercel.com/analytics',
            documentation: 'https://vercel.com/docs/analytics'
        };
    }
    async validate(context) {
        this.logger.info('Validating Vercel Analytics plugin configuration');
        const { pluginConfig } = context;
        if (!pluginConfig.vercelProjectId) {
            return {
                valid: false,
                errors: [{
                        field: 'vercelProjectId',
                        message: 'Vercel project ID is required for analytics setup',
                        code: 'MISSING_PROJECT_ID',
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
        this.logger.info('Installing Vercel Analytics plugin');
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
                        name: '@vercel/analytics',
                        version: '^1.0.0',
                        type: 'production',
                        category: PluginCategory.MONITORING
                    }
                ],
                scripts: [
                    {
                        name: 'analytics:dev',
                        command: 'echo "Analytics enabled in development"',
                        description: 'Development analytics status',
                        category: 'dev'
                    },
                    {
                        name: 'analytics:build',
                        command: 'echo "Analytics will be active in production"',
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
            this.logger.error('Failed to install Vercel Analytics plugin:', error);
            return {
                success: false,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [{
                        code: 'INSTALL_FAILED',
                        message: `Failed to setup Vercel Analytics: ${error}`,
                        severity: 'error'
                    }],
                warnings: [],
                duration: 0
            };
        }
    }
    async uninstall(context) {
        this.logger.info('Uninstalling Vercel Analytics plugin');
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
        this.logger.info('Updating Vercel Analytics plugin');
        return this.install(context);
    }
    getCompatibility() {
        return {
            frameworks: ['nextjs', 'react'],
            platforms: [TargetPlatform.WEB],
            nodeVersions: ['>=18.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm'],
            conflicts: []
        };
    }
    getDependencies() {
        return ['@vercel/analytics'];
    }
    getConflicts() {
        return [];
    }
    getRequirements() {
        return [
            {
                type: 'package',
                name: '@vercel/analytics',
                description: 'Vercel Analytics package',
                version: '^1.0.0'
            }
        ];
    }
    getDefaultConfig() {
        return {
            vercelProjectId: '',
            enableWebVitals: true,
            enableSpeedInsights: true,
            enableCustomEvents: false,
            enablePrivacyMode: true
        };
    }
    getConfigSchema() {
        return {
            type: 'object',
            properties: {
                vercelProjectId: {
                    type: 'string',
                    description: 'Vercel project ID for analytics',
                    default: ''
                },
                enableWebVitals: {
                    type: 'boolean',
                    description: 'Enable Core Web Vitals tracking',
                    default: true
                },
                enableSpeedInsights: {
                    type: 'boolean',
                    description: 'Enable Speed Insights',
                    default: true
                },
                enableCustomEvents: {
                    type: 'boolean',
                    description: 'Enable custom event tracking',
                    default: false
                },
                enablePrivacyMode: {
                    type: 'boolean',
                    description: 'Enable privacy mode (respects DNT)',
                    default: true
                }
            },
            required: ['vercelProjectId']
        };
    }
    async installDependencies(projectPath) {
        this.logger.info('Installing Vercel Analytics dependencies');
        // This would be handled by the package manager
        // For now, we just log the required packages
        this.logger.info('Required packages: @vercel/analytics');
    }
    async generateFiles(config) {
        const files = [];
        // Generate analytics configuration
        files.push({
            path: 'src/lib/analytics.ts',
            content: this.generateAnalyticsConfig(config),
            mergeStrategy: 'replace'
        });
        // Generate Next.js configuration
        files.push({
            path: 'next.config.js',
            content: this.generateNextConfig(config),
            mergeStrategy: 'merge'
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
        return files;
    }
    generateAnalyticsConfig(config) {
        const enableWebVitals = config.enableWebVitals !== false;
        const enableSpeedInsights = config.enableSpeedInsights !== false;
        const enableCustomEvents = config.enableCustomEvents === true;
        const enablePrivacyMode = config.enablePrivacyMode !== false;
        return `import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

// ============================================================================
// VERCEL ANALYTICS CONFIGURATION
// ============================================================================

export const analyticsConfig = {
  // Project configuration
  projectId: process.env.VERCEL_PROJECT_ID || '${config.vercelProjectId}',
  
  // Feature flags
  enableWebVitals: ${enableWebVitals},
  enableSpeedInsights: ${enableSpeedInsights},
  enableCustomEvents: ${enableCustomEvents},
  enablePrivacyMode: ${enablePrivacyMode},
  
  // Privacy settings
  respectDNT: ${enablePrivacyMode},
  anonymizeIP: ${enablePrivacyMode},
  
  // Debug mode
  debug: process.env.NODE_ENV === 'development',
};

// ============================================================================
// ANALYTICS COMPONENTS
// ============================================================================

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {analyticsConfig.enableWebVitals && <Analytics />}
      {analyticsConfig.enableSpeedInsights && <SpeedInsights />}
    </>
  );
}

// ============================================================================
// CUSTOM EVENT TRACKING
// ============================================================================

${enableCustomEvents ? `
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.va) {
    window.va.track(eventName, properties);
  }
};

export const trackPageView = (url: string) => {
  trackEvent('page_view', { url });
};

export const trackButtonClick = (buttonName: string, location?: string) => {
  trackEvent('button_click', { buttonName, location });
};

export const trackFormSubmission = (formName: string, success: boolean) => {
  trackEvent('form_submission', { formName, success });
};
` : ''}

// ============================================================================
// WEB VITALS TRACKING
// ============================================================================

${enableWebVitals ? `
export const trackWebVitals = (metric: any) => {
  if (typeof window !== 'undefined' && window.va) {
    window.va.track('web_vitals', {
      name: metric.name,
      value: metric.value,
      id: metric.id,
      delta: metric.delta,
      rating: metric.rating,
    });
  }
};
` : ''}

// ============================================================================
// EXPORTS
// ============================================================================

export { Analytics, SpeedInsights };
`;
    }
    generateNextConfig(config) {
        return `// Vercel Analytics configuration
const { withAnalytics } = require('@vercel/analytics/next');

const nextConfig = {
  // Your existing Next.js configuration
  experimental: {
    // Enable analytics in experimental features
  },
  
  // Analytics configuration
  analytics: {
    projectId: process.env.VERCEL_PROJECT_ID || '${config.vercelProjectId}',
    respectDNT: ${config.enablePrivacyMode !== false},
  },
};

module.exports = withAnalytics(nextConfig);
`;
    }
    generateAnalyticsProvider(config) {
        const enableWebVitals = config.enableWebVitals !== false;
        const enableSpeedInsights = config.enableSpeedInsights !== false;
        return `'use client';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { useEffect } from 'react';

// ============================================================================
// ANALYTICS PROVIDER COMPONENT
// ============================================================================

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  useEffect(() => {
    // Initialize analytics on client side
    console.log('📊 Vercel Analytics initialized');
  }, []);

  return (
    <>
      {children}
      ${enableWebVitals ? '<Analytics />' : ''}
      ${enableSpeedInsights ? '<SpeedInsights />' : ''}
    </>
  );
}

// ============================================================================
// ANALYTICS HOOKS
// ============================================================================

export function useAnalytics() {
  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.va) {
      window.va.track(eventName, properties);
    }
  };

  const trackPageView = (url: string) => {
    trackEvent('page_view', { url });
  };

  const trackButtonClick = (buttonName: string, location?: string) => {
    trackEvent('button_click', { buttonName, location });
  };

  const trackFormSubmission = (formName: string, success: boolean) => {
    trackEvent('form_submission', { formName, success });
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
        const enableCustomEvents = config.enableCustomEvents === true;
        return `// ============================================================================
// ANALYTICS UTILITIES
// ============================================================================

/**
 * Check if analytics is available
 */
export function isAnalyticsAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.va;
}

/**
 * Get analytics instance
 */
export function getAnalytics() {
  if (typeof window !== 'undefined') {
    return window.va;
  }
  return null;
}

/**
 * Track custom events
 */
${enableCustomEvents ? `
export function trackCustomEvent(
  eventName: string,
  properties?: Record<string, any>
): void {
  if (isAnalyticsAvailable()) {
    window.va!.track(eventName, properties);
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
    window.va!.track('performance', {
      metric: metricName,
      value,
      category,
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
    window.va!.track('engagement', {
      type,
      element,
      duration,
    });
  }
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

declare global {
  interface Window {
    va?: {
      track: (eventName: string, properties?: Record<string, any>) => void;
    };
  }
}
`;
    }
    generateEnvironmentVariables(config) {
        return {
            VERCEL_PROJECT_ID: config.vercelProjectId,
            NEXT_PUBLIC_VERCEL_ANALYTICS_ID: config.vercelProjectId,
            NEXT_PUBLIC_ENABLE_ANALYTICS: 'true',
            NEXT_PUBLIC_ANALYTICS_DEBUG: process.env.NODE_ENV === 'development' ? 'true' : 'false'
        };
    }
}
//# sourceMappingURL=vercel-analytics.plugin.js.map