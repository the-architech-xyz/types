import { SentryConfig } from './SentrySchema.js';

export class SentryGenerator {
  static generateSentryClientConfig(config: SentryConfig): string {
    return `// This file configures the Sentry browser client for error monitoring and session replay.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: ${config.tracesSampleRate},
  replaysOnErrorSampleRate: ${config.replaysOnErrorSampleRate},
  replaysSessionSampleRate: ${config.replaysSessionSampleRate},
  
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
`;
  }

  static generateSentryServerConfig(config: SentryConfig): string {
    return `// This file configures the Sentry server client for error monitoring.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: ${config.tracesSampleRate},
});
`;
  }

  static generateNextConfig(config: SentryConfig): string {
    return `const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing Next.js config...
};

module.exports = withSentryConfig(
  nextConfig,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,
    org: "${config.org}",
    project: "${config.project}",
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for better stack traces (increases build time)
    widenClientFileUpload: true,

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  }
);
`;
  }

  static generateEnvConfig(config: SentryConfig): string {
    let envContent = '# Sentry Configuration\n';
    envContent += `NEXT_PUBLIC_SENTRY_DSN="${config.dsn}"\n`;
    if (config.authToken) {
      envContent += `SENTRY_AUTH_TOKEN="${config.authToken}"\n`;
    }
    if (config.org) {
      envContent += `SENTRY_ORG="${config.org}"\n`;
    }
    if (config.project) {
      envContent += `SENTRY_PROJECT="${config.project}"\n`;
    }
    return envContent;
  }

  static generatePackageJson(config: SentryConfig): string {
    return JSON.stringify({
      dependencies: {
        '@sentry/nextjs': '^7.0.0',
      }
    }, null, 2);
  }

  static generateReadme(): string {
    return `# Sentry Monitoring

This project is configured to use [Sentry](https://sentry.io) for error tracking and performance monitoring.

## Configuration

The following environment variables are required for the Sentry integration:

- \`NEXT_PUBLIC_SENTRY_DSN\`: Your Sentry Data Source Name.
- \`SENTRY_AUTH_TOKEN\`: Your Sentry auth token for uploading source maps.
- \`SENTRY_ORG\`: Your Sentry organization slug.
- \`SENTRY_PROJECT\`: Your Sentry project slug.

These should be set in your \`.env\` file.

## Source Maps

Source maps are configured to be uploaded during the build process if \`enableSourceMaps\` is true in the plugin configuration. This requires the \`SENTRY_AUTH_TOKEN\`, \`SENTRY_ORG\`, and \`SENTRY_PROJECT\` environment variables to be set.`;
  }
} 