import { ConfigSchema } from '../../../../types/plugins.js';

export interface MongoDBConfig {
  // Database configuration
  databaseUrl: string;
  databaseName: string;
  
  // MongoDB specific
  enableReplicaSet: boolean;
  enableSharding: boolean;
  enableAtlas: boolean;
  enableCompression: boolean;
  enableRetryWrites: boolean;
  enableReadConcern: boolean;
  enableWriteConcern: boolean;
  connectionPoolSize: number;
  serverSelectionTimeout: number;
  socketTimeout: number;
  maxIdleTime: number;
  enableMonitoring: boolean;
  enableLogging: boolean;
  enableMetrics: boolean;
  enableTelemetry: boolean;
  
  // Advanced configuration
  readPreference: 'primary' | 'primaryPreferred' | 'secondary' | 'secondaryPreferred' | 'nearest';
  writeConcern: 'majority' | '1' | '2' | '3';
  readConcern: 'local' | 'majority' | 'linearizable' | 'snapshot';
  maxPoolSize: number;
  minPoolSize: number;
  maxIdleTimeMS: number;
  connectTimeoutMS: number;
  socketTimeoutMS: number;
  serverSelectionTimeoutMS: number;
  heartbeatFrequencyMS: number;
  retryWrites: boolean;
  retryReads: boolean;
  wtimeout: number;
  journal: boolean;
  fsync: boolean;
  safe: boolean;
  w: number | string;
  j: boolean;
  wtimeoutMS: number;
  readPreferenceTags: string[];
  maxStalenessSeconds: number;
  compressors: string[];
  zlibCompressionLevel: number;
  ssl: boolean;
  sslValidate: boolean;
  sslCA: string;
  sslCert: string;
  sslKey: string;
  sslPass: string;
  sslCRL: string;
  tls: boolean;
  tlsInsecure: boolean;
  tlsAllowInvalidCertificates: boolean;
  tlsAllowInvalidHostnames: boolean;
  tlsCAFile: string;
  tlsCertificateFile: string;
  tlsCertificateKeyFile: string;
  tlsCertificateKeyFilePassword: string;
  tlsCRLFile: string;
  authSource: string;
  authMechanism: string;
  authMechanismProperties: Record<string, any>;
  gssapiServiceName: string;
  gssapiHostName: string;
  gssapiRealm: string;
  gssapiCanonicalizeHostName: boolean;
  localThresholdMS: number;
  directConnection: boolean;
  appName: string;
  replicaSet: string;
  maxConnecting: number;
  loadBalanced: boolean;
  serverApi: {
    version: string;
    strict: boolean;
    deprecationErrors: boolean;
  };
}

