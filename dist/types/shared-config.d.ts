/**
 * Shared Configuration - Single Source of Truth
 *
 * Centralized definitions for all provider types, features, and configuration options
 * used across the plugin system. This eliminates duplication and ensures consistency.
 */
export declare const DATABASE_PROVIDERS: {
    readonly NEON: "neon";
    readonly SUPABASE: "supabase";
    readonly VERCEL_POSTGRES: "vercel-postgres";
    readonly PLANETSCALE: "planetscale";
    readonly MONGODB: "mongodb";
    readonly MONGODB_ATLAS: "mongodb-atlas";
    readonly TURSO: "turso";
    readonly SQLITE: "sqlite";
    readonly MYSQL: "mysql";
    readonly PLANETSCALE_MYSQL: "planetscale-mysql";
    readonly LOCAL_POSTGRES: "local-postgres";
    readonly LOCAL_MYSQL: "local-mysql";
    readonly LOCAL_SQLITE: "local-sqlite";
};
export type DatabaseProvider = typeof DATABASE_PROVIDERS[keyof typeof DATABASE_PROVIDERS];
export declare const ORM_LIBRARIES: {
    readonly DRIZZLE: "drizzle";
    readonly PRISMA: "prisma";
    readonly TYPEORM: "typeorm";
    readonly KYSELY: "kysely";
    readonly SEQUELIZE: "sequelize";
    readonly MONGOOSE: "mongoose";
    readonly PRISMA_MONGO: "prisma-mongo";
    readonly D1: "d1";
    readonly UPSTASH_REDIS: "upstash-redis";
    readonly KNEX: "knex";
};
export type ORMLibrary = typeof ORM_LIBRARIES[keyof typeof ORM_LIBRARIES];
export declare const DATABASE_ORM_COMPATIBILITY: Record<DatabaseProvider, ORMLibrary[]>;
export declare const AUTH_PROVIDERS: {
    readonly EMAIL: "email";
    readonly GITHUB: "github";
    readonly GOOGLE: "google";
    readonly DISCORD: "discord";
    readonly TWITTER: "twitter";
    readonly FACEBOOK: "facebook";
    readonly LINKEDIN: "linkedin";
    readonly APPLE: "apple";
    readonly MICROSOFT: "microsoft";
    readonly SLACK: "slack";
    readonly TWITCH: "twitch";
    readonly SPOTIFY: "spotify";
    readonly GITLAB: "gitlab";
    readonly BITBUCKET: "bitbucket";
    readonly AUTH0: "auth0";
    readonly CLERK: "clerk";
    readonly SUPABASE_AUTH: "supabase-auth";
    readonly FIREBASE_AUTH: "firebase-auth";
};
export type AuthProvider = typeof AUTH_PROVIDERS[keyof typeof AUTH_PROVIDERS];
export declare const AUTH_FEATURES: {
    readonly EMAIL_VERIFICATION: "email-verification";
    readonly PASSWORD_RESET: "password-reset";
    readonly SOCIAL_LOGIN: "social-login";
    readonly SESSION_MANAGEMENT: "session-management";
    readonly TWO_FACTOR_AUTH: "two-factor-auth";
    readonly ORGANIZATION_SUPPORT: "organization-support";
    readonly ROLE_BASED_ACCESS: "role-based-access";
    readonly MULTI_TENANT: "multi-tenant";
};
export type AuthFeature = typeof AUTH_FEATURES[keyof typeof AUTH_FEATURES];
export declare const UI_LIBRARIES: {
    readonly SHADCN_UI: "shadcn-ui";
    readonly CHAKRA_UI: "chakra-ui";
    readonly MATERIAL_UI: "mui";
    readonly ANT_DESIGN: "antd";
    readonly MANTINE: "mantine";
    readonly HEADLESS_UI: "headless-ui";
    readonly RADIX_UI: "radix-ui";
    readonly ARIANE: "ariane";
    readonly NEXT_UI: "next-ui";
    readonly DAISY_UI: "daisy-ui";
};
export type UILibrary = typeof UI_LIBRARIES[keyof typeof UI_LIBRARIES];
export declare const DEPLOYMENT_PLATFORMS: {
    readonly VERCEL: "vercel";
    readonly NETLIFY: "netlify";
    readonly RAILWAY: "railway";
    readonly HEROKU: "heroku";
    readonly AWS: "aws";
    readonly GOOGLE_CLOUD: "google-cloud";
    readonly AZURE: "azure";
    readonly DIGITAL_OCEAN: "digital-ocean";
    readonly FLY_IO: "fly-io";
    readonly RENDER: "render";
    readonly SUPABASE_EDGE: "supabase-edge";
    readonly CLOUDFLARE_PAGES: "cloudflare-pages";
    readonly CLOUDFLARE_WORKERS: "cloudflare-workers";
};
export type DeploymentPlatform = typeof DEPLOYMENT_PLATFORMS[keyof typeof DEPLOYMENT_PLATFORMS];
export declare const EMAIL_SERVICES: {
    readonly RESEND: "resend";
    readonly SENDGRID: "sendgrid";
    readonly MAILGUN: "mailgun";
    readonly POSTMARK: "postmark";
    readonly AWS_SES: "aws-ses";
    readonly GMAIL: "gmail";
    readonly OUTLOOK: "outlook";
    readonly SMTP: "smtp";
};
export type EmailService = typeof EMAIL_SERVICES[keyof typeof EMAIL_SERVICES];
export declare const TESTING_FRAMEWORKS: {
    readonly VITEST: "vitest";
    readonly JEST: "jest";
    readonly PLAYWRIGHT: "playwright";
    readonly CYPRESS: "cypress";
    readonly TESTING_LIBRARY: "testing-library";
    readonly MSW: "msw";
    readonly HAPPY_DOM: "happy-dom";
    readonly JSDOM: "jsdom";
};
export type TestingFramework = typeof TESTING_FRAMEWORKS[keyof typeof TESTING_FRAMEWORKS];
