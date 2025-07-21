/**
 * Supabase Database Provider Plugin - Pure Technology Implementation
 *
 * Provides Supabase PostgreSQL database infrastructure setup.
 * Focuses only on database technology setup and artifact generation.
 * Authentication functionality is handled by separate auth plugins.
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
    // PLUGIN LIFECYCLE - Pure Technology Implementation
    // ============================================================================
    async install(context) {
        const startTime = Date.now();
        try {
            const { projectName, projectPath, pluginConfig } = context;
            context.logger.info('Installing Supabase database infrastructure...');
            // Step 1: Install dependencies
            await this.installDependencies(context);
            // Step 2: Initialize Supabase configuration
            await this.initializeSupabaseConfig(context);
            // Step 3: Create database connection and utilities
            await this.createDatabaseFiles(context);
            // Step 4: Generate unified interface files
            await this.generateUnifiedInterfaceFiles(context);
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: [
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'db', 'supabase.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'db', 'types.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'db', 'index.ts')
                    }
                ],
                dependencies: [
                    {
                        name: '@supabase/supabase-js',
                        version: '^2.39.0',
                        type: 'production',
                        category: PluginCategory.DATABASE
                    }
                ],
                scripts: [
                    {
                        name: 'db:generate-types',
                        command: 'npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/db/types.ts',
                        description: 'Generate Supabase TypeScript types',
                        category: 'dev'
                    }
                ],
                configs: [
                    {
                        file: '.env',
                        content: this.generateEnvConfig(pluginConfig),
                        mergeStrategy: 'append'
                    }
                ],
                errors: [],
                warnings: [],
                duration
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to install Supabase database', startTime, [], error);
        }
    }
    async uninstall(context) {
        const startTime = Date.now();
        try {
            const { projectPath } = context;
            context.logger.info('Uninstalling Supabase database...');
            // Remove Supabase database files
            const filesToRemove = [
                path.join(projectPath, 'src', 'lib', 'db', 'supabase.ts'),
                path.join(projectPath, 'src', 'lib', 'db', 'types.ts')
            ];
            for (const file of filesToRemove) {
                if (await fsExtra.pathExists(file)) {
                    await fsExtra.remove(file);
                }
            }
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [],
                warnings: ['Supabase database files removed. You may need to manually remove dependencies from package.json'],
                duration
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to uninstall Supabase database', startTime, [], error);
        }
    }
    async update(context) {
        const startTime = Date.now();
        try {
            context.logger.info('Updating Supabase database...');
            // Update dependencies
            await this.runner.execCommand(['npm', 'update', '@supabase/supabase-js']);
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
            return this.createErrorResult('Failed to update Supabase database', startTime, [], error);
        }
    }
    async validate(context) {
        const errors = [];
        const warnings = [];
        try {
            // Check if Supabase client is properly configured
            const supabasePath = path.join(context.projectPath, 'src', 'lib', 'db', 'supabase.ts');
            if (!await fsExtra.pathExists(supabasePath)) {
                errors.push({
                    field: 'supabase.client',
                    message: 'Supabase client configuration file not found',
                    code: 'MISSING_CLIENT',
                    severity: 'error'
                });
            }
            // Validate environment variables
            const envPath = path.join(context.projectPath, '.env');
            if (await fsExtra.pathExists(envPath)) {
                const envContent = await fsExtra.readFile(envPath, 'utf-8');
                if (!envContent.includes('SUPABASE_URL')) {
                    warnings.push('SUPABASE_URL not found in .env file');
                }
                if (!envContent.includes('SUPABASE_ANON_KEY')) {
                    warnings.push('SUPABASE_ANON_KEY not found in .env file');
                }
            }
            return {
                valid: errors.length === 0,
                errors,
                warnings
            };
        }
        catch (error) {
            return {
                valid: false,
                errors: [{
                        field: 'validation',
                        message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                        code: 'VALIDATION_ERROR',
                        severity: 'error'
                    }],
                warnings: []
            };
        }
    }
    getCompatibility() {
        return {
            frameworks: ['nextjs', 'react', 'vue', 'angular'],
            platforms: [TargetPlatform.WEB, TargetPlatform.SERVER],
            nodeVersions: ['>=16.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
            databases: ['postgresql'],
            conflicts: []
        };
    }
    getDependencies() {
        return ['@supabase/supabase-js'];
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
                type: 'config',
                name: 'SUPABASE_URL',
                description: 'Supabase project URL',
                optional: false
            },
            {
                type: 'config',
                name: 'SUPABASE_ANON_KEY',
                description: 'Supabase anonymous key',
                optional: false
            }
        ];
    }
    getDefaultConfig() {
        return {
            supabaseUrl: 'https://your-project.supabase.co',
            supabaseAnonKey: 'your-anon-key',
            enableRealtime: true,
            enableEdgeFunctions: false,
            enableStorage: false
        };
    }
    getConfigSchema() {
        return {
            type: 'object',
            properties: {
                supabaseUrl: {
                    type: 'string',
                    description: 'Supabase project URL',
                    default: 'https://your-project.supabase.co'
                },
                supabaseAnonKey: {
                    type: 'string',
                    description: 'Supabase anonymous key',
                    minLength: 1
                },
                enableRealtime: {
                    type: 'boolean',
                    description: 'Enable real-time subscriptions',
                    default: true
                },
                enableEdgeFunctions: {
                    type: 'boolean',
                    description: 'Enable edge functions',
                    default: false
                },
                enableStorage: {
                    type: 'boolean',
                    description: 'Enable file storage',
                    default: false
                }
            },
            required: ['supabaseUrl', 'supabaseAnonKey']
        };
    }
    // ============================================================================
    // PRIVATE IMPLEMENTATION METHODS
    // ============================================================================
    async installDependencies(context) {
        const { projectPath } = context;
        context.logger.info('Installing Supabase dependencies...');
        const dependencies = [
            '@supabase/supabase-js@^2.39.0'
        ];
        await this.runner.execCommand(['npm', 'install', ...dependencies], { cwd: projectPath });
    }
    async initializeSupabaseConfig(context) {
        const { projectPath, pluginConfig } = context;
        context.logger.info('Initializing Supabase configuration...');
        // Create database lib directory
        const dbLibDir = path.join(projectPath, 'src', 'lib', 'db');
        await fsExtra.ensureDir(dbLibDir);
        // Generate Supabase client configuration
        const clientContent = this.generateSupabaseClient(pluginConfig);
        await fsExtra.writeFile(path.join(dbLibDir, 'supabase.ts'), clientContent);
        // Generate database types
        const typesContent = this.generateTypes();
        await fsExtra.writeFile(path.join(dbLibDir, 'types.ts'), typesContent);
    }
    async createDatabaseFiles(context) {
        const { projectPath } = context;
        context.logger.info('Creating database connection files...');
        const dbLibDir = path.join(projectPath, 'src', 'lib', 'db');
        await fsExtra.ensureDir(dbLibDir);
        // Generate database client
        const clientContent = this.generateDatabaseClient();
        await fsExtra.writeFile(path.join(dbLibDir, 'client.ts'), clientContent);
    }
    async generateUnifiedInterfaceFiles(context) {
        const { projectPath } = context;
        context.logger.info('Generating unified interface files...');
        const dbLibDir = path.join(projectPath, 'src', 'lib', 'db');
        await fsExtra.ensureDir(dbLibDir);
        // Generate unified database interface
        const unifiedContent = this.generateUnifiedIndex();
        await fsExtra.writeFile(path.join(dbLibDir, 'index.ts'), unifiedContent);
    }
    generateSupabaseClient(config) {
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
    generateTypes() {
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
    generateDatabaseClient() {
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
    generateUnifiedIndex() {
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
    generateEnvConfig(config) {
        return `# Supabase Database Configuration
SUPABASE_URL="${config.supabaseUrl || 'https://your-project.supabase.co'}"
SUPABASE_ANON_KEY="${config.supabaseAnonKey || 'your-anon-key'}"
SUPABASE_SERVICE_ROLE_KEY="${config.supabaseServiceKey || 'your-service-role-key'}"

# Database URL for ORM usage
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
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
                {
                    code: 'SUPABASE_INSTALL_ERROR',
                    message,
                    details: originalError,
                    severity: 'error'
                },
                ...errors
            ],
            warnings: [],
            duration
        };
    }
}
//# sourceMappingURL=supabase-plugin.js.map