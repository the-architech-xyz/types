/**
 * Monitoring Agent - Monitoring Service Orchestrator
 * 
 * Orchestrates monitoring service setup and configuration through unified interfaces.
 * Supports multiple monitoring providers (Sentry, LogRocket, DataDog) with consistent APIs.
 */

import { existsSync } from 'fs';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { AbstractAgent } from './base/abstract-agent.js';
import { PluginSystem } from '../core/plugin/plugin-system.js';
import { PluginContext, ProjectType, TargetPlatform } from '../types/plugin.js';
import {
  IAgent,
  AgentContext,
  AgentResult,
  AgentMetadata,
  AgentCapability,
  AgentCategory,
  CapabilityCategory,
  ValidationResult,
  Artifact,
  ValidationError,
  Logger
} from '../types/agent.js';
import { CommandRunner } from '../core/cli/command-runner.js';

interface MonitoringSetupConfig {
  provider: 'sentry' | 'logrocket' | 'datadog' | 'none';
  environment: string;
  release?: string;
  features: {
    errorTracking: boolean;
    performanceMonitoring: boolean;
    analytics: boolean;
    logging: boolean;
    healthChecks: boolean;
    alerts: boolean;
  };
  sampling: {
    tracesSampleRate: number;
    profilesSampleRate: number;
  };
}

interface MonitoringSetupResult {
  provider: string;
  features: string[];
  config: Record<string, any>;
}

export class MonitoringAgent implements IAgent {
  private pluginSystem: PluginSystem;
  private logger: Logger;
  private runner: CommandRunner;

  constructor() {
    this.pluginSystem = PluginSystem.getInstance();
    this.logger = this.pluginSystem.getLogger();
    this.runner = new CommandRunner();
  }

  // ============================================================================
  // AGENT METADATA
  // ============================================================================

  getMetadata(): AgentMetadata {
    return {
      name: 'Monitoring Service Orchestrator',
      version: '1.00',
      description: 'AI-powered monitoring service setup and configuration',
      author: 'The Architech Team',
      category: AgentCategory.MONITORING,
      tags: ['monitoring', 'observability', 'error-tracking', 'performance', 'analytics'],
      dependencies: ['base-project'],
      requirements: [{
        type: 'package',
        name: 'monitoring-provider',
        description: 'Monitoring service provider package'
      }]
    };
  }

  getCapabilities(): AgentCapability[] {
    return [
      {
        name: 'monitoring-provider-setup',
        description: 'Setup and configure monitoring service providers',
        category: CapabilityCategory.SETUP
      },
      {
        name: 'error-tracking-configuration',
        description: 'Configure error tracking and exception monitoring',
        category: CapabilityCategory.CONFIGURATION
      },
      {
        name: 'performance-monitoring-setup',
        description: 'Setup performance monitoring and tracing',
        category: CapabilityCategory.SETUP
      },
      {
        name: 'analytics-configuration',
        description: 'Configure user analytics and event tracking',
        category: CapabilityCategory.CONFIGURATION
      },
      {
        name: 'health-checks-setup',
        description: 'Setup health checks and system monitoring',
        category: CapabilityCategory.SETUP
      },
      {
        name: 'alerts-configuration',
        description: 'Configure alerts and notifications',
        category: CapabilityCategory.CONFIGURATION
      }
    ];
  }

  // ============================================================================
  // MAIN EXECUTION
  // ============================================================================

  async execute(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      this.logger.info('Starting monitoring service orchestration...');

      // Step 1: Analyze monitoring requirements
      const config = await this.analyzeMonitoringRequirements(context);
      
      // Step 2: Select monitoring provider
      const provider = await this.selectMonitoringProvider(config, context);
      
      // Step 3: Setup monitoring service
      const setupResult = await this.setupMonitoringService(provider, config, context);
      
      // Step 4: Configure monitoring features
      const featuresResult = await this.configureMonitoringFeatures(setupResult, config, context);
      
      // Step 5: Setup monitoring utilities
      const utilitiesResult = await this.setupMonitoringUtilities(setupResult, config, context);

      const duration = Date.now() - startTime;

      return {
        success: true,
        data: {
          provider: setupResult.provider,
          features: featuresResult.features,
          config: setupResult.config
        },
        artifacts: [
          ...setupResult.artifacts,
          ...featuresResult.artifacts,
          ...utilitiesResult.artifacts
        ],
        warnings: [
          ...setupResult.warnings,
          ...featuresResult.warnings,
          ...utilitiesResult.warnings
        ],
        duration
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult(
        `Monitoring service setup failed: ${errorMessage}`,
        startTime,
        [],
        error
      );
    }
  }

  // ============================================================================
  // REQUIREMENTS ANALYSIS
  // ============================================================================

  private async analyzeMonitoringRequirements(context: AgentContext): Promise<MonitoringSetupConfig> {
    this.logger.info('Analyzing monitoring service requirements...');

    const userInput = context.config.userInput || '';
    const projectType = context.config.projectType || 'scalable-monorepo';
    
    // Extract monitoring requirements from user input
    const hasErrorTracking = userInput.toLowerCase().includes('error') || userInput.toLowerCase().includes('monitoring');
    const hasPerformance = userInput.toLowerCase().includes('performance') || userInput.toLowerCase().includes('tracing');
    const hasAnalytics = userInput.toLowerCase().includes('analytics') || userInput.toLowerCase().includes('tracking');
    const hasHealthChecks = userInput.toLowerCase().includes('health') || userInput.toLowerCase().includes('monitoring');
    const hasAlerts = userInput.toLowerCase().includes('alert') || userInput.toLowerCase().includes('notification');
    
    // Determine required features based on project needs
    const features = {
      errorTracking: hasErrorTracking || projectType === 'scalable-monorepo',
      performanceMonitoring: hasPerformance || projectType === 'scalable-monorepo',
      analytics: hasAnalytics,
      logging: true, // Always recommended
      healthChecks: hasHealthChecks || projectType === 'scalable-monorepo',
      alerts: hasAlerts || projectType === 'scalable-monorepo'
    };

    // Determine sampling rates based on environment
    const sampling = {
      tracesSampleRate: context.config.environment === 'production' ? 0.1 : 1.0,
      profilesSampleRate: context.config.environment === 'production' ? 0.05 : 1.0
    };

    this.logger.success('Monitoring requirements analysis completed');
    
    return {
      provider: 'none', // Will be selected later
      environment: context.config.environment || 'development',
      features,
      sampling
    };
  }

  // ============================================================================
  // PROVIDER SELECTION
  // ============================================================================

  private async selectMonitoringProvider(config: MonitoringSetupConfig, context: AgentContext): Promise<string> {
    this.logger.info('Selecting monitoring service provider...');

    // Get available monitoring plugins
    const availablePlugins = this.pluginSystem.getPluginsByCategory('MONITORING');
    
    if (availablePlugins.length === 0) {
      this.logger.warn('No monitoring plugins available, skipping monitoring setup');
      return 'none';
    }

    // Use default provider if in --yes mode
    if (context.options.useDefaults) {
      const defaultProvider = availablePlugins.find(p => p.name === 'sentry') || availablePlugins[0];
      this.logger.info(`Using default monitoring provider: ${defaultProvider.name}`);
      return defaultProvider.name;
    }

    // Interactive provider selection would go here
    // For now, use the first available provider
    const selectedProvider = availablePlugins[0];
    this.logger.info(`Selected monitoring provider: ${selectedProvider.name}`);
    
    return selectedProvider.name;
  }

  // ============================================================================
  // MONITORING SERVICE SETUP
  // ============================================================================

  private async setupMonitoringService(provider: string, config: MonitoringSetupConfig, context: AgentContext): Promise<{
    provider: string;
    config: Record<string, any>;
    artifacts: any[];
    warnings: string[];
  }> {
    try {
      context.logger.info(`Setting up monitoring service with provider: ${provider}`);

      // Get the monitoring plugin
      const plugin = this.pluginSystem.getRegistry().get(provider);
      if (!plugin) {
        throw new Error(`Monitoring plugin not found: ${provider}`);
      }

      // Prepare plugin context
      const pluginContext: PluginContext = {
        ...context,
        pluginId: provider,
        pluginConfig: {
          provider,
          environment: config.environment,
          release: config.release,
          features: config.features,
          sampling: config.sampling
        },
        installedPlugins: [],
        projectType: ProjectType.NEXTJS,
        targetPlatform: [TargetPlatform.WEB, TargetPlatform.SERVER]
      };

      // Validate plugin
      const validation = await plugin.validate(pluginContext);
      if (!validation.valid) {
        throw new Error(`Monitoring plugin validation failed: ${validation.errors.map((e: any) => e.message).join(', ')}`);
      }

      // Execute plugin
      const result = await plugin.install(pluginContext);
      if (!result.success) {
        throw new Error(`Monitoring plugin execution failed: ${result.errors.map((e: any) => e.message).join(', ')}`);
      }

      context.logger.success(`Monitoring service setup completed for ${provider}`);

      return {
        provider,
        config: pluginContext.pluginConfig,
        artifacts: result.artifacts || [],
        warnings: result.warnings || []
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to setup monitoring service: ${errorMessage}`);
    }
  }

  // ============================================================================
  // FEATURE CONFIGURATION
  // ============================================================================

  private async configureMonitoringFeatures(setupResult: any, config: MonitoringSetupConfig, context: AgentContext): Promise<{
    features: string[];
    artifacts: any[];
    warnings: string[];
  }> {
    try {
      context.logger.info('Configuring monitoring features...');

      // Get the monitoring plugin
      const plugin = this.pluginSystem.getRegistry().get(setupResult.provider);
      if (!plugin) {
        throw new Error(`Monitoring plugin not found: ${setupResult.provider}`);
      }

      // Check if unified interface files exist
      const unifiedFiles = [
        path.join(context.projectPath, 'src', 'lib', 'monitoring', 'index.ts'),
        path.join(context.projectPath, 'src', 'lib', 'monitoring', 'config.ts'),
        path.join(context.projectPath, 'src', 'lib', 'monitoring', 'utils.ts')
      ];

      const enabledFeatures: string[] = [];
      const artifacts: any[] = [];

      for (const file of unifiedFiles) {
        if (await fsExtra.pathExists(file)) {
          const fileName = path.basename(file, path.extname(file));
          enabledFeatures.push(fileName);
          artifacts.push({
            type: 'file',
            path: file,
            description: `Monitoring ${fileName} feature`
          });
        }
      }

      context.logger.success(`Monitoring features configured: ${enabledFeatures.join(', ')}`);

      return {
        features: enabledFeatures,
        artifacts,
        warnings: []
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to configure monitoring features: ${errorMessage}`);
    }
  }

  // ============================================================================
  // UTILITIES SETUP
  // ============================================================================

  private async setupMonitoringUtilities(setupResult: any, config: MonitoringSetupConfig, context: AgentContext): Promise<{
    artifacts: any[];
    warnings: string[];
  }> {
    try {
      context.logger.info('Setting up monitoring utilities...');

      // Check if monitoring utilities exist
      const utilityFiles = [
        path.join(context.projectPath, 'src', 'lib', 'monitoring', 'utils.ts'),
        path.join(context.projectPath, 'src', 'lib', 'monitoring', 'health.ts'),
        path.join(context.projectPath, 'src', 'lib', 'monitoring', 'alerts.ts')
      ];

      const artifacts: any[] = [];
      for (const file of utilityFiles) {
        if (await fsExtra.pathExists(file)) {
          artifacts.push({
            type: 'file',
            path: file,
            description: 'Monitoring utility'
          });
        }
      }

      context.logger.success('Monitoring utilities setup completed');

      return {
        artifacts,
        warnings: []
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to setup monitoring utilities: ${errorMessage}`);
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private async createMonitoringConfigFiles(provider: string, context: AgentContext): Promise<any[]> {
    const artifacts: any[] = [];
    
    // Create monitoring configuration file
    const configPath = path.join(context.projectPath, 'src', 'lib', 'monitoring', 'config.ts');
    const configContent = this.generateMonitoringConfig(provider);
    await fsExtra.writeFile(configPath, configContent);
    
    artifacts.push({
      type: 'file',
      path: configPath,
      description: 'Monitoring service configuration'
    });

    return artifacts;
  }

  private async createMonitoringEnvTemplate(requiredEnvVars: string[], context: AgentContext): Promise<any> {
    const envPath = path.join(context.projectPath, '.env.local');
    const envContent = `# Monitoring Service Configuration\n${requiredEnvVars.map(varName => `${varName}=""`).join('\n')}\n`;
    
    // Append to existing .env.local or create new
    let existingContent = '';
    if (await fsExtra.pathExists(envPath)) {
      existingContent = await fsExtra.readFile(envPath, 'utf-8');
    }
    
    await fsExtra.writeFile(envPath, existingContent + '\n' + envContent);
    
    return {
      type: 'file',
      path: envPath,
      description: 'Monitoring environment variables'
    };
  }

  private async createMonitoringUtilities(context: AgentContext): Promise<any[]> {
    const artifacts: any[] = [];
    
    // Create monitoring utility file
    const utilityPath = path.join(context.projectPath, 'src', 'lib', 'monitoring', 'utils.ts');
    const utilityContent = this.generateMonitoringUtilities();
    await fsExtra.writeFile(utilityPath, utilityContent);
    
    artifacts.push({
      type: 'file',
      path: utilityPath,
      description: 'Monitoring utilities'
    });

    return artifacts;
  }

  private generateMonitoringConfig(provider: string): string {
    return `/**
 * Monitoring Service Configuration
 * Generated by The Architech Monitoring Agent
 */

export interface MonitoringConfig {
  provider: '${provider}';
  environment: string;
  release?: string;
  features: {
    errorTracking: boolean;
    performanceMonitoring: boolean;
    analytics: boolean;
    logging: boolean;
    healthChecks: boolean;
    alerts: boolean;
  };
  sampling: {
    tracesSampleRate: number;
    profilesSampleRate: number;
  };
}

export const monitoringConfig: MonitoringConfig = {
  provider: '${provider}',
  environment: process.env.NODE_ENV || 'development',
  release: process.env.APP_VERSION || undefined,
  features: {
    errorTracking: true,
    performanceMonitoring: true,
    analytics: true,
    logging: true,
    healthChecks: true,
    alerts: true
  },
  sampling: {
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.1
  }
};

export default monitoringConfig;
`;
  }

  private generateMonitoringUtilities(): string {
    return `/**
 * Monitoring Utilities
 * Generated by The Architech Monitoring Agent
 */

export interface MonitoringEvent {
  id: string;
  type: 'error' | 'performance' | 'analytics' | 'log' | 'health' | 'alert';
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  lastChecked: Date;
  details?: Record<string, any>;
}

export class MonitoringService {
  private events: MonitoringEvent[] = [];
  private healthChecks: Map<string, HealthCheck> = new Map();

  /**
   * Track an error event
   */
  trackError(error: Error, metadata?: Record<string, any>): void {
    const event: MonitoringEvent = {
      id: this.generateEventId(),
      type: 'error',
      message: error.message,
      timestamp: new Date(),
      metadata: {
        stack: error.stack,
        name: error.name,
        ...metadata
      },
      severity: 'high'
    };

    this.events.push(event);
    console.error('Error tracked:', event);
  }

  /**
   * Track a performance event
   */
  trackPerformance(operation: string, duration: number, metadata?: Record<string, any>): void {
    const event: MonitoringEvent = {
      id: this.generateEventId(),
      type: 'performance',
      message: \`Operation '\${operation}' took \${duration}ms\`,
      timestamp: new Date(),
      metadata: {
        operation,
        duration,
        ...metadata
      },
      severity: duration > 1000 ? 'medium' : 'low'
    };

    this.events.push(event);
  }

  /**
   * Track an analytics event
   */
  trackAnalytics(eventName: string, data?: Record<string, any>): void {
    const event: MonitoringEvent = {
      id: this.generateEventId(),
      type: 'analytics',
      message: \`Analytics event: \${eventName}\`,
      timestamp: new Date(),
      metadata: {
        eventName,
        ...data
      }
    };

    this.events.push(event);
  }

  /**
   * Log a message
   */
  log(message: string, level: 'info' | 'warn' | 'error' = 'info', metadata?: Record<string, any>): void {
    const event: MonitoringEvent = {
      id: this.generateEventId(),
      type: 'log',
      message,
      timestamp: new Date(),
      metadata,
      severity: level === 'error' ? 'high' : level === 'warn' ? 'medium' : 'low'
    };

    this.events.push(event);
    console[level](message, metadata);
  }

  /**
   * Add a health check
   */
  addHealthCheck(name: string, check: () => Promise<HealthCheck>): void {
    this.healthChecks.set(name, {
      name,
      status: 'healthy',
      lastChecked: new Date()
    });
  }

  /**
   * Run all health checks
   */
  async runHealthChecks(): Promise<HealthCheck[]> {
    const results: HealthCheck[] = [];

    for (const [name, check] of this.healthChecks) {
      try {
        const startTime = Date.now();
        const result = await check();
        const responseTime = Date.now() - startTime;

        const healthCheck: HealthCheck = {
          ...result,
          responseTime,
          lastChecked: new Date()
        };

        this.healthChecks.set(name, healthCheck);
        results.push(healthCheck);
      } catch (error) {
        const healthCheck: HealthCheck = {
          name,
          status: 'unhealthy',
          lastChecked: new Date(),
          details: {
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        };

        this.healthChecks.set(name, healthCheck);
        results.push(healthCheck);
      }
    }

    return results;
  }

  /**
   * Send an alert
   */
  sendAlert(message: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium', metadata?: Record<string, any>): void {
    const event: MonitoringEvent = {
      id: this.generateEventId(),
      type: 'alert',
      message,
      timestamp: new Date(),
      metadata,
      severity
    };

    this.events.push(event);
    console.warn(\`Alert [\${severity.toUpperCase()}]: \${message}\`, metadata);
  }

  /**
   * Get all events
   */
  getEvents(): MonitoringEvent[] {
    return [...this.events];
  }

  /**
   * Get events by type
   */
  getEventsByType(type: MonitoringEvent['type']): MonitoringEvent[] {
    return this.events.filter(event => event.type === type);
  }

  /**
   * Get events in date range
   */
  getEventsInRange(startDate: Date, endDate: Date): MonitoringEvent[] {
    return this.events.filter(event => 
      event.timestamp >= startDate && event.timestamp <= endDate
    );
  }

  /**
   * Clear events
   */
  clearEvents(): void {
    this.events = [];
  }

  private generateEventId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

export default MonitoringService;
`;
  }

  private createErrorResult(
    message: string,
    startTime: number,
    errors: any[] = [],
    originalError?: any
  ): AgentResult {
    return {
      success: false,
      errors: [
        {
          code: 'MONITORING_SETUP_ERROR',
          message,
          details: originalError,
          recoverable: false,
          timestamp: new Date()
        },
        ...errors
      ],
      duration: Date.now() - startTime
    };
  }
} 