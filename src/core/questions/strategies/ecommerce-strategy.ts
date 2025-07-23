/**
 * E-commerce Question Strategy
 * 
 * Provides intelligent questions and recommendations specifically for e-commerce projects.
 */

import { BaseQuestionStrategy } from '../question-strategy.js';
import { ProjectContext, Question, Recommendation } from '../../../types/questions.js';

export class EcommerceStrategy extends BaseQuestionStrategy {
  name = 'E-commerce Strategy';
  projectType = 'ecommerce' as const;

  protected getProjectQuestions(context: ProjectContext): Question[] {
    return [
      {
        id: 'projectName',
        type: 'input',
        message: 'What\'s your project name?',
        description: 'This will be used for your project directory and package name',
        default: 'my-ecommerce-store',
        order: 1
      },
      {
        id: 'businessType',
        type: 'select',
        message: 'What type of e-commerce business are you building?',
        description: 'This helps us recommend the right features',
        choices: [
          { name: 'Retail Store', value: 'retail', recommended: true },
          { name: 'Digital Products', value: 'digital' },
          { name: 'Subscription Service', value: 'subscription' },
          { name: 'Marketplace', value: 'marketplace' },
          { name: 'Dropshipping', value: 'dropshipping' }
        ],
        default: 'retail',
        order: 2
      },
      {
        id: 'targetAudience',
        type: 'select',
        message: 'Who is your target audience?',
        description: 'This influences UI and feature recommendations',
        choices: [
          { name: 'B2C (Business to Consumer)', value: 'b2c', recommended: true },
          { name: 'B2B (Business to Business)', value: 'b2b' },
          { name: 'Both B2C and B2B', value: 'both' }
        ],
        default: 'b2c',
        order: 3
      },
      {
        id: 'paymentMethods',
        type: 'multiselect',
        message: 'Which payment methods do you want to support?',
        description: 'Select all that apply',
        choices: [
          { name: 'Credit/Debit Cards', value: 'cards', recommended: true },
          { name: 'PayPal', value: 'paypal' },
          { name: 'Apple Pay', value: 'apple-pay' },
          { name: 'Google Pay', value: 'google-pay' },
          { name: 'Bank Transfer', value: 'bank-transfer' },
          { name: 'Cryptocurrency', value: 'crypto' }
        ],
        default: ['cards'],
        order: 4
      },
      {
        id: 'inventoryManagement',
        type: 'confirm',
        message: 'Do you need inventory management?',
        description: 'Track stock levels, low stock alerts, etc.',
        default: true,
        order: 5
      },
      {
        id: 'orderManagement',
        type: 'confirm',
        message: 'Do you need order management features?',
        description: 'Order tracking, status updates, customer notifications',
        default: true,
        order: 6
      },
      {
        id: 'customerAccounts',
        type: 'confirm',
        message: 'Do you want customer accounts?',
        description: 'User registration, order history, saved addresses',
        default: true,
        order: 7
      },
      {
        id: 'analytics',
        type: 'confirm',
        message: 'Do you need analytics and reporting?',
        description: 'Sales reports, customer insights, performance metrics',
        default: true,
        order: 8
      }
    ];
  }

  protected getFeatureQuestions(context: ProjectContext): Question[] {
    const questions: Question[] = [];

    // Add payment-specific questions if payments are selected
    if (context.features.includes('payments')) {
      questions.push(
        {
          id: 'stripeConfig',
          type: 'input',
          message: 'Enter your Stripe publishable key (optional for now)',
          description: 'You can add this later in your environment variables',
          default: '',
          order: 10,
          when: (answers) => answers.paymentMethods?.includes('cards')
        },
        {
          id: 'paypalConfig',
          type: 'input',
          message: 'Enter your PayPal client ID (optional for now)',
          description: 'You can add this later in your environment variables',
          default: '',
          order: 11,
          when: (answers) => answers.paymentMethods?.includes('paypal')
        }
      );
    }

    // Add email-specific questions if email is selected
    if (context.features.includes('email')) {
      questions.push(
        {
          id: 'emailNotifications',
          type: 'multiselect',
          message: 'Which email notifications do you want?',
          description: 'Select all that apply',
          choices: [
            { name: 'Order Confirmations', value: 'order-confirmation', recommended: true },
            { name: 'Shipping Updates', value: 'shipping-updates', recommended: true },
            { name: 'Password Reset', value: 'password-reset', recommended: true },
            { name: 'Welcome Emails', value: 'welcome-email' },
            { name: 'Abandoned Cart', value: 'abandoned-cart' },
            { name: 'Newsletter', value: 'newsletter' }
          ],
          default: ['order-confirmation', 'shipping-updates', 'password-reset'],
          order: 12
        }
      );
    }

    return questions;
  }

  protected getDatabaseRecommendation(context: ProjectContext): Recommendation {
    return {
      category: 'database',
      plugin: 'drizzle',
      provider: 'neon',
      reason: 'PostgreSQL is ideal for e-commerce transactions and data integrity',
      confidence: 0.95,
      alternatives: ['prisma', 'supabase']
    };
  }

  protected getAuthRecommendation(context: ProjectContext): Recommendation {
    return {
      category: 'auth',
      plugin: 'better-auth',
      reason: 'Excellent for user accounts and order management',
      confidence: 0.95,
      alternatives: ['nextauth', 'clerk']
    };
  }

  protected getUIRecommendation(context: ProjectContext): Recommendation {
    return {
      category: 'ui',
      plugin: 'shadcn-ui',
      reason: 'Professional components perfect for e-commerce',
      confidence: 0.95,
      alternatives: ['chakra-ui', 'mui']
    };
  }

  protected getPaymentRecommendation(context: ProjectContext): Recommendation {
    return {
      category: 'payment',
      plugin: 'stripe',
      reason: 'Most popular payment processor with excellent documentation',
      confidence: 0.95,
      alternatives: ['paypal', 'square']
    };
  }

  protected getEmailRecommendation(context: ProjectContext): Recommendation {
    return {
      category: 'email',
      plugin: 'resend',
      reason: 'Developer-friendly email API with great deliverability',
      confidence: 0.9,
      alternatives: ['sendgrid', 'mailgun']
    };
  }
} 