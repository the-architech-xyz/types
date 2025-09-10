/**
 * Tailwind Config Enhancer Modifier
 * 
 * Enhances Tailwind CSS configuration with additional plugins, themes, and content paths.
 * This is essential for proper Tailwind integration with component libraries.
 */

import { BaseModifier, ModifierParams, ModifierResult } from './base-modifier.js';
import { ProjectContext } from '../../../types/agent.js';

export class TailwindConfigEnhancerModifier extends BaseModifier {
  getDescription(): string {
    return 'Enhances Tailwind CSS configuration with additional plugins, themes, and content paths';
  }

  getSupportedFileTypes(): string[] {
    return ['js', 'ts', 'mjs'];
  }

  getParamsSchema(): any {
    return {
      type: 'object',
      properties: {
        plugins: {
          type: 'array',
          items: { type: 'string' },
          description: 'Additional Tailwind plugins to add'
        },
        content: {
          type: 'array',
          items: { type: 'string' },
          description: 'Additional content paths to scan'
        },
        theme: {
          type: 'object',
          description: 'Theme extensions to add'
        },
        darkMode: {
          type: 'string',
          enum: ['media', 'class', 'selector'],
          description: 'Dark mode strategy'
        },
        important: {
          type: 'boolean',
          description: 'Whether to use important prefix'
        },
        prefix: {
          type: 'string',
          description: 'CSS prefix to add to all classes'
        },
        separator: {
          type: 'string',
          description: 'Separator for variant modifiers'
        },
        corePlugins: {
          type: 'object',
          description: 'Core plugins configuration'
        },
        future: {
          type: 'object',
          description: 'Future features configuration'
        },
        experimental: {
          type: 'object',
          description: 'Experimental features configuration'
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
      
      // Enhance Tailwind configuration
      const enhancedContent = this.enhanceTailwindConfig(existingContent, params, context);
      
      // Write back to VFS
      await this.writeFile(filePath, enhancedContent);

      return {
        success: true,
        message: `Successfully enhanced Tailwind configuration with new plugins and content paths`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private enhanceTailwindConfig(existingContent: string, params: ModifierParams, context: ProjectContext): string {
    const {
      plugins = [],
      content = [],
      theme = {},
      darkMode,
      important,
      prefix,
      separator,
      corePlugins = {},
      future = {},
      experimental = {}
    } = params;

    // Parse existing config to extract the export
    const configMatch = existingContent.match(/export\s+default\s+([^;]+);?/);
    if (!configMatch || !configMatch[1]) {
      throw new Error('Could not find default export in Tailwind config file');
    }

    const configObject = configMatch[1].trim();
    
    // Build the enhanced configuration
    const enhancedConfig = this.buildEnhancedConfig({
      plugins,
      content,
      theme,
      darkMode,
      important,
      prefix,
      separator,
      corePlugins,
      future,
      experimental
    });
    
    // Replace the export with enhanced version
    const enhancedExport = `export default ${enhancedConfig};`;
    return existingContent.replace(/export\s+default\s+[^;]+;?/, enhancedExport);
  }

  private buildEnhancedConfig(config: any): string {
    const {
      plugins,
      content,
      theme,
      darkMode,
      important,
      prefix,
      separator,
      corePlugins,
      future,
      experimental
    } = config;

    let configString = '{\n';

    // Add content paths
    if (content.length > 0) {
      configString += `  content: [\n`;
      content.forEach((path: string) => {
        configString += `    '${path}',\n`;
      });
      configString += `  ],\n`;
    }

    // Add dark mode
    if (darkMode) {
      configString += `  darkMode: '${darkMode}',\n`;
    }

    // Add important
    if (important !== undefined) {
      configString += `  important: ${important},\n`;
    }

    // Add prefix
    if (prefix) {
      configString += `  prefix: '${prefix}',\n`;
    }

    // Add separator
    if (separator) {
      configString += `  separator: '${separator}',\n`;
    }

    // Add theme extensions
    if (Object.keys(theme).length > 0) {
      configString += `  theme: {\n`;
      configString += `    extend: {\n`;
      Object.entries(theme).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          configString += `      ${key}: {\n`;
          Object.entries(value).forEach(([subKey, subValue]) => {
            configString += `        ${subKey}: ${JSON.stringify(subValue)},\n`;
          });
          configString += `      },\n`;
        } else {
          configString += `      ${key}: ${JSON.stringify(value)},\n`;
        }
      });
      configString += `    },\n`;
      configString += `  },\n`;
    }

    // Add plugins
    if (plugins.length > 0) {
      configString += `  plugins: [\n`;
      plugins.forEach((plugin: string) => {
        configString += `    require('${plugin}'),\n`;
      });
      configString += `  ],\n`;
    }

    // Add core plugins
    if (Object.keys(corePlugins).length > 0) {
      configString += `  corePlugins: {\n`;
      Object.entries(corePlugins).forEach(([key, value]) => {
        configString += `    ${key}: ${value},\n`;
      });
      configString += `  },\n`;
    }

    // Add future
    if (Object.keys(future).length > 0) {
      configString += `  future: {\n`;
      Object.entries(future).forEach(([key, value]) => {
        configString += `    ${key}: ${value},\n`;
      });
      configString += `  },\n`;
    }

    // Add experimental
    if (Object.keys(experimental).length > 0) {
      configString += `  experimental: {\n`;
      Object.entries(experimental).forEach(([key, value]) => {
        configString += `    ${key}: ${value},\n`;
      });
      configString += `  },\n`;
    }

    configString += '}';
    return configString;
  }
}

