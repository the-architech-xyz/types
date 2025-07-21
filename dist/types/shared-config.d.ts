/**
 * Shared Configuration - Single Source of Truth
 *
 * Centralized definitions for all provider types, features, and configuration options
 * used across the plugin system. This eliminates duplication and ensures consistency.
 */
export declare const DATABASE_PROVIDERS: {
    readonly NEON: "neon";
    readonly SUPABASE: "supabase";
    readonly VERCEL: "vercel";
    readonly LOCAL: "local";
    readonly POSTGRESQL: "postgresql";
    readonly MYSQL: "mysql";
    readonly SQLITE: "sqlite";
    readonly MONGODB: "mongodb";
};
export type DatabaseProvider = typeof DATABASE_PROVIDERS[keyof typeof DATABASE_PROVIDERS];
export declare const DATABASE_PROVIDER_LABELS: Record<DatabaseProvider, string>;
export declare const DATABASE_FEATURES: {
    readonly MIGRATIONS: "migrations";
    readonly SEEDING: "seeding";
    readonly BACKUP: "backup";
    readonly STUDIO: "studio";
};
export type DatabaseFeature = typeof DATABASE_FEATURES[keyof typeof DATABASE_FEATURES];
export declare const DATABASE_FEATURE_LABELS: Record<DatabaseFeature, string>;
export declare const AUTH_PROVIDERS: {
    readonly EMAIL: "email";
    readonly GITHUB: "github";
    readonly GOOGLE: "google";
    readonly DISCORD: "discord";
    readonly TWITTER: "twitter";
    readonly FACEBOOK: "facebook";
    readonly CREDENTIALS: "credentials";
};
export type AuthProvider = typeof AUTH_PROVIDERS[keyof typeof AUTH_PROVIDERS];
export declare const AUTH_PROVIDER_LABELS: Record<AuthProvider, string>;
export declare const AUTH_FEATURES: {
    readonly EMAIL_VERIFICATION: "emailVerification";
    readonly PASSWORD_RESET: "passwordReset";
    readonly SOCIAL_LOGIN: "socialLogin";
    readonly SESSION_MANAGEMENT: "sessionManagement";
};
export type AuthFeature = typeof AUTH_FEATURES[keyof typeof AUTH_FEATURES];
export declare const AUTH_FEATURE_LABELS: Record<AuthFeature, string>;
export declare const SESSION_STRATEGIES: {
    readonly JWT: "jwt";
    readonly DATABASE: "database";
};
export type SessionStrategy = typeof SESSION_STRATEGIES[keyof typeof SESSION_STRATEGIES];
export declare const SESSION_STRATEGY_LABELS: Record<SessionStrategy, string>;
export declare const DATABASE_ADAPTERS: {
    readonly DRIZZLE: "drizzle";
    readonly PRISMA: "prisma";
    readonly MONGODB: "mongodb";
};
export type DatabaseAdapter = typeof DATABASE_ADAPTERS[keyof typeof DATABASE_ADAPTERS];
export declare const DATABASE_ADAPTER_LABELS: Record<DatabaseAdapter, string>;
export declare const PLUGIN_TYPES: {
    readonly DRIZZLE: "drizzle";
    readonly PRISMA: "prisma";
    readonly BETTER_AUTH: "better-auth";
    readonly NEXTAUTH: "next-auth";
    readonly NEXTJS: "nextjs";
    readonly SHADCN: "shadcn";
    readonly NONE: "none";
};
export type PluginType = typeof PLUGIN_TYPES[keyof typeof PLUGIN_TYPES];
export declare const PLUGIN_TYPE_LABELS: Record<PluginType, string>;
export interface DatabaseConfigSchema {
    provider: DatabaseProvider;
    features: Partial<Record<DatabaseFeature, boolean>>;
    schema?: {
        tables?: string[];
        relationships?: boolean;
    };
}
export interface AuthConfigSchema {
    providers: AuthProvider[];
    features: Partial<Record<AuthFeature, boolean>>;
    database?: {
        adapter: DatabaseAdapter;
    };
    session?: {
        strategy: SessionStrategy;
        maxAge?: number;
    };
}
export declare function getDatabaseProvidersForPlugin(pluginType: PluginType): DatabaseProvider[];
export declare function getAuthProvidersForPlugin(pluginType: PluginType): AuthProvider[];
export declare function getDatabaseFeaturesForPlugin(pluginType: PluginType): DatabaseFeature[];
export declare function getAuthFeaturesForPlugin(pluginType: PluginType): AuthFeature[];
