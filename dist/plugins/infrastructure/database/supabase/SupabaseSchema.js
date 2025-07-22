export const SupabaseConfigSchema = {
    type: 'object',
    properties: {
        databaseUrl: {
            type: 'string',
            description: 'Supabase database connection URL',
            default: 'postgresql://postgres:[password]@[host]:5432/postgres'
        },
        supabaseUrl: {
            type: 'string',
            description: 'Supabase project URL',
            default: 'https://[project-id].supabase.co'
        },
        supabaseAnonKey: {
            type: 'string',
            description: 'Supabase anonymous key for client-side operations',
            default: ''
        },
        supabaseServiceKey: {
            type: 'string',
            description: 'Supabase service role key for server-side operations',
            default: ''
        },
        enableRealtime: {
            type: 'boolean',
            description: 'Enable real-time subscriptions',
            default: true
        },
        enableEdgeFunctions: {
            type: 'boolean',
            description: 'Enable edge functions',
            default: true
        },
        enableStorage: {
            type: 'boolean',
            description: 'Enable file storage',
            default: true
        },
        enableSSL: {
            type: 'boolean',
            description: 'Enable SSL connections',
            default: true
        },
        connectionPoolSize: {
            type: 'number',
            description: 'Connection pool size',
            default: 10,
            minimum: 1,
            maximum: 100
        },
        connectionTimeout: {
            type: 'number',
            description: 'Connection timeout in milliseconds',
            default: 10000,
            minimum: 1000,
            maximum: 60000
        },
        queryTimeout: {
            type: 'number',
            description: 'Query timeout in milliseconds',
            default: 30000,
            minimum: 1000,
            maximum: 300000
        },
        enableRowLevelSecurity: {
            type: 'boolean',
            description: 'Enable Row Level Security (RLS)',
            default: true
        },
        enableDatabaseWebhooks: {
            type: 'boolean',
            description: 'Enable database webhooks',
            default: false
        },
        enableDatabaseBackups: {
            type: 'boolean',
            description: 'Enable automatic database backups',
            default: true
        },
        enableDatabaseLogs: {
            type: 'boolean',
            description: 'Enable database logging',
            default: true
        },
        enableConnectionPooling: {
            type: 'boolean',
            description: 'Enable connection pooling',
            default: true
        },
        enableQueryOptimization: {
            type: 'boolean',
            description: 'Enable query optimization',
            default: true
        },
        enableCaching: {
            type: 'boolean',
            description: 'Enable query caching',
            default: false
        },
        cacheSize: {
            type: 'number',
            description: 'Cache size in MB',
            default: 100,
            minimum: 10,
            maximum: 10000
        },
        enableMonitoring: {
            type: 'boolean',
            description: 'Enable database monitoring',
            default: true
        },
        enableMetrics: {
            type: 'boolean',
            description: 'Enable metrics collection',
            default: true
        },
        enableAlerts: {
            type: 'boolean',
            description: 'Enable database alerts',
            default: true
        },
        enableAuditLogs: {
            type: 'boolean',
            description: 'Enable audit logs',
            default: false
        },
        enableEncryption: {
            type: 'boolean',
            description: 'Enable data encryption',
            default: true
        },
        enableCompression: {
            type: 'boolean',
            description: 'Enable data compression',
            default: true
        },
        enableRateLimiting: {
            type: 'boolean',
            description: 'Enable rate limiting',
            default: true
        },
        maxRequestsPerMinute: {
            type: 'number',
            description: 'Maximum requests per minute',
            default: 1000,
            minimum: 100,
            maximum: 10000
        }
    },
    required: ['databaseUrl', 'supabaseUrl', 'supabaseAnonKey'],
    additionalProperties: false
};
export const SupabaseDefaultConfig = {
    // Database configuration
    databaseUrl: 'postgresql://postgres:[password]@[host]:5432/postgres',
    supabaseUrl: 'https://[project-id].supabase.co',
    supabaseAnonKey: '',
    supabaseServiceKey: '',
    // Database features
    enableRealtime: true,
    enableEdgeFunctions: true,
    enableStorage: true,
    // Connection settings
    enableSSL: true,
    connectionPoolSize: 10,
    connectionTimeout: 10000,
    queryTimeout: 30000,
    // Feature flags
    enableRowLevelSecurity: true,
    enableDatabaseWebhooks: false,
    enableDatabaseBackups: true,
    enableDatabaseLogs: true,
    // Performance settings
    enableConnectionPooling: true,
    enableQueryOptimization: true,
    enableCaching: false,
    cacheSize: 100,
    // Monitoring
    enableMonitoring: true,
    enableMetrics: true,
    enableAlerts: true,
    enableAuditLogs: false,
    // Security
    enableEncryption: true,
    enableCompression: true,
    enableRateLimiting: true,
    maxRequestsPerMinute: 1000
};
//# sourceMappingURL=SupabaseSchema.js.map