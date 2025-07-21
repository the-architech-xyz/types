/**
 * Shared Configuration - Single Source of Truth
 *
 * Centralized definitions for all provider types, features, and configuration options
 * used across the plugin system. This eliminates duplication and ensures consistency.
 */
// ============================================================================
// DATABASE PROVIDERS (Infrastructure Layer)
// ============================================================================
export const DATABASE_PROVIDERS = {
    // PostgreSQL-based
    NEON: 'neon',
    SUPABASE: 'supabase',
    VERCEL_POSTGRES: 'vercel-postgres',
    PLANETSCALE: 'planetscale',
    // Document databases
    MONGODB: 'mongodb',
    MONGODB_ATLAS: 'mongodb-atlas',
    // SQLite-based
    TURSO: 'turso',
    SQLITE: 'sqlite',
    // MySQL-based
    MYSQL: 'mysql',
    PLANETSCALE_MYSQL: 'planetscale-mysql',
    // Local development
    LOCAL_POSTGRES: 'local-postgres',
    LOCAL_MYSQL: 'local-mysql',
    LOCAL_SQLITE: 'local-sqlite'
};
// ============================================================================
// ORM LIBRARIES (Data Access Layer)
// ============================================================================
export const ORM_LIBRARIES = {
    // SQL ORMs
    DRIZZLE: 'drizzle',
    PRISMA: 'prisma',
    TYPEORM: 'typeorm',
    KYSELY: 'kysely',
    SEQUELIZE: 'sequelize',
    // MongoDB ODMs
    MONGOOSE: 'mongoose',
    PRISMA_MONGO: 'prisma-mongo',
    // Edge/Serverless
    D1: 'd1',
    UPSTASH_REDIS: 'upstash-redis',
    // Query Builders
    KNEX: 'knex'
};
// ============================================================================
// COMPATIBILITY MATRIX
// ============================================================================
export const DATABASE_ORM_COMPATIBILITY = {
    // PostgreSQL-based databases
    [DATABASE_PROVIDERS.NEON]: [ORM_LIBRARIES.DRIZZLE, ORM_LIBRARIES.PRISMA, ORM_LIBRARIES.TYPEORM, ORM_LIBRARIES.KYSELY],
    [DATABASE_PROVIDERS.SUPABASE]: [ORM_LIBRARIES.DRIZZLE, ORM_LIBRARIES.PRISMA, ORM_LIBRARIES.TYPEORM, ORM_LIBRARIES.KYSELY],
    [DATABASE_PROVIDERS.VERCEL_POSTGRES]: [ORM_LIBRARIES.DRIZZLE, ORM_LIBRARIES.PRISMA, ORM_LIBRARIES.TYPEORM, ORM_LIBRARIES.KYSELY],
    [DATABASE_PROVIDERS.LOCAL_POSTGRES]: [ORM_LIBRARIES.DRIZZLE, ORM_LIBRARIES.PRISMA, ORM_LIBRARIES.TYPEORM, ORM_LIBRARIES.KYSELY],
    // MySQL-based databases
    [DATABASE_PROVIDERS.PLANETSCALE]: [ORM_LIBRARIES.DRIZZLE, ORM_LIBRARIES.PRISMA, ORM_LIBRARIES.TYPEORM, ORM_LIBRARIES.KYSELY],
    [DATABASE_PROVIDERS.PLANETSCALE_MYSQL]: [ORM_LIBRARIES.DRIZZLE, ORM_LIBRARIES.PRISMA, ORM_LIBRARIES.TYPEORM, ORM_LIBRARIES.KYSELY],
    [DATABASE_PROVIDERS.MYSQL]: [ORM_LIBRARIES.DRIZZLE, ORM_LIBRARIES.PRISMA, ORM_LIBRARIES.TYPEORM, ORM_LIBRARIES.KYSELY],
    [DATABASE_PROVIDERS.LOCAL_MYSQL]: [ORM_LIBRARIES.DRIZZLE, ORM_LIBRARIES.PRISMA, ORM_LIBRARIES.TYPEORM, ORM_LIBRARIES.KYSELY],
    // SQLite-based databases
    [DATABASE_PROVIDERS.TURSO]: [ORM_LIBRARIES.DRIZZLE, ORM_LIBRARIES.PRISMA, ORM_LIBRARIES.KYSELY],
    [DATABASE_PROVIDERS.SQLITE]: [ORM_LIBRARIES.DRIZZLE, ORM_LIBRARIES.PRISMA, ORM_LIBRARIES.KYSELY],
    [DATABASE_PROVIDERS.LOCAL_SQLITE]: [ORM_LIBRARIES.DRIZZLE, ORM_LIBRARIES.PRISMA, ORM_LIBRARIES.KYSELY],
    // Document databases
    [DATABASE_PROVIDERS.MONGODB]: [ORM_LIBRARIES.MONGOOSE, ORM_LIBRARIES.PRISMA_MONGO],
    [DATABASE_PROVIDERS.MONGODB_ATLAS]: [ORM_LIBRARIES.MONGOOSE, ORM_LIBRARIES.PRISMA_MONGO]
};
// ============================================================================
// AUTHENTICATION PROVIDERS
// ============================================================================
export const AUTH_PROVIDERS = {
    EMAIL: 'email',
    GITHUB: 'github',
    GOOGLE: 'google',
    DISCORD: 'discord',
    TWITTER: 'twitter',
    FACEBOOK: 'facebook',
    LINKEDIN: 'linkedin',
    APPLE: 'apple',
    MICROSOFT: 'microsoft',
    SLACK: 'slack',
    TWITCH: 'twitch',
    SPOTIFY: 'spotify',
    GITLAB: 'gitlab',
    BITBUCKET: 'bitbucket',
    AUTH0: 'auth0',
    CLERK: 'clerk',
    SUPABASE_AUTH: 'supabase-auth',
    FIREBASE_AUTH: 'firebase-auth'
};
// ============================================================================
// AUTHENTICATION FEATURES
// ============================================================================
export const AUTH_FEATURES = {
    EMAIL_VERIFICATION: 'email-verification',
    PASSWORD_RESET: 'password-reset',
    SOCIAL_LOGIN: 'social-login',
    SESSION_MANAGEMENT: 'session-management',
    TWO_FACTOR_AUTH: 'two-factor-auth',
    ORGANIZATION_SUPPORT: 'organization-support',
    ROLE_BASED_ACCESS: 'role-based-access',
    MULTI_TENANT: 'multi-tenant'
};
// ============================================================================
// UI LIBRARIES
// ============================================================================
export const UI_LIBRARIES = {
    SHADCN_UI: 'shadcn-ui',
    CHAKRA_UI: 'chakra-ui',
    MATERIAL_UI: 'mui',
    ANT_DESIGN: 'antd',
    MANTINE: 'mantine',
    HEADLESS_UI: 'headless-ui',
    RADIX_UI: 'radix-ui',
    ARIANE: 'ariane',
    NEXT_UI: 'next-ui',
    DAISY_UI: 'daisy-ui'
};
// ============================================================================
// DEPLOYMENT PLATFORMS
// ============================================================================
export const DEPLOYMENT_PLATFORMS = {
    VERCEL: 'vercel',
    NETLIFY: 'netlify',
    RAILWAY: 'railway',
    HEROKU: 'heroku',
    AWS: 'aws',
    GOOGLE_CLOUD: 'google-cloud',
    AZURE: 'azure',
    DIGITAL_OCEAN: 'digital-ocean',
    FLY_IO: 'fly-io',
    RENDER: 'render',
    SUPABASE_EDGE: 'supabase-edge',
    CLOUDFLARE_PAGES: 'cloudflare-pages',
    CLOUDFLARE_WORKERS: 'cloudflare-workers'
};
// ============================================================================
// EMAIL SERVICES
// ============================================================================
export const EMAIL_SERVICES = {
    RESEND: 'resend',
    SENDGRID: 'sendgrid',
    MAILGUN: 'mailgun',
    POSTMARK: 'postmark',
    AWS_SES: 'aws-ses',
    GMAIL: 'gmail',
    OUTLOOK: 'outlook',
    SMTP: 'smtp'
};
// ============================================================================
// TESTING FRAMEWORKS
// ============================================================================
export const TESTING_FRAMEWORKS = {
    VITEST: 'vitest',
    JEST: 'jest',
    PLAYWRIGHT: 'playwright',
    CYPRESS: 'cypress',
    TESTING_LIBRARY: 'testing-library',
    MSW: 'msw',
    HAPPY_DOM: 'happy-dom',
    JSDOM: 'jsdom'
};
//# sourceMappingURL=shared-config.js.map