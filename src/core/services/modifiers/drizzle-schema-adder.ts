/**
 * Drizzle Schema Adder Modifier
 * 
 * Adds schema definitions to existing Drizzle schema files.
 * This is essential for extending database schemas with new tables.
 */

import { BaseModifier, ModifierParams, ModifierResult } from './base-modifier.js';
import { ProjectContext } from '../../../types/agent.js';

export class DrizzleSchemaAdderModifier extends BaseModifier {
  getDescription(): string {
    return 'Adds schema definitions to existing Drizzle schema files';
  }

  getSupportedFileTypes(): string[] {
    return ['ts', 'js', 'mjs'];
  }

  getParamsSchema(): any {
    return {
      type: 'object',
      required: ['schemaDefinitions'],
      properties: {
        schemaDefinitions: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of schema definition strings to add'
        },
        imports: {
          type: 'array',
          items: { type: 'string' },
          description: 'Additional imports needed for the schema definitions'
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
      
      // Add schema definitions
      const enhancedContent = this.addSchemaDefinitions(existingContent, params);
      
      // Write back to VFS
      await this.writeFile(filePath, enhancedContent);

      return {
        success: true,
        message: `Successfully added ${params.schemaDefinitions.length} schema definitions`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private addSchemaDefinitions(existingContent: string, params: ModifierParams): string {
    const { schemaDefinitions, imports = [] } = params;

    let newContent = existingContent;

    // Add imports if they don't exist
    if (imports.length > 0) {
      newContent = this.addImports(newContent, imports);
    }

    // Add schema definitions
    const schemaCode = schemaDefinitions.join('\n\n');
    newContent += '\n\n' + schemaCode;

    return newContent;
  }

  private addImports(content: string, imports: string[]): string {
    // Check if imports already exist
    const existingImports = content.match(/import\s*{([^}]+)}\s*from\s*['"][^'"]+['"];?/g) || [];
    const existingImportNames = existingImports
      .map(imp => imp.match(/{([^}]+)}/)?.[1])
      .join(',')
      .split(',')
      .map(name => name.trim());

    // Find the last import statement
    const lastImportIndex = content.lastIndexOf('import');
    if (lastImportIndex === -1) {
      // No imports found, add at the beginning
      const importStatement = `import { ${imports.join(', ')} } from 'drizzle-orm/pg-core';\n`;
      return importStatement + content;
    }

    // Find the end of the last import statement
    const lastImportEnd = content.indexOf('\n', lastImportIndex) + 1;
    
    // Check which imports are missing
    const missingImports = imports.filter(imp => !existingImportNames.includes(imp));
    
    if (missingImports.length === 0) {
      return content; // All imports already exist
    }

    // Add missing imports to the last import statement
    const lastImport = existingImports[existingImports.length - 1];
    if (!lastImport) {
      return content;
    }
    
    const importMatch = lastImport.match(/import\s*{([^}]+)}\s*from\s*(['"][^'"]+['"])/);
    
    if (importMatch && importMatch[1] && importMatch[2]) {
      const existingImportsInLast = importMatch[1].split(',').map(name => name.trim());
      const allImports = [...existingImportsInLast, ...missingImports];
      const newImport = `import { ${allImports.join(', ')} } from ${importMatch[2]};`;
      
      return content.replace(lastImport, newImport);
    }

    return content;
  }
}
