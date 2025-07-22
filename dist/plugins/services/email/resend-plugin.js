/**
 * Resend Plugin - Pure Technology Implementation
 *
 * Provides Resend email API integration for modern email delivery.
 * Resend is a developer-first email API with excellent TypeScript support,
 * webhooks, and analytics. Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { PluginCategory, TargetPlatform } from '../../../types/plugin.js';
import { templateService } from '../../../core/templates/template-service.js';
import { CommandRunner } from '../../../core/cli/command-runner.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
export class ResendPlugin {
    templateService;
    runner;
    constructor() {
        this.templateService = templateService;
        this.runner = new CommandRunner();
    }
    // ============================================================================
    // PLUGIN METADATA
    // ============================================================================
    getMetadata() {
        return {
            id: 'resend',
            name: 'Resend',
            version: '1.0.0',
            description: 'Developer-first email API with excellent TypeScript support, webhooks, and analytics',
            author: 'The Architech Team',
            category: PluginCategory.EMAIL,
            tags: ['email', 'api', 'typescript', 'webhooks', 'analytics', 'resend', 'transactional'],
            license: 'MIT',
            repository: 'https://github.com/resendlabs/resend-node',
            homepage: 'https://resend.com',
            documentation: 'https://resend.com/docs'
        };
    }
    // ============================================================================
    // PLUGIN LIFECYCLE - Pure Technology Implementation
    // ============================================================================
    async install(context) {
        const startTime = Date.now();
        try {
            const { projectName, projectPath, pluginConfig } = context;
            context.logger.info('Installing Resend email service...');
            // Step 1: Install dependencies
            await this.installDependencies(context);
            // Step 2: Create email service configuration
            await this.createEmailConfiguration(context);
            // Step 3: Create email templates
            await this.createEmailTemplates(context);
            // Step 4: Create API routes for webhooks
            await this.createAPIRoutes(context);
            // Step 5: Generate unified interface files
            await this.generateUnifiedInterfaceFiles(context);
            // Step 6: Create email utilities
            await this.createEmailUtilities(context);
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: [
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'email', 'index.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'email', 'client.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'email', 'templates.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'email', 'types.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'email', 'config.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'app', 'api', 'email', 'webhook', 'route.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'emails', 'welcome.tsx')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'emails', 'verification.tsx')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'emails', 'reset-password.tsx')
                    }
                ],
                dependencies: [
                    {
                        name: 'resend',
                        version: '^3.1.0',
                        type: 'production',
                        category: PluginCategory.EMAIL
                    },
                    {
                        name: '@react-email/components',
                        version: '^0.0.15',
                        type: 'production',
                        category: PluginCategory.EMAIL
                    },
                    {
                        name: '@react-email/render',
                        version: '^0.0.12',
                        type: 'production',
                        category: PluginCategory.EMAIL
                    }
                ],
                scripts: [],
                configs: [],
                errors: [],
                warnings: [],
                duration
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to install Resend', startTime, [], error);
        }
    }
    async uninstall(context) {
        const startTime = Date.now();
        try {
            const { projectPath } = context;
            context.logger.info('Uninstalling Resend...');
            // Remove email files
            const filesToRemove = [
                path.join(projectPath, 'src', 'lib', 'email'),
                path.join(projectPath, 'src', 'app', 'api', 'email'),
                path.join(projectPath, 'src', 'emails')
            ];
            for (const filePath of filesToRemove) {
                if (await fsExtra.pathExists(filePath)) {
                    await fsExtra.remove(filePath);
                }
            }
            // Remove dependencies
            await this.runner.install(['resend', '@react-email/components', '@react-email/render'], false, projectPath);
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [],
                warnings: [],
                duration
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to uninstall Resend', startTime, [], error);
        }
    }
    async update(context) {
        const startTime = Date.now();
        try {
            const { projectPath } = context;
            context.logger.info('Updating Resend...');
            // Update dependencies
            await this.runner.install(['resend', '@react-email/components', '@react-email/render'], false, projectPath);
            // Regenerate configuration files
            await this.createEmailConfiguration(context);
            await this.generateUnifiedInterfaceFiles(context);
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [],
                warnings: [],
                duration
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to update Resend', startTime, [], error);
        }
    }
    async validate(context) {
        const errors = [];
        const warnings = [];
        try {
            const { projectPath, pluginConfig } = context;
            // Check if Resend configuration exists
            const resendConfigPath = path.join(projectPath, 'src', 'lib', 'email', 'client.ts');
            if (!await fsExtra.pathExists(resendConfigPath)) {
                errors.push({
                    field: 'resend-config',
                    message: 'Resend client configuration not found',
                    code: 'MISSING_CONFIG',
                    severity: 'error'
                });
            }
            // Check if environment variables are configured
            const envPath = path.join(projectPath, '.env.local');
            if (await fsExtra.pathExists(envPath)) {
                const envContent = await fsExtra.readFile(envPath, 'utf-8');
                const requiredVars = ['RESEND_API_KEY', 'EMAIL_FROM'];
                for (const varName of requiredVars) {
                    if (!envContent.includes(varName)) {
                        warnings.push(`Environment variable ${varName} not found in .env.local`);
                    }
                }
            }
            else {
                warnings.push('.env.local file not found - Resend environment variables need to be configured');
            }
            // Check if dependencies are installed
            const packageJsonPath = path.join(projectPath, 'package.json');
            if (await fsExtra.pathExists(packageJsonPath)) {
                const packageJson = await fsExtra.readJson(packageJsonPath);
                const requiredDeps = ['resend'];
                for (const dep of requiredDeps) {
                    if (!packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]) {
                        errors.push({
                            field: 'dependencies',
                            message: `Required dependency ${dep} not found in package.json`,
                            code: 'MISSING_DEPENDENCY',
                            severity: 'error'
                        });
                    }
                }
            }
            // Check Node.js version compatibility
            const nodeVersion = process.version;
            const majorVersion = parseInt(nodeVersion?.slice(1).split('.')[0] || '0');
            if (majorVersion < 16) {
                errors.push({
                    field: 'node-version',
                    message: 'Node.js version 16 or higher is required for Resend',
                    code: 'INCOMPATIBLE_NODE_VERSION',
                    severity: 'error'
                });
            }
        }
        catch (error) {
            errors.push({
                field: 'validation',
                message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                code: 'VALIDATION_ERROR',
                severity: 'error'
            });
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    // ============================================================================
    // PLUGIN COMPATIBILITY & DEPENDENCIES
    // ============================================================================
    getCompatibility() {
        return {
            frameworks: ['nextjs', 'react', 'node'],
            platforms: [TargetPlatform.WEB, TargetPlatform.SERVER],
            nodeVersions: ['>=16.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm'],
            conflicts: ['sendgrid', 'mailgun', 'nodemailer']
        };
    }
    getDependencies() {
        return [
            'resend@^3.0.0',
            '@react-email/components@^0.0.15',
            '@react-email/render@^0.0.12',
            '@react-email/html@^0.0.12',
            '@react-email/head@^0.0.12',
            '@react-email/body@^0.0.12',
            '@react-email/container@^0.0.12',
            '@react-email/text@^0.0.12',
            '@react-email/button@^0.0.12',
            '@react-email/link@^0.0.12',
            '@react-email/img@^0.0.12',
            '@react-email/section@^0.0.12',
            '@react-email/row@^0.0.12',
            '@react-email/column@^0.0.12',
            '@react-email/preview@^0.0.12'
        ];
    }
    getConflicts() {
        return [
            'sendgrid',
            'mailgun',
            'nodemailer',
            'aws-ses'
        ];
    }
    getRequirements() {
        return [
            {
                type: 'service',
                name: 'Resend Account',
                description: 'A Resend account with API key',
                version: 'latest'
            },
            {
                type: 'config',
                name: 'Environment Variables',
                description: 'RESEND_API_KEY and EMAIL_FROM must be configured',
                version: 'latest'
            },
            {
                type: 'package',
                name: 'resend',
                description: 'Resend Node.js SDK',
                version: '^3.0.0'
            },
            {
                type: 'package',
                name: '@react-email/components',
                description: 'React Email components for templates',
                version: '^0.0.15'
            }
        ];
    }
    // ============================================================================
    // CONFIGURATION
    // ============================================================================
    getDefaultConfig() {
        return {
            fromEmail: 'noreply@example.com',
            fromName: 'Your App',
            sandboxMode: true,
            templates: {
                welcome: true,
                verification: true,
                resetPassword: true,
                notification: true,
                marketing: false
            },
            features: {
                analytics: true,
                webhooks: true,
                templates: true,
                validation: true
            }
        };
    }
    getConfigSchema() {
        return {
            type: 'object',
            properties: {
                fromEmail: {
                    type: 'string',
                    description: 'Default sender email address',
                    default: 'noreply@example.com'
                },
                fromName: {
                    type: 'string',
                    description: 'Default sender name',
                    default: 'Your App'
                },
                replyTo: {
                    type: 'string',
                    description: 'Reply-to email address'
                },
                webhookUrl: {
                    type: 'string',
                    description: 'Webhook URL for email events'
                },
                sandboxMode: {
                    type: 'boolean',
                    description: 'Enable sandbox mode for testing',
                    default: true
                },
                templates: {
                    type: 'object',
                    properties: {
                        welcome: {
                            type: 'boolean',
                            description: 'Enable welcome email template',
                            default: true
                        },
                        verification: {
                            type: 'boolean',
                            description: 'Enable email verification template',
                            default: true
                        },
                        resetPassword: {
                            type: 'boolean',
                            description: 'Enable password reset template',
                            default: true
                        },
                        notification: {
                            type: 'boolean',
                            description: 'Enable notification template',
                            default: true
                        },
                        marketing: {
                            type: 'boolean',
                            description: 'Enable marketing template',
                            default: false
                        }
                    },
                    description: 'Email templates to enable'
                },
                features: {
                    type: 'object',
                    properties: {
                        analytics: {
                            type: 'boolean',
                            description: 'Enable email analytics',
                            default: true
                        },
                        webhooks: {
                            type: 'boolean',
                            description: 'Enable webhook support',
                            default: true
                        },
                        templates: {
                            type: 'boolean',
                            description: 'Enable email templates',
                            default: true
                        },
                        validation: {
                            type: 'boolean',
                            description: 'Enable email validation',
                            default: true
                        }
                    },
                    description: 'Email features to enable'
                }
            },
            required: ['fromEmail']
        };
    }
    // ============================================================================
    // PRIVATE IMPLEMENTATION METHODS
    // ============================================================================
    async installDependencies(context) {
        const { projectPath } = context;
        context.logger.info('Installing Resend dependencies...');
        const dependencies = [
            'resend@^3.0.0',
            '@react-email/components@^0.0.15',
            '@react-email/render@^0.0.12',
            '@react-email/html@^0.0.12',
            '@react-email/head@^0.0.12',
            '@react-email/body@^0.0.12',
            '@react-email/container@^0.0.12',
            '@react-email/text@^0.0.12',
            '@react-email/button@^0.0.12',
            '@react-email/link@^0.0.12',
            '@react-email/img@^0.0.12',
            '@react-email/section@^0.0.12',
            '@react-email/row@^0.0.12',
            '@react-email/column@^0.0.12',
            '@react-email/preview@^0.0.12'
        ];
        await this.runner.install(dependencies, false, projectPath);
    }
    async createEmailConfiguration(context) {
        const { projectPath, pluginConfig } = context;
        context.logger.info('Creating Resend email configuration...');
        const emailDir = path.join(projectPath, 'src', 'lib', 'email');
        await fsExtra.ensureDir(emailDir);
        // Create email client
        const clientContent = this.generateEmailClient();
        await fsExtra.writeFile(path.join(emailDir, 'client.ts'), clientContent);
        // Create email config
        const configContent = this.generateEmailConfig(pluginConfig);
        await fsExtra.writeFile(path.join(emailDir, 'config.ts'), configContent);
        // Create email types
        const typesContent = this.generateEmailTypes();
        await fsExtra.writeFile(path.join(emailDir, 'types.ts'), typesContent);
    }
    async createEmailTemplates(context) {
        const { projectPath, pluginConfig } = context;
        context.logger.info('Creating Resend email templates...');
        const emailsDir = path.join(projectPath, 'src', 'emails');
        await fsExtra.ensureDir(emailsDir);
        // Create welcome email template
        const welcomeContent = this.generateWelcomeTemplate();
        await fsExtra.writeFile(path.join(emailsDir, 'welcome.tsx'), welcomeContent);
        // Create verification email template
        const verificationContent = this.generateVerificationTemplate();
        await fsExtra.writeFile(path.join(emailsDir, 'verification.tsx'), verificationContent);
        // Create reset password template
        const resetPasswordContent = this.generateResetPasswordTemplate();
        await fsExtra.writeFile(path.join(emailsDir, 'reset-password.tsx'), resetPasswordContent);
        // Create email templates utility
        const templatesContent = this.generateEmailTemplates();
        await fsExtra.writeFile(path.join(projectPath, 'src', 'lib', 'email', 'templates.ts'), templatesContent);
    }
    async createAPIRoutes(context) {
        const { projectPath } = context;
        context.logger.info('Creating Resend API routes...');
        const apiDir = path.join(projectPath, 'src', 'app', 'api', 'email', 'webhook');
        await fsExtra.ensureDir(apiDir);
        // Create webhook route
        const webhookContent = this.generateWebhookRoute();
        await fsExtra.writeFile(path.join(apiDir, 'route.ts'), webhookContent);
    }
    async createEmailUtilities(context) {
        const { projectPath } = context;
        context.logger.info('Creating Resend email utilities...');
        const emailDir = path.join(projectPath, 'src', 'lib', 'email');
        await fsExtra.ensureDir(emailDir);
        // Create email service
        const serviceContent = this.generateEmailService();
        await fsExtra.writeFile(path.join(emailDir, 'service.ts'), serviceContent);
    }
    async generateUnifiedInterfaceFiles(context) {
        const { projectPath } = context;
        context.logger.info('Generating unified interface files...');
        const emailDir = path.join(projectPath, 'src', 'lib', 'email');
        await fsExtra.ensureDir(emailDir);
        // Create unified index
        const indexContent = this.generateUnifiedIndex();
        await fsExtra.writeFile(path.join(emailDir, 'index.ts'), indexContent);
    }
    // ============================================================================
    // TEMPLATE GENERATION METHODS
    // ============================================================================
    generateEmailClient() {
        return `import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

if (!process.env.RESEND_API_KEY) {
  throw new Error('Missing RESEND_API_KEY environment variable');
}

export default resend;
`;
    }
    generateEmailConfig(config) {
        return `/**
 * Email Configuration
 * Generated by The Architech Resend Plugin
 */

