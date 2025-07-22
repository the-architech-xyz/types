/**
 * Sentry Monitoring Plugin - Pure Technology Implementation
 *
 * Provides Sentry error tracking and performance monitoring setup.
 * Focuses only on monitoring technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { PluginCategory, TargetPlatform } from '../../../../types/plugin.js';
import { templateService } from '../../../../core/templates/template-service.js';
import { CommandRunner } from '../../../../core/cli/command-runner.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
export class SentryPlugin {
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
            id: 'sentry',
            name: 'Sentry Monitoring',
            version: '1.0.0',
            description: 'Error tracking and performance monitoring with Sentry',
            author: 'The Architech Team',
            category: PluginCategory.MONITORING,
            tags: ['monitoring', 'error-tracking', 'performance', 'sentry', 'analytics'],
            license: 'MIT',
            repository: 'https://github.com/getsentry/sentry-javascript',
            homepage: 'https://sentry.io',
            documentation: 'https://docs.sentry.io'
        };
    }
    // ============================================================================
    // PLUGIN LIFECYCLE - Pure Technology Implementation
    // ============================================================================
    async install(context) {
        const startTime = Date.now();
        try {
            const { projectName, projectPath, pluginConfig } = context;
            context.logger.info('Installing Sentry monitoring...');
            // Step 1: Install dependencies
            await this.installDependencies(context);
            // Step 2: Initialize Sentry configuration
            await this.initializeSentryConfig(context);
            // Step 3: Create monitoring utilities
            await this.createMonitoringFiles(context);
            // Step 4: Generate unified interface files
            await this.generateUnifiedInterfaceFiles(context);
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: [
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'monitoring', 'sentry.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'monitoring', 'index.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'sentry.client.config.js')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'sentry.server.config.js')
                    }
                ],
                dependencies: [
                    {
                        name: '@sentry/nextjs',
                        version: '^7.0.0',
                        type: 'production',
                        category: PluginCategory.MONITORING
                    }
                ],
                scripts: [
                    {
                        name: 'sentry:sourcemaps',
                        command: 'npx @sentry/wizard --config wizard.json',
                        description: 'Upload source maps to Sentry',
                        category: 'deploy'
                    }
                ],
                configs: [
                    {
                        file: '.env',
                        content: this.generateEnvConfig(pluginConfig),
                        mergeStrategy: 'append'
                    },
                    {
                        file: 'sentry.properties',
                        content: this.generateSentryProperties(pluginConfig),
                        mergeStrategy: 'replace'
                    }
                ],
                errors: [],
                warnings: [],
                duration
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to install Sentry monitoring', startTime, [], error);
        }
    }
    async uninstall(context) {
        const startTime = Date.now();
        try {
            const { projectPath } = context;
            context.logger.info('Uninstalling Sentry monitoring...');
            // Remove Sentry files
            const filesToRemove = [
                path.join(projectPath, 'src', 'lib', 'monitoring'),
                path.join(projectPath, 'sentry.client.config.js'),
                path.join(projectPath, 'sentry.server.config.js'),
                path.join(projectPath, 'sentry.properties')
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
                warnings: ['Sentry files removed. You may need to manually remove dependencies from package.json'],
                duration
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to uninstall Sentry monitoring', startTime, [], error);
        }
    }
    async update(context) {
        const startTime = Date.now();
        try {
            context.logger.info('Updating Sentry monitoring...');
            // Update dependencies
            await this.runner.execCommand(['npm', 'update', '@sentry/nextjs']);
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
            return this.createErrorResult('Failed to update Sentry monitoring', startTime, [], error);
        }
    }
    async validate(context) {
        const errors = [];
        const warnings = [];
        try {
            // Check if Sentry configuration exists
            const sentryPath = path.join(context.projectPath, 'src', 'lib', 'monitoring', 'sentry.ts');
            if (!await fsExtra.pathExists(sentryPath)) {
                errors.push({
                    field: 'sentry.config',
                    message: 'Sentry configuration file not found',
                    code: 'MISSING_CONFIG',
                    severity: 'error'
                });
            }
            // Validate environment variables
            const envPath = path.join(context.projectPath, '.env');
            if (await fsExtra.pathExists(envPath)) {
                const envContent = await fsExtra.readFile(envPath, 'utf-8');
                if (!envContent.includes('SENTRY_DSN')) {
                    warnings.push('SENTRY_DSN not found in .env file');
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
            databases: ['postgresql', 'mysql', 'sqlite', 'mongodb'],
            conflicts: []
        };
    }
    getDependencies() {
        return ['@sentry/nextjs'];
    }
    getConflicts() {
        return [];
    }
    getRequirements() {
        return [
            {
                type: 'package',
                name: '@sentry/nextjs',
                description: 'Sentry SDK for Next.js',
                version: '^7.0.0'
            },
            {
                type: 'config',
                name: 'SENTRY_DSN',
                description: 'Sentry DSN for error reporting',
                optional: false
            }
        ];
    }
    getDefaultConfig() {
        return {
            dsn: '',
            environment: 'development',
            release: '1.0.0',
            enablePerformance: true,
            enableSessionTracking: true,
            enableSourceMaps: true,
            enableReplay: false
        };
    }
    getConfigSchema() {
        return {
            type: 'object',
            properties: {
                dsn: {
                    type: 'string',
                    description: 'Sentry DSN for error reporting',
                    default: ''
                },
                environment: {
                    type: 'string',
                    description: 'Environment name (development, staging, production)',
                    default: 'development'
                },
                release: {
                    type: 'string',
                    description: 'Release version',
                    default: '1.0.0'
                },
                enablePerformance: {
                    type: 'boolean',
                    description: 'Enable performance monitoring',
                    default: true
                },
                enableSessionTracking: {
                    type: 'boolean',
                    description: 'Enable session tracking',
                    default: true
                },
                enableSourceMaps: {
                    type: 'boolean',
                    description: 'Enable source map upload',
                    default: true
                },
                enableReplay: {
                    type: 'boolean',
                    description: 'Enable session replay',
                    default: false
                }
            },
            required: ['dsn']
        };
    }
    // ============================================================================
    // PRIVATE IMPLEMENTATION METHODS
    // ============================================================================
    async installDependencies(context) {
        const { projectPath } = context;
        context.logger.info('Installing Sentry dependencies...');
        const dependencies = [
            '@sentry/nextjs@^7.0.0'
        ];
        await this.runner.execCommand(['npm', 'install', ...dependencies], { cwd: projectPath });
    }
    async initializeSentryConfig(context) {
        const { projectPath, pluginConfig } = context;
        context.logger.info('Initializing Sentry configuration...');
        // Create monitoring lib directory
        const monitoringDir = path.join(projectPath, 'src', 'lib', 'monitoring');
        await fsExtra.ensureDir(monitoringDir);
        // Generate Sentry client configuration
        const clientConfigContent = this.generateSentryClientConfig(pluginConfig);
        await fsExtra.writeFile(path.join(projectPath, 'sentry.client.config.js'), clientConfigContent);
        // Generate Sentry server configuration
        const serverConfigContent = this.generateSentryServerConfig(pluginConfig);
        await fsExtra.writeFile(path.join(projectPath, 'sentry.server.config.js'), serverConfigContent);
        // Generate Sentry monitoring utilities
        const sentryContent = this.generateSentryMonitoring(pluginConfig);
        await fsExtra.writeFile(path.join(monitoringDir, 'sentry.ts'), sentryContent);
    }
    async createMonitoringFiles(context) {
        const { projectPath } = context;
        context.logger.info('Creating monitoring files...');
        const monitoringDir = path.join(projectPath, 'src', 'lib', 'monitoring');
        await fsExtra.ensureDir(monitoringDir);
        // Generate monitoring utilities
        const utilitiesContent = this.generateMonitoringUtilities();
        await fsExtra.writeFile(path.join(monitoringDir, 'utilities.ts'), utilitiesContent);
    }
    async generateUnifiedInterfaceFiles(context) {
        const { projectPath } = context;
        context.logger.info('Generating unified interface files...');
        const monitoringDir = path.join(projectPath, 'src', 'lib', 'monitoring');
        await fsExtra.ensureDir(monitoringDir);
        // Generate unified monitoring interface
        const unifiedContent = this.generateUnifiedIndex();
        await fsExtra.writeFile(path.join(monitoringDir, 'index.ts'), unifiedContent);
    }
    generateSentryClientConfig(config) {
        const enablePerformance = config.enablePerformance !== false;
        const enableSessionTracking = config.enableSessionTracking !== false;
        const enableReplay = config.enableReplay === true;
        return `import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: "${config.release || '1.0.0'}",
  
  // Performance monitoring
  ${enablePerformance ? `
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ["localhost", "your-domain.com"],
    }),
  ],` : ''}
  
  // Session tracking
  ${enableSessionTracking ? `
  autoSessionTracking: true,` : ''}
  
  // Session replay
  ${enableReplay ? `
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,` : ''}
  
  // Debug mode in development
  debug: process.env.NODE_ENV === 'development',
  
  // Before send hook
  beforeSend(event, hint) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },
});`;
    }
    generateSentryServerConfig(config) {
        const enablePerformance = config.enablePerformance !== false;
        return `import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: "${config.release || '1.0.0'}",
  
  // Performance monitoring
  ${enablePerformance ? `
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app: true }),
  ],` : ''}
  
  // Debug mode in development
  debug: process.env.NODE_ENV === 'development',
  
  // Before send hook
  beforeSend(event, hint) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },
});`;
    }
    generateSentryMonitoring(config) {
        return `import * as Sentry from '@sentry/nextjs';

// ============================================================================
// SENTRY MONITORING UTILITIES
// ============================================================================

/**
 * Capture an error with additional context
 */
export function captureError(error: Error, context?: Record<string, any>): void {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture a message with severity level
 */
export function captureMessage(
  message: string, 
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, any>
): void {
  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

/**
 * Start a performance transaction
 */
export function startTransaction(
  name: string,
  operation: string,
  context?: Record<string, any>
): Sentry.Transaction {
  return Sentry.startTransaction({
    name,
    op: operation,
    data: context,
  });
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string = 'default',
  data?: Record<string, any>
): void {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
  });
}

/**
 * Set user context for error tracking
 */
export function setUser(user: {
  id?: string;
  email?: string;
  username?: string;
  ip_address?: string;
}): void {
  Sentry.setUser(user);
}

/**
 * Set tag for filtering and grouping
 */
export function setTag(key: string, value: string): void {
  Sentry.setTag(key, value);
}

/**
 * Set extra context data
 */
export function setExtra(key: string, value: any): void {
  Sentry.setExtra(key, value);
}

/**
 * Set context data
 */
export function setContext(name: string, context: Record<string, any>): void {
  Sentry.setContext(name, context);
}

/**
 * Flush events before shutdown
 */
export async function flush(timeout?: number): Promise<boolean> {
  return Sentry.flush(timeout);
}

/**
 * Close Sentry connection
 */
export async function close(): Promise<void> {
  return Sentry.close();
}

// ============================================================================
// RE-EXPORTS
// ============================================================================

export { Sentry };
export default Sentry;
`;
    }
    generateMonitoringUtilities() {
        return `/**
 * Monitoring Utilities
 * 
 * Common utilities for monitoring and observability
 */

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

/**
 * Measure execution time of a function
 */
export async function measureExecutionTime<T>(
  fn: () => Promise<T>,
  name: string
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    console.log(\`⏱️  \${name} took \${duration.toFixed(2)}ms\`);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(\`❌ \${name} failed after \${duration.toFixed(2)}ms\`, error);
    throw error;
  }
}

/**
 * Create a performance timer
 */
export function createTimer(name: string) {
  const start = performance.now();
  return {
    end: () => {
      const duration = performance.now() - start;
      console.log(\`⏱️  \${name} took \${duration.toFixed(2)}ms\`);
      return duration;
    }
  };
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Wrap async function with error handling
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error(\`❌ Error in \${context || 'function'}\`, error);
      throw error;
    }
  };
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      const waitTime = delay * Math.pow(2, attempt - 1);
      console.log(\`⚠️  Attempt \${attempt} failed, retrying in \${waitTime}ms...\`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError!;
}

// ============================================================================
// HEALTH CHECKS
// ============================================================================

/**
 * Health check result interface
 */
export interface HealthCheckResult {
  healthy: boolean;
  status: string;
  details?: Record<string, any>;
  timestamp: Date;
}

/**
 * Perform a health check
 */
export async function performHealthCheck(
  check: () => Promise<boolean>,
  name: string
): Promise<HealthCheckResult> {
  const start = Date.now();
  
  try {
    const isHealthy = await check();
    const duration = Date.now() - start;
    
    return {
      healthy: isHealthy,
      status: isHealthy ? 'healthy' : 'unhealthy',
      details: {
        duration,
        name
      },
      timestamp: new Date()
    };
  } catch (error) {
    const duration = Date.now() - start;
    
    return {
      healthy: false,
      status: 'error',
      details: {
        duration,
        name,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date()
    };
  }
}
`;
    }
    generateUnifiedIndex() {
        return `/**
 * Unified Monitoring Interface - Sentry Implementation
 * 
 * This file provides a unified interface for monitoring operations
 * that works with Sentry. It abstracts away Sentry-specific details
 * and provides a clean API for monitoring operations.
 */

import * as Sentry from './sentry.js';
import { measureExecutionTime, createTimer, withErrorHandling, retry, performHealthCheck } from './utilities.js';

// ============================================================================
// UNIFIED MONITORING INTERFACE
// ============================================================================

export interface UnifiedMonitoring {
  // Error tracking
  captureError: (error: Error, context?: Record<string, any>) => void;
  captureMessage: (message: string, level?: string, context?: Record<string, any>) => void;
  
  // Performance monitoring
  startTransaction: (name: string, operation: string, context?: Record<string, any>) => any;
  measureExecution: <T>(fn: () => Promise<T>, name: string) => Promise<T>;
  
  // Context management
  setUser: (user: { id?: string; email?: string; username?: string }) => void;
  setTag: (key: string, value: string) => void;
  setContext: (name: string, context: Record<string, any>) => void;
  
  // Health checks
  healthCheck: (check: () => Promise<boolean>, name: string) => Promise<any>;
  
  // Utility
  flush: (timeout?: number) => Promise<boolean>;
  close: () => Promise<void>;
}

// ============================================================================
// SENTRY IMPLEMENTATION
// ============================================================================

export const createUnifiedMonitoring = (): UnifiedMonitoring => {
  return {
    // Error tracking
    captureError: (error: Error, context?: Record<string, any>) => {
      Sentry.captureError(error, context);
    },

    captureMessage: (message: string, level: string = 'info', context?: Record<string, any>) => {
      Sentry.captureMessage(message, level as any, context);
    },

    // Performance monitoring
    startTransaction: (name: string, operation: string, context?: Record<string, any>) => {
      return Sentry.startTransaction(name, operation, context);
    },

    measureExecution: measureExecutionTime,

    // Context management
    setUser: (user: { id?: string; email?: string; username?: string }) => {
      Sentry.setUser(user);
    },

    setTag: (key: string, value: string) => {
      Sentry.setTag(key, value);
    },

    setContext: (name: string, context: Record<string, any>) => {
      Sentry.setContext(name, context);
    },

    // Health checks
    healthCheck: performHealthCheck,

    // Utility
    flush: (timeout?: number) => {
      return Sentry.flush(timeout);
    },

    close: () => {
      return Sentry.close();
    },
  };
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export const monitoring = createUnifiedMonitoring();
export default monitoring;

// ============================================================================
// RE-EXPORTS
// ============================================================================

export * from './sentry.js';
export * from './utilities.js';
`;
    }
    generateEnvConfig(config) {
        return `# Sentry Monitoring Configuration
SENTRY_DSN="${config.dsn || ''}"
SENTRY_ENVIRONMENT="${config.environment || 'development'}"
SENTRY_RELEASE="${config.release || '1.0.0'}"

# Sentry features
SENTRY_ENABLE_PERFORMANCE="${config.enablePerformance !== false ? 'true' : 'false'}"
SENTRY_ENABLE_SESSION_TRACKING="${config.enableSessionTracking !== false ? 'true' : 'false'}"
SENTRY_ENABLE_REPLAY="${config.enableReplay === true ? 'true' : 'false'}"
`;
    }
    generateSentryProperties(config) {
        return `defaults.url=https://sentry.io/
defaults.org=your-org
defaults.project=your-project
auth.token=your-auth-token
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
                    code: 'SENTRY_INSTALL_ERROR',
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
//# sourceMappingURL=sentry.plugin.js.map