export const MongoDBConfigSchema: ConfigSchema = {
  type: 'object',
  properties: {
    databaseUrl: {
      type: 'string',
      description: 'MongoDB connection string',
      default: 'mongodb://localhost:27017'
    },
    databaseName: {
      type: 'string',
      description: 'Database name',
      default: 'myapp'
    },
    enableReplicaSet: {
      type: 'boolean',
      description: 'Enable replica set support',
      default: false
    },
    enableSharding: {
      type: 'boolean',
      description: 'Enable sharding support',
      default: false
    },
    enableAtlas: {
      type: 'boolean',
      description: 'Enable MongoDB Atlas features',
      default: false
    },
    enableCompression: {
      type: 'boolean',
      description: 'Enable connection compression',
      default: true
    },
    enableRetryWrites: {
      type: 'boolean',
      description: 'Enable retry writes',
      default: true
    },
    enableReadConcern: {
      type: 'boolean',
      description: 'Enable read concern',
      default: true
    },
    enableWriteConcern: {
      type: 'boolean',
      description: 'Enable write concern',
      default: true
    },
    connectionPoolSize: {
      type: 'number',
      description: 'Connection pool size',
      default: 10,
      minimum: 1,
      maximum: 100
    },
    serverSelectionTimeout: {
      type: 'number',
      description: 'Server selection timeout in milliseconds',
      default: 30000,
      minimum: 1000,
      maximum: 300000
    },
    socketTimeout: {
      type: 'number',
      description: 'Socket timeout in milliseconds',
      default: 30000,
      minimum: 1000,
      maximum: 300000
    },
    maxIdleTime: {
      type: 'number',
      description: 'Maximum idle time in milliseconds',
      default: 30000,
      minimum: 1000,
      maximum: 300000
    },
    enableMonitoring: {
      type: 'boolean',
      description: 'Enable database monitoring',
      default: true
    },
    enableLogging: {
      type: 'boolean',
      description: 'Enable database logging',
      default: true
    },
    enableMetrics: {
      type: 'boolean',
      description: 'Enable metrics collection',
      default: true
    },
    enableTelemetry: {
      type: 'boolean',
      description: 'Enable telemetry',
      default: false
    },
    readPreference: {
      type: 'string',
      description: 'Read preference for queries',
      default: 'primary',
      enum: ['primary', 'primaryPreferred', 'secondary', 'secondaryPreferred', 'nearest']
    },
    writeConcern: {
      type: 'string',
      description: 'Write concern level',
      default: 'majority',
      enum: ['majority', '1', '2', '3']
    },
    readConcern: {
      type: 'string',
      description: 'Read concern level',
      default: 'local',
      enum: ['local', 'majority', 'linearizable', 'snapshot']
    },
    maxPoolSize: {
      type: 'number',
      description: 'Maximum connection pool size',
      default: 10,
      minimum: 1,
      maximum: 100
    },
    minPoolSize: {
      type: 'number',
      description: 'Minimum connection pool size',
      default: 0,
      minimum: 0,
      maximum: 50
    },
    maxIdleTimeMS: {
      type: 'number',
      description: 'Maximum idle time in milliseconds',
      default: 30000,
      minimum: 1000,
      maximum: 300000
    },
    connectTimeoutMS: {
      type: 'number',
      description: 'Connection timeout in milliseconds',
      default: 10000,
      minimum: 1000,
      maximum: 60000
    },
    socketTimeoutMS: {
      type: 'number',
      description: 'Socket timeout in milliseconds',
      default: 30000,
      minimum: 1000,
      maximum: 300000
    },
    serverSelectionTimeoutMS: {
      type: 'number',
      description: 'Server selection timeout in milliseconds',
      default: 30000,
      minimum: 1000,
      maximum: 300000
    },
    heartbeatFrequencyMS: {
      type: 'number',
      description: 'Heartbeat frequency in milliseconds',
      default: 10000,
      minimum: 1000,
      maximum: 60000
    },
    retryWrites: {
      type: 'boolean',
      description: 'Enable retry writes',
      default: true
    },
    retryReads: {
      type: 'boolean',
      description: 'Enable retry reads',
      default: true
    },
    wtimeout: {
      type: 'number',
      description: 'Write timeout in milliseconds',
      default: 10000,
      minimum: 1000,
      maximum: 60000
    },
    journal: {
      type: 'boolean',
      description: 'Enable journal writes',
      default: true
    },
    fsync: {
      type: 'boolean',
      description: 'Enable fsync writes',
      default: false
    },
    safe: {
      type: 'boolean',
      description: 'Enable safe writes',
      default: true
    },
    w: {
      type: 'number',
      description: 'Write concern value',
      default: 1,
      minimum: 0,
      maximum: 10
    },
    j: {
      type: 'boolean',
      description: 'Journal write concern',
      default: true
    },
    wtimeoutMS: {
      type: 'number',
      description: 'Write timeout in milliseconds',
      default: 10000,
      minimum: 1000,
      maximum: 60000
    },
    maxStalenessSeconds: {
      type: 'number',
      description: 'Maximum staleness in seconds',
      default: 90,
      minimum: 0,
      maximum: 86400
    },
    compressors: {
      type: 'array',
      description: 'Compression algorithms',
      items: {
        type: 'string',
        description: 'Compression algorithm',
        enum: ['zlib', 'snappy', 'zstd']
      },
      default: ['zlib']
    },
    zlibCompressionLevel: {
      type: 'number',
      description: 'Zlib compression level',
      default: 6,
      minimum: -1,
      maximum: 9
    },
    ssl: {
      type: 'boolean',
      description: 'Enable SSL connection',
      default: false
    },
    sslValidate: {
      type: 'boolean',
      description: 'Validate SSL certificates',
      default: true
    },
    tls: {
      type: 'boolean',
      description: 'Enable TLS connection',
      default: false
    },
    tlsInsecure: {
      type: 'boolean',
      description: 'Allow insecure TLS connections',
      default: false
    },
    tlsAllowInvalidCertificates: {
      type: 'boolean',
      description: 'Allow invalid TLS certificates',
      default: false
    },
    tlsAllowInvalidHostnames: {
      type: 'boolean',
      description: 'Allow invalid TLS hostnames',
      default: false
    },
    authSource: {
      type: 'string',
      description: 'Authentication source database',
      default: 'admin'
    },
    authMechanism: {
      type: 'string',
      description: 'Authentication mechanism',
      default: 'SCRAM-SHA-256',
      enum: ['SCRAM-SHA-1', 'SCRAM-SHA-256', 'MONGODB-CR', 'MONGODB-X509', 'GSSAPI', 'PLAIN', 'MONGODB-AWS']
    },
    localThresholdMS: {
      type: 'number',
      description: 'Local threshold in milliseconds',
      default: 15,
      minimum: 0,
      maximum: 1000
    },
    directConnection: {
      type: 'boolean',
      description: 'Use direct connection',
      default: false
    },
    appName: {
      type: 'string',
      description: 'Application name',
      default: 'the-architech-app'
    },
    replicaSet: {
      type: 'string',
      description: 'Replica set name',
      default: ''
    },
    maxConnecting: {
      type: 'number',
      description: 'Maximum connecting connections',
      default: 2,
      minimum: 1,
      maximum: 10
    },
    loadBalanced: {
      type: 'boolean',
      description: 'Enable load balancing',
      default: false
    }
  },
  required: ['databaseUrl', 'databaseName'],
  additionalProperties: false
};

export const MongoDBDefaultConfig: MongoDBConfig = {
  // Database configuration
  databaseUrl: 'mongodb://localhost:27017',
  databaseName: 'myapp',
  
  // MongoDB specific
  enableReplicaSet: false,
  enableSharding: false,
  enableAtlas: false,
  enableCompression: true,
  enableRetryWrites: true,
  enableReadConcern: true,
  enableWriteConcern: true,
  connectionPoolSize: 10,
  serverSelectionTimeout: 30000,
  socketTimeout: 30000,
  maxIdleTime: 30000,
  enableMonitoring: true,
  enableLogging: true,
  enableMetrics: true,
  enableTelemetry: false,
  
  // Advanced configuration
  readPreference: 'primary',
  writeConcern: 'majority',
  readConcern: 'local',
  maxPoolSize: 10,
  minPoolSize: 0,
  maxIdleTimeMS: 30000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 30000,
  serverSelectionTimeoutMS: 30000,
  heartbeatFrequencyMS: 10000,
  retryWrites: true,
  retryReads: true,
  wtimeout: 10000,
  journal: true,
  fsync: false,
  safe: true,
  w: 1,
  j: true,
  wtimeoutMS: 10000,
  readPreferenceTags: [],
  maxStalenessSeconds: 90,
  compressors: ['zlib'],
  zlibCompressionLevel: 6,
  ssl: false,
  sslValidate: true,
  sslCA: '',
  sslCert: '',
  sslKey: '',
  sslPass: '',
  sslCRL: '',
  tls: false,
  tlsInsecure: false,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  tlsCAFile: '',
  tlsCertificateFile: '',
  tlsCertificateKeyFile: '',
  tlsCertificateKeyFilePassword: '',
  tlsCRLFile: '',
  authSource: 'admin',
  authMechanism: 'SCRAM-SHA-256',
  authMechanismProperties: {},
  gssapiServiceName: '',
  gssapiHostName: '',
  gssapiRealm: '',
  gssapiCanonicalizeHostName: false,
  localThresholdMS: 15,
  directConnection: false,
  appName: 'the-architech-app',
  replicaSet: '',
  maxConnecting: 2,
  loadBalanced: false,
  serverApi: {
    version: '1',
    strict: false,
    deprecationErrors: false
  }
}; 