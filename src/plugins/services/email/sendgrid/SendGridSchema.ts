import { ConfigSchema } from '../../../../types/plugins.js';

export interface SendGridConfig {
  apiKey: string;
  fromEmail: string;
  fromName?: string;
  replyTo?: string;
  sandboxMode?: boolean;
}

export const SendGridConfigSchema: ConfigSchema = {
  type: 'object',
  properties: {
    apiKey: {
      type: 'string',
      description: 'Your SendGrid API key.',
      default: '',
    },
    fromEmail: {
      type: 'string',
      description: 'The default "from" email address for outgoing emails.',
      default: 'noreply@example.com',
    },
    fromName: {
      type: 'string',
      description: 'The default "from" name for outgoing emails.',
    },
    replyTo: {
      type: 'string',
      description: 'The default "reply-to" email address.',
    },
    sandboxMode: {
      type: 'boolean',
      description: 'Enable SendGrid sandbox mode for testing without sending emails.',
      default: false,
    },
  },
  required: ['apiKey', 'fromEmail'],
  additionalProperties: false,
};

export const SendGridDefaultConfig: SendGridConfig = {
  apiKey: '',
  fromEmail: 'noreply@example.com',
  fromName: 'The Architech',
  replyTo: 'noreply@example.com',
  sandboxMode: false,
}; 