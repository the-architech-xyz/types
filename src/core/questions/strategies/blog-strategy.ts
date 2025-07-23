/**
 * Blog Question Strategy
 * 
 * Provides intelligent questions and recommendations specifically for blog projects.
 */

import { BaseQuestionStrategy } from '../question-strategy.js';
import { ProjectContext, Question, Recommendation } from '../../../types/questions.js';

export class BlogStrategy extends BaseQuestionStrategy {
  name = 'Blog Strategy';
  projectType = 'blog' as const;

  protected getProjectQuestions(context: ProjectContext): Question[] {
    return [
      {
        id: 'projectName',
        type: 'input',
        message: 'What\'s your blog name?',
        description: 'This will be used for your project directory and site title',
        default: 'my-blog',
        order: 1
      },
      {
        id: 'blogType',
        type: 'select',
        message: 'What type of blog are you building?',
        description: 'This helps us recommend the right features',
        choices: [
          { name: 'Personal Blog', value: 'personal', recommended: true },
          { name: 'Company Blog', value: 'company' },
          { name: 'News/Magazine', value: 'news' },
          { name: 'Technical Blog', value: 'technical' },
          { name: 'Portfolio Blog', value: 'portfolio' }
        ],
        default: 'personal',
        order: 2
      },
      {
        id: 'contentManagement',
        type: 'select',
        message: 'How do you want to manage content?',
        description: 'Choose your content management approach',
        choices: [
          { name: 'Markdown Files (Git-based)', value: 'markdown', recommended: true },
          { name: 'CMS (Content Management System)', value: 'cms' },
          { name: 'Headless CMS', value: 'headless-cms' },
          { name: 'Database-driven', value: 'database' }
        ],
        default: 'markdown',
        order: 3
      },
      {
        id: 'commentSystem',
        type: 'confirm',
        message: 'Do you want a comment system?',
        description: 'Allow readers to comment on your posts',
        default: true,
        order: 4
      },
      {
        id: 'newsletter',
        type: 'confirm',
        message: 'Do you want a newsletter subscription?',
        description: 'Collect email subscribers for updates',
        default: false,
        order: 5
      },
      {
        id: 'socialSharing',
        type: 'confirm',
        message: 'Do you want social media sharing?',
        description: 'Add share buttons for social platforms',
        default: true,
        order: 6
      },
      {
        id: 'seo',
        type: 'confirm',
        message: 'Do you need SEO optimization?',
        description: 'Meta tags, sitemap, structured data',
        default: true,
        order: 7
      },
      {
        id: 'analytics',
        type: 'confirm',
        message: 'Do you need analytics?',
        description: 'Track page views, visitors, and engagement',
        default: true,
        order: 8
      }
    ];
  }

  protected getFeatureQuestions(context: ProjectContext): Question[] {
    const questions: Question[] = [];

    // Add comment system questions if enabled
    if (context.features.includes('comments')) {
      questions.push(
        {
          id: 'commentProvider',
          type: 'select',
          message: 'Which comment system do you prefer?',
          description: 'Choose your comment solution',
          choices: [
            { name: 'Disqus (Popular, easy setup)', value: 'disqus', recommended: true },
            { name: 'Giscus (GitHub Discussions)', value: 'giscus' },
            { name: 'Utterances (GitHub Issues)', value: 'utterances' },
            { name: 'Custom built', value: 'custom' }
          ],
          default: 'disqus',
          order: 10
        }
      );
    }

    // Add newsletter questions if enabled
    if (context.features.includes('newsletter')) {
      questions.push(
        {
          id: 'newsletterProvider',
          type: 'select',
          message: 'Which newsletter service do you prefer?',
          description: 'Choose your email marketing platform',
          choices: [
            { name: 'ConvertKit (Creator-friendly)', value: 'convertkit', recommended: true },
            { name: 'Mailchimp (Popular)', value: 'mailchimp' },
            { name: 'Substack (All-in-one)', value: 'substack' },
            { name: 'Custom (Resend/SendGrid)', value: 'custom' }
          ],
          default: 'convertkit',
          order: 11
        }
      );
    }

    // Add analytics questions if enabled
    if (context.features.includes('analytics')) {
      questions.push(
        {
          id: 'analyticsProvider',
          type: 'select',
          message: 'Which analytics service do you prefer?',
          description: 'Choose your analytics platform',
          choices: [
            { name: 'Google Analytics (Comprehensive)', value: 'google-analytics', recommended: true },
            { name: 'Plausible (Privacy-focused)', value: 'plausible' },
            { name: 'Vercel Analytics (Simple)', value: 'vercel-analytics' },
            { name: 'PostHog (Product analytics)', value: 'posthog' }
          ],
          default: 'google-analytics',
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
      reason: 'Fast and reliable for content management',
      confidence: 0.9,
      alternatives: ['prisma', 'supabase']
    };
  }

  protected getAuthRecommendation(context: ProjectContext): Recommendation {
    return {
      category: 'auth',
      plugin: 'better-auth',
      reason: 'Simple and secure for admin access',
      confidence: 0.8,
      alternatives: ['nextauth', 'clerk']
    };
  }

  protected getUIRecommendation(context: ProjectContext): Recommendation {
    return {
      category: 'ui',
      plugin: 'shadcn-ui',
      reason: 'Clean, readable components perfect for blogs',
      confidence: 0.9,
      alternatives: ['chakra-ui', 'mui']
    };
  }

  protected getPaymentRecommendation(context: ProjectContext): Recommendation {
    return {
      category: 'payment',
      plugin: 'stripe',
      reason: 'Most popular payment processor with excellent documentation',
      confidence: 0.9,
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