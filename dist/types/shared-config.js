/**
 * Shared Configuration - Single Source of Truth
 *
 * Centralized definitions for all provider types, features, and configuration options
 * used across the plugin system. This eliminates duplication and ensures consistency.
 */
// ============================================================================
// DATABASE PROVIDERS
// ============================================================================
export const DATABASE_PROVIDERS = {
    // Cloud PostgreSQL providers
    NEON: 'neon',
    SUPABASE: 'supabase',
    VERCEL: 'vercel',
    // Local providers
    LOCAL: 'local',
    // Traditional database providers
    POSTGRESQL: 'postgresql',
    MYSQL: 'mysql',
    SQLITE: 'sqlite',
    MONGODB: 'mongodb'
};
export const DATABASE_PROVIDER_LABELS = {
    [DATABASE_PROVIDERS.NEON]: 'Neon (PostgreSQL)',
    [DATABASE_PROVIDERS.SUPABASE]: 'Supabase (PostgreSQL)',
    [DATABASE_PROVIDERS.VERCEL]: 'Vercel Postgres',
    [DATABASE_PROVIDERS.LOCAL]: 'Local SQLite',
    [DATABASE_PROVIDERS.POSTGRESQL]: 'PostgreSQL',
    [DATABASE_PROVIDERS.MYSQL]: 'MySQL',
    [DATABASE_PROVIDERS.SQLITE]: 'SQLite',
    [DATABASE_PROVIDERS.MONGODB]: 'MongoDB'
};
// ============================================================================
// DATABASE FEATURES
// ============================================================================
export const DATABASE_FEATURES = {
    MIGRATIONS: 'migrations',
    SEEDING: 'seeding',
    BACKUP: 'backup',
    STUDIO: 'studio'
};
export const DATABASE_FEATURE_LABELS = {
    [DATABASE_FEATURES.MIGRATIONS]: 'Migrations',
    [DATABASE_FEATURES.SEEDING]: 'Seeding',
    [DATABASE_FEATURES.BACKUP]: 'Backup',
    [DATABASE_FEATURES.STUDIO]: 'Studio'
};
// ============================================================================
// AUTHENTICATION PROVIDERS
// ============================================================================
export const AUTH_PROVIDERS = {
    // Email-based authentication
    EMAIL: 'email',
    // OAuth providers
    GITHUB: 'github',
    GOOGLE: 'google',
    DISCORD: 'discord',
    TWITTER: 'twitter',
    FACEBOOK: 'facebook',
    // Additional providers
    CREDENTIALS: 'credentials'
};
export const AUTH_PROVIDER_LABELS = {
    [AUTH_PROVIDERS.EMAIL]: 'Email/Password',
    [AUTH_PROVIDERS.GITHUB]: 'GitHub',
    [AUTH_PROVIDERS.GOOGLE]: 'Google',
    [AUTH_PROVIDERS.DISCORD]: 'Discord',
    [AUTH_PROVIDERS.TWITTER]: 'Twitter',
    [AUTH_PROVIDERS.FACEBOOK]: 'Facebook',
    [AUTH_PROVIDERS.CREDENTIALS]: 'Credentials'
};
// ============================================================================
// AUTHENTICATION FEATURES
// ============================================================================
export const AUTH_FEATURES = {
    EMAIL_VERIFICATION: 'emailVerification',
    PASSWORD_RESET: 'passwordReset',
    SOCIAL_LOGIN: 'socialLogin',
    SESSION_MANAGEMENT: 'sessionManagement'
};
export const AUTH_FEATURE_LABELS = {
    [AUTH_FEATURES.EMAIL_VERIFICATION]: 'Email Verification',
    [AUTH_FEATURES.PASSWORD_RESET]: 'Password Reset',
    [AUTH_FEATURES.SOCIAL_LOGIN]: 'Social Login',
    [AUTH_FEATURES.SESSION_MANAGEMENT]: 'Session Management'
};
// ============================================================================
// SESSION STRATEGIES
// ============================================================================
export const SESSION_STRATEGIES = {
    JWT: 'jwt',
    DATABASE: 'database'
};
export const SESSION_STRATEGY_LABELS = {
    [SESSION_STRATEGIES.JWT]: 'JWT',
    [SESSION_STRATEGIES.DATABASE]: 'Database'
};
// ============================================================================
// DATABASE ADAPTERS
// ============================================================================
export const DATABASE_ADAPTERS = {
    DRIZZLE: 'drizzle',
    PRISMA: 'prisma',
    MONGODB: 'mongodb'
};
export const DATABASE_ADAPTER_LABELS = {
    [DATABASE_ADAPTERS.DRIZZLE]: 'Drizzle ORM',
    [DATABASE_ADAPTERS.PRISMA]: 'Prisma ORM',
    [DATABASE_ADAPTERS.MONGODB]: 'MongoDB'
};
// ============================================================================
// PLUGIN TYPES
// ============================================================================
export const PLUGIN_TYPES = {
    // Database plugins
    DRIZZLE: 'drizzle',
    PRISMA: 'prisma',
    // Authentication plugins
    BETTER_AUTH: 'better-auth',
    NEXTAUTH: 'next-auth',
    // Framework plugins
    NEXTJS: 'nextjs',
    // UI plugins
    SHADCN: 'shadcn',
    // No plugin selected
    NONE: 'none'
};
export const PLUGIN_TYPE_LABELS = {
    [PLUGIN_TYPES.DRIZZLE]: 'Drizzle ORM',
    [PLUGIN_TYPES.PRISMA]: 'Prisma ORM',
    [PLUGIN_TYPES.BETTER_AUTH]: 'Better Auth',
    [PLUGIN_TYPES.NEXTAUTH]: 'NextAuth.js',
    [PLUGIN_TYPES.NEXTJS]: 'Next.js',
    [PLUGIN_TYPES.SHADCN]: 'Shadcn/ui',
    [PLUGIN_TYPES.NONE]: 'None'
};
// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
export function getDatabaseProvidersForPlugin(pluginType) {
    switch (pluginType) {
        case PLUGIN_TYPES.DRIZZLE:
            return [DATABASE_PROVIDERS.NEON, DATABASE_PROVIDERS.SUPABASE, DATABASE_PROVIDERS.VERCEL, DATABASE_PROVIDERS.LOCAL];
        case PLUGIN_TYPES.PRISMA:
            return [DATABASE_PROVIDERS.POSTGRESQL, DATABASE_PROVIDERS.MYSQL, DATABASE_PROVIDERS.SQLITE];
        case PLUGIN_TYPES.NONE:
            return [];
        default:
            return [];
    }
}
export function getAuthProvidersForPlugin(pluginType) {
    switch (pluginType) {
        case PLUGIN_TYPES.BETTER_AUTH:
            return [AUTH_PROVIDERS.EMAIL, AUTH_PROVIDERS.GITHUB, AUTH_PROVIDERS.GOOGLE, AUTH_PROVIDERS.DISCORD, AUTH_PROVIDERS.TWITTER];
        case PLUGIN_TYPES.NEXTAUTH:
            return [AUTH_PROVIDERS.GITHUB, AUTH_PROVIDERS.GOOGLE, AUTH_PROVIDERS.DISCORD, AUTH_PROVIDERS.TWITTER, AUTH_PROVIDERS.FACEBOOK, AUTH_PROVIDERS.EMAIL];
        case PLUGIN_TYPES.NONE:
            return [];
        default:
            return [];
    }
}
export function getDatabaseFeaturesForPlugin(pluginType) {
    switch (pluginType) {
        case PLUGIN_TYPES.DRIZZLE:
            return [DATABASE_FEATURES.MIGRATIONS, DATABASE_FEATURES.SEEDING, DATABASE_FEATURES.BACKUP];
        case PLUGIN_TYPES.PRISMA:
            return [DATABASE_FEATURES.MIGRATIONS, DATABASE_FEATURES.SEEDING, DATABASE_FEATURES.STUDIO];
        case PLUGIN_TYPES.NONE:
            return [];
        default:
            return [];
    }
}
export function getAuthFeaturesForPlugin(pluginType) {
    switch (pluginType) {
        case PLUGIN_TYPES.BETTER_AUTH:
        case PLUGIN_TYPES.NEXTAUTH:
            return [AUTH_FEATURES.EMAIL_VERIFICATION, AUTH_FEATURES.PASSWORD_RESET, AUTH_FEATURES.SOCIAL_LOGIN, AUTH_FEATURES.SESSION_MANAGEMENT];
        case PLUGIN_TYPES.NONE:
            return [];
        default:
            return [];
    }
}
//# sourceMappingURL=shared-config.js.map