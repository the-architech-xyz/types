import { ConfigSchema } from '../../../../types/plugins.js';

export interface SentryConfig {
  dsn: string;
  environment: string;
  release?: string;
  tracesSampleRate: number;
  replaysSessionSampleRate?: number;
  replaysOnErrorSampleRate?: number;
  enableSourceMaps: boolean;
  authToken?: string;
  org?: string;
  project?: string;
}

export const SentryConfigSchema: ConfigSchema = {
  type: 'object',
  properties: {
    dsn: {
      type: 'string',
      description: 'Your Sentry Data Source Name (DSN).',
      default: '',
    },
    environment: {
      type: 'string',
      description: 'The environment of your application (e.g., development, staging, production).',
      default: 'development',
    },
    release: {
      type: 'string',
      description: 'The release version of your application.',
    },
    tracesSampleRate: {
      type: 'number',
      description: 'The percentage of transactions to send to Sentry (0.0 to 1.0).',
      default: 1.0,
      minimum: 0,
      maximum: 1,
    },
    replaysSessionSampleRate: {
        type: 'number',
        description: 'The percentage of sessions to record for session replay (0.0 to 1.0).',
        default: 0.1,
        minimum: 0,
        maximum: 1,
    },
    replaysOnErrorSampleRate: {
        type: 'number',
        description: 'The percentage of sessions with errors to record for session replay (0.0 to 1.0).',
        default: 1.0,
        minimum: 0,
        maximum: 1,
    },
    enableSourceMaps: {
      type: 'boolean',
      description: 'Enable source map generation and uploading.',
      default: true,
    },
    authToken: {
      type: 'string',
      description: 'Your Sentry authentication token for uploading source maps.',
    },
    org: {
      type: 'string',
      description: 'Your Sentry organization slug.',
    },
    project: {
      type: 'string',
      description: 'Your Sentry project slug.',
    },
  },
  required: ['dsn', 'environment'],
  additionalProperties: false,
};

export const SentryDefaultConfig: SentryConfig = {
  dsn: '',
  environment: 'development',
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  enableSourceMaps: true,
}; 