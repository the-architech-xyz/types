import { Blueprint } from '../../types/adapter.js';

const sentryNextjsIntegrationBlueprint: Blueprint = {
  id: 'sentry-nextjs-integration',
  name: 'Sentry Next.js Integration',
  description: 'Complete error monitoring and performance tracking for Next.js',
  version: '1.0.0',
  actions: [
    // Install Sentry packages
    {
      type: 'INSTALL_PACKAGES',
      packages: ['@sentry/nextjs'],
      isDev: false
    },
    // Add environment variables
    {
      type: 'ADD_ENV_VAR',
      key: 'NEXT_PUBLIC_SENTRY_DSN',
      value: 'https://...@sentry.io/...',
      description: 'Sentry DSN for error tracking'
    },
    {
      type: 'ADD_ENV_VAR',
      key: 'SENTRY_ORG',
      value: 'your-org',
      description: 'Sentry organization slug'
    },
    {
      type: 'ADD_ENV_VAR',
      key: 'SENTRY_PROJECT',
      value: 'your-project',
      description: 'Sentry project name'
    },
    {
      type: 'ADD_ENV_VAR',
      key: 'SENTRY_AUTH_TOKEN',
      value: 'sntrys_...',
      description: 'Sentry auth token for releases'
    },
    // Update Next.js config using modifier
    {
      type: 'ENHANCE_FILE',
      path: 'next.config.js',
      condition: '{{#if integration.features.errorTracking}}',
      modifier: 'nextjs-config-wrapper',
      params: {
        wrapper: 'withSentryConfig',
        options: {
          org: 'process.env.SENTRY_ORG',
          project: 'process.env.SENTRY_PROJECT',
          authToken: 'process.env.SENTRY_AUTH_TOKEN',
          silent: true,
          widenClientFileUpload: true,
          hideSourceMaps: true,
          disableLogger: true,
          automaticVercelMonitors: true,
        }
      }
    },
    // Enhance Sentry configuration files using modifier
    {
      type: 'ENHANCE_FILE',
      path: 'sentry.client.config.ts',
      condition: '{{#if integration.features.errorTracking}}',
      modifier: 'sentry-config-merger',
      params: {
        framework: 'nextjs',
        features: ['errorTracking', 'performanceMonitoring', 'replay'],
        tracesSampleRate: 0.1,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0
      }
    },
    {
      type: 'ENHANCE_FILE',
      path: 'sentry.server.config.ts',
      condition: '{{#if integration.features.errorTracking}}',
      modifier: 'sentry-config-merger',
      params: {
        framework: 'nextjs',
        features: ['errorTracking', 'performanceMonitoring'],
        tracesSampleRate: 0.1
      }
    },
    {
      type: 'ENHANCE_FILE',
      path: 'sentry.edge.config.ts',
      condition: '{{#if integration.features.errorTracking}}',
      modifier: 'sentry-config-merger',
      params: {
        framework: 'nextjs',
        features: ['errorTracking', 'performanceMonitoring'],
        tracesSampleRate: 0.1
      }
    },
    // Middleware - only create if it doesn't exist
    {
      type: 'CREATE_FILE',
      path: 'src/middleware.ts',
      condition: '{{#if integration.features.middleware}}',
      content: `import * as Sentry from '@sentry/nextjs';
import { NextRequest } from 'next/server';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: process.env.NODE_ENV === 'development',
});

export async function middleware(request: NextRequest) {
  return Sentry.withSentryMiddleware(request);
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
`
    }
  ]
};

export const blueprint = sentryNextjsIntegrationBlueprint;