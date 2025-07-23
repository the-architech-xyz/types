import { ConfigSchema } from '../../../../types/plugins.js';

export interface NeonConfig {
  projectId?: string;
  branchId?: string;
  databaseUrl: string;
  region?: string;
  poolSize?: number;
  ssl?: boolean;
  maxConnections?: number;
  idleTimeout?: number;
  connectionTimeout?: number;
  statementTimeout?: number;
  queryTimeout?: number;
  applicationName?: string;
  enableLogging?: boolean;
  enableMetrics?: boolean;
  enableConnectionPooling?: boolean;
  enableReadReplicas?: boolean;
  enableAutoScaling?: boolean;
  enableBranching?: boolean;
  enablePointInTimeRecovery?: boolean;
  enableBackupRetention?: boolean;
  backupRetentionDays?: number;
  enableMonitoring?: boolean;
  enableAlerts?: boolean;
  enableAuditLogs?: boolean;
  enableEncryption?: boolean;
  enableCompression?: boolean;
  enableCaching?: boolean;
  cacheSize?: number;
  enableQueryOptimization?: boolean;
  enableIndexOptimization?: boolean;
  enableVacuumOptimization?: boolean;
  enableStatisticsCollection?: boolean;
  enablePerformanceInsights?: boolean;
}

export const NeonConfigSchema: ConfigSchema = {
  type: 'object',
  properties: {
    projectId: {
      type: 'string',
      description: 'Neon project ID',
      default: ''
    },
    branchId: {
      type: 'string',
      description: 'Neon branch ID',
      default: ''
    },
    databaseUrl: {
      type: 'string',
      description: 'Neon database connection URL',
      default: 'postgresql://user:password@host:port/database'
    },
    region: {
      type: 'string',
      description: 'Neon region for the database',
      default: 'us-east-1',
      enum: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1', 'ap-northeast-1']
    },
    poolSize: {
      type: 'number',
      description: 'Connection pool size',
      default: 10,
      minimum: 1,
      maximum: 100
    },
    ssl: {
      type: 'boolean',
      description: 'Enable SSL connection',
      default: true
    },
    maxConnections: {
      type: 'number',
      description: 'Maximum number of connections',
      default: 20,
      minimum: 1,
      maximum: 1000
    },
    idleTimeout: {
      type: 'number',
      description: 'Idle timeout in milliseconds',
      default: 30000,
      minimum: 1000,
      maximum: 300000
    },
    connectionTimeout: {
      type: 'number',
      description: 'Connection timeout in milliseconds',
      default: 10000,
      minimum: 1000,
      maximum: 60000
    },
    statementTimeout: {
      type: 'number',
      description: 'Statement timeout in milliseconds',
      default: 30000,
      minimum: 1000,
      maximum: 300000
    },
    queryTimeout: {
      type: 'number',
      description: 'Query timeout in milliseconds',
      default: 30000,
      minimum: 1000,
      maximum: 300000
    },
    applicationName: {
      type: 'string',
      description: 'Application name for connection identification',
      default: 'the-architech-app'
    },
    enableLogging: {
      type: 'boolean',
      description: 'Enable database logging',
      default: true
    },
    enableMetrics: {
      type: 'boolean',
      description: 'Enable database metrics collection',
      default: true
    },
    enableConnectionPooling: {
      type: 'boolean',
      description: 'Enable connection pooling',
      default: true
    },
    enableReadReplicas: {
      type: 'boolean',
      description: 'Enable read replicas',
      default: false
    },
    enableAutoScaling: {
      type: 'boolean',
      description: 'Enable auto-scaling',
      default: true
    },
    enableBranching: {
      type: 'boolean',
      description: 'Enable database branching',
      default: true
    },
    enablePointInTimeRecovery: {
      type: 'boolean',
      description: 'Enable point-in-time recovery',
      default: true
    },
    enableBackupRetention: {
      type: 'boolean',
      description: 'Enable backup retention',
      default: true
    },
    backupRetentionDays: {
      type: 'number',
      description: 'Number of days to retain backups',
      default: 7,
      minimum: 1,
      maximum: 365
    },
    enableMonitoring: {
      type: 'boolean',
      description: 'Enable database monitoring',
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
    enableQueryOptimization: {
      type: 'boolean',
      description: 'Enable query optimization',
      default: true
    },
    enableIndexOptimization: {
      type: 'boolean',
      description: 'Enable index optimization',
      default: true
    },
    enableVacuumOptimization: {
      type: 'boolean',
      description: 'Enable vacuum optimization',
      default: true
    },
    enableStatisticsCollection: {
      type: 'boolean',
      description: 'Enable statistics collection',
      default: true
    },
    enablePerformanceInsights: {
      type: 'boolean',
      description: 'Enable performance insights',
      default: true
    }
  },
  required: ['databaseUrl'],
  additionalProperties: false
};

export const NeonDefaultConfig: NeonConfig = {
  projectId: '',
  branchId: '',
  databaseUrl: 'postgresql://user:password@host:port/database',
  region: 'us-east-1',
  poolSize: 10,
  ssl: true,
  maxConnections: 20,
  idleTimeout: 30000,
  connectionTimeout: 10000,
  statementTimeout: 30000,
  queryTimeout: 30000,
  applicationName: 'the-architech-app',
  enableLogging: true,
  enableMetrics: true,
  enableConnectionPooling: true,
  enableReadReplicas: false,
  enableAutoScaling: true,
  enableBranching: true,
  enablePointInTimeRecovery: true,
  enableBackupRetention: true,
  backupRetentionDays: 7,
  enableMonitoring: true,
  enableAlerts: true,
  enableAuditLogs: false,
  enableEncryption: true,
  enableCompression: true,
  enableCaching: false,
  cacheSize: 100,
  enableQueryOptimization: true,
  enableIndexOptimization: true,
  enableVacuumOptimization: true,
  enableStatisticsCollection: true,
  enablePerformanceInsights: true
}; 