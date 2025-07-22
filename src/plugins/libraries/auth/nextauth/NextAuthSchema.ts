/**
 * NextAuth Schema Definitions
 * 
 * Contains all configuration schemas and parameter definitions for the NextAuth plugin.
 * Based on: https://next-auth.js.org/configuration
 */

import { ConfigSchema } from '../../../../types/plugin.js';

export interface NextAuthConfig {
  providers: string[];
  requireEmailVerification: boolean;
  sessionDuration: number;
  databaseUrl: string;
  enableOAuth: boolean;
  enableCredentials: boolean;
  enableMagicLinks: boolean;
  enableTwoFactor: boolean;
  enableWebAuthn: boolean;
  enableRateLimiting: boolean;
  enableAuditLogs: boolean;
  enableUserProfiles: boolean;
  enableRoles: boolean;
  enablePermissions: boolean;
  enableSocialLogin: boolean;
  enableEmailTemplates: boolean;
  enableCustomFields: boolean;
  enableJWT: boolean;
  enableDatabase: boolean;
  enableSecret: boolean;
}

export const NextAuthConfigSchema: ConfigSchema = {
  type: 'object',
  properties: {
    providers: {
      type: 'array',
      items: { 
        type: 'string',
        description: 'Authentication provider name'
      },
      description: 'Authentication providers to enable',
      default: ['credentials', 'google', 'github']
    },
    requireEmailVerification: {
      type: 'boolean',
      description: 'Require email verification for new accounts',
      default: true
    },
    sessionDuration: {
      type: 'number',
      description: 'Session duration in seconds',
      default: 30 * 24 * 60 * 60, // 30 days
      minimum: 60,
      maximum: 365 * 24 * 60 * 60
    },
    databaseUrl: {
      type: 'string',
      description: 'Database connection URL',
      default: 'postgresql://user:password@localhost:5432/nextauth'
    },
    enableOAuth: {
      type: 'boolean',
      description: 'Enable OAuth providers',
      default: true
    },
    enableCredentials: {
      type: 'boolean',
      description: 'Enable email/password authentication',
      default: true
    },
    enableMagicLinks: {
      type: 'boolean',
      description: 'Enable magic link authentication',
      default: false
    },
    enableTwoFactor: {
      type: 'boolean',
      description: 'Enable two-factor authentication',
      default: false
    },
    enableWebAuthn: {
      type: 'boolean',
      description: 'Enable WebAuthn (passkeys)',
      default: false
    },
    enableRateLimiting: {
      type: 'boolean',
      description: 'Enable rate limiting',
      default: true
    },
    enableAuditLogs: {
      type: 'boolean',
      description: 'Enable audit logging',
      default: true
    },
    enableUserProfiles: {
      type: 'boolean',
      description: 'Enable user profiles',
      default: true
    },
    enableRoles: {
      type: 'boolean',
      description: 'Enable role-based access control',
      default: false
    },
    enablePermissions: {
      type: 'boolean',
      description: 'Enable permission-based access control',
      default: false
    },
    enableSocialLogin: {
      type: 'boolean',
      description: 'Enable social login providers',
      default: true
    },
    enableEmailTemplates: {
      type: 'boolean',
      description: 'Enable customizable email templates',
      default: true
    },
    enableCustomFields: {
      type: 'boolean',
      description: 'Enable custom user fields',
      default: false
    },
    enableJWT: {
      type: 'boolean',
      description: 'Enable JWT session strategy',
      default: true
    },
    enableDatabase: {
      type: 'boolean',
      description: 'Enable database adapter',
      default: true
    },
    enableSecret: {
      type: 'boolean',
      description: 'Enable secret configuration',
      default: true
    }
  },
  required: ['databaseUrl']
};

export const NextAuthDefaultConfig: NextAuthConfig = {
  providers: ['credentials', 'google', 'github'],
  requireEmailVerification: true,
  sessionDuration: 30 * 24 * 60 * 60, // 30 days
  databaseUrl: 'postgresql://user:password@localhost:5432/nextauth',
  enableOAuth: true,
  enableCredentials: true,
  enableMagicLinks: false,
  enableTwoFactor: false,
  enableWebAuthn: false,
  enableRateLimiting: true,
  enableAuditLogs: true,
  enableUserProfiles: true,
  enableRoles: false,
  enablePermissions: false,
  enableSocialLogin: true,
  enableEmailTemplates: true,
  enableCustomFields: false,
  enableJWT: true,
  enableDatabase: true,
  enableSecret: true
}; 