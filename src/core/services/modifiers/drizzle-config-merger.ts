/**
 * Drizzle Config Merger Modifier
 * 
 * Merges Drizzle database configuration into existing auth config files.
 * This is essential for proper database integration with authentication.
 */

import { BaseModifier, ModifierParams, ModifierResult } from './base-modifier.js';
import { ProjectContext } from '../../../types/agent.js';

export class DrizzleConfigMergerModifier extends BaseModifier {
  getDescription(): string {
    return 'Merges Drizzle database configuration into existing auth config files';
  }

  getSupportedFileTypes(): string[] {
    return ['ts', 'js', 'mjs'];
  }

  getParamsSchema(): any {
    return {
      type: 'object',
      required: ['configObjectName', 'payload'],
      properties: {
        configObjectName: {
          type: 'string',
          description: 'Name of the configuration object to merge into'
        },
        payload: {
          type: 'object',
          description: 'Configuration payload to merge'
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
      
      // Merge Drizzle configuration
      const mergedContent = this.mergeDrizzleConfig(existingContent, params);
      
      // Write back to VFS
      await this.writeFile(filePath, mergedContent);

      return {
        success: true,
        message: `Successfully merged Drizzle configuration into ${params.configObjectName}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private mergeDrizzleConfig(existingContent: string, params: ModifierParams): string {
    const { configObjectName, payload } = params;

    // Find the configuration object
    const configRegex = new RegExp(`(export\\s+const\\s+${configObjectName}\\s*=\\s*{)([\\s\\S]*?)(};)`, 'g');
    const match = configRegex.exec(existingContent);

    if (!match) {
      // If config object doesn't exist, create it
      const newConfig = this.generateConfigObject(configObjectName, payload);
      return existingContent + '\n\n' + newConfig;
    }

    // Parse existing config and merge
    const existingConfig = this.parseConfigObject(match[2] || '');
    const mergedConfig = this.mergeConfigObjects(existingConfig, payload);
    const newConfigString = this.generateConfigString(mergedConfig);

    // Replace the existing config
    return existingContent.replace(configRegex, `$1${newConfigString}$3`);
  }

  private generateConfigObject(configName: string, payload: any): string {
    const configString = this.generateConfigString(payload);
    return `export const ${configName} = ${configString};`;
  }

  private generateConfigString(config: any): string {
    return JSON.stringify(config, null, 2)
      .replace(/"([^"]+)":/g, '$1:')
      .replace(/"process\.env\.([^"]+)"/g, 'process.env.$1')
      .replace(/"([^"]+)!"/g, '$1!');
  }

  private parseConfigObject(configString: string): any {
    // Simple config parsing - in a real implementation, you'd use a proper parser
    try {
      // Clean up the config string for JSON parsing
      const cleaned = configString
        .replace(/(\w+):/g, '"$1":')
        .replace(/'/g, '"')
        .replace(/(\w+)!/g, '"$1!"')
        .replace(/process\.env\.(\w+)/g, '"process.env.$1"');
      
      return JSON.parse(`{${cleaned}}`);
    } catch {
      return {};
    }
  }

  private mergeConfigObjects(existing: any, newConfig: any): any {
    return { ...existing, ...newConfig };
  }
}
