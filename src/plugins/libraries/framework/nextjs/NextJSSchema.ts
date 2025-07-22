import { ConfigSchema } from '../../../../types/plugin.js';

export interface NextJSConfig {
  version: '13' | '14' | '15';
  appRouter: boolean;
  pagesRouter: boolean;
  typescript: boolean;
  eslint: boolean;
  tailwind: boolean;
  postcss: boolean;
  sass: boolean;
  less: boolean;
  styledComponents: boolean;
  emotion: boolean;
  mdx: boolean;
  pwa: boolean;
  i18n: boolean;
  analytics: boolean;
  seo: boolean;
  performance: boolean;
  security: boolean;
  testing: boolean;
  storybook: boolean;
  docker: boolean;
  deployment: 'vercel' | 'netlify' | 'railway' | 'docker' | 'custom';
  database: 'none' | 'postgresql' | 'mysql' | 'mongodb' | 'sqlite' | 'supabase' | 'neon';
  authentication: 'none' | 'nextauth' | 'better-auth' | 'supabase-auth' | 'custom';
  ui: 'none' | 'shadcn-ui' | 'chakra-ui' | 'mui' | 'tamagui' | 'custom';
  stateManagement: 'none' | 'zustand' | 'redux' | 'jotai' | 'recoil' | 'custom';
  api: 'none' | 'rest' | 'graphql' | 'tRPC' | 'custom';
  monitoring: 'none' | 'sentry' | 'vercel-analytics' | 'google-analytics' | 'custom';
  email: 'none' | 'resend' | 'sendgrid' | 'nodemailer' | 'custom';
  payment: 'none' | 'stripe' | 'paypal' | 'custom';
  fileStorage: 'none' | 'aws-s3' | 'cloudinary' | 'supabase-storage' | 'custom';
}

export const NextJSConfigSchema: ConfigSchema = {
  type: 'object',
  properties: {
    version: {
      type: 'string',
      description: 'Next.js version to use',
      default: '15',
      enum: ['13', '14', '15']
    },
    appRouter: {
      type: 'boolean',
      description: 'Enable App Router (Next.js 13+)',
      default: true
    },
    pagesRouter: {
      type: 'boolean',
      description: 'Enable Pages Router (legacy)',
      default: false
    },
    typescript: {
      type: 'boolean',
      description: 'Enable TypeScript support',
      default: true
    },
    eslint: {
      type: 'boolean',
      description: 'Enable ESLint configuration',
      default: true
    },
    tailwind: {
      type: 'boolean',
      description: 'Enable Tailwind CSS',
      default: true
    },
    postcss: {
      type: 'boolean',
      description: 'Enable PostCSS configuration',
      default: true
    },
    sass: {
      type: 'boolean',
      description: 'Enable Sass/SCSS support',
      default: false
    },
    less: {
      type: 'boolean',
      description: 'Enable Less support',
      default: false
    },
    styledComponents: {
      type: 'boolean',
      description: 'Enable styled-components',
      default: false
    },
    emotion: {
      type: 'boolean',
      description: 'Enable Emotion CSS-in-JS',
      default: false
    },
    mdx: {
      type: 'boolean',
      description: 'Enable MDX support',
      default: false
    },
    pwa: {
      type: 'boolean',
      description: 'Enable Progressive Web App features',
      default: false
    },
    i18n: {
      type: 'boolean',
      description: 'Enable internationalization',
      default: false
    },
    analytics: {
      type: 'boolean',
      description: 'Enable analytics integration',
      default: false
    },
    seo: {
      type: 'boolean',
      description: 'Enable SEO optimization',
      default: true
    },
    performance: {
      type: 'boolean',
      description: 'Enable performance optimizations',
      default: true
    },
    security: {
      type: 'boolean',
      description: 'Enable security features',
      default: true
    },
    testing: {
      type: 'boolean',
      description: 'Enable testing setup',
      default: true
    },
    storybook: {
      type: 'boolean',
      description: 'Enable Storybook for component development',
      default: false
    },
    docker: {
      type: 'boolean',
      description: 'Enable Docker configuration',
      default: false
    },
    deployment: {
      type: 'string',
      description: 'Deployment platform',
      default: 'vercel',
      enum: ['vercel', 'netlify', 'railway', 'docker', 'custom']
    },
    database: {
      type: 'string',
      description: 'Database type',
      default: 'none',
      enum: ['none', 'postgresql', 'mysql', 'mongodb', 'sqlite', 'supabase', 'neon']
    },
    authentication: {
      type: 'string',
      description: 'Authentication solution',
      default: 'none',
      enum: ['none', 'nextauth', 'better-auth', 'supabase-auth', 'custom']
    },
    ui: {
      type: 'string',
      description: 'UI library',
      default: 'none',
      enum: ['none', 'shadcn-ui', 'chakra-ui', 'mui', 'tamagui', 'custom']
    },
    stateManagement: {
      type: 'string',
      description: 'State management solution',
      default: 'none',
      enum: ['none', 'zustand', 'redux', 'jotai', 'recoil', 'custom']
    },
    api: {
      type: 'string',
      description: 'API type',
      default: 'rest',
      enum: ['none', 'rest', 'graphql', 'tRPC', 'custom']
    },
    monitoring: {
      type: 'string',
      description: 'Monitoring solution',
      default: 'none',
      enum: ['none', 'sentry', 'vercel-analytics', 'google-analytics', 'custom']
    },
    email: {
      type: 'string',
      description: 'Email service',
      default: 'none',
      enum: ['none', 'resend', 'sendgrid', 'nodemailer', 'custom']
    },
    payment: {
      type: 'string',
      description: 'Payment processor',
      default: 'none',
      enum: ['none', 'stripe', 'paypal', 'custom']
    },
    fileStorage: {
      type: 'string',
      description: 'File storage solution',
      default: 'none',
      enum: ['none', 'aws-s3', 'cloudinary', 'supabase-storage', 'custom']
    }
  },
  required: ['version'],
  additionalProperties: false
};

export const NextJSDefaultConfig: NextJSConfig = {
  version: '15',
  appRouter: true,
  pagesRouter: false,
  typescript: true,
  eslint: true,
  tailwind: true,
  postcss: true,
  sass: false,
  less: false,
  styledComponents: false,
  emotion: false,
  mdx: false,
  pwa: false,
  i18n: false,
  analytics: false,
  seo: true,
  performance: true,
  security: true,
  testing: true,
  storybook: false,
  docker: false,
  deployment: 'vercel',
  database: 'none',
  authentication: 'none',
  ui: 'none',
  stateManagement: 'none',
  api: 'rest',
  monitoring: 'none',
  email: 'none',
  payment: 'none',
  fileStorage: 'none'
}; 