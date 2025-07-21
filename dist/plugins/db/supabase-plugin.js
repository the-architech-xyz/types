/**
 * Supabase Plugin - Pure Technology Implementation
 *
 * Provides Supabase integration for both database and authentication services.
 * Supabase is a powerful open-source alternative to Firebase with PostgreSQL database
 * and built-in authentication, real-time subscriptions, and edge functions.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { PluginCategory, TargetPlatform } from '../../types/plugin.js';
import { templateService } from '../../core/templates/template-service.js';
import { CommandRunner } from '../../core/cli/command-runner.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
export class SupabasePlugin {
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
            id: 'supabase',
            name: 'Supabase',
            version: '1.0.0',
            description: 'Open-source Firebase alternative with PostgreSQL database, authentication, real-time subscriptions, and edge functions',
            author: 'The Architech Team',
            category: PluginCategory.DATABASE, // Primary category, but also provides auth
            tags: ['database', 'authentication', 'postgresql', 'realtime', 'edge-functions', 'storage', 'supabase', 'firebase-alternative'],
            license: 'Apache-2.0',
            repository: 'https://github.com/supabase/supabase',
            homepage: 'https://supabase.com',
            documentation: 'https://supabase.com/docs'
        };
    }
    // ============================================================================
    // PLUGIN LIFECYCLE - Pure Technology Implementation
    // ============================================================================
    async install(context) {
        const startTime = Date.now();
        try {
            const { projectName, projectPath, pluginConfig } = context;
            context.logger.info('Installing Supabase with database and authentication...');
            // Step 1: Install dependencies
            await this.installDependencies(context);
            // Step 2: Initialize Supabase configuration
            await this.initializeSupabaseConfig(context);
            // Step 3: Create database schema and connection
            await this.createDatabaseFiles(context);
            // Step 4: Create authentication configuration
            await this.createAuthConfiguration(context);
            // Step 5: Create API routes and utilities
            await this.createAPIRoutes(context);
            // Step 6: Generate unified interface files
            await this.generateUnifiedInterfaceFiles(context);
            // Step 7: Create Supabase client and utilities
            await this.createSupabaseClient(context);
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: [
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'supabase', 'index.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'supabase', 'client.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'supabase', 'auth.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'supabase', 'database.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'supabase', 'types.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'supabase', 'schema.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'app', 'api', 'auth', 'callback', 'route.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'supabase', 'config.toml')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'supabase', 'migrations', '00000000000000_initial_schema.sql')
                    }
                ],
                dependencies: [
                    {
                        name: '@supabase/supabase-js',
                        version: '^2.39.0',
                        type: 'production',
                        category: PluginCategory.DATABASE
                    },
                    {
                        name: '@supabase/auth-helpers-nextjs',
                        version: '^0.8.7',
                        type: 'production',
                        category: PluginCategory.AUTHENTICATION
                    },
                    {
                        name: '@supabase/auth-helpers-react',
                        version: '^0.4.2',
                        type: 'production',
                        category: PluginCategory.AUTHENTICATION
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
            return this.createErrorResult('Failed to install Supabase', startTime, [], error);
        }
    }
    async uninstall(context) {
        const startTime = Date.now();
        try {
            const { projectPath } = context;
            context.logger.info('Uninstalling Supabase...');
            // Remove Supabase files
            const filesToRemove = [
                path.join(projectPath, 'src', 'lib', 'supabase'),
                path.join(projectPath, 'src', 'app', 'api', 'auth'),
                path.join(projectPath, 'supabase')
            ];
            for (const filePath of filesToRemove) {
                if (await fsExtra.pathExists(filePath)) {
                    await fsExtra.remove(filePath);
                }
            }
            // Remove dependencies
            await this.runner.install(['@supabase/supabase-js', '@supabase/auth-helpers-nextjs', '@supabase/auth-helpers-react'], false, projectPath);
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
            return this.createErrorResult('Failed to uninstall Supabase', startTime, [], error);
        }
    }
    async update(context) {
        const startTime = Date.now();
        try {
            const { projectPath } = context;
            context.logger.info('Updating Supabase...');
            // Update dependencies
            await this.runner.install(['@supabase/supabase-js', '@supabase/auth-helpers-nextjs', '@supabase/auth-helpers-react'], false, projectPath);
            // Regenerate configuration files
            await this.initializeSupabaseConfig(context);
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
            return this.createErrorResult('Failed to update Supabase', startTime, [], error);
        }
    }
    async validate(context) {
        const errors = [];
        const warnings = [];
        try {
            const { projectPath, pluginConfig } = context;
            // Check if Supabase configuration exists
            const supabaseConfigPath = path.join(projectPath, 'src', 'lib', 'supabase', 'client.ts');
            if (!await fsExtra.pathExists(supabaseConfigPath)) {
                errors.push({
                    field: 'supabase-config',
                    message: 'Supabase client configuration not found',
                    code: 'MISSING_CONFIG',
                    severity: 'error'
                });
            }
            // Check if environment variables are configured
            const envPath = path.join(projectPath, '.env.local');
            if (await fsExtra.pathExists(envPath)) {
                const envContent = await fsExtra.readFile(envPath, 'utf-8');
                const requiredVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
                for (const varName of requiredVars) {
                    if (!envContent.includes(varName)) {
                        warnings.push(`Environment variable ${varName} not found in .env.local`);
                    }
                }
            }
            else {
                warnings.push('.env.local file not found - Supabase environment variables need to be configured');
            }
            // Check if dependencies are installed
            const packageJsonPath = path.join(projectPath, 'package.json');
            if (await fsExtra.pathExists(packageJsonPath)) {
                const packageJson = await fsExtra.readJson(packageJsonPath);
                const requiredDeps = ['@supabase/supabase-js'];
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
                    message: 'Node.js version 16 or higher is required for Supabase',
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
            frameworks: ['nextjs', 'react'],
            platforms: [TargetPlatform.WEB, TargetPlatform.MOBILE],
            nodeVersions: ['>=16.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm'],
            conflicts: ['firebase', 'mongodb', 'mysql', 'sqlite']
        };
    }
    getDependencies() {
        return [
            '@supabase/supabase-js',
            '@supabase/auth-helpers-nextjs',
            '@supabase/auth-helpers-react'
        ];
    }
    getConflicts() {
        return [
            'firebase',
            'mongodb',
            'mysql',
            'sqlite'
        ];
    }
    getRequirements() {
        return [
            {
                type: 'service',
                name: 'Supabase Project',
                description: 'A Supabase project with database and authentication enabled',
                optional: false
            },
            {
                type: 'config',
                name: 'Environment Variables',
                description: 'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be configured',
                optional: false
            },
            {
                type: 'binary',
                name: 'Node.js',
                description: 'Node.js version 16 or higher',
                version: '>=16.0.0',
                optional: false
            }
        ];
    }
    // ============================================================================
    // CONFIGURATION
    // ============================================================================
    getDefaultConfig() {
        return {
            databaseProvider: 'postgresql',
            databaseFeatures: ['realtime', 'row-level-security', 'full-text-search'],
            authProviders: ['email', 'google', 'github'],
            sessionStrategy: 'jwt',
            enableRealtime: true,
            enableEdgeFunctions: false,
            enableStorage: true
        };
    }
    getConfigSchema() {
        return {
            type: 'object',
            properties: {
                databaseProvider: {
                    type: 'string',
                    enum: ['postgresql'],
                    default: 'postgresql',
                    description: 'Database provider (Supabase only supports PostgreSQL)'
                },
                databaseFeatures: {
                    type: 'array',
                    items: {
                        type: 'string',
                        enum: ['realtime', 'row-level-security', 'full-text-search', 'backups', 'extensions'],
                        description: 'Database feature to enable'
                    },
                    default: ['realtime', 'row-level-security', 'full-text-search'],
                    description: 'Database features to enable'
                },
                authProviders: {
                    type: 'array',
                    items: {
                        type: 'string',
                        enum: ['email', 'google', 'github', 'facebook', 'twitter', 'discord', 'slack', 'azure', 'gitlab', 'bitbucket'],
                        description: 'Authentication provider to configure'
                    },
                    default: ['email', 'google', 'github'],
                    description: 'Authentication providers to configure'
                },
                sessionStrategy: {
                    type: 'string',
                    enum: ['jwt', 'database'],
                    default: 'jwt',
                    description: 'Session strategy for authentication'
                },
                enableRealtime: {
                    type: 'boolean',
                    default: true,
                    description: 'Enable real-time subscriptions'
                },
                enableEdgeFunctions: {
                    type: 'boolean',
                    default: false,
                    description: 'Enable Supabase Edge Functions'
                },
                enableStorage: {
                    type: 'boolean',
                    default: true,
                    description: 'Enable Supabase Storage'
                }
            },
            required: ['databaseProvider', 'authProviders', 'sessionStrategy']
        };
    }
    // ============================================================================
    // PRIVATE IMPLEMENTATION METHODS
    // ============================================================================
    async installDependencies(context) {
        const { projectPath } = context;
        context.logger.info('Installing Supabase dependencies...');
        const dependencies = [
            '@supabase/supabase-js',
            '@supabase/auth-helpers-nextjs',
            '@supabase/auth-helpers-react'
        ];
        await this.runner.install(dependencies, false, projectPath);
    }
    async initializeSupabaseConfig(context) {
        const { projectPath, pluginConfig } = context;
        context.logger.info('Initializing Supabase configuration...');
        // Create Supabase directory structure
        const supabaseDir = path.join(projectPath, 'supabase');
        await fsExtra.ensureDir(supabaseDir);
        await fsExtra.ensureDir(path.join(supabaseDir, 'migrations'));
        await fsExtra.ensureDir(path.join(supabaseDir, 'functions'));
        // Create Supabase config file
        const configContent = this.generateSupabaseConfig(pluginConfig);
        await fsExtra.writeFile(path.join(supabaseDir, 'config.toml'), configContent);
        // Create initial migration
        const migrationContent = this.generateInitialMigration(pluginConfig);
        await fsExtra.writeFile(path.join(supabaseDir, 'migrations', '00000000000000_initial_schema.sql'), migrationContent);
    }
    async createDatabaseFiles(context) {
        const { projectPath, pluginConfig } = context;
        context.logger.info('Creating Supabase database files...');
        const supabaseDir = path.join(projectPath, 'src', 'lib', 'supabase');
        await fsExtra.ensureDir(supabaseDir);
        // Create database client
        const databaseContent = this.generateDatabaseClient();
        await fsExtra.writeFile(path.join(supabaseDir, 'database.ts'), databaseContent);
        // Create schema types
        const schemaContent = this.generateSchemaTypes(pluginConfig);
        await fsExtra.writeFile(path.join(supabaseDir, 'schema.ts'), schemaContent);
    }
    async createAuthConfiguration(context) {
        const { projectPath, pluginConfig } = context;
        context.logger.info('Creating Supabase authentication configuration...');
        const supabaseDir = path.join(projectPath, 'src', 'lib', 'supabase');
        await fsExtra.ensureDir(supabaseDir);
        // Create auth utilities
        const authContent = this.generateAuthUtilities(pluginConfig);
        await fsExtra.writeFile(path.join(supabaseDir, 'auth.ts'), authContent);
    }
    async createAPIRoutes(context) {
        const { projectPath } = context;
        context.logger.info('Creating Supabase API routes...');
        const apiDir = path.join(projectPath, 'src', 'app', 'api', 'auth', 'callback');
        await fsExtra.ensureDir(apiDir);
        // Create auth callback route
        const callbackContent = this.generateAuthCallbackRoute();
        await fsExtra.writeFile(path.join(apiDir, 'route.ts'), callbackContent);
    }
    async createSupabaseClient(context) {
        const { projectPath } = context;
        context.logger.info('Creating Supabase client...');
        const supabaseDir = path.join(projectPath, 'src', 'lib', 'supabase');
        await fsExtra.ensureDir(supabaseDir);
        // Create main client
        const clientContent = this.generateSupabaseClient();
        await fsExtra.writeFile(path.join(supabaseDir, 'client.ts'), clientContent);
        // Create types
        const typesContent = this.generateTypes();
        await fsExtra.writeFile(path.join(supabaseDir, 'types.ts'), typesContent);
    }
    async generateUnifiedInterfaceFiles(context) {
        const { projectPath } = context;
        context.logger.info('Generating unified interface files...');
        const supabaseDir = path.join(projectPath, 'src', 'lib', 'supabase');
        await fsExtra.ensureDir(supabaseDir);
        // Create unified index
        const indexContent = this.generateUnifiedIndex();
        await fsExtra.writeFile(path.join(supabaseDir, 'index.ts'), indexContent);
    }
    // ============================================================================
    // TEMPLATE GENERATION METHODS
    // ============================================================================
    generateSupabaseConfig(config) {
        return `# A string used to distinguish different Supabase projects on the same host. Defaults to the
# working directory name when running 'supabase init'.
project_id = "your-project-id"

[api]
enabled = true
# Port to use for the API URL.
port = 54321
# Schemas to expose in your API. Tables, views and stored procedures in this schema will get API endpoints.
# public and storage are always included.
schemas = ["public", "storage", "graphql_public"]
# Extra schemas to add to the search_path of every request. public is always included.
extra_search_path = ["public", "extensions"]
# The maximum number of rows returned from a table or view. Limits payload size for accidental or malicious requests.
max_rows = 1000

[db]
# Port to use for the local database URL.
port = 54322
# Port used by db diff command to initialize the shadow database.
shadow_port = 54320
# The database major version to use. This has to be the same as your remote database's. Run 'SHOW server_version;' on the remote database to check.
major_version = 15

[db.pooler]
enabled = false
# Port to use for the local connection pooler.
port = 54329
# Specifies when a server connection can be reused by other clients.
# Configure one of the supported pooler modes: 'transaction', 'session'.
pool_mode = "transaction"
# How many server connections to allow per user/database pair.
default_pool_size = 15
# Maximum number of client connections allowed.
max_client_conn = 100

[realtime]
enabled = true
# Bind realtime via either IPv4 or IPv6. (default: IPv4)
# ip_version = "IPv4"

[studio]
enabled = true
# Port to use for Supabase Studio.
port = 54323
# External URL of the API server that frontend connects to.
api_url = "http://localhost:54321"

# Email testing server. Emails sent with the local dev setup are not actually sent - rather, they
# are monitored, and you can view the emails that would have been sent from the web interface.
[inbucket]
enabled = true
# Port to use for the email testing server web interface.
port = 54324
# Uncomment to expose additional ports for testing user applications that send emails.
# smtp_port = 2500
# pop3_port = 1100

[storage]
enabled = true
# The maximum file size allowed (e.g. "5MB", "500KB").
file_size_limit = "50MiB"

[auth]
enabled = true
# The base URL of your website. Used as an allow-list for redirects and for constructing URLs used
# in emails.
site_url = "http://localhost:3000"
# A list of *exact* URLs that auth providers are permitted to redirect to post authentication.
additional_redirect_urls = ["https://localhost:3000"]
# How long tokens are valid for, in seconds. Defaults to 3600 (1 hour), maximum 604800 (1 week).
jwt_expiry = 3600
# If disabled, the refresh token will never expire.
enable_refresh_token_rotation = true
# Allows refresh tokens to be reused after expiry, up to the specified interval in seconds.
# Requires enable_refresh_token_rotation = true.
refresh_token_reuse_interval = 10
# Allow/disallow new user signups to your project.
enable_signup = true

[auth.email]
# Allow/disallow new user signups via email to your project.
enable_signup = true
# If enabled, a user will be required to confirm any email change on both the old, and new email addresses. If disabled, only the new email is required to confirm.
double_confirm_changes = true
# If enabled, users need to confirm their email address before signing in.
enable_confirmations = false

# Uncomment to customize email template
# [auth.email.template.invite]
# subject = "You have been invited"
# content_path = "./supabase/templates/invite.html"

[auth.sms]
# Allow/disallow new user signups via SMS to your project.
enable_signup = true
# If enabled, users need to confirm their phone number before signing in.
enable_confirmations = false
# Template for sending a confirmation message when a user signs up with a phone number.
template = "Your code is {{ .Code }}"

# Use pre-defined map of phone number to OTP for testing.
# [auth.sms.test_otp]
# 4152127777 = "123456"

# Configure one of the supported SMS providers: 'twilio', 'messagebird', 'textlocal', 'vonage'.
# [auth.sms.twilio]
# enabled = true
# account_sid = ""
# message_service_sid = ""
# # DO NOT commit your Twilio auth token to git. Use environment variable substitution instead:
# auth_token = "env(SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN)"

# Use an external OAuth provider. The full list of providers are: 'apple', 'azure', 'bitbucket',
# 'discord', 'facebook', 'github', 'gitlab', 'google', 'keycloak', 'linkedin', 'notion', 'twitch',
# 'twitter', 'slack', 'spotify', 'workos', 'zoom'.
# [auth.external.apple]
# enabled = true
# client_id = ""
# # DO NOT commit your OAuth provider secret to git. Use environment variable substitution instead:
# secret = "env(SUPABASE_AUTH_EXTERNAL_APPLE_SECRET)"
# # Overrides the default auth redirectUrl.
# redirect_uri = ""
# # Overrides the default auth provider URL. Used to support self-hosted gitlab, single-tenant Azure,
# # or any other third-party OIDC providers.
# url = ""

[edge_functions]
enabled = false
# Configure one of the supported runtimes: 'deno', 'nodejs'.
runtime = "deno"

[analytics]
enabled = false
port = 54327
vector_port = 54328
# Configure one of the supported backends: 'postgres', 'bigquery'.
backend = "postgres"

[functions]
# Configure one of the supported runtimes: 'deno', 'nodejs'.
runtime = "deno"
`;
    }
    generateInitialMigration(config) {
        return `-- Create initial schema for Supabase project
-- This migration sets up the basic database structure

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
`;
    }
    generateSupabaseClient() {
        return `import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Helper function to get the current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Helper function to get the current session
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

// Helper function to sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Helper function to get user profile
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

// Helper function to update user profile
export const updateUserProfile = async (userId: string, updates: Partial<Database['public']['Tables']['profiles']['Update']>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};
`;
    }
    generateTypes() {
        return `export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Auth types
export type User = Database['public']['Tables']['profiles']['Row']
export type UserInsert = Database['public']['Tables']['profiles']['Insert']
export type UserUpdate = Database['public']['Tables']['profiles']['Update']

// Realtime types
export type RealtimeChannel = {
  id: string
  name: string
  topic: string
}

// Storage types
export type StorageBucket = {
  id: string
  name: string
  public: boolean
  file_size_limit: number
  allowed_mime_types: string[]
}

export type StorageFile = {
  id: string
  name: string
  bucket_id: string
  owner: string
  created_at: string
  updated_at: string
  last_accessed_at: string
  metadata: Record<string, any>
}
`;
    }
    generateDatabaseClient() {
        return `import { supabase } from './client';
import type { Database } from './types';

// Database operations
export class DatabaseService {
  // Generic query builder
  static from<T extends keyof Database['public']['Tables']>(
    table: T
  ) {
    return supabase.from(table);
  }

  // Profile operations
  static async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateProfile(userId: string, updates: Partial<Database['public']['Tables']['profiles']['Update']>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async createProfile(profile: Database['public']['Tables']['profiles']['Insert']) {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteProfile(userId: string) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (error) throw error;
  }

  // Real-time subscriptions
  static subscribeToProfile(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: \`id=eq.\${userId}\`
        },
        callback
      )
      .subscribe();
  }

  // Storage operations
  static async uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);
    
    if (error) throw error;
    return data;
  }

  static async downloadFile(bucket: string, path: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);
    
    if (error) throw error;
    return data;
  }

  static async deleteFile(bucket: string, path: string) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) throw error;
  }

  static getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }
}

export default DatabaseService;
`;
    }
    generateAuthUtilities(config) {
        return `import { supabase } from './client';
import type { User } from './types';

// Authentication utilities
export class AuthService {
  // Sign up with email
  static async signUpWithEmail(email: string, password: string, metadata?: Record<string, any>) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    
    if (error) throw error;
    return data;
  }

  // Sign in with email
  static async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  }

  // Sign in with OAuth provider
  static async signInWithOAuth(provider: 'google' | 'github' | 'facebook' | 'twitter' | 'discord' | 'slack' | 'azure' | 'gitlab' | 'bitbucket') {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: \`\${window.location.origin}/auth/callback\`
      }
    });
    
    if (error) throw error;
    return data;
  }

  // Sign out
  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  // Get current user
  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  // Get current session
  static async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  }

  // Reset password
  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: \`\${window.location.origin}/auth/reset-password\`
    });
    
    if (error) throw error;
  }

  // Update password
  static async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
  }

  // Update user metadata
  static async updateUserMetadata(metadata: Record<string, any>) {
    const { error } = await supabase.auth.updateUser({
      data: metadata
    });
    
    if (error) throw error;
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  }

  // Get user profile with auth user
  static async getUserProfile(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    return profile;
  }
}

export default AuthService;
`;
    }
    generateAuthCallbackRoute() {
        return `import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin);
}
`;
    }
    generateSchemaTypes(config) {
        return `import type { Database } from './types';

// Export database types
export type Tables = Database['public']['Tables'];
export type Views = Database['public']['Views'];
export type Functions = Database['public']['Functions'];
export type Enums = Database['public']['Enums'];
export type CompositeTypes = Database['public']['CompositeTypes'];

// Export specific table types
export type Profile = Tables['profiles']['Row'];
export type ProfileInsert = Tables['profiles']['Insert'];
export type ProfileUpdate = Tables['profiles']['Update'];

// Export auth types
export type User = Profile;
export type UserInsert = ProfileInsert;
export type UserUpdate = ProfileUpdate;

// Realtime event types
export type RealtimeEvent = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  schema: string;
  table: string;
  record: any;
  oldRecord: any;
};

// Storage types
export type StorageFile = {
  id: string;
  name: string;
  bucket_id: string;
  owner: string;
  created_at: string;
  updated_at: string;
  last_accessed_at: string;
  metadata: Record<string, any>;
};

export type StorageBucket = {
  id: string;
  name: string;
  public: boolean;
  file_size_limit: number;
  allowed_mime_types: string[];
};

// Edge function types
export type EdgeFunction = {
  id: string;
  name: string;
  slug: string;
  version: string;
  created_at: string;
  updated_at: string;
  verify_jwt: boolean;
  import_map: boolean;
  entrypoint_path: string;
};

// Database schema validation
export const validateProfile = (profile: any): profile is Profile => {
  return (
    typeof profile === 'object' &&
    profile !== null &&
    typeof profile.id === 'string' &&
    (profile.email === null || typeof profile.email === 'string') &&
    (profile.full_name === null || typeof profile.full_name === 'string') &&
    (profile.avatar_url === null || typeof profile.avatar_url === 'string') &&
    typeof profile.created_at === 'string' &&
    typeof profile.updated_at === 'string'
  );
};

// Helper types for common operations
export type CreateProfileData = Omit<ProfileInsert, 'id' | 'created_at' | 'updated_at'>;
export type UpdateProfileData = Partial<Omit<ProfileUpdate, 'id' | 'created_at' | 'updated_at'>>;

// Pagination types
export type PaginationParams = {
  page?: number;
  limit?: number;
  offset?: number;
};

export type PaginatedResult<T> = {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

// Filter types
export type ProfileFilters = {
  email?: string;
  full_name?: string;
  created_after?: string;
  created_before?: string;
};

// Sort types
export type SortOrder = 'asc' | 'desc';
export type ProfileSortBy = 'created_at' | 'updated_at' | 'full_name' | 'email';

export type SortParams = {
  column: ProfileSortBy;
  order: SortOrder;
};
`;
    }
    generateUnifiedIndex() {
        return `/**
 * Supabase Unified Interface
 * 
 * This file provides a unified interface for all Supabase functionality
 * including database operations, authentication, storage, and real-time features.
 */

// Core exports
export { supabase } from './client';
export { default as DatabaseService } from './database';
export { default as AuthService } from './auth';

// Type exports
export type {
  Database,
  User,
  UserInsert,
  UserUpdate,
  Profile,
  ProfileInsert,
  ProfileUpdate,
  RealtimeEvent,
  StorageFile,
  StorageBucket,
  EdgeFunction,
  CreateProfileData,
  UpdateProfileData,
  PaginationParams,
  PaginatedResult,
  ProfileFilters,
  SortOrder,
  ProfileSortBy,
  SortParams
} from './types';

export type {
  Tables,
  Views,
  Functions,
  Enums,
  CompositeTypes,
  validateProfile
} from './schema';

// Utility functions
export { getCurrentUser, getCurrentSession, signOut, getUserProfile, updateUserProfile } from './client';

// Re-export commonly used functions for convenience
export const db = DatabaseService;
export const auth = AuthService;

// Default export for easy importing
export default {
  supabase,
  db: DatabaseService,
  auth: AuthService,
  getCurrentUser,
  getCurrentSession,
  signOut,
  getUserProfile,
  updateUserProfile
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
//# sourceMappingURL=supabase-plugin.js.map