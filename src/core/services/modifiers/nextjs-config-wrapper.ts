/**
 * Next.js Config Wrapper Modifier
 * 
 * Wraps Next.js configuration files with external wrappers like withSentryConfig,
 * withBundleAnalyzer, etc. This is a core modifier for Next.js integrations.
 */

import { BaseModifier, ModifierParams, ModifierResult } from './base-modifier.js';
import { ProjectContext } from '../../../types/agent.js';

export class NextjsConfigWrapperModifier extends BaseModifier {
  getDescription(): string {
    return 'Wraps Next.js configuration with external wrappers (e.g., withSentryConfig, withBundleAnalyzer)';
  }

  getSupportedFileTypes(): string[] {
    return ['js', 'ts', 'mjs'];
  }

  getParamsSchema(): any {
    return {
      type: 'object',
      required: ['wrapper'],
      properties: {
        wrapper: {
          type: 'string',
          description: 'Name of the wrapper function to apply'
        },
        options: {
          type: 'object',
          description: 'Options to pass to the wrapper function'
        },
        env: {
          type: 'object',
          description: 'Environment variables to add to the config'
        },
        imports: {
          type: 'array',
          items: { type: 'string' },
          description: 'Additional imports to add'
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
      
      // Parse and modify the configuration
      const modifiedContent = this.wrapNextjsConfig(existingContent, params);
      
      // Write back to VFS
      await this.writeFile(filePath, modifiedContent);

      return {
        success: true,
        message: `Successfully wrapped ${filePath} with ${params.wrapper}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private wrapNextjsConfig(existingContent: string, params: ModifierParams): string {
    const { wrapper, options = {}, env = {}, imports = [] } = params;
    
    // Parse the existing config to extract the export
    const configMatch = existingContent.match(/export\s+default\s+([^;]+);?/);
    if (!configMatch || !configMatch[1]) {
      throw new Error('Could not find default export in Next.js config file');
    }

    const configObject = configMatch[1].trim();
    
    // Build the wrapper options
    const optionsString = this.buildOptionsString(options);
    const envString = this.buildEnvString(env);
    const importsString = this.buildImportsString(imports, wrapper);
    
    // Create the new content
    let newContent = existingContent;
    
    // Add imports if not already present
    if (importsString && !newContent.includes(importsString)) {
      newContent = importsString + '\n' + newContent;
    }
    
    // Add environment variables if not already present
    if (envString && !newContent.includes(envString)) {
      newContent = newContent.replace(
        /const\s+nextConfig\s*=/,
        `${envString}\nconst nextConfig =`
      );
    }
    
    // Replace the export with wrapped version
    const wrappedExport = `export default ${wrapper}(nextConfig${optionsString});`;
    newContent = newContent.replace(
      /export\s+default\s+[^;]+;?/,
      wrappedExport
    );
    
    return newContent;
  }

  private buildOptionsString(options: any): string {
    if (!options || Object.keys(options).length === 0) {
      return '';
    }
    
    const optionsArray = Object.entries(options).map(([key, value]) => {
      if (typeof value === 'string' && value.startsWith('process.env.')) {
        return `${key}: ${value}`;
      } else if (typeof value === 'string') {
        return `${key}: '${value}'`;
      } else if (typeof value === 'boolean') {
        return `${key}: ${value}`;
      } else {
        return `${key}: ${JSON.stringify(value)}`;
      }
    });
    
    return `, {\n  ${optionsArray.join(',\n  ')}\n}`;
  }

  private buildEnvString(env: any): string {
    if (!env || Object.keys(env).length === 0) {
      return '';
    }
    
    const envEntries = Object.entries(env).map(([key, value]) => {
      return `  ${key}: process.env.${value}`;
    });
    
    return `const env = {\n${envEntries.join(',\n')}\n};\n\n`;
  }

  private buildImportsString(imports: string[], wrapper: string): string {
    const allImports = [...imports, wrapper];
    const uniqueImports = [...new Set(allImports)];
    
    if (uniqueImports.length === 0) {
      return '';
    }
    
    return `import { ${uniqueImports.join(', ')} } from '${this.getImportPath(wrapper)}';\n`;
  }

  private getImportPath(wrapper: string): string {
    // Map common wrappers to their import paths
    const importMap: { [key: string]: string } = {
      'withSentryConfig': '@sentry/nextjs',
      'withBundleAnalyzer': '@next/bundle-analyzer',
      'withPWA': 'next-pwa',
      'withTM': 'next-transpile-modules'
    };
    
    return importMap[wrapper] || `./${wrapper}`;
  }
}
