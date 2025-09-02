/**
 * Blueprint Executor - V1 Simple Blueprint Execution
 * 
 * Executes blueprints with 2 action types: ADD_CONTENT and RUN_COMMAND
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { Blueprint, BlueprintAction, BlueprintExecutionResult } from '../../../types/adapter.js';
import { ProjectContext } from '../../../types/agent.js';
import { CommandRunner } from '../../cli/command-runner.js';

export class BlueprintExecutor {
  private commandRunner: CommandRunner;

  constructor() {
    this.commandRunner = new CommandRunner();
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
      
      try {
        if (action.type === 'ADD_CONTENT') {
          const result = await this.handleAddContent(action, context);
          if (result.success && result.filePath) {
            files.push(result.filePath);
          } else if (result.error) {
            errors.push(result.error);
          }
        } else if (action.type === 'RUN_COMMAND') {
          const result = await this.handleRunCommand(action, context);
          if (!result.success && result.error) {
            errors.push(result.error);
          }
        } else {
          errors.push(`Unknown action type: ${action.type}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Action ${i + 1} failed: ${errorMessage}`);
      }
    }
    
    const success = errors.length === 0;
    
    return {
      success,
      files,
      errors,
      warnings
    };
  }

  /**
   * Handle ADD_CONTENT action
   */
  private async handleAddContent(action: BlueprintAction, context: ProjectContext): Promise<{ success: boolean; filePath?: string; error?: string }> {
    if (!action.target || !action.content) {
      return { success: false, error: 'ADD_CONTENT action must have target and content' };
    }
    
    try {
      const targetPath = this.resolvePath(action.target, context);
      
      // Process template variables in content
      const processedContent = this.processTemplate(action.content, context);
      
      // Intelligent file handling
      if (action.target === 'package.json') {
        await this.mergePackageJson(targetPath, processedContent);
      } else if (action.target === '.env' || action.target === '.env.example') {
        await this.appendToEnv(targetPath, processedContent);
      } else if (action.target === 'tsconfig.json') {
        await this.mergeTsConfig(targetPath, processedContent);
      } else {
        await this.createOrUpdateFile(targetPath, processedContent);
      }
      
      return { success: true, filePath: targetPath };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
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
   * Process template variables
   */
  private processTemplate(content: string, context: ProjectContext): string {
    return content
      .replace(/\{\{project\.name\}\}/g, context.project.name)
      .replace(/\{\{project\.path\}\}/g, context.project.path)
      .replace(/\{\{project\.framework\}\}/g, context.project.framework);
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
}