export interface EmailConfig {
  fromEmail: string;
  fromName?: string;
  replyTo?: string;
  webhookUrl?: string;
  sandboxMode: boolean;
  templates: {
    welcome: boolean;
    verification: boolean;
    resetPassword: boolean;
    notification: boolean;
    marketing: boolean;
  };
  features: {
    analytics: boolean;
    webhooks: boolean;
    templates: boolean;
    validation: boolean;
  };
}

export const emailConfig: EmailConfig = {
  fromEmail: process.env.EMAIL_FROM || '${config.fromEmail || 'noreply@example.com'}',
  fromName: process.env.EMAIL_FROM_NAME || '${config.fromName || 'Your App'}',
  replyTo: process.env.EMAIL_REPLY_TO || '${config.replyTo || ''}',
  webhookUrl: process.env.EMAIL_WEBHOOK_URL || '${config.webhookUrl || ''}',
  sandboxMode: process.env.NODE_ENV === 'development' || ${config.sandboxMode || true},
  templates: {
    welcome: ${config.templates?.welcome || true},
    verification: ${config.templates?.verification || true},
    resetPassword: ${config.templates?.resetPassword || true},
    notification: ${config.templates?.notification || true},
    marketing: ${config.templates?.marketing || false}
  },
  features: {
    analytics: ${config.features?.analytics || true},
    webhooks: ${config.features?.webhooks || true},
    templates: ${config.features?.templates || true},
    validation: ${config.features?.validation || true}
  }
};

