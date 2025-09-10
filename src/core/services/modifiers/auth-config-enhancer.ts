/**
 * Auth Config Enhancer Modifier
 * 
 * Enhances authentication configuration files with additional providers,
 * settings, and middleware. This is essential for proper auth integration.
 */

import { BaseModifier, ModifierParams, ModifierResult } from './base-modifier.js';
import { ProjectContext } from '../../../types/agent.js';

export class AuthConfigEnhancerModifier extends BaseModifier {
  getDescription(): string {
    return 'Enhances authentication configuration with additional providers and settings';
  }

  getSupportedFileTypes(): string[] {
    return ['ts', 'js', 'mjs'];
  }

  getParamsSchema(): any {
    return {
      type: 'object',
      required: ['authProvider'],
      properties: {
        authProvider: {
          type: 'string',
          enum: ['better-auth', 'next-auth', 'auth0', 'firebase', 'supabase'],
          description: 'Authentication provider to configure'
        },
        providers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              type: { type: 'string' },
              config: { type: 'object' }
            }
          },
          description: 'Additional auth providers to add'
        },
        database: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            url: { type: 'string' },
            adapter: { type: 'string' }
          },
          description: 'Database configuration for auth'
        },
        session: {
          type: 'object',
          properties: {
            strategy: { type: 'string' },
            maxAge: { type: 'number' },
            updateAge: { type: 'number' }
          },
          description: 'Session configuration'
        },
        callbacks: {
          type: 'object',
          description: 'Auth callbacks configuration'
        },
        pages: {
          type: 'object',
          description: 'Custom auth pages configuration'
        },
        events: {
          type: 'object',
          description: 'Auth events configuration'
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
      
      // Enhance auth configuration based on provider
      const enhancedContent = this.enhanceAuthConfig(existingContent, params, context);
      
      // Write back to VFS
      await this.writeFile(filePath, enhancedContent);

      return {
        success: true,
        message: `Successfully enhanced auth configuration for ${params.authProvider}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private enhanceAuthConfig(existingContent: string, params: ModifierParams, context: ProjectContext): string {
    const { authProvider } = params;

    switch (authProvider) {
      case 'better-auth':
        return this.enhanceBetterAuthConfig(existingContent, params);
      case 'next-auth':
        return this.enhanceNextAuthConfig(existingContent, params);
      case 'auth0':
        return this.enhanceAuth0Config(existingContent, params);
      case 'firebase':
        return this.enhanceFirebaseConfig(existingContent, params);
      case 'supabase':
        return this.enhanceSupabaseConfig(existingContent, params);
      default:
        throw new Error(`Unsupported auth provider: ${authProvider}`);
    }
  }

  private enhanceBetterAuthConfig(existingContent: string, params: ModifierParams): string {
    const { providers = [], database, session, callbacks } = params;

    // Check if Better Auth is already configured
    if (existingContent.includes('betterAuth')) {
      return existingContent; // Already configured
    }

    // Add Better Auth import
    const importStatement = `import { betterAuth } from 'better-auth';\n`;
    
    // Build providers configuration
    const providersConfig = providers.map((provider: any) => {
      return `    ${provider.name}: {
      type: '${provider.type}',
      ...${JSON.stringify(provider.config, null, 6).replace(/^/gm, '      ')}
    }`;
    }).join(',\n');

    // Build database configuration
    const databaseConfig = database ? `
  database: {
    type: '${database.type}',
    url: process.env.DATABASE_URL,
    ${database.adapter ? `adapter: '${database.adapter}',` : ''}
  },` : '';

    // Build session configuration
    const sessionConfig = session ? `
  session: {
    strategy: '${session.strategy || 'jwt'}',
    ${session.maxAge ? `maxAge: ${session.maxAge},` : ''}
    ${session.updateAge ? `updateAge: ${session.updateAge},` : ''}
  },` : '';

    // Build callbacks configuration
    const callbacksConfig = callbacks ? `
  callbacks: {
    ${Object.entries(callbacks).map(([key, value]) => 
      `${key}: ${typeof value === 'function' ? value.toString() : JSON.stringify(value)}`
    ).join(',\n    ')}
  },` : '';

    // Add Better Auth configuration
    const configCode = `
// Better Auth configuration
export const auth = betterAuth({
  ${providersConfig ? `providers: [\n${providersConfig}\n  ],` : ''}${databaseConfig}${sessionConfig}${callbacksConfig}
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

  private enhanceNextAuthConfig(existingContent: string, params: ModifierParams): string {
    // Similar implementation for NextAuth
    // This would be implemented based on NextAuth configuration patterns
    return existingContent;
  }

  private enhanceAuth0Config(existingContent: string, params: ModifierParams): string {
    // Similar implementation for Auth0
    return existingContent;
  }

  private enhanceFirebaseConfig(existingContent: string, params: ModifierParams): string {
    // Similar implementation for Firebase
    return existingContent;
  }

  private enhanceSupabaseConfig(existingContent: string, params: ModifierParams): string {
    // Similar implementation for Supabase
    return existingContent;
  }
}
