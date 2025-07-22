import { SendGridConfig } from './SendGridSchema.js';

export class SendGridGenerator {
  static generateEmailClient(config: SendGridConfig): string {
    return `import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn('SENDGRID_API_KEY environment variable not set. Email functionality will be disabled.');
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export default sgMail;
`;
  }

  static generateEmailConfig(config: SendGridConfig): string {
    return `
export const emailConfig = {
  fromEmail: process.env.EMAIL_FROM || '${config.fromEmail}',
  fromName: process.env.EMAIL_FROM_NAME || '${config.fromName || ''}',
  replyTo: process.env.EMAIL_REPLY_TO || '${config.replyTo || ''}',
  sandboxMode: process.env.NODE_ENV === 'development' || ${config.sandboxMode},
};

export default emailConfig;
`;
  }

  static generateEmailTypes(): string {
    return `
export interface EmailData {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: { name?: string; email: string };
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: {
    content: string;
    filename: string;
    type?: string;
    disposition?: string;
    content_id?: string;
  }[];
}

export interface EmailSendResult {
  messageId: string;
}
`;
  }

  static generateEmailService(config: SendGridConfig): string {
    return `import sgMail from './client';
import { emailConfig } from './config';
import { EmailData, EmailSendResult } from './types';

export class EmailService {
  static async send(data: EmailData): Promise<EmailSendResult> {
    const msg = {
      ...data,
      from: data.from || {
        name: emailConfig.fromName,
        email: emailConfig.fromEmail,
      },
      replyTo: data.replyTo || emailConfig.replyTo,
      mailSettings: {
        sandboxMode: {
          enable: emailConfig.sandboxMode,
        },
      },
    };

    try {
      const response = await sgMail.send(msg);
      return {
        messageId: response[0].headers['x-message-id'],
      };
    } catch (error) {
      console.error('Error sending email:', error);
      if (error.response) {
        console.error(error.response.body);
      }
      throw new Error('Failed to send email via SendGrid.');
    }
  }
}

export default EmailService;
`;
  }

  static generateEnvConfig(config: SendGridConfig): string {
    return `
# SendGrid Configuration
SENDGRID_API_KEY="${config.apiKey}"
EMAIL_FROM="${config.fromEmail}"
${config.fromName ? `EMAIL_FROM_NAME="${config.fromName}"` : ''}
${config.replyTo ? `EMAIL_REPLY_TO="${config.replyTo}"` : ''}
`;
  }

  static generatePackageJson(config: SendGridConfig): string {
    return JSON.stringify({
      dependencies: {
        '@sendgrid/mail': '^8.1.0',
      }
    }, null, 2);
  }

  static generateReadme(): string {
    return `# SendGrid Email Service

This project is configured to use SendGrid for sending transactional emails.

## Configuration

The following environment variables are used to configure the SendGrid client:

- \`SENDGRID_API_KEY\`: Your SendGrid API Key.
- \`EMAIL_FROM\`: The default email address to send emails from.
- \`EMAIL_FROM_NAME\`: (Optional) The default name to send emails from.
- \`EMAIL_REPLY_TO\`: (Optional) The default reply-to email address.

These can be set in your \`.env\` file.

## Usage

To send an email, you can use the \`EmailService\`:

\`\`\`typescript
import EmailService from '@/lib/email/service';

await EmailService.send({
  to: 'test@example.com',
  subject: 'Hello from The Architech!',
  text: 'This is a test email.',
  html: '<strong>This is a test email.</strong>',
});
\`\`\`

The \`EmailService.send\` method takes an \`EmailData\` object which corresponds to the options available in the SendGrid API.
`;
  }
} 