export default emailConfig;
`;
    }
    generateEmailTypes() {
        return `import { Resend } from 'resend';

// Email types
export interface EmailData {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: EmailAttachment[];
  headers?: Record<string, string>;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  text?: string;
  variables: string[];
}

export interface EmailSendResult {
  id: string;
  from: string;
  to: string[];
  subject: string;
  createdAt: Date;
  status: 'sent' | 'delivered' | 'failed';
}

export interface EmailValidationResult {
  isValid: boolean;
  suggestions?: string[];
  reason?: string;
}

export interface EmailStats {
  sent: number;
  delivered: number;
  failed: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
}

export interface EmailEvent {
  id: string;
  type: 'email.sent' | 'email.delivered' | 'email.opened' | 'email.clicked' | 'email.bounced' | 'email.unsubscribed';
  data: {
    email: string;
    subject: string;
    timestamp: Date;
    [key: string]: any;
  };
}

// Template types
export interface WelcomeEmailData {
  name: string;
  email: string;
  verificationUrl?: string;
}

export interface VerificationEmailData {
  name: string;
  email: string;
  verificationUrl: string;
  expiresAt: Date;
}

export interface ResetPasswordEmailData {
  name: string;
  email: string;
  resetUrl: string;
  expiresAt: Date;
}

export interface NotificationEmailData {
  name: string;
  email: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}
`;
    }
    generateWelcomeTemplate() {
        return `import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  name: string;
  email: string;
  verificationUrl?: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  name,
  email,
  verificationUrl,
}) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Your App!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to Your App!</Heading>
          
          <Text style={text}>Hi {name},</Text>
          
          <Text style={text}>
            Welcome to Your App! We're excited to have you on board.
          </Text>
          
          {verificationUrl && (
            <>
              <Text style={text}>
                To get started, please verify your email address by clicking the button below:
              </Text>
              
              <Link href={verificationUrl} style={button}>
                Verify Email Address
              </Link>
            </>
          )}
          
          <Text style={text}>
            If you have any questions, feel free to reach out to our support team.
          </Text>
          
          <Text style={footer}>
            Best regards,<br />
            The Your App Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
};

const text = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '26px',
};

const button = {
  backgroundColor: '#000',
  borderRadius: '3px',
  color: '#fff',
  fontSize: '14px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px',
  margin: '20px 0',
};

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '22px',
  marginTop: '12px',
  marginBottom: '24px',
};
`;
    }
    generateVerificationTemplate() {
        return `import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface VerificationEmailProps {
  name: string;
  email: string;
  verificationUrl: string;
  expiresAt: Date;
}

export const VerificationEmail: React.FC<VerificationEmailProps> = ({
  name,
  email,
  verificationUrl,
  expiresAt,
}) => {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Verify your email address</Heading>
          
          <Text style={text}>Hi {name},</Text>
          
          <Text style={text}>
            Please verify your email address by clicking the button below:
          </Text>
          
          <Link href={verificationUrl} style={button}>
            Verify Email Address
          </Link>
          
          <Text style={text}>
            This link will expire on {expiresAt.toLocaleDateString()} at {expiresAt.toLocaleTimeString()}.
          </Text>
          
          <Text style={text}>
            If you didn't create an account, you can safely ignore this email.
          </Text>
          
          <Text style={footer}>
            Best regards,<br />
            The Your App Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default VerificationEmail;

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
};

const text = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '26px',
};

const button = {
  backgroundColor: '#000',
  borderRadius: '3px',
  color: '#fff',
  fontSize: '14px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px',
  margin: '20px 0',
};

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '22px',
  marginTop: '12px',
  marginBottom: '24px',
};
`;
    }
    generateResetPasswordTemplate() {
        return `import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface ResetPasswordEmailProps {
  name: string;
  email: string;
  resetUrl: string;
  expiresAt: Date;
}

export const ResetPasswordEmail: React.FC<ResetPasswordEmailProps> = ({
  name,
  email,
  resetUrl,
  expiresAt,
}) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Reset your password</Heading>
          
          <Text style={text}>Hi {name},</Text>
          
          <Text style={text}>
            You requested to reset your password. Click the button below to create a new password:
          </Text>
          
          <Link href={resetUrl} style={button}>
            Reset Password
          </Link>
          
          <Text style={text}>
            This link will expire on {expiresAt.toLocaleDateString()} at {expiresAt.toLocaleTimeString()}.
          </Text>
          
          <Text style={text}>
            If you didn't request a password reset, you can safely ignore this email.
          </Text>
          
          <Text style={footer}>
            Best regards,<br />
            The Your App Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default ResetPasswordEmail;

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
};

const text = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '26px',
};

const button = {
  backgroundColor: '#000',
  borderRadius: '3px',
  color: '#fff',
  fontSize: '14px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px',
  margin: '20px 0',
};

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '22px',
  marginTop: '12px',
  marginBottom: '24px',
};
`;
    }
    generateEmailTemplates() {
        return `import { render } from '@react-email/render';
import WelcomeEmail from '../../emails/welcome';
import VerificationEmail from '../../emails/verification';
import ResetPasswordEmail from '../../emails/reset-password';
import type {
  WelcomeEmailData,
  VerificationEmailData,
  ResetPasswordEmailData,
} from './types';

export class EmailTemplates {
  static async renderWelcome(data: WelcomeEmailData): Promise<string> {
    const email = WelcomeEmail(data);
    return render(email);
  }

  static async renderVerification(data: VerificationEmailData): Promise<string> {
    const email = VerificationEmail(data);
    return render(email);
  }

  static async renderResetPassword(data: ResetPasswordEmailData): Promise<string> {
    const email = ResetPasswordEmail(data);
    return render(email);
  }

  static async renderNotification(data: any): Promise<string> {
    // Simple notification template
    return \`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Notification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>\${data.title}</h2>
            <p>\${data.message}</p>
            \${data.actionUrl ? \`<a href="\${data.actionUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">\${data.actionText || 'Learn More'}</a>\` : ''}
          </div>
        </body>
      </html>
    \`;
  }
}

export default EmailTemplates;
`;
    }
    generateWebhookRoute() {
        return `import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headersList = await headers();
    
    // Verify webhook signature (implement based on your needs)
    // const signature = headersList.get('resend-signature');
    // if (!verifySignature(body, signature)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    // Handle different webhook events
    switch (body.type) {
      case 'email.sent':
        console.log('Email sent:', body.data);
        break;
      case 'email.delivered':
        console.log('Email delivered:', body.data);
        break;
      case 'email.opened':
        console.log('Email opened:', body.data);
        break;
      case 'email.clicked':
        console.log('Email clicked:', body.data);
        break;
      case 'email.bounced':
        console.log('Email bounced:', body.data);
        break;
      case 'email.unsubscribed':
        console.log('Email unsubscribed:', body.data);
        break;
      default:
        console.log('Unknown webhook event:', body);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
`;
    }
    generateEmailService() {
        return `import resend from './client';
import { EmailTemplates } from './templates';
import emailConfig from './config';
import type {
  EmailData,
  EmailSendResult,
  EmailValidationResult,
  WelcomeEmailData,
  VerificationEmailData,
  ResetPasswordEmailData,
} from './types';

export class EmailService {
  // Send a simple email
  static async sendEmail(data: EmailData): Promise<EmailSendResult> {
    try {
      const result = await resend.emails.send({
        from: data.from || emailConfig.fromEmail,
        to: data.to,
        subject: data.subject,
        html: data.html,
        text: data.text,
        reply_to: data.replyTo || emailConfig.replyTo,
        cc: data.cc,
        bcc: data.bcc,
        attachments: data.attachments,
        headers: data.headers,
      });

      return {
        id: result.data?.id || '',
        from: data.from || emailConfig.fromEmail,
        to: Array.isArray(data.to) ? data.to : [data.to],
        subject: data.subject,
        createdAt: new Date(),
        status: 'sent',
      };
    } catch (error) {
      throw new Error(\`Failed to send email: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  // Send welcome email
  static async sendWelcomeEmail(data: WelcomeEmailData): Promise<EmailSendResult> {
    const html = await EmailTemplates.renderWelcome(data);
    
    return this.sendEmail({
      to: data.email,
      subject: 'Welcome to Your App!',
      html,
    });
  }

  // Send verification email
  static async sendVerificationEmail(data: VerificationEmailData): Promise<EmailSendResult> {
    const html = await EmailTemplates.renderVerification(data);
    
    return this.sendEmail({
      to: data.email,
      subject: 'Verify your email address',
      html,
    });
  }

  // Send reset password email
  static async sendResetPasswordEmail(data: ResetPasswordEmailData): Promise<EmailSendResult> {
    const html = await EmailTemplates.renderResetPassword(data);
    
    return this.sendEmail({
      to: data.email,
      subject: 'Reset your password',
      html,
    });
  }

  // Send notification email
  static async sendNotificationEmail(data: any): Promise<EmailSendResult> {
    const html = await EmailTemplates.renderNotification(data);
    
    return this.sendEmail({
      to: data.email,
      subject: data.title,
      html,
    });
  }

  // Validate email address
  static async validateEmail(email: string): Promise<EmailValidationResult> {
    // Basic email validation
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    const isValid = emailRegex.test(email);
    
    return {
      isValid,
      suggestions: isValid ? undefined : ['Please enter a valid email address'],
      reason: isValid ? undefined : 'Invalid email format',
    };
  }

  // Get email statistics (placeholder - implement based on your needs)
  static async getEmailStats(): Promise<any> {
    // This would typically call Resend's API to get statistics
    // For now, return placeholder data
    return {
      sent: 0,
      delivered: 0,
      failed: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      unsubscribed: 0,
    };
  }
}

export default EmailService;
`;
    }
    generateUnifiedIndex() {
        return `/**
 * Resend Email Unified Interface
 * 
 * This file provides a unified interface for all Resend email functionality
 * including sending emails, templates, validation, and analytics.
 */

// Core exports
export { default as resend } from './client';
export { default as EmailService } from './service';
export { EmailTemplates } from './templates';
export { default as emailConfig } from './config';

// Type exports
export type {
  EmailData,
  EmailAttachment,
  EmailTemplate,
  EmailSendResult,
  EmailValidationResult,
  EmailStats,
  EmailEvent,
  WelcomeEmailData,
  VerificationEmailData,
  ResetPasswordEmailData,
  NotificationEmailData,
} from './types';

// Utility functions
export const sendEmail = EmailService.sendEmail;
export const sendWelcomeEmail = EmailService.sendWelcomeEmail;
export const sendVerificationEmail = EmailService.sendVerificationEmail;
export const sendResetPasswordEmail = EmailService.sendResetPasswordEmail;
export const sendNotificationEmail = EmailService.sendNotificationEmail;
export const validateEmail = EmailService.validateEmail;
export const getEmailStats = EmailService.getEmailStats;

// Re-export commonly used functions for convenience
export const email = EmailService;

// Default export for easy importing
export default {
  resend,
  email: EmailService,
  templates: EmailTemplates,
  config: emailConfig,
  sendEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendNotificationEmail,
  validateEmail,
  getEmailStats,
};
`;
    }
    createErrorResult(message, startTime, errors = [], originalError) {
        const duration = Date.now() - startTime;
        return {
            success: false,
            artifacts: [],
            dependencies: [],
            scripts: [],
            configs: [],
            errors: [
                ...errors,
                ...(originalError ? [{
                        code: 'PLUGIN_ERROR',
                        message: originalError instanceof Error ? originalError.message : String(originalError),
                        details: originalError,
                        severity: 'error'
                    }] : [])
            ],
            warnings: [],
            duration
        };
    }
}
//# sourceMappingURL=resend-plugin.js.map