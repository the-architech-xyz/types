/**
 * Supabase Database Provider Plugin - Pure Technology Implementation
 *
 * Provides Supabase PostgreSQL database infrastructure setup.
 * Focuses only on database technology setup and artifact generation.
 * Authentication functionality is handled by separate auth plugins.
 * No user interaction or business logic - that's handled by agents.
 */
import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginCategory } from '../../../../types/plugins.js';
import { SupabaseConfigSchema } from './SupabaseSchema.js';
import { SupabaseGenerator } from './SupabaseGenerator.js';
export class SupabasePlugin extends BasePlugin {
    generator;
    constructor() {
        super();
        // Generator will be initialized in install method when pathResolver is available
    }
    // ============================================================================
    // PLUGIN METADATA
    // ============================================================================
    getMetadata() {
        return {
            id: 'supabase',
            name: 'Supabase Database',
            version: '1.0.0',
            description: 'Open-source Firebase alternative with PostgreSQL database infrastructure',
            author: 'The Architech Team',
            category: PluginCategory.DATABASE,
            tags: ['database', 'postgresql', 'realtime', 'edge-functions', 'storage', 'supabase', 'firebase-alternative'],
            license: 'Apache-2.0',
            repository: 'https://github.com/supabase/supabase',
            homepage: 'https://supabase.com',
            documentation: 'https://supabase.com/docs'
        };
    }
    // ============================================================================
    // ENHANCED PLUGIN INTERFACE IMPLEMENTATIONS
    // ============================================================================
    getParameterSchema() {
        return {
            category: PluginCategory.DATABASE,
            groups: [
                { id: 'connection', name: 'Connection Settings', description: 'Configure Supabase connection parameters.', order: 1, parameters: ['supabaseUrl', 'supabaseAnonKey', 'supabaseServiceKey'] },
                { id: 'features', name: 'Features', description: 'Enable Supabase features.', order: 2, parameters: ['enableRealtime', 'enableEdgeFunctions', 'enableStorage'] },
                { id: 'performance', name: 'Performance', description: 'Configure performance settings.', order: 3, parameters: ['connectionPoolSize', 'connectionTimeout', 'queryTimeout'] }
            ],
            parameters: [
                {
                    id: 'supabaseUrl',
                    name: 'Supabase URL',
                    type: 'string',
                    description: 'Your Supabase project URL',
                    required: true,
                    group: 'connection'
                },
                {
                    id: 'supabaseAnonKey',
                    name: 'Anonymous Key',
                    type: 'string',
                    description: 'Supabase anonymous key for client-side operations',
                    required: true,
                    group: 'connection'
                },
                {
                    id: 'supabaseServiceKey',
                    name: 'Service Key',
                    type: 'string',
                    description: 'Supabase service role key for server-side operations',
                    required: false,
                    group: 'connection'
                },
                {
                    id: 'enableRealtime',
                    name: 'Enable Realtime',
                    type: 'boolean',
                    description: 'Enable real-time subscriptions',
                    required: false,
                    default: true,
                    group: 'features'
                },
                {
                    id: 'enableEdgeFunctions',
                    name: 'Enable Edge Functions',
                    type: 'boolean',
                    description: 'Enable edge functions',
                    required: false,
                    default: true,
                    group: 'features'
                },
                {
                    id: 'enableStorage',
                    name: 'Enable Storage',
                    type: 'boolean',
                    description: 'Enable file storage',
                    required: false,
                    default: true,
                    group: 'features'
                },
                {
                    id: 'connectionPoolSize',
                    name: 'Connection Pool Size',
                    type: 'number',
                    description: 'Connection pool size',
                    required: false,
                    default: 10,
                    group: 'performance'
                },
                {
                    id: 'connectionTimeout',
                    name: 'Connection Timeout',
                    type: 'number',
                    description: 'Connection timeout in milliseconds',
                    required: false,
                    default: 10000,
                    group: 'performance'
                },
                {
                    id: 'queryTimeout',
                    name: 'Query Timeout',
                    type: 'number',
                    description: 'Query timeout in milliseconds',
                    required: false,
                    default: 30000,
                    group: 'performance'
                }
            ],
            dependencies: [],
            validations: []
        };
    }
    validateConfiguration(config) {
        const errors = [];
        const warnings = [];
        // Validate required fields
        if (!config.supabaseUrl) {
            errors.push({
                field: 'supabaseUrl',
                message: 'Supabase project URL is required',
                code: 'MISSING_FIELD',
                severity: 'error'
            });
        }
        if (!config.supabaseAnonKey) {
            errors.push({
                field: 'supabaseAnonKey',
                message: 'Supabase anonymous key is required',
                code: 'MISSING_FIELD',
                severity: 'error'
            });
        }
        // URL validation
        if (config.supabaseUrl && !config.supabaseUrl.includes('supabase.co')) {
            warnings.push('Project URL should be from Supabase (supabase.co)');
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    generateUnifiedInterface(config) {
        return {
            category: PluginCategory.DATABASE,
            exports: [
                {
                    name: 'supabase',
                    type: 'class',
                    implementation: 'Supabase client instance',
                    documentation: 'Main Supabase client for database operations'
                },
                {
                    name: 'db',
                    type: 'constant',
                    implementation: 'Database connection utilities',
                    documentation: 'Database connection and utility functions'
                },
                {
                    name: 'types',
                    type: 'constant',
                    implementation: 'Database type definitions',
                    documentation: 'TypeScript type definitions for database schema'
                }
            ],
            types: [],
            utilities: [],
            constants: [],
            documentation: 'Supabase database integration with PostgreSQL support'
        };
    }
    // ============================================================================
    // IUIDatabasePlugin INTERFACE IMPLEMENTATIONS
    // ============================================================================
    getDatabaseProviders() {
        return ['supabase'];
    }
    getORMOptions() {
        return ['drizzle', 'prisma', 'kysely'];
    }
    getDatabaseFeatures() {
        return ['realtime', 'edge-functions', 'storage', 'auth', 'row-level-security'];
    }
    getConnectionOptions() {
        return ['direct', 'pooled', 'edge'];
    }
    getProviderLabel(provider) {
        return 'Supabase';
    }
    getProviderDescription(provider) {
        return 'Open-source Firebase alternative with PostgreSQL database infrastructure';
    }
    getFeatureLabel(feature) {
        const labels = {
            'realtime': 'Real-time subscriptions',
            'edge-functions': 'Edge Functions',
            'storage': 'File Storage',
            'auth': 'Authentication',
            'row-level-security': 'Row Level Security'
        };
        return labels[feature] || feature;
    }
    getFeatureDescription(feature) {
        const descriptions = {
            'realtime': 'Real-time database subscriptions and live updates',
            'edge-functions': 'Serverless functions running at the edge',
            'storage': 'File upload and management system',
            'auth': 'Built-in authentication and user management',
            'row-level-security': 'Database-level security policies'
        };
        return descriptions[feature] || feature;
    }
    // ============================================================================
    // PLUGIN LIFECYCLE - Pure Technology Implementation
    // ============================================================================
    async install(context) {
        const startTime = Date.now();
        try {
            const { projectName, projectPath, pluginConfig } = context;
            context.logger.info('Installing Supabase database infrastructure...');
            // Initialize path resolver
            this.initializePathResolver(context);
            // Initialize generator
            this.generator = new SupabaseGenerator();
            // Validate configuration
            const validation = this.validateConfiguration(pluginConfig);
            if (!validation.valid) {
                return this.createErrorResult('Invalid Supabase configuration', validation.errors, startTime);
            }
            // Step 1: Install dependencies
            await this.installDependencies(['@supabase/supabase-js', '@supabase/auth-helpers-nextjs']);
            // Step 2: Generate files using the generator
            const supabaseClient = SupabaseGenerator.generateSupabaseClient(pluginConfig);
            const types = SupabaseGenerator.generateTypes();
            const databaseClient = SupabaseGenerator.generateDatabaseClient();
            const unifiedIndex = SupabaseGenerator.generateUnifiedIndex();
            // Step 3: Write files to project
            await this.generateFile('src/lib/db/supabase.ts', supabaseClient);
            await this.generateFile('src/lib/db/types.ts', types);
            await this.generateFile('src/lib/db/client.ts', databaseClient);
            await this.generateFile('src/lib/db/index.ts', unifiedIndex);
            const duration = Date.now() - startTime;
            return this.createSuccessResult([
                { type: 'file', path: 'src/lib/db/supabase.ts' },
                { type: 'file', path: 'src/lib/db/types.ts' },
                { type: 'file', path: 'src/lib/db/client.ts' },
                { type: 'file', path: 'src/lib/db/index.ts' }
            ], [
                {
                    name: '@supabase/supabase-js',
                    version: '^2.39.0',
                    type: 'production',
                    category: PluginCategory.DATABASE
                },
                {
                    name: '@supabase/auth-helpers-nextjs',
                    version: '^0.8.0',
                    type: 'production',
                    category: PluginCategory.DATABASE
                }
            ], [], [], validation.warnings, startTime);
        }
        catch (error) {
            return this.createErrorResult('Failed to install Supabase database infrastructure', [], startTime);
        }
    }
    // ============================================================================
    // PLUGIN INTERFACE IMPLEMENTATIONS
    // ============================================================================
    getDependencies() {
        return ['@supabase/supabase-js', '@supabase/auth-helpers-nextjs'];
    }
    getDevDependencies() {
        return ['@supabase/cli'];
    }
    getCompatibility() {
        return {
            frameworks: ['nextjs', 'react', 'vue', 'svelte'],
            platforms: ['web', 'mobile'],
            nodeVersions: ['>=16.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm'],
            databases: ['postgresql'],
            conflicts: []
        };
    }
    getConflicts() {
        return [];
    }
    getRequirements() {
        return [
            {
                type: 'package',
                name: '@supabase/supabase-js',
                description: 'Supabase JavaScript client',
                version: '^2.39.0'
            },
            {
                type: 'service',
                name: 'supabase-project',
                description: 'Supabase project with PostgreSQL database'
            }
        ];
    }
    getDefaultConfig() {
        return {
            supabaseUrl: '',
            supabaseAnonKey: '',
            supabaseServiceKey: '',
            enableRealtime: true,
            enableEdgeFunctions: true,
            enableStorage: true,
            enableSSL: true,
            connectionPoolSize: 10,
            connectionTimeout: 10000,
            queryTimeout: 30000
        };
    }
    getConfigSchema() {
        return SupabaseConfigSchema;
    }
}
//# sourceMappingURL=SupabasePlugin.js.map