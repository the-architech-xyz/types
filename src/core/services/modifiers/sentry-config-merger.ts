/**
 * Sentry Config Merger Modifier
 * 
 * Merges Sentry configuration into existing config files.
 * This is essential for proper Sentry integration without duplication.
 */

import { BaseModifier, ModifierParams, ModifierResult } from './base-modifier.js';
import { ProjectContext } from '../../../types/agent.js';

export class SentryConfigMergerModifier extends BaseModifier {
  getDescription(): string {
    return 'Merges Sentry configuration into existing config files';
  }

  getSupportedFileTypes(): string[] {
    return ['ts', 'js', 'mjs'];
  }

  getParamsSchema(): any {
    return {
      type: 'object',
      required: ['framework'],
      properties: {
        framework: {
          type: 'string',
          enum: ['nextjs', 'react', 'vue', 'svelte'],
          description: 'Target framework for Sentry configuration'
        },
        features: {
          type: 'array',
          items: { 
            type: 'string',
            enum: ['errorTracking', 'performanceMonitoring', 'replay', 'profiling']
          },
          description: 'Sentry features to enable'
        },
        dsn: {
          type: 'string',
          description: 'Sentry DSN (will use environment variable if not provided)'
        },
        environment: {
          type: 'string',
          description: 'Environment name (will use NODE_ENV if not provided)'
        },
        release: {
          type: 'string',
          description: 'Release version (will use package.json version if not provided)'
        },
        tracesSampleRate: {
          type: 'number',
          minimum: 0,
          maximum: 1,
          description: 'Performance monitoring sample rate'
        },
        replaysSessionSampleRate: {
          type: 'number',
          minimum: 0,
          maximum: 1,
          description: 'Session replay sample rate'
        },
        replaysOnErrorSampleRate: {
          type: 'number',
          minimum: 0,
          maximum: 1,
          description: 'Error replay sample rate'
        }
      }
    };
  }

  async execute(
    filePath: string,
    params: ModifierParams,
    context: ProjectContext
  ): Promise<ModifierResult> {
    try {
      // Validate parameters
      const validation = this.validateParams(params);
      if (!validation.valid) {
        return {
          success: false,
          error: `Parameter validation failed: ${validation.errors.join(', ')}`
        };
      }

      // Check if file exists
      const fileExists = this.engine.fileExists(filePath);
      if (!fileExists) {
        return {
          success: false,
          error: `Target file ${filePath} does not exist`
        };
      }

      // Read existing content
      const existingContent = await this.readFile(filePath);
      
      // Generate Sentry configuration based on framework
      const sentryConfig = this.generateSentryConfig(params, context);
      
      // Merge with existing content
      const mergedContent = this.mergeSentryConfig(existingContent, sentryConfig, params.framework);
      
      // Write back to VFS
      await this.writeFile(filePath, mergedContent);

      return {
        success: true,
        message: `Successfully merged Sentry configuration for ${params.framework}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private generateSentryConfig(params: ModifierParams, context: ProjectContext): any {
    const {
      features = ['errorTracking'],
      dsn,
      environment,
      release,
      tracesSampleRate = 0.1,
      replaysSessionSampleRate = 0.1,
      replaysOnErrorSampleRate = 1.0
    } = params;

    const config: any = {
      dsn: dsn || 'process.env.SENTRY_DSN',
      environment: environment || 'process.env.NODE_ENV',
      release: release || 'process.env.npm_package_version',
    };

    // Add performance monitoring
    if (features.includes('performanceMonitoring')) {
      config.tracesSampleRate = tracesSampleRate;
    }

    // Add session replay
    if (features.includes('replay')) {
      config.replaysSessionSampleRate = replaysSessionSampleRate;
      config.replaysOnErrorSampleRate = replaysOnErrorSampleRate;
    }

    // Add profiling
    if (features.includes('profiling')) {
      config.profilesSampleRate = 0.1;
    }

    return config;
  }

  private mergeSentryConfig(existingContent: string, sentryConfig: any, framework: string): string {
    if (framework === 'nextjs') {
      return this.mergeNextjsSentryConfig(existingContent, sentryConfig);
    }
    
    // For other frameworks, add basic Sentry initialization
    return this.mergeBasicSentryConfig(existingContent, sentryConfig);
  }

  private mergeNextjsSentryConfig(existingContent: string, sentryConfig: any): string {
    // Check if Sentry is already configured
    if (existingContent.includes('Sentry.init')) {
      return existingContent; // Already configured
    }

    // Add Sentry import
    const importStatement = `import * as Sentry from '@sentry/nextjs';\n`;
    
    // Add Sentry configuration
    const configCode = `
// Sentry configuration
Sentry.init({
  dsn: ${sentryConfig.dsn},
  environment: ${sentryConfig.environment},
  release: ${sentryConfig.release},${sentryConfig.tracesSampleRate ? `\n  tracesSampleRate: ${sentryConfig.tracesSampleRate},` : ''}${sentryConfig.replaysSessionSampleRate ? `\n  replaysSessionSampleRate: ${sentryConfig.replaysSessionSampleRate},` : ''}${sentryConfig.replaysOnErrorSampleRate ? `\n  replaysOnErrorSampleRate: ${sentryConfig.replaysOnErrorSampleRate},` : ''}${sentryConfig.profilesSampleRate ? `\n  profilesSampleRate: ${sentryConfig.profilesSampleRate},` : ''}
});
`;

    // Insert after imports
    const importEndIndex = existingContent.lastIndexOf('import');
    if (importEndIndex !== -1) {
      const nextLineIndex = existingContent.indexOf('\n', importEndIndex) + 1;
      return existingContent.slice(0, nextLineIndex) + importStatement + existingContent.slice(nextLineIndex) + configCode;
    }

    // If no imports found, add at the beginning
    return importStatement + existingContent + configCode;
  }

  private mergeBasicSentryConfig(existingContent: string, sentryConfig: any): string {
    // Check if Sentry is already configured
    if (existingContent.includes('Sentry.init')) {
      return existingContent; // Already configured
    }

    // Add Sentry import
    const importStatement = `import * as Sentry from '@sentry/browser';\n`;
    
    // Add Sentry configuration
    const configCode = `
// Sentry configuration
Sentry.init({
  dsn: ${sentryConfig.dsn},
  environment: ${sentryConfig.environment},
  release: ${sentryConfig.release},${sentryConfig.tracesSampleRate ? `\n  tracesSampleRate: ${sentryConfig.tracesSampleRate},` : ''}
});
`;

    // Insert after imports
    const importEndIndex = existingContent.lastIndexOf('import');
    if (importEndIndex !== -1) {
      const nextLineIndex = existingContent.indexOf('\n', importEndIndex) + 1;
      return existingContent.slice(0, nextLineIndex) + importStatement + existingContent.slice(nextLineIndex) + configCode;
    }

    // If no imports found, add at the beginning
    return importStatement + existingContent + configCode;
  }
}

