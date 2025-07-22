export class SupabaseGenerator {
    static generateSupabaseClient(config) {
        const enableRealtime = config.enableRealtime !== false;
        const enableEdgeFunctions = config.enableEdgeFunctions === true;
        const enableStorage = config.enableStorage === true;
        return `import { createClient } from '@supabase/supabase-js';
import type { Database } from './types.js';

// Supabase client configuration
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with configuration
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: ${enableRealtime ? '10' : '0'}
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'the-architech-supabase'
    }
  }
});

// Database connection for ORM usage
export const sql = supabase;

// Health check utility
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('_dummy_table_for_connection_test').select('*').limit(1);
    return !error;
  } catch {
    return false;
  }
}

// Export for use with ORM plugins
export { supabase as db };
`;
    }
    static generateTypes() {
        return `/**
 * Supabase Database Types
 * 
 * This file contains TypeScript types for your Supabase database.
 * You can generate these types using the Supabase CLI:
 * 
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/db/types.ts
 */

export type Database = {
  public: {
    Tables: {
      // Define your table types here
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Add more tables as needed
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

// Re-export common types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
`;
    }
    static generateDatabaseClient() {
        return `/**
 * Database Client - Supabase Implementation
 * 
 * This file provides a unified database client interface
 * that works with Supabase PostgreSQL.
 */

import { supabase } from './supabase.js';
import type { Database } from './types.js';

// Database client for ORM usage
export const db = supabase;

// Connection utility
export const getConnection = () => supabase;

// Health check
export const healthCheck = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('_dummy_table_for_connection_test').select('*').limit(1);
    return !error;
  } catch {
    return false;
  }
};

// Export types
export type { Database } from './types.js';
`;
    }
    static generateUnifiedIndex() {
        return `/**
 * Unified Database Interface - Supabase Implementation
 * 
 * This file provides a unified interface for database operations
 * that works with Supabase PostgreSQL. It abstracts away Supabase-specific
 * details and provides a clean API for database operations.
 */

import { supabase } from './supabase.js';
import type { Database } from './types.js';

// ============================================================================
// UNIFIED DATABASE INTERFACE
// ============================================================================

export interface UnifiedDatabase {
  // Connection management
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  healthCheck: () => Promise<boolean>;
  
  // Query operations
  query: <T = any>(sql: string, params?: any[]) => Promise<T[]>;
  execute: (sql: string, params?: any[]) => Promise<void>;
  
  // Transaction support
  transaction: <T>(callback: (db: UnifiedDatabase) => Promise<T>) => Promise<T>;
  
  // Utility
  getConnectionString: () => string;
  getDatabaseInfo: () => Promise<DatabaseInfo>;
}

export interface DatabaseInfo {
  name: string;
  version: string;
  size: string;
  tables: string[];
}

// ============================================================================
// SUPABASE IMPLEMENTATION
// ============================================================================

export const createUnifiedDatabase = (): UnifiedDatabase => {
  return {
    // Connection management
    async connect() {
      // Supabase client is auto-connected
      const { data, error } = await supabase.from('_dummy_table_for_connection_test').select('*').limit(1);
      if (error && error.code !== 'PGRST116') {
        throw new Error(\`Database connection failed: \${error.message}\`);
      }
    },

    async disconnect() {
      // Supabase client doesn't need explicit disconnection
    },

    async healthCheck() {
      try {
        const { data, error } = await supabase.from('_dummy_table_for_connection_test').select('*').limit(1);
        return !error || error.code === 'PGRST116';
      } catch {
        return false;
      }
    },

    // Query operations
    async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
      // Note: Supabase doesn't support raw SQL queries directly
      // This is a simplified implementation
      throw new Error('Raw SQL queries are not supported in Supabase. Use the Supabase client methods instead.');
    },

    async execute(sql: string, params?: any[]): Promise<void> {
      // Note: Supabase doesn't support raw SQL execution directly
      throw new Error('Raw SQL execution is not supported in Supabase. Use the Supabase client methods instead.');
    },

    // Transaction support
    async transaction<T>(callback: (db: UnifiedDatabase) => Promise<T>): Promise<T> {
      // Note: Supabase doesn't support explicit transactions in the client
      // This is a simplified implementation
      return await callback(this);
    },

    // Utility
    getConnectionString(): string {
      return process.env.SUPABASE_URL || '';
    },

    async getDatabaseInfo(): Promise<DatabaseInfo> {
      return {
        name: 'Supabase PostgreSQL',
        version: 'PostgreSQL 15',
        size: 'Unknown',
        tables: []
      };
    },
  };
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export const database = createUnifiedDatabase();
export default database;

// ============================================================================
// RE-EXPORTS
// ============================================================================

export { supabase, db } from './supabase.js';
export type { Database } from './types.js';
`;
    }
    static generateEnvConfig(config) {
        return `# Supabase Database Configuration
SUPABASE_URL="${config.supabaseUrl || 'https://your-project.supabase.co'}"
SUPABASE_ANON_KEY="${config.supabaseAnonKey || 'your-anon-key'}"
SUPABASE_SERVICE_ROLE_KEY="${config.supabaseServiceKey || 'your-service-role-key'}"

# Database URL for ORM usage
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Feature Flags
SUPABASE_ENABLE_REALTIME="${config.enableRealtime !== false ? 'true' : 'false'}"
SUPABASE_ENABLE_EDGE_FUNCTIONS="${config.enableEdgeFunctions ? 'true' : 'false'}"
SUPABASE_ENABLE_STORAGE="${config.enableStorage ? 'true' : 'false'}"

# Connection Settings
SUPABASE_ENABLE_SSL="${config.enableSSL !== false ? 'true' : 'false'}"
SUPABASE_CONNECTION_POOL_SIZE="${config.connectionPoolSize || 10}"
SUPABASE_CONNECTION_TIMEOUT="${config.connectionTimeout || 10000}"
SUPABASE_QUERY_TIMEOUT="${config.queryTimeout || 30000}"

# Security Settings
SUPABASE_ENABLE_ROW_LEVEL_SECURITY="${config.enableRowLevelSecurity !== false ? 'true' : 'false'}"
SUPABASE_ENABLE_ENCRYPTION="${config.enableEncryption !== false ? 'true' : 'false'}"
SUPABASE_ENABLE_COMPRESSION="${config.enableCompression !== false ? 'true' : 'false'}"
SUPABASE_ENABLE_RATE_LIMITING="${config.enableRateLimiting !== false ? 'true' : 'false'}"
SUPABASE_MAX_REQUESTS_PER_MINUTE="${config.maxRequestsPerMinute || 1000}"

# Monitoring Settings
SUPABASE_ENABLE_MONITORING="${config.enableMonitoring !== false ? 'true' : 'false'}"
SUPABASE_ENABLE_METRICS="${config.enableMetrics !== false ? 'true' : 'false'}"
SUPABASE_ENABLE_ALERTS="${config.enableAlerts !== false ? 'true' : 'false'}"
SUPABASE_ENABLE_AUDIT_LOGS="${config.enableAuditLogs ? 'true' : 'false'}"

# Performance Settings
SUPABASE_ENABLE_CONNECTION_POOLING="${config.enableConnectionPooling !== false ? 'true' : 'false'}"
SUPABASE_ENABLE_QUERY_OPTIMIZATION="${config.enableQueryOptimization !== false ? 'true' : 'false'}"
SUPABASE_ENABLE_CACHING="${config.enableCaching ? 'true' : 'false'}"
SUPABASE_CACHE_SIZE="${config.cacheSize || 100}"
`;
    }
    static generatePackageJson(config) {
        const dependencies = {
            '@supabase/supabase-js': '^2.39.0',
            '@supabase/auth-helpers-nextjs': '^0.8.7',
            '@supabase/auth-helpers-react': '^0.4.2'
        };
        // Add optional dependencies based on features
        if (config.enableEdgeFunctions) {
            dependencies['@supabase/functions-js'] = '^2.0.0';
        }
        if (config.enableStorage) {
            dependencies['@supabase/storage-js'] = '^2.0.0';
        }
        return JSON.stringify({
            name: 'supabase-database',
            version: '0.1.0',
            private: true,
            scripts: {
                'db:connect': 'node -e \"require(\'./src/lib/db/supabase.js\').checkDatabaseConnection()\"',
                'db:health': 'node -e \"require(\'./src/lib/db/supabase.js\').healthCheck()\"',
                'db:generate-types': 'npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/db/types.ts',
                'db:migrate': 'npx supabase db push',
                'db:studio': 'npx supabase studio',
                'db:backup': 'npx supabase db dump'
            },
            dependencies
        }, null, 2);
    }
    static generateReadme() {
        return `# Supabase Database Setup

This project uses Supabase for PostgreSQL database infrastructure with real-time capabilities.

## Features

- **PostgreSQL Database**: Full PostgreSQL database with Row Level Security
- **Real-time Subscriptions**: Live data updates with WebSocket connections
- **Edge Functions**: Serverless functions at the edge
- **File Storage**: Object storage for files and media
- **Authentication**: Built-in authentication system
- **Row Level Security**: Fine-grained access control
- **Database Backups**: Automatic backups and point-in-time recovery

## Configuration

The Supabase database is configured in \`src/lib/db/supabase.ts\`. Key settings:

- **Project URL**: Set via \`SUPABASE_URL\` environment variable
- **Anonymous Key**: Set via \`SUPABASE_ANON_KEY\` environment variable
- **Service Role Key**: Set via \`SUPABASE_SERVICE_ROLE_KEY\` environment variable
- **Real-time**: Configurable real-time subscriptions
- **Edge Functions**: Optional edge function support
- **Storage**: Optional file storage support

## Environment Variables

Required:
- \`SUPABASE_URL\`: Your Supabase project URL
- \`SUPABASE_ANON_KEY\`: Anonymous key for client-side operations
- \`SUPABASE_SERVICE_ROLE_KEY\`: Service role key for server-side operations

Optional:
- \`DATABASE_URL\`: Direct PostgreSQL connection string
- \`SUPABASE_ENABLE_REALTIME\`: Enable real-time subscriptions
- \`SUPABASE_ENABLE_EDGE_FUNCTIONS\`: Enable edge functions
- \`SUPABASE_ENABLE_STORAGE\`: Enable file storage

## Usage

\`\`\`typescript
import { supabase } from '@/lib/db/supabase';

// Query data
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('status', 'active');

// Insert data
const { data, error } = await supabase
  .from('users')
  .insert([
    { name: 'John Doe', email: 'john@example.com' }
  ]);

// Real-time subscriptions
const subscription = supabase
  .channel('users')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'users' },
    (payload) => {
      console.log('Change received!', payload);
    }
  )
  .subscribe();

// File storage
const { data, error } = await supabase.storage
  .from('avatars')
  .upload('user-avatar.jpg', file);

// Edge functions
const { data, error } = await supabase.functions.invoke('hello-world');
\`\`\`

## Available Scripts

- \`npm run db:connect\` - Test database connection
- \`npm run db:health\` - Check database health
- \`npm run db:generate-types\` - Generate TypeScript types
- \`npm run db:migrate\` - Run database migrations
- \`npm run db:studio\` - Open Supabase Studio
- \`npm run db:backup\` - Create database backup

## Best Practices

1. **Row Level Security**: Always enable RLS for production
2. **Environment Variables**: Use different keys for client and server
3. **Real-time**: Use real-time subscriptions for live data
4. **Edge Functions**: Use edge functions for serverless logic
5. **Storage**: Use Supabase Storage for file management
6. **Monitoring**: Enable monitoring and alerts
7. **Backups**: Regular backups with point-in-time recovery

## Troubleshooting

### Connection Issues
- Verify \`SUPABASE_URL\` and keys are correct
- Check network connectivity
- Ensure project is active in Supabase dashboard

### Real-time Issues
- Verify real-time is enabled in project settings
- Check WebSocket connection status
- Monitor subscription limits

### Storage Issues
- Verify storage bucket exists and is public
- Check file size limits
- Ensure proper CORS configuration

### Edge Function Issues
- Verify function is deployed
- Check function logs in dashboard
- Ensure proper environment variables
`;
    }
    static generateCLIConfig() {
        return `# Supabase CLI Configuration
# Install Supabase CLI: npm install -g supabase

# Authentication
# supabase login

# Project management
# supabase projects list
# supabase projects create my-project
# supabase link --project-ref YOUR_PROJECT_REF

# Database operations
# supabase db reset
# supabase db push
# supabase db diff
# supabase db dump

# Edge functions
# supabase functions new hello-world
# supabase functions deploy hello-world
# supabase functions serve

# Storage
# supabase storage ls
# supabase storage cp file.jpg bucket-name/

# Monitoring
# supabase logs
# supabase status
`;
    }
}
//# sourceMappingURL=SupabaseGenerator.js.map