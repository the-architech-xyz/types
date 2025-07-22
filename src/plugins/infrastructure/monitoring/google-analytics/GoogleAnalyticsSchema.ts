import { ConfigSchema } from '../../../../types/plugin.js';

export interface GoogleAnalyticsConfig {
  measurementId: string;
  enableEcommerce?: boolean;
  debugMode?: boolean;
}

export const GoogleAnalyticsConfigSchema: ConfigSchema = {
  type: 'object',
  properties: {
    measurementId: {
      type: 'string',
      description: 'Your Google Analytics 4 Measurement ID (e.g., G-XXXXXXXXXX).',
      default: '',
    },
    enableEcommerce: {
      type: 'boolean',
      description: 'Enable e-commerce tracking features.',
      default: false,
    },
    debugMode: {
      type: 'boolean',
      description: 'Enable debug mode to see events in the DebugView.',
      default: false,
    },
  },
  required: ['measurementId'],
  additionalProperties: false,
};

export const GoogleAnalyticsDefaultConfig: GoogleAnalyticsConfig = {
  measurementId: '',
  enableEcommerce: false,
  debugMode: false,
}; 