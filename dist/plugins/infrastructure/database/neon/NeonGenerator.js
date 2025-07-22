export class NeonGenerator {
    static generateNeonConfig(config) {
        const projectId = config.projectId || '';
        const branchId = config.branchId || '';
        const region = config.region || 'us-east-1';
        const poolSize = config.poolSize || 10;
        const ssl = config.ssl !== false;
        const maxConnections = config.maxConnections || 20;
        const idleTimeout = config.idleTimeout || 30000;
        const connectionTimeout = config.connectionTimeout || 10000;
        const statementTimeout = config.statementTimeout || 30000;
        const queryTimeout = config.queryTimeout || 30000;
        const applicationName = config.applicationName || 'the-architech-app';
        return `import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Neon configuration
export const neonConfig = {
  projectId: '${projectId}',
  branchId: '${branchId}',
  region: '${region}',
  poolSize: ${poolSize},
  ssl: ${ssl},
  maxConnections: ${maxConnections},
  idleTimeout: ${idleTimeout},
  connectionTimeout: ${connectionTimeout},
  statementTimeout: ${statementTimeout},
  queryTimeout: ${queryTimeout},
  applicationName: '${applicationName}',
  enableLogging: ${config.enableLogging !== false},
  enableMetrics: ${config.enableMetrics !== false},
  enableConnectionPooling: ${config.enableConnectionPooling !== false},
  enableReadReplicas: ${config.enableReadReplicas || false},
  enableAutoScaling: ${config.enableAutoScaling !== false},
  enableBranching: ${config.enableBranching !== false},
  enablePointInTimeRecovery: ${config.enablePointInTimeRecovery !== false},
  enableBackupRetention: ${config.enableBackupRetention !== false},
  backupRetentionDays: ${config.backupRetentionDays || 7},
  enableMonitoring: ${config.enableMonitoring !== false},
  enableAlerts: ${config.enableAlerts !== false},
  enableAuditLogs: ${config.enableAuditLogs || false},
  enableEncryption: ${config.enableEncryption !== false},
  enableCompression: ${config.enableCompression !== false},
  enableCaching: ${config.enableCaching || false},
  cacheSize: ${config.cacheSize || 100},
  enableQueryOptimization: ${config.enableQueryOptimization !== false},
  enableIndexOptimization: ${config.enableIndexOptimization !== false},
  enableVacuumOptimization: ${config.enableVacuumOptimization !== false},
  enableStatisticsCollection: ${config.enableStatisticsCollection !== false},
  enablePerformanceInsights: ${config.enablePerformanceInsights !== false}
};

// Database connection
export const sql = neon(process.env.DATABASE_URL!);

// Drizzle ORM instance (if using Drizzle)
export const db = drizzle(sql);

// Connection pool configuration
export const poolConfig = {
  min: 1,
  max: ${poolSize},
  idleTimeoutMillis: ${idleTimeout},
  connectionTimeoutMillis: ${connectionTimeout},
  statement_timeout: ${statementTimeout},
  query_timeout: ${queryTimeout},
  application_name: '${applicationName}',
  ssl: ${ssl}
};

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await sql\`SELECT 1\`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Connection info
export function getConnectionInfo() {
  return {
    provider: 'neon',
    region: '${region}',
    projectId: '${projectId}',
    branchId: '${branchId}',
    poolSize: ${poolSize},
    maxConnections: ${maxConnections},
    ssl: ${ssl},
    applicationName: '${applicationName}'
  };
}
`;
    }
    static generateNeonConnection(config) {
        const poolSize = config.poolSize || 10;
        const ssl = config.ssl !== false;
        const maxConnections = config.maxConnections || 20;
        const idleTimeout = config.idleTimeout || 30000;
        const connectionTimeout = config.connectionTimeout || 10000;
        const applicationName = config.applicationName || 'the-architech-app';
        return `import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { Pool } from 'pg';

// Neon serverless connection
export const sql = neon(process.env.DATABASE_URL!);

// Drizzle ORM instance
export const db = drizzle(sql);

// Traditional PostgreSQL connection pool (for complex queries)
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: ${ssl},
  max: ${maxConnections},
  idleTimeoutMillis: ${idleTimeout},
  connectionTimeoutMillis: ${connectionTimeout},
  application_name: '${applicationName}',
  statement_timeout: ${config.statementTimeout || 30000},
  query_timeout: ${config.queryTimeout || 30000}
});

// Connection management
export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected = false;

  private constructor() {}

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  async connect(): Promise<void> {
    try {
      // Test connection
      await sql\`SELECT 1\`;
      this.isConnected = true;
      console.log('✅ Connected to Neon database');
    } catch (error) {
      console.error('❌ Failed to connect to Neon database:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await pool.end();
      this.isConnected = false;
      console.log('✅ Disconnected from Neon database');
    } catch (error) {
      console.error('❌ Error disconnecting from Neon database:', error);
      throw error;
    }
  }

  isConnectedToDatabase(): boolean {
    return this.isConnected;
  }

  async healthCheck(): Promise<{ status: string; timestamp: string; responseTime: number }> {
    const startTime = Date.now();
    try {
      await sql\`SELECT 1\`;
      const responseTime = Date.now() - startTime;
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        responseTime
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime
      };
    }
  }
}

// Export singleton instance
export const databaseConnection = DatabaseConnection.getInstance();

// Utility functions
export async function executeQuery<T = any>(query: string, params?: any[]): Promise<T[]> {
  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Query execution failed:', error);
    throw error;
  }
}

export async function executeTransaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Migration utilities
export async function runMigrations(migrations: string[]): Promise<void> {
  for (const migration of migrations) {
    try {
      await sql.unsafe(migration);
      console.log(\`✅ Migration executed: \${migration.substring(0, 50)}...\`);
    } catch (error) {
      console.error(\`❌ Migration failed: \${migration.substring(0, 50)}...\`, error);
      throw error;
    }
  }
}

// Backup utilities
export async function createBackup(): Promise<string> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = \`backup-\${timestamp}\`;
    
    // This would typically use Neon's API or pg_dump
    console.log(\`Creating backup: \${backupName}\`);
    
    return backupName;
  } catch (error) {
    console.error('Backup creation failed:', error);
    throw error;
  }
}

// Performance monitoring
export async function getPerformanceMetrics(): Promise<any> {
  try {
    const metrics = await sql\`
      SELECT 
        schemaname,
        tablename,
        attname,
        n_distinct,
        correlation
      FROM pg_stats 
      WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
      ORDER BY n_distinct DESC
      LIMIT 10
    \`;
    
    return metrics;
  } catch (error) {
    console.error('Failed to get performance metrics:', error);
    return [];
  }
}
`;
    }
    static generateEnvConfig(config) {
        const projectId = config.projectId || '';
        const branchId = config.branchId || '';
        const region = config.region || 'us-east-1';
        return `# Neon Database Configuration
DATABASE_URL="postgresql://user:password@host:port/database"
NEON_PROJECT_ID="${projectId}"
NEON_BRANCH_ID="${branchId}"
NEON_REGION="${region}"

# Connection Settings
DB_POOL_SIZE="${config.poolSize || 10}"
DB_MAX_CONNECTIONS="${config.maxConnections || 20}"
DB_IDLE_TIMEOUT="${config.idleTimeout || 30000}"
DB_CONNECTION_TIMEOUT="${config.connectionTimeout || 10000}"
DB_STATEMENT_TIMEOUT="${config.statementTimeout || 30000}"
DB_QUERY_TIMEOUT="${config.queryTimeout || 30000}"
DB_APPLICATION_NAME="${config.applicationName || 'the-architech-app'}"

# SSL Configuration
DB_SSL="${config.ssl !== false ? 'true' : 'false'}"

# Feature Flags
DB_ENABLE_LOGGING="${config.enableLogging !== false ? 'true' : 'false'}"
DB_ENABLE_METRICS="${config.enableMetrics !== false ? 'true' : 'false'}"
DB_ENABLE_CONNECTION_POOLING="${config.enableConnectionPooling !== false ? 'true' : 'false'}"
DB_ENABLE_READ_REPLICAS="${config.enableReadReplicas || false ? 'true' : 'false'}"
DB_ENABLE_AUTO_SCALING="${config.enableAutoScaling !== false ? 'true' : 'false'}"
DB_ENABLE_BRANCHING="${config.enableBranching !== false ? 'true' : 'false'}"
DB_ENABLE_POINT_IN_TIME_RECOVERY="${config.enablePointInTimeRecovery !== false ? 'true' : 'false'}"
DB_ENABLE_BACKUP_RETENTION="${config.enableBackupRetention !== false ? 'true' : 'false'}"
DB_BACKUP_RETENTION_DAYS="${config.backupRetentionDays || 7}"
DB_ENABLE_MONITORING="${config.enableMonitoring !== false ? 'true' : 'false'}"
DB_ENABLE_ALERTS="${config.enableAlerts !== false ? 'true' : 'false'}"
DB_ENABLE_AUDIT_LOGS="${config.enableAuditLogs || false ? 'true' : 'false'}"
DB_ENABLE_ENCRYPTION="${config.enableEncryption !== false ? 'true' : 'false'}"
DB_ENABLE_COMPRESSION="${config.enableCompression !== false ? 'true' : 'false'}"
DB_ENABLE_CACHING="${config.enableCaching || false ? 'true' : 'false'}"
DB_CACHE_SIZE="${config.cacheSize || 100}"
DB_ENABLE_QUERY_OPTIMIZATION="${config.enableQueryOptimization !== false ? 'true' : 'false'}"
DB_ENABLE_INDEX_OPTIMIZATION="${config.enableIndexOptimization !== false ? 'true' : 'false'}"
DB_ENABLE_VACUUM_OPTIMIZATION="${config.enableVacuumOptimization !== false ? 'true' : 'false'}"
DB_ENABLE_STATISTICS_COLLECTION="${config.enableStatisticsCollection !== false ? 'true' : 'false'}"
DB_ENABLE_PERFORMANCE_INSIGHTS="${config.enablePerformanceInsights !== false ? 'true' : 'false'}"

# Neon CLI Configuration (optional)
NEON_API_KEY="your-neon-api-key-here"
NEON_CLI_PATH="/usr/local/bin/neon"

# Development Settings
NODE_ENV="development"
DB_LOG_LEVEL="info"
DB_DEBUG="${config.enableLogging !== false ? 'true' : 'false'}"
`;
    }
    static generatePackageJson(config) {
        const dependencies = {
            '@neondatabase/serverless': '^1.0.1',
            'pg': '^8.11.0',
            '@types/pg': '^8.10.0'
        };
        // Add ORM dependencies if needed
        if (config.enableConnectionPooling !== false) {
            dependencies['drizzle-orm'] = '^0.44.3';
            dependencies['drizzle-kit'] = '^0.31.4';
        }
        return JSON.stringify({
            name: 'neon-database',
            version: '0.1.0',
            private: true,
            scripts: {
                'db:connect': 'node -e \"require(\'./src/lib/database/neon.js\').databaseConnection.connect()\"',
                'db:health': 'node -e \"require(\'./src/lib/database/neon.js\').databaseConnection.healthCheck()\"',
                'db:migrate': 'drizzle-kit push',
                'db:studio': 'drizzle-kit studio',
                'db:generate': 'drizzle-kit generate',
                'db:backup': 'node scripts/backup.js'
            },
            dependencies
        }, null, 2);
    }
    static generateReadme() {
        return `# Neon Database Setup

This project uses Neon PostgreSQL for serverless database infrastructure.

## Features

- **Serverless PostgreSQL**: Auto-scaling database with pay-per-use pricing
- **Database Branching**: Create instant database branches for development
- **Connection Pooling**: Efficient connection management
- **SSL Encryption**: Secure connections by default
- **Auto-scaling**: Automatic resource scaling based on demand
- **Point-in-time Recovery**: Data protection and recovery
- **Monitoring**: Built-in performance monitoring and alerts

## Configuration

The Neon database is configured in \`src/lib/database/neon.ts\`. Key settings:

- **Connection URL**: Set via \`DATABASE_URL\` environment variable
- **Pool Size**: Number of connections in the pool (default: 10)
- **SSL**: Enabled by default for security
- **Timeouts**: Configurable connection and query timeouts
- **Region**: Choose the closest region for better performance

## Environment Variables

Required:
- \`DATABASE_URL\`: Neon database connection string

Optional:
- \`NEON_PROJECT_ID\`: Neon project identifier
- \`NEON_BRANCH_ID\`: Neon branch identifier
- \`NEON_REGION\`: Database region

## Usage

\`\`\`typescript
import { sql, db, databaseConnection } from '@/lib/database/neon';

// Connect to database
await databaseConnection.connect();

// Execute queries
const users = await sql\`SELECT * FROM users\`;

// Use with Drizzle ORM
const result = await db.select().from(usersTable);

// Health check
const health = await databaseConnection.healthCheck();
\`\`\`

## Available Scripts

- \`npm run db:connect\` - Test database connection
- \`npm run db:health\` - Check database health
- \`npm run db:migrate\` - Run database migrations
- \`npm run db:studio\` - Open Drizzle Studio
- \`npm run db:generate\` - Generate migration files
- \`npm run db:backup\` - Create database backup

## Best Practices

1. **Connection Management**: Use connection pooling for production
2. **SSL**: Always enable SSL for security
3. **Timeouts**: Set appropriate timeouts for your use case
4. **Monitoring**: Enable monitoring and alerts
5. **Backups**: Regular backups with point-in-time recovery
6. **Branching**: Use database branches for development
7. **Auto-scaling**: Leverage Neon's auto-scaling capabilities

## Troubleshooting

### Connection Issues
- Verify \`DATABASE_URL\` is correct
- Check network connectivity
- Ensure SSL is properly configured

### Performance Issues
- Monitor connection pool usage
- Check query performance with monitoring
- Consider read replicas for read-heavy workloads

### Migration Issues
- Use Drizzle Kit for schema management
- Test migrations in development branches
- Backup before major schema changes
`;
    }
    static generateCLIConfig() {
        return `# Neon CLI Configuration
# Install Neon CLI: npm install -g @neondatabase/cli

# Authentication
# neon auth login

# Project management
# neon projects list
# neon projects create my-project
# neon branches list --project-id <project-id>

# Database operations
# neon sql "SELECT version();" --project-id <project-id>
# neon branches create <branch-name> --project-id <project-id>

# Connection strings
# neon connection-string <branch-name> --project-id <project-id>

# Monitoring
# neon console --project-id <project-id>
`;
    }
}
//# sourceMappingURL=NeonGenerator.js.map