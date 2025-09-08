/**
 * Blueprint Orchestrator - Layer 2
 * 
 * Translates semantic actions (Layer 3) into file modification primitives (Layer 1).
 * This is the brain that knows which low-level operations to perform for each high-level intent.
 */

import { BlueprintAction } from '../../../types/adapter.js';
import { ProjectContext } from '../../../types/agent.js';
import { FileModificationEngine } from '../file-engine/index.js';

export interface OrchestrationResult {
  success: boolean;
  files: string[];
  errors: string[];
  warnings: string[];
}

export class BlueprintOrchestrator {
  private engine: FileModificationEngine;

  constructor(projectRoot: string) {
    this.engine = new FileModificationEngine(projectRoot);
  }

  /**
   * Execute a semantic action using the file modification engine
   */
  async executeSemanticAction(action: BlueprintAction, context: ProjectContext): Promise<OrchestrationResult> {
    const files: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      switch (action.type) {
        case 'CREATE_FILE':
          await this.handleCreateFile(action, context, files);
          break;
        
        case 'INSTALL_PACKAGES':
          await this.handleInstallPackages(action, context, files);
          break;
        
        case 'ADD_SCRIPT':
          await this.handleAddScript(action, context, files);
          break;
        
        case 'ADD_ENV_VAR':
          await this.handleAddEnvVar(action, context, files);
          break;
        
        case 'ADD_TS_IMPORT':
          await this.handleAddTsImport(action, context, files);
          break;
        
        case 'MERGE_JSON':
          await this.handleMergeJson(action, context, files);
          break;
        
        case 'APPEND_TO_FILE':
          await this.handleAppendToFile(action, context, files);
          break;
        
        case 'PREPEND_TO_FILE':
          await this.handlePrependToFile(action, context, files);
          break;
        
        case 'ENHANCE_FILE':
          await this.handleEnhanceFile(action, context, files);
          break;
        
        case 'RUN_COMMAND':
          await this.handleRunCommand(action, context, files);
          break;
        
        case 'MERGE_CONFIG':
          await this.handleMergeConfig(action, context, files);
          break;
        
        case 'WRAP_CONFIG':
          await this.handleWrapConfig(action, context, files);
          break;
        
        case 'EXTEND_SCHEMA':
          await this.handleExtendSchema(action, context, files);
          break;
        
        default:
          errors.push(`Unknown action type: ${action.type}`);
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    return {
      success: errors.length === 0,
      files,
      errors,
      warnings
    };
  }

  /**
   * Flush all changes to disk
   */
  async flushToDisk(): Promise<void> {
    await this.engine.flushToDisk();
  }

  /**
   * Get all files in VFS
   */
  getAllFiles() {
    return this.engine.getAllFiles();
  }

  /**
   * Get operation history
   */
  getOperations() {
    return this.engine.getOperations();
  }

  // ============================================================================
  // SEMANTIC ACTION HANDLERS
  // ============================================================================

  private async handleCreateFile(action: BlueprintAction, context: ProjectContext, files: string[]): Promise<void> {
    if (!action.path || !action.content) {
      throw new Error('CREATE_FILE requires path and content');
    }

    const processedPath = this.processTemplate(action.path, context);
    const processedContent = this.processTemplate(action.content, context);
    
    const result = await this.engine.createFile(processedPath, processedContent);
    if (result.success) {
      files.push(result.filePath);
    } else {
      throw new Error(result.error);
    }
  }

  private async handleInstallPackages(action: BlueprintAction, context: ProjectContext, files: string[]): Promise<void> {
    if (!action.packages || action.packages.length === 0) {
      throw new Error('INSTALL_PACKAGES requires packages array');
    }

    // Process template variables in packages
    const processedPackages = action.packages.map(pkg => this.processTemplate(pkg, context));
    
    // Build dependencies object
    const dependencies: Record<string, string> = {};
    for (const pkg of processedPackages) {
      // Extract package name and version
      const parts = pkg.includes('@') ? pkg.split('@') : [pkg, 'latest'];
      const name = parts[0];
      const version = parts[1] || 'latest';
      if (name) {
        dependencies[name] = version;
      }
    }

    // Merge into package.json
    const result = await this.engine.mergeJsonFile('package.json', {
      [action.isDev ? 'devDependencies' : 'dependencies']: dependencies
    });

    if (result.success) {
      files.push(result.filePath);
    } else {
      throw new Error(result.error);
    }
  }

  private async handleAddScript(action: BlueprintAction, context: ProjectContext, files: string[]): Promise<void> {
    if (!action.name || !action.command) {
      throw new Error('ADD_SCRIPT requires name and command');
    }

    const processedName = this.processTemplate(action.name, context);
    const processedCommand = this.processTemplate(action.command, context);

    const result = await this.engine.mergeJsonFile('package.json', {
      scripts: {
        [processedName]: processedCommand
      }
    });

    if (result.success) {
      files.push(result.filePath);
    } else {
      throw new Error(result.error);
    }
  }

  private async handleAddEnvVar(action: BlueprintAction, context: ProjectContext, files: string[]): Promise<void> {
    if (!action.key || !action.value) {
      throw new Error('ADD_ENV_VAR requires key and value');
    }

    const processedKey = this.processTemplate(action.key, context);
    const processedValue = this.processTemplate(action.value, context);
    const processedDescription = action.description ? this.processTemplate(action.description, context) : undefined;

    // Add to .env.example
    const envExampleContent = this.buildEnvVarContent(processedKey, processedValue, processedDescription);
    const envExampleResult = await this.engine.appendToFile('.env.example', envExampleContent);
    if (envExampleResult.success) {
      files.push(envExampleResult.filePath);
    }

    // Add to .env if it exists
    try {
      await this.engine.readFile('.env');
      const envContent = this.buildEnvVarContent(processedKey, processedValue, processedDescription);
      const envResult = await this.engine.appendToFile('.env', envContent);
      if (envResult.success) {
        files.push(envResult.filePath);
      }
    } catch {
      // .env file does not exist, skip adding to it
    }
  }

  private async handleAddTsImport(action: BlueprintAction, context: ProjectContext, files: string[]): Promise<void> {
    if (!action.path || !action.imports || action.imports.length === 0) {
      throw new Error('ADD_TS_IMPORT requires path and imports array');
    }

    const processedPath = this.processTemplate(action.path, context);

    const result = await this.engine.modifyTsFile(processedPath, (sourceFile) => {
      for (const importDef of action.imports!) {
        const importStructure: any = {
          moduleSpecifier: importDef.moduleSpecifier
        };
        
        if (importDef.namedImports) {
          importStructure.namedImports = importDef.namedImports;
        }
        if (importDef.defaultImport) {
          importStructure.defaultImport = importDef.defaultImport;
        }
        if (importDef.namespaceImport) {
          importStructure.namespaceImport = importDef.namespaceImport;
        }
        
        sourceFile.addImportDeclaration(importStructure);
      }
    });

    if (result.success) {
      files.push(result.filePath);
    } else {
      throw new Error(result.error);
    }
  }

  private async handleMergeJson(action: BlueprintAction, context: ProjectContext, files: string[]): Promise<void> {
    if (!action.path || !action.content) {
      throw new Error('MERGE_JSON requires path and content');
    }

    const processedPath = this.processTemplate(action.path, context);
    const processedContent = typeof action.content === 'string' 
      ? JSON.parse(this.processTemplate(action.content, context))
      : action.content;

    const result = await this.engine.mergeJsonFile(processedPath, processedContent);
    if (result.success) {
      files.push(result.filePath);
    } else {
      throw new Error(result.error);
    }
  }

  private async handleAppendToFile(action: BlueprintAction, context: ProjectContext, files: string[]): Promise<void> {
    if (!action.path || !action.content) {
      throw new Error('APPEND_TO_FILE requires path and content');
    }

    const processedPath = this.processTemplate(action.path, context);
    const processedContent = this.processTemplate(action.content, context);

    const result = await this.engine.appendToFile(processedPath, processedContent);
    if (result.success) {
      files.push(result.filePath);
    } else {
      throw new Error(result.error);
    }
  }

  private async handlePrependToFile(action: BlueprintAction, context: ProjectContext, files: string[]): Promise<void> {
    if (!action.path || !action.content) {
      throw new Error('PREPEND_TO_FILE requires path and content');
    }

    const processedPath = this.processTemplate(action.path, context);
    const processedContent = this.processTemplate(action.content, context);

    const result = await this.engine.prependToFile(processedPath, processedContent);
    if (result.success) {
      files.push(result.filePath);
    } else {
      throw new Error(result.error);
    }
  }

  private async handleEnhanceFile(action: BlueprintAction, context: ProjectContext, files: string[]): Promise<void> {
    if (!action.path || !action.modifier) {
      throw new Error('ENHANCE_FILE requires path and modifier');
    }

    const processedPath = this.processTemplate(action.path, context);
    
    // Get modifier function from registry
    const modifier = this.getModifier(action.modifier);
    if (!modifier) {
      if (action.fallback === 'skip') {
        console.warn(`Modifier '${action.modifier}' not found, skipping enhancement of ${processedPath}`);
        return;
      } else if (action.fallback === 'create') {
        // Create file with basic content if it doesn't exist
        await this.engine.createFile(processedPath, '// Enhanced file\n');
        files.push(processedPath);
        return;
      } else {
        throw new Error(`Modifier '${action.modifier}' not found`);
      }
    }

    // Execute modifier function
    const result = await this.engine.modifyTsFile(processedPath, (sourceFile) => {
      // For now, just add a comment since we don't have the modifier registry integrated
      sourceFile.addStatements('// Enhanced by modifier: ' + action.modifier);
    });

    if (result.success) {
      files.push(result.filePath);
    } else {
      throw new Error(result.error);
    }
  }

  private async handleRunCommand(action: BlueprintAction, context: ProjectContext, files: string[]): Promise<void> {
    if (!action.command) {
      throw new Error('RUN_COMMAND requires command');
    }

    const processedCommand = this.processTemplate(action.command, context);
    
    // For now, we'll just track the command - actual execution would be handled by CommandRunner
    console.log(`Would execute command: ${processedCommand}`);
    // TODO: Integrate with CommandRunner
  }


  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private processTemplate(template: string, context: ProjectContext): string {
    let processed = template;
    
    // 1. Process path variables first (from decentralized path handler)
    if (context.pathHandler && typeof context.pathHandler.resolveTemplate === 'function') {
      processed = context.pathHandler.resolveTemplate(processed);
    }
    
    // 2. Process other template variables
    processed = processed.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
      const keys = variable.trim().split('.');
      let value: any = context;
      
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key];
        } else {
          return match; // Return original if not found
        }
      }
      
      return String(value || '');
    });
    
    return processed;
  }

  private buildEnvVarContent(key: string, value: string, description?: string): string {
    let content = '';
    if (description) {
      content += `# ${description}\n`;
    }
    content += `${key}=${value}\n`;
    return content;
  }

  private getModifier(modifierName: string) {
    // TODO: Integrate with modifier registry
    // For now, return null to trigger fallback behavior
    return null;
  }

  // ============================================================================
  // SMART INTEGRATION ACTION HANDLERS
  // ============================================================================

  private async handleMergeConfig(action: BlueprintAction, context: ProjectContext, files: string[]): Promise<void> {
    if (!action.path || !action.config) {
      throw new Error('MERGE_CONFIG requires path and config');
    }

    const processedPath = this.processTemplate(action.path, context);
    const strategy = action.strategy || 'deep-merge';

    // Read existing config
    let existingConfig = {};
    try {
      const content = await this.engine.readFile(processedPath);
      existingConfig = JSON.parse(content);
    } catch {
      // File doesn't exist, start with empty config
    }

    // Merge configs based on strategy
    let mergedConfig;
    switch (strategy) {
      case 'deep-merge':
        mergedConfig = this.deepMerge(existingConfig, action.config);
        break;
      case 'shallow-merge':
        mergedConfig = { ...existingConfig, ...action.config };
        break;
      case 'replace':
        mergedConfig = action.config;
        break;
      default:
        throw new Error(`Unknown merge strategy: ${strategy}`);
    }

    // Write merged config back
    const result = await this.engine.overwriteFile(processedPath, JSON.stringify(mergedConfig, null, 2));
    if (result.success) {
      files.push(result.filePath);
    } else {
      throw new Error(result.error);
    }
  }

  private async handleWrapConfig(action: BlueprintAction, context: ProjectContext, files: string[]): Promise<void> {
    if (!action.path || !action.wrapper) {
      throw new Error('WRAP_CONFIG requires path and wrapper');
    }

    const processedPath = this.processTemplate(action.path, context);
    const wrapperName = this.processTemplate(action.wrapper, context);
    const options = action.options || {};

    // Read existing config
    let existingConfigContent = '';
    try {
      existingConfigContent = await this.engine.readFile(processedPath);
    } catch {
      throw new Error(`Config file not found: ${processedPath}`);
    }

    // Create wrapper content
    const wrapperContent = this.buildWrapperConfig(existingConfigContent, wrapperName, options);

    // Write wrapped config
    const result = await this.engine.overwriteFile(processedPath, wrapperContent);
    if (result.success) {
      files.push(result.filePath);
    } else {
      throw new Error(result.error);
    }
  }

  private async handleExtendSchema(action: BlueprintAction, context: ProjectContext, files: string[]): Promise<void> {
    if (!action.path || !action.tables || action.tables.length === 0) {
      throw new Error('EXTEND_SCHEMA requires path and tables');
    }

    const processedPath = this.processTemplate(action.path, context);

    // Read existing schema
    let existingContent = '';
    try {
      existingContent = await this.engine.readFile(processedPath);
    } catch {
      throw new Error(`Schema file not found: ${processedPath}`);
    }

    // Add new tables to existing schema
    const newTablesContent = action.tables
      .map(table => this.processTemplate(table.definition, context))
      .join('\n\n');

    const extendedContent = existingContent + '\n\n' + newTablesContent;

    // Write extended schema
    const result = await this.engine.overwriteFile(processedPath, extendedContent);
    if (result.success) {
      files.push(result.filePath);
    } else {
      throw new Error(result.error);
    }
  }

  // ============================================================================
  // HELPER METHODS FOR SMART ACTIONS
  // ============================================================================

  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  private buildWrapperConfig(existingConfig: string, wrapperName: string, options: Record<string, any>): string {
    // Extract the existing config object
    const configMatch = existingConfig.match(/module\.exports\s*=\s*(\{[\s\S]*\})/);
    if (!configMatch) {
      throw new Error('Could not parse existing config object');
    }

    const existingConfigObject = configMatch[1];
    const optionsString = JSON.stringify(options, null, 2);

    return `const { ${wrapperName} } = require('${wrapperName}');

${existingConfig}

module.exports = ${wrapperName}(${existingConfigObject}, ${optionsString});
`;
  }
}
