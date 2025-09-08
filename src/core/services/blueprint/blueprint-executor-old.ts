/**
 * Blueprint Executor - V1 Simple Blueprint Execution
 * 
 * Executes blueprints with 2 action types: ADD_CONTENT and RUN_COMMAND
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { Blueprint, BlueprintAction, BlueprintExecutionResult, AdapterConfig, ImportDefinition } from '../../../types/adapter.js';
import { ProjectContext } from '../../../types/agent.js';
import { CommandRunner } from '../../cli/command-runner.js';
import { ParameterResolver } from '../../../types/parameter-schema.js';
import { logger } from '../../utils/logger.js';
import { BlueprintOrchestrator } from '../blueprint-orchestrator/index.js';

export class BlueprintExecutor {
  private commandRunner: CommandRunner;
  private orchestrator: BlueprintOrchestrator;
  private currentAction: BlueprintAction | null = null;

  constructor(projectRoot: string) {
    this.commandRunner = new CommandRunner();
    this.orchestrator = new BlueprintOrchestrator(projectRoot);
  }

  /**
   * Execute a blueprint
   */
  async executeBlueprint(blueprint: Blueprint, context: ProjectContext): Promise<BlueprintExecutionResult> {
    console.log(`🎯 Executing blueprint: ${blueprint.name}`);
    
    const files: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    
    for (let i = 0; i < blueprint.actions.length; i++) {
      const action = blueprint.actions[i];
      
      if (!action) {
        errors.push(`Action at index ${i} is undefined`);
        continue;
      }
      
      console.log(`  📋 [${i + 1}/${blueprint.actions.length}] ${action.type}`);
      console.log(`  🔍 Action path: ${action.path}`);
      console.log(`  🔍 Action condition: ${action.condition}`);
      
      // Check action condition before processing
      if (action.condition) {
        const shouldExecute = this.evaluateCondition(action.condition, context);
        console.log(`  🔍 Action condition evaluation: ${action.condition} = ${shouldExecute}`);
        if (!shouldExecute) {
          console.log(`  ⏭️ Skipping action due to condition: ${action.condition}`);
          continue;
        }
      }
      
      // Set current action for context-aware processing
      this.currentAction = action;
      
      try {
        // Use orchestrator for all semantic actions
        const result = await this.orchestrator.executeSemanticAction(action, context);
        
        if (result.success) {
          files.push(...result.files);
          warnings.push(...result.warnings);
        } else {
          errors.push(...result.errors);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Action ${i + 1} failed: ${errorMessage}`);
      }
    }
    
    const success = errors.length === 0;
    
    // Flush all changes to disk
    if (success) {
      await this.orchestrator.flushToDisk();
    }
    
    return {
      success,
      files,
      errors,
      warnings
    };
  }

  /**
   * Detect file type from target path
   */
  private detectFileType(target: string): 'typescript' | 'javascript' | 'json' | 'env' | 'auto' {
    if (target.endsWith('.ts') || target.endsWith('.tsx')) return 'typescript';
    if (target.endsWith('.js') || target.endsWith('.jsx')) return 'javascript';
    if (target.endsWith('.json')) return 'json';
    if (target.endsWith('.env') || target.endsWith('.env.example')) return 'env';
    return 'auto';
  }

  /**
   * Handle RUN_COMMAND action
   */
  private async handleRunCommand(action: BlueprintAction, context: ProjectContext): Promise<{ success: boolean; error?: string }> {
    if (!action.command) {
      return { success: false, error: 'RUN_COMMAND action must have command' };
    }
    
    try {
      // Replace variables in command
      const processedCommand = this.processTemplate(action.command, context);
      
      // Debug logging
      logger.debug(`Original command: ${action.command}`);
      logger.debug(`Processed command: ${processedCommand}`);
      logger.debug(`Module parameters:`, context.module?.parameters);
      
      // Execute command - split into command and args
      const commandParts = processedCommand.split(' ');
      const [command, ...args] = commandParts;
      if (!command) {
        return { success: false, error: 'Command is empty' };
      }
      
      // Handle interactive commands that need user input
      if (this.isInteractiveCommand(command, args)) {
        await this.handleInteractiveCommand(command, args, context);
      } else {
        await this.commandRunner.execCommand([command, ...args], { cwd: context.project.path || '.' });
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Check if a command is interactive and needs special handling
   */
  private isInteractiveCommand(command: string, args: string[]): boolean {
    // Shadcn CLI commands that might ask for interactive input
    if (command.includes('shadcn') && (args.includes('init') || args.includes('add'))) {
      return true;
    }
    
    // Add other interactive commands here as needed
    return false;
  }

  /**
   * Handle interactive commands by providing expected input
   */
  private async handleInteractiveCommand(command: string, args: string[], context: ProjectContext): Promise<void> {
    const cwd = context.project.path || '.';
    
    if (command.includes('shadcn')) {
      if (args.includes('init')) {
        // For shadcn init, provide "yes" to proceed with components.json creation
        await this.commandRunner.execNonInteractive(command, args, ['yes'], cwd);
      } else if (args.includes('add')) {
        // For shadcn add, it should work non-interactively
        await this.commandRunner.execCommand([command, ...args], { cwd });
      }
    } else {
      // Fallback to regular command execution
      await this.commandRunner.execCommand([command, ...args], { cwd });
    }
  }

  /**
   * Resolve file path
   */
  private resolvePath(target: string, context: ProjectContext): string {
    if (path.isAbsolute(target)) {
      return target;
    }
    
    return path.join(context.project.path, target);
  }

  /**
   * Process template variables with enhanced support and conditional logic
   */
  private processTemplate(content: string, context: ProjectContext): string {
    let processed = content;
    
    // Process conditional blocks first
    processed = this.processConditionals(processed, context);
    
    // 1. Process path variables first (from decentralized path handler)
    if (context.pathHandler && typeof context.pathHandler.resolveTemplate === 'function') {
      processed = context.pathHandler.resolveTemplate(processed);
    }
    
    // 2. Project variables
    processed = processed
      .replace(/\{\{project\.name\}\}/g, context.project.name)
      .replace(/\{\{project\.path\}\}/g, context.project.path)
      .replace(/\{\{project\.framework\}\}/g, context.project.framework)
      .replace(/\{\{project\.description\}\}/g, context.project.description || '')
      .replace(/\{\{project\.author\}\}/g, context.project.author || '')
      .replace(/\{\{project\.version\}\}/g, context.project.version || '0.1.0')
      .replace(/\{\{project\.license\}\}/g, context.project.license || 'MIT');
    
    // 3. Module parameters with defaults (enhanced)
    if (context.module?.parameters) {
      // Get adapter schema for defaults (if available)
      const adapterSchema = (context as any).adapter?.parameters || {};
      
      logger.debug(`Adapter schema:`, adapterSchema);
      
      // Resolve parameters with defaults
      const resolvedParams = ParameterResolver.resolveParameters(
        context.module.parameters,
        adapterSchema
      );
      
      logger.debug(`Resolved parameters:`, resolvedParams);
      
      Object.entries(resolvedParams).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{module\\.parameters\\.${key}\\}\\}`, 'g');
        const beforeReplace = processed;
        // Context-aware array processing
        const processedValue = this.processValueForContext(value, context);
        processed = processed.replace(regex, processedValue);
        if (beforeReplace !== processed) {
          logger.debug(`Replaced {{module.parameters.${key}}} with ${processedValue}`);
        }
      });
    }
    
    // 4. Module metadata
    if (context.module) {
      processed = processed
        .replace(/\{\{module\.id\}\}/g, context.module.id)
        .replace(/\{\{module\.category\}\}/g, context.module.category)
        .replace(/\{\{module\.version\}\}/g, context.module.version);
    }
    
    // 5. Framework variable
    if (context.framework) {
      processed = processed.replace(/\{\{framework\}\}/g, context.framework);
    }
    
    // 6. Environment variables
    processed = processed
      .replace(/\{\{env\.NODE_ENV\}\}/g, process.env.NODE_ENV || 'development')
      .replace(/\{\{env\.USER\}\}/g, process.env.USER || 'user');
    
    return processed;
  }

  /**
   * Process value based on context (simple context-aware processing)
   */
  private processValueForContext(value: any, context: ProjectContext): string {
    if (!Array.isArray(value)) return String(value);
    
    // For JavaScript/TypeScript files, keep array syntax
    // We'll detect this from the current action being processed
    if (this.currentAction?.path && (this.currentAction.path.endsWith('.ts') || this.currentAction.path.endsWith('.js'))) {
      return `[${value.map(v => `'${v}'`).join(', ')}]`;
    }
    
    // For command arguments, join with spaces
    if (this.currentAction?.type === 'RUN_COMMAND') {
      return value.join(' ');
    }
    
    // Default to space-separated
    return value.join(' ');
  }

  /**
   * Process conditional blocks in templates
   */
  private processConditionals(content: string, context: ProjectContext): string {
    let processed = content;
    
    // Handle {{#if condition}}...{{/if}} blocks
    const ifRegex = /\{\{#if\s+([^}]+)\}\}(.*?)\{\{\/if\}\}/g;
    processed = processed.replace(ifRegex, (match, condition, block) => {
      const shouldInclude = this.evaluateCondition(condition, context);
      console.log(`🔍 Conditional: ${condition}, shouldInclude: ${shouldInclude}, framework: ${context.framework}`);
      console.log(`🔍 Context integration:`, (context as any).integration);
      console.log(`🔍 Block length: ${block.length}, will include: ${shouldInclude}`);
      return shouldInclude ? block : '';
    });
    
    return processed;
  }

  /**
   * Evaluate a condition in template
   */
  private evaluateCondition(condition: string, context: ProjectContext): boolean {
    // Handle integration.features.paramName conditions
    const integrationMatch = condition.match(/integration\.features\.(\w+)/);
    if (integrationMatch) {
      const featureName = integrationMatch[1];
      const integration = (context as any).integration;
      if (integration?.features && featureName) {
        const value = integration.features[featureName];
        return Boolean(value);
      }
      return false;
    }
    
    // Handle module.parameters.paramName conditions
    const paramMatch = condition.match(/module\.parameters\.(\w+)/);
    if (paramMatch) {
      const paramName = paramMatch[1];
      const value = context.module?.parameters?.[paramName as string];
      return Boolean(value);
    }
    
    // Handle framework conditions
    if (condition === 'framework') {
      return Boolean(context.framework);
    }
    
    // Handle simple boolean conditions
    if (condition === 'true') return true;
    if (condition === 'false') return false;
    
    return false;
  }

  /**
   * Merge package.json intelligently
   */
  private async mergePackageJson(filePath: string, newContent: string): Promise<void> {
    let existingContent = {};
    
    try {
      const existingFile = await fs.readFile(filePath, 'utf-8');
      existingContent = JSON.parse(existingFile);
    } catch {
      // File doesn't exist, create new
    }
    
    const newContentObj = JSON.parse(newContent);
    const mergedContent = this.deepMerge(existingContent, newContentObj);
    
    // Ensure proper formatting with 2 spaces
    await fs.writeFile(filePath, JSON.stringify(mergedContent, null, 2) + '\n');
  }

  /**
   * Append to .env file
   */
  private async appendToEnv(filePath: string, newContent: string): Promise<void> {
    let existingContent = '';
    
    try {
      existingContent = await fs.readFile(filePath, 'utf-8');
    } catch {
      // File doesn't exist
    }
    
    const newVars = newContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    const existingVars = existingContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    
    const newUniqueVars = newVars.filter(newVar => {
      const key = newVar.split('=')[0];
      return !existingVars.some(existingVar => existingVar.split('=')[0] === key);
    });
    
    if (newUniqueVars.length > 0) {
      const finalContent = existingContent + (existingContent.endsWith('\n') ? '' : '\n') + newUniqueVars.join('\n');
      await fs.writeFile(filePath, finalContent);
    }
  }

  /**
   * Merge tsconfig.json
   */
  private async mergeTsConfig(filePath: string, newContent: string): Promise<void> {
    let existingContent = {};
    
    try {
      const existingFile = await fs.readFile(filePath, 'utf-8');
      existingContent = JSON.parse(existingFile);
    } catch {
      // File doesn't exist, create new
    }
    
    const newContentObj = JSON.parse(newContent);
    const mergedContent = this.deepMerge(existingContent, newContentObj);
    
    await fs.writeFile(filePath, JSON.stringify(mergedContent, null, 2));
  }

  /**
   * Create or update file
   */
  private async createOrUpdateFile(filePath: string, content: string): Promise<void> {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    
    await fs.writeFile(filePath, content);
  }

  /**
   * Deep merge objects
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  /**
   * Merge TypeScript/JavaScript files intelligently
   */
  private async mergeTypeScriptFile(filePath: string, newContent: string): Promise<void> {
    let existingContent = '';
    
    try {
      existingContent = await fs.readFile(filePath, 'utf-8');
    } catch {
      // File doesn't exist, create new
      await fs.writeFile(filePath, newContent);
      return;
    }
    
    // Simple merge: add imports, add exports, add functions
    const mergedContent = this.mergeTypeScriptContent(existingContent, newContent);
    await fs.writeFile(filePath, mergedContent);
  }

  /**
   * Merge TypeScript content intelligently
   */
  private mergeTypeScriptContent(existing: string, newContent: string): string {
    // Extract imports from new content
    const newImports = this.extractImports(newContent);
    const existingImports = this.extractImports(existing);
    
    // Extract exports from new content
    const newExports = this.extractExports(newContent);
    const existingExports = this.extractExports(existing);
    
    // Extract functions from new content
    const newFunctions = this.extractFunctions(newContent);
    
    // Remove imports and exports from existing content
    let result = existing
      .replace(/import\s+.*?from\s+['"][^'"]+['"];?\n?/g, '')
      .replace(/export\s+.*?;?\n?/g, '');
    
    // Add merged imports
    const mergedImports = this.mergeImports(existingImports, newImports);
    const importStrings = mergedImports.map(imp => {
      if (imp.type === 'default') {
        return `import ${imp.imports[0]} from '${imp.source}';`;
      } else {
        return `import { ${imp.imports.join(', ')} } from '${imp.source}';`;
      }
    });
    
    // Add merged exports
    const mergedExports = [...existingExports, ...newExports.filter(exp => 
      !existingExports.some(existing => existing.name === exp.name)
    )];
    const exportStrings = mergedExports.map(exp => {
      if (exp.type === 'default') {
        return `export default ${exp.name};`;
      } else {
        return `export { ${exp.name} };`;
      }
    });
    
    // Combine everything
    const imports = importStrings.length > 0 ? importStrings.join('\n') + '\n\n' : '';
    const exports = exportStrings.length > 0 ? '\n\n' + exportStrings.join('\n') : '';
    const functions = newFunctions.length > 0 ? '\n\n' + newFunctions.join('\n\n') : '';
    
    return imports + result.trim() + functions + exports;
  }

  /**
   * Extract imports from content
   */
  private extractImports(content: string): Array<{ type: 'default' | 'named'; source: string; imports: string[] }> {
    const imports: Array<{ type: 'default' | 'named'; source: string; imports: string[] }> = [];
    const importRegex = /import\s+(?:(\w+)\s+from\s+)?['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      const importName = match[1];
      const source = match[2];
      if (!source) continue; // Skip invalid matches
      
      imports.push({
        type: importName ? 'default' : 'named',
        source,
        imports: importName ? [importName] : []
      });
    }

    return imports;
  }

  /**
   * Extract exports from content
   */
  private extractExports(content: string): Array<{ type: 'default' | 'named'; name: string }> {
    const exports: Array<{ type: 'default' | 'named'; name: string }> = [];
    const exportRegex = /export\s+(?:(\w+)\s+)?(?:const|let|var|function|class|interface|type)\s+(\w+)/g;
    let match;

    while ((match = exportRegex.exec(content)) !== null) {
      const exportType = match[1];
      const name = match[2];
      if (!name) continue; // Skip invalid matches
      
      exports.push({
        type: exportType === 'default' ? 'default' : 'named',
        name
      });
    }

    return exports;
  }

  /**
   * Extract functions from content
   */
  private extractFunctions(content: string): string[] {
    const functions: string[] = [];
    const functionRegex = /(?:export\s+)?(?:async\s+)?(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>)/g;
    let match;

    while ((match = functionRegex.exec(content)) !== null) {
      functions.push(match[0]);
    }

    return functions;
  }

  /**
   * Merge imports intelligently
   */
  private mergeImports(existing: Array<{ type: 'default' | 'named'; source: string; imports: string[] }>, newImports: Array<{ type: 'default' | 'named'; source: string; imports: string[] }>): Array<{ type: 'default' | 'named'; source: string; imports: string[] }> {
    const merged = [...existing];
    
    for (const newImport of newImports) {
      const existingImport = merged.find(imp => imp.source === newImport.source);
      if (existingImport) {
        // Merge imports from same source
        existingImport.imports = [...new Set([...existingImport.imports, ...newImport.imports])];
      } else {
        // Add new import source
        merged.push(newImport);
      }
    }

    return merged;
  }

  /**
   * Append content to file
   */
  private async appendToFile(filePath: string, content: string): Promise<void> {
    let existingContent = '';
    
    try {
      existingContent = await fs.readFile(filePath, 'utf-8');
    } catch {
      // File doesn't exist, create new
      await fs.writeFile(filePath, content);
      return;
    }
    
    const finalContent = existingContent + (existingContent.endsWith('\n') ? '' : '\n') + content;
    await fs.writeFile(filePath, finalContent);
  }

  /**
   * Prepend content to file
   */
  private async prependToFile(filePath: string, content: string): Promise<void> {
    let existingContent = '';
    
    try {
      existingContent = await fs.readFile(filePath, 'utf-8');
    } catch {
      // File doesn't exist, create new
      await fs.writeFile(filePath, content);
      return;
    }
    
    const finalContent = content + '\n' + existingContent;
    await fs.writeFile(filePath, finalContent);
  }

  /**
   * Merge imports into TypeScript file
   */
  private async mergeImportsToFile(filePath: string, imports: ImportDefinition[]): Promise<void> {
    // This would use ts-morph for robust import merging
    // For now, we'll use the existing TypeScript merging logic
    const importContent = imports.map(imp => {
      if (imp.namedImports) {
        return `import { ${imp.namedImports.join(', ')} } from '${imp.moduleSpecifier}';`;
      } else if (imp.defaultImport) {
        return `import ${imp.defaultImport} from '${imp.moduleSpecifier}';`;
      } else if (imp.namespaceImport) {
        return `import * as ${imp.namespaceImport} from '${imp.moduleSpecifier}';`;
      }
      return '';
    }).join('\n');

    await this.mergeTypeScriptFile(filePath, importContent);
  }

  /**
   * Merge configuration object
   */
  private async mergeConfigObject(filePath: string, configObjectName: string, payload: Record<string, any>): Promise<void> {
    // This would use ts-morph for robust config merging
    // For now, we'll use simple string replacement
    const configContent = `export const ${configObjectName} = ${JSON.stringify(payload, null, 2)};`;
    await this.mergeTypeScriptFile(filePath, configContent);
  }

  /**
   * Merge database schema
   */
  private async mergeSchema(filePath: string, schema: Record<string, any>, dialect: string): Promise<void> {
    // This would use dialect-specific schema merging
    // For now, we'll use simple string replacement
    const schemaContent = `export const schema = ${JSON.stringify(schema, null, 2)};`;
    await this.mergeTypeScriptFile(filePath, schemaContent);
  }
}
