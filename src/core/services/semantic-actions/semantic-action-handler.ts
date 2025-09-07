/**
 * Semantic Action Handler
 * 
 * Handles high-level semantic actions that abstract away implementation complexity
 * Contributors express intent, this handler manages the implementation details
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { BlueprintAction } from '../../../types/adapter.js';
import { ProjectContext } from '../../../types/agent.js';
import { CommandRunner } from '../../cli/command-runner.js';

export class SemanticActionHandler {
  private commandRunner: CommandRunner;

  constructor() {
    this.commandRunner = new CommandRunner();
  }

  /**
   * Handle semantic actions
   */
  async handleSemanticAction(action: BlueprintAction, context: ProjectContext): Promise<void> {
    switch (action.type) {
      case 'INSTALL_PACKAGES':
        await this.handleInstallPackages(action, context);
        break;
      case 'ADD_SCRIPT':
        await this.handleAddScript(action, context);
        break;
      case 'ADD_ENV_VAR':
        await this.handleAddEnvVar(action, context);
        break;
      case 'CREATE_FILE':
        await this.handleCreateFile(action, context);
        break;
      case 'UPDATE_TS_CONFIG':
        await this.handleUpdateTsConfig(action, context);
        break;
      case 'APPEND_TO_FILE':
        await this.handleAppendToFile(action, context);
        break;
      case 'PREPEND_TO_FILE':
        await this.handlePrependToFile(action, context);
        break;
      default:
        throw new Error(`Unsupported semantic action: ${action.type}`);
    }
  }

  /**
   * Check if action is a semantic action
   */
  static isSemanticAction(action: BlueprintAction): boolean {
    return [
      'INSTALL_PACKAGES',
      'ADD_SCRIPT', 
      'ADD_ENV_VAR',
      'CREATE_FILE',
      'UPDATE_TS_CONFIG',
      'APPEND_TO_FILE',
      'PREPEND_TO_FILE'
    ].includes(action.type);
  }

  /**
   * INSTALL_PACKAGES: Install npm packages
   */
  private async handleInstallPackages(action: BlueprintAction, context: ProjectContext): Promise<void> {
    if (!action.packages || action.packages.length === 0) {
      throw new Error('INSTALL_PACKAGES requires packages array');
    }

    // Add packages to package.json
    await this.addPackagesToPackageJson(action.packages, action.isDev || false, context);

    // Install packages
    const installCommand = action.isDev ? 'npm install -D' : 'npm install';
    const packagesStr = action.packages.join(' ');
    await this.commandRunner.execCommand([installCommand, packagesStr], { 
      cwd: context.project.path || '.' 
    });
  }

  /**
   * ADD_SCRIPT: Add script to package.json
   */
  private async handleAddScript(action: BlueprintAction, context: ProjectContext): Promise<void> {
    if (!action.name || !action.command) {
      throw new Error('ADD_SCRIPT requires name and command');
    }

    const packageJsonPath = path.join(context.project.path || '.', 'package.json');
    await this.addScriptToPackageJson(packageJsonPath, action.name, action.command);
  }

  /**
   * ADD_ENV_VAR: Add environment variable to .env files
   */
  private async handleAddEnvVar(action: BlueprintAction, context: ProjectContext): Promise<void> {
    if (!action.key || !action.value) {
      throw new Error('ADD_ENV_VAR requires key and value');
    }

    const projectPath = context.project.path || '.';
    
    // Add to .env.example
    const envExamplePath = path.join(projectPath, '.env.example');
    await this.addEnvVarToFile(envExamplePath, action.key, action.value, action.description);

    // Add to .env if it exists
    const envPath = path.join(projectPath, '.env');
    try {
      await fs.access(envPath);
      await this.addEnvVarToFile(envPath, action.key, action.value, action.description);
    } catch {
      // .env doesn't exist, that's fine
    }
  }

  /**
   * CREATE_FILE: Create a new file
   */
  private async handleCreateFile(action: BlueprintAction, context: ProjectContext): Promise<void> {
    if (!action.path || !action.content) {
      throw new Error('CREATE_FILE requires path and content');
    }

    const filePath = this.resolvePath(action.path, context);
    
    // Check if file exists
    try {
      await fs.access(filePath);
      if (!action.overwrite) {
        throw new Error(`File ${action.path} already exists. Use overwrite: true to replace it.`);
      }
    } catch {
      // File doesn't exist, that's fine
    }

    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(filePath, action.content);
  }

  /**
   * UPDATE_TS_CONFIG: Update TypeScript configuration object
   */
  private async handleUpdateTsConfig(action: BlueprintAction, context: ProjectContext): Promise<void> {
    if (!action.path || !action.modifications) {
      throw new Error('UPDATE_TS_CONFIG requires path and modifications');
    }

    const filePath = this.resolvePath(action.path, context);
    await this.updateTypeScriptConfig(filePath, action.modifications);
  }

  /**
   * APPEND_TO_FILE: Append content to file
   */
  private async handleAppendToFile(action: BlueprintAction, context: ProjectContext): Promise<void> {
    if (!action.path || !action.content) {
      throw new Error('APPEND_TO_FILE requires path and content');
    }

    const filePath = this.resolvePath(action.path, context);
    await this.appendToFile(filePath, action.content);
  }

  /**
   * PREPEND_TO_FILE: Prepend content to file
   */
  private async handlePrependToFile(action: BlueprintAction, context: ProjectContext): Promise<void> {
    if (!action.path || !action.content) {
      throw new Error('PREPEND_TO_FILE requires path and content');
    }

    const filePath = this.resolvePath(action.path, context);
    await this.prependToFile(filePath, action.content);
  }

  /**
   * Add packages to package.json
   */
  private async addPackagesToPackageJson(packages: string[], isDev: boolean, context: ProjectContext): Promise<void> {
    const packageJsonPath = path.join(context.project.path || '.', 'package.json');
    
    let packageJson: any = {};
    try {
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      packageJson = JSON.parse(content);
    } catch {
      // Package.json doesn't exist, create basic structure
      packageJson = {
        name: context.project.name || 'my-project',
        version: '0.1.0',
        private: true
      };
    }

    // Initialize dependencies if they don't exist
    if (!packageJson.dependencies) packageJson.dependencies = {};
    if (!packageJson.devDependencies) packageJson.devDependencies = {};

    // Add packages
    const targetDeps = isDev ? packageJson.devDependencies : packageJson.dependencies;
    packages.forEach(pkg => {
      if (targetDeps) {
        targetDeps[pkg] = 'latest'; // Could be made configurable
      }
    });

    // Write back to package.json
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  }

  /**
   * Add script to package.json
   */
  private async addScriptToPackageJson(packageJsonPath: string, name: string, command: string): Promise<void> {
    let packageJson: any = {};
    try {
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      packageJson = JSON.parse(content);
    } catch {
      throw new Error('package.json not found');
    }

    // Initialize scripts if they don't exist
    if (!packageJson.scripts) packageJson.scripts = {};

    // Add script
    packageJson.scripts[name] = command;

    // Write back to package.json
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  }

  /**
   * Add environment variable to file
   */
  private async addEnvVarToFile(filePath: string, key: string, value: string, description?: string): Promise<void> {
    let content = '';
    try {
      content = await fs.readFile(filePath, 'utf-8');
    } catch {
      // File doesn't exist, that's fine
    }

    // Check if variable already exists
    const lines = content.split('\n');
    const existingLineIndex = lines.findIndex(line => line.startsWith(`${key}=`));
    
    if (existingLineIndex >= 0) {
      // Update existing variable
      lines[existingLineIndex] = `${key}=${value}`;
    } else {
      // Add new variable
      if (description) {
        lines.push(`# ${description}`);
      }
      lines.push(`${key}=${value}`);
    }

    // Write back to file
    const lastLine = lines[lines.length - 1];
    const newContent = lines.join('\n') + (lines.length > 0 && lastLine && !lastLine.endsWith('\n') ? '\n' : '');
    await fs.writeFile(filePath, newContent);
  }

  /**
   * Update TypeScript configuration object
   */
  private async updateTypeScriptConfig(filePath: string, modifications: Record<string, any>): Promise<void> {
    // This is a simplified implementation
    // In a full implementation, you'd use ts-morph for robust AST manipulation
    let content = '';
    try {
      content = await fs.readFile(filePath, 'utf-8');
    } catch {
      throw new Error(`TypeScript config file not found: ${filePath}`);
    }

    // Simple object merging for now
    // This could be enhanced with proper AST manipulation
    const configMatch = content.match(/export\s+const\s+(\w+)\s*=\s*({[\s\S]*?});/);
    if (configMatch && configMatch[1] && configMatch[2]) {
      const configName = configMatch[1];
      const existingConfig = JSON.parse(configMatch[2]);
      const mergedConfig = this.deepMerge(existingConfig, modifications);
      
      const newConfigStr = `export const ${configName} = ${JSON.stringify(mergedConfig, null, 2)};`;
      content = content.replace(configMatch[0], newConfigStr);
    }

    await fs.writeFile(filePath, content);
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
   * Resolve file path
   */
  private resolvePath(target: string, context: ProjectContext): string {
    if (path.isAbsolute(target)) {
      return target;
    }
    return path.join(context.project.path || '.', target);
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
