/**
 * Blueprint Orchestrator - Layer 2
 * 
 * Translates semantic actions (Layer 3) into file modification primitives (Layer 1).
 * This is the brain that knows which low-level operations to perform for each high-level intent.
 */

import { BlueprintAction } from '../../../types/adapter.js';
import { ProjectContext } from '../../../types/agent.js';
import { BlueprintContext } from '../../../types/blueprint-context.js';
import { FileModificationEngine } from '../file-engine/index.js';
import { getModifierRegistry } from '../modifiers/modifier-registry.js';
import { registerAllModifiers } from '../modifiers/register-modifiers.js';
import { TemplateService } from '../template/index.js';
import { ErrorHandler, ErrorCode } from '../error/index.js';
import { TsFileModifier, ImportStructure, DeepMergeTarget, DeepMergeSource } from '../../../types/common.js';
import { SourceFile } from 'ts-morph';

export interface OrchestrationResult {
  success: boolean;
  files: string[];
  errors: string[];
  warnings: string[];
}

export class BlueprintOrchestrator {
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * Execute a semantic action using the file modification engine
   */
  async executeSemanticAction(action: BlueprintAction, context: ProjectContext, blueprintContext: BlueprintContext): Promise<OrchestrationResult> {
    const files: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      switch (action.type) {
        case 'CREATE_FILE':
          await this.handleCreateFile(action, context, blueprintContext, files);
          break;
        
        case 'INSTALL_PACKAGES':
          await this.handleInstallPackages(action, context, blueprintContext, files);
          break;
        
        case 'ADD_SCRIPT':
          await this.handleAddScript(action, context, blueprintContext, files);
          break;
        
        case 'ADD_ENV_VAR':
          await this.handleAddEnvVar(action, context, blueprintContext, files);
          break;
        
        case 'ADD_TS_IMPORT':
          await this.handleAddTsImport(action, context, blueprintContext, files);
          break;
        
        case 'MERGE_JSON':
          await this.handleMergeJson(action, context, blueprintContext, files);
          break;
        
        case 'APPEND_TO_FILE':
          await this.handleAppendToFile(action, context, blueprintContext, files);
          break;
        
        case 'PREPEND_TO_FILE':
          await this.handlePrependToFile(action, context, blueprintContext, files);
          break;
        
        case 'ENHANCE_FILE':
          await this.handleEnhanceFile(action, context, blueprintContext, files);
          break;
        
        case 'RUN_COMMAND':
          await this.handleRunCommand(action, context, blueprintContext, files);
          break;
        
        case 'MERGE_CONFIG':
          await this.handleMergeConfig(action, context, blueprintContext, files);
          break;
        
        case 'WRAP_CONFIG':
          await this.handleWrapConfig(action, context, blueprintContext, files);
          break;
        
        case 'EXTEND_SCHEMA':
          await this.handleExtendSchema(action, context, blueprintContext, files);
          break;
        
        default:
          const errorResult = ErrorHandler.createError(
            `Unknown action type: ${action.type}`,
            { operation: 'action_execution', actionType: action.type },
            ErrorCode.ACTION_EXECUTION_ERROR,
            false
          );
          errors.push(errorResult.error);
      }
    } catch (error) {
      const errorResult = ErrorHandler.handleActionError(
        error,
        action.type,
        context.module?.id || 'unknown'
      );
      errors.push(errorResult.error);
    }

    return {
      success: errors.length === 0,
      files,
      errors,
      warnings
    };
  }


  // ============================================================================
  // SEMANTIC ACTION HANDLERS
  // ============================================================================

  private async handleCreateFile(action: BlueprintAction, context: ProjectContext, blueprintContext: BlueprintContext, files: string[]): Promise<void> {
    if (!action.path || !action.content) {
      const errorResult = ErrorHandler.createError(
        'CREATE_FILE requires path and content',
        { operation: 'create_file', actionType: 'CREATE_FILE' },
        ErrorCode.ACTION_EXECUTION_ERROR,
        false
      );
      throw new Error(errorResult.error);
    }

    const processedPath = this.processTemplate(action.path, context);
    const processedContent = this.processTemplate(action.content, context);
    
    console.log(`  🔧 Creating file: ${processedPath}`);
    console.log(`  🔧 Content length: ${processedContent.length} characters`);
    
    // Create engine with blueprint's VFS
    const engine = new FileModificationEngine(blueprintContext.vfs, blueprintContext.projectRoot);
    
    // Check if file already exists in VFS
    if (engine.fileExists(processedPath)) {
      console.log(`  ⚠️  File already exists: ${processedPath} - skipping creation`);
      return;
    }
    
    const result = await engine.createFile(processedPath, processedContent);
    if (result.success) {
      console.log(`  ✅ File created successfully: ${result.filePath}`);
      files.push(result.filePath);
    } else {
      const errorResult = ErrorHandler.handleFileError(
        new Error(result.error),
        processedPath,
        'create'
      );
      console.error(`  ❌ File creation failed: ${errorResult.error}`);
      throw new Error(errorResult.error);
    }
  }

  private async handleInstallPackages(action: BlueprintAction, context: ProjectContext, blueprintContext: BlueprintContext, files: string[]): Promise<void> {
    if (!action.packages || action.packages.length === 0) {
      throw new Error('INSTALL_PACKAGES requires packages array');
    }

    // Process template variables in packages
    const processedPackages = action.packages.map(pkg => this.processTemplate(pkg, context));
    
    // Build dependencies object
    const dependencies: Record<string, string> = {};
    for (const pkg of processedPackages) {
      // Extract package name and version
      const parts = pkg.includes('@') && !pkg.startsWith('@') ? pkg.split('@') : [pkg, 'latest'];
      const name = parts[0];
      const version = parts[1] || 'latest';
      if (name) {
        dependencies[name] = version;
      }
    }

    // Create engine with blueprint's VFS
    const engine = new FileModificationEngine(blueprintContext.vfs, blueprintContext.projectRoot);
    
    // Use the VFS mergeJsonFile method to properly handle file merging
    const dependencyKey = action.isDev ? 'devDependencies' : 'dependencies';
    const mergeContent = {
      [dependencyKey]: dependencies
    };

    const result = await engine.mergeJsonFile('package.json', mergeContent);
    if (result.success) {
      files.push(result.filePath);
    } else {
      throw new Error(result.error);
    }
    
    console.log(`Added ${action.isDev ? 'dev dependencies' : 'dependencies'}: ${Object.keys(dependencies).join(', ')}`);
  }

  private async handleAddScript(action: BlueprintAction, context: ProjectContext, blueprintContext: BlueprintContext, files: string[]): Promise<void> {
    if (!action.name || !action.command) {
      throw new Error('ADD_SCRIPT requires name and command');
    }

    const processedName = this.processTemplate(action.name, context);
    const processedCommand = this.processTemplate(action.command, context);

    // Create engine with blueprint's VFS
    const engine = new FileModificationEngine(blueprintContext.vfs, blueprintContext.projectRoot);
    
    const result = await engine.mergeJsonFile('package.json', {
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

  private async handleAddEnvVar(action: BlueprintAction, context: ProjectContext, blueprintContext: BlueprintContext, files: string[]): Promise<void> {
    if (!action.key || !action.value) {
      throw new Error('ADD_ENV_VAR requires key and value');
    }

    const processedKey = this.processTemplate(action.key, context);
    const processedValue = this.processTemplate(action.value, context);
    const processedDescription = action.description ? this.processTemplate(action.description, context) : undefined;

    // Add to .env.example
    const envExampleContent = this.buildEnvVarContent(processedKey, processedValue, processedDescription);
    // Create engine with blueprint's VFS
    const engine = new FileModificationEngine(blueprintContext.vfs, blueprintContext.projectRoot);
    const envExampleResult = await engine.appendToFile('.env.example', envExampleContent);
    if (envExampleResult.success) {
      files.push(envExampleResult.filePath);
    }

    // Add to .env if it exists
    try {
      await engine.readFile('.env');
      const envContent = this.buildEnvVarContent(processedKey, processedValue, processedDescription);
      const envResult = await engine.appendToFile('.env', envContent);
      if (envResult.success) {
        files.push(envResult.filePath);
      }
    } catch {
      // .env file does not exist, skip adding to it
    }
  }

  private async handleAddTsImport(action: BlueprintAction, context: ProjectContext, blueprintContext: BlueprintContext, files: string[]): Promise<void> {
    if (!action.path || !action.imports || action.imports.length === 0) {
      throw new Error('ADD_TS_IMPORT requires path and imports array');
    }

    const processedPath = this.processTemplate(action.path, context);

    // Create engine with blueprint's VFS
    const engine = new FileModificationEngine(blueprintContext.vfs, blueprintContext.projectRoot);
    const result = await engine.modifyTsFile(processedPath, (sourceFile: SourceFile) => {
      for (const importDef of action.imports!) {
        const importStructure: ImportStructure = {
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

  private async handleMergeJson(action: BlueprintAction, context: ProjectContext, blueprintContext: BlueprintContext, files: string[]): Promise<void> {
    if (!action.path || !action.content) {
      throw new Error('MERGE_JSON requires path and content');
    }

    const processedPath = this.processTemplate(action.path, context);
    const processedContent = typeof action.content === 'string' 
      ? JSON.parse(this.processTemplate(action.content, context))
      : action.content;

    // Create engine with blueprint's VFS
    const engine = new FileModificationEngine(blueprintContext.vfs, blueprintContext.projectRoot);
    const result = await engine.mergeJsonFile(processedPath, processedContent);
    if (result.success) {
      files.push(result.filePath);
    } else {
      throw new Error(result.error);
    }
  }

  private async handleAppendToFile(action: BlueprintAction, context: ProjectContext, blueprintContext: BlueprintContext, files: string[]): Promise<void> {
    if (!action.path || !action.content) {
      throw new Error('APPEND_TO_FILE requires path and content');
    }

    const processedPath = this.processTemplate(action.path, context);
    const processedContent = this.processTemplate(action.content, context);

    // Create engine with blueprint's VFS
    const engine = new FileModificationEngine(blueprintContext.vfs, blueprintContext.projectRoot);
    const result = await engine.appendToFile(processedPath, processedContent);
    if (result.success) {
      files.push(result.filePath);
    } else {
      throw new Error(result.error);
    }
  }

  private async handlePrependToFile(action: BlueprintAction, context: ProjectContext, blueprintContext: BlueprintContext, files: string[]): Promise<void> {
    if (!action.path || !action.content) {
      throw new Error('PREPEND_TO_FILE requires path and content');
    }

    const processedPath = this.processTemplate(action.path, context);
    const processedContent = this.processTemplate(action.content, context);

    // Create engine with blueprint's VFS
    const engine = new FileModificationEngine(blueprintContext.vfs, blueprintContext.projectRoot);
    const result = await engine.prependToFile(processedPath, processedContent);
    if (result.success) {
      files.push(result.filePath);
    } else {
      throw new Error(result.error);
    }
  }

  private async handleEnhanceFile(action: BlueprintAction, context: ProjectContext, blueprintContext: BlueprintContext, files: string[]): Promise<void> {
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
        const engine = new FileModificationEngine(blueprintContext.vfs, blueprintContext.projectRoot);
        await engine.createFile(processedPath, '// Enhanced file\n');
        files.push(processedPath);
        return;
      } else {
        throw new Error(`Modifier '${action.modifier}' not found`);
      }
    }

    // Execute modifier function
    try {
      await modifier.handler(processedPath, action.params || {}, context);
      files.push(processedPath);
    } catch (error) {
      throw new Error(`Modifier '${action.modifier}' failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleRunCommand(action: BlueprintAction, context: ProjectContext, blueprintContext: BlueprintContext, files: string[]): Promise<void> {
    if (!action.command) {
      throw new Error('RUN_COMMAND requires command');
    }

    const processedCommand = this.processTemplate(action.command, context);
    
    // Execute the command using CommandRunner
    const { CommandRunner } = await import('../../cli/command-runner.js');
    const commandRunner = new CommandRunner();
    
    console.log(`Executing command: ${processedCommand}`);
    
    try {
      // Use execNonInteractive for commands that might ask for input
      const commandParts = processedCommand.split(' ');
      const command = commandParts[0];
      const args = commandParts.slice(1);
      
      if (!command) {
        throw new Error('Command cannot be empty');
      }
      
      const result = await commandRunner.execNonInteractive(
        command, 
        args,
        ['y', 'yes'], // Default answers for interactive prompts
        blueprintContext.projectRoot
      );
      
      if (result.code !== 0) {
        console.error(`Command failed with exit code ${result.code}`);
        console.error(`STDOUT: ${result.stdout}`);
        console.error(`STDERR: ${result.stderr}`);
        throw new Error(`Command failed with exit code ${result.code}: ${result.stderr}`);
      }
      
      console.log(`Command executed successfully: ${processedCommand}`);
    } catch (error) {
      console.error(`Failed to execute command '${processedCommand}'`);
      console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error(`Failed to execute command '${processedCommand}': ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }


  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  public processTemplate(template: string, context: ProjectContext): string {
    return TemplateService.processTemplate(template, context);
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
    const registry = getModifierRegistry();
    return registry.get(modifierName);
  }

  // ============================================================================
  // SMART INTEGRATION ACTION HANDLERS
  // ============================================================================

  private async handleMergeConfig(action: BlueprintAction, context: ProjectContext, blueprintContext: BlueprintContext, files: string[]): Promise<void> {
    if (!action.path || !action.config) {
      throw new Error('MERGE_CONFIG requires path and config');
    }

    const processedPath = this.processTemplate(action.path, context);
    const strategy = action.strategy || 'deep-merge';

    // Create engine with blueprint's VFS
    const engine = new FileModificationEngine(blueprintContext.vfs, blueprintContext.projectRoot);
    
    // Read existing config
    let existingConfig = {};
    try {
      const content = await engine.readFile(processedPath);
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
    const result = await engine.overwriteFile(processedPath, JSON.stringify(mergedConfig, null, 2));
    if (result.success) {
      files.push(result.filePath);
    } else {
      throw new Error(result.error);
    }
  }

  private async handleWrapConfig(action: BlueprintAction, context: ProjectContext, blueprintContext: BlueprintContext, files: string[]): Promise<void> {
    if (!action.path || !action.wrapper) {
      throw new Error('WRAP_CONFIG requires path and wrapper');
    }

    const processedPath = this.processTemplate(action.path, context);
    const wrapperName = this.processTemplate(action.wrapper, context);
    const options = action.options || {};

    // Create engine with blueprint's VFS
    const engine = new FileModificationEngine(blueprintContext.vfs, blueprintContext.projectRoot);
    
    // Read existing config
    let existingConfigContent = '';
    try {
      existingConfigContent = await engine.readFile(processedPath);
    } catch {
      throw new Error(`Config file not found: ${processedPath}`);
    }

    // Create wrapper content
    const wrapperContent = this.buildWrapperConfig(existingConfigContent, wrapperName, options);

    // Write wrapped config
    const result = await engine.overwriteFile(processedPath, wrapperContent);
    if (result.success) {
      files.push(result.filePath);
    } else {
      throw new Error(result.error);
    }
  }

  private async handleExtendSchema(action: BlueprintAction, context: ProjectContext, blueprintContext: BlueprintContext, files: string[]): Promise<void> {
    if (!action.path || !action.tables || action.tables.length === 0) {
      throw new Error('EXTEND_SCHEMA requires path and tables');
    }

    const processedPath = this.processTemplate(action.path, context);

    // Create engine with blueprint's VFS
    const engine = new FileModificationEngine(blueprintContext.vfs, blueprintContext.projectRoot);
    
    // Read existing schema
    let existingContent = '';
    try {
      existingContent = await engine.readFile(processedPath);
    } catch {
      throw new Error(`Schema file not found: ${processedPath}`);
    }

    // Add new tables to existing schema
    const newTablesContent = action.tables
      .map(table => this.processTemplate(table.definition, context))
      .join('\n\n');

    const extendedContent = existingContent + '\n\n' + newTablesContent;

    // Write extended schema
    const result = await engine.overwriteFile(processedPath, extendedContent);
    if (result.success) {
      files.push(result.filePath);
    } else {
      throw new Error(result.error);
    }
  }

  // ============================================================================
  // HELPER METHODS FOR SMART ACTIONS
  // ============================================================================

  private deepMerge(target: DeepMergeTarget, source: DeepMergeSource): DeepMergeTarget {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge((target[key] as DeepMergeTarget) || {}, source[key] as DeepMergeSource);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  private buildWrapperConfig(existingConfig: string, wrapperName: string, options: Record<string, unknown>): string {
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
