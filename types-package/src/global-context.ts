/**
 * Global Context & State Management Types
 * 
 * Centralized state management for the entire generation process.
 * Provides a clean API for accessing and modifying state.
 */

// ============================================================================
// CORE GLOBAL CONTEXT
// ============================================================================

export interface GlobalContext {
  // Core execution state
  execution: ExecutionState;
  
  // Project-specific state
  project: ProjectState;
  
  // Environment and configuration state
  environment: EnvironmentState;
  
  // Module execution state
  modules: ModuleState;
  
  // File system and VFS state
  filesystem: FileSystemState;
  
  // Dependency and package state
  dependencies: DependencyState;
  
  // Integration and feature state
  integrations: IntegrationState;
}

// ============================================================================
// EXECUTION STATE
// ============================================================================

export interface ExecutionState {
  // Execution metadata
  traceId: string;
  startTime: Date;
  endTime?: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  
  // Current execution context
  currentPhase: 'initialization' | 'framework' | 'modules' | 'integrations' | 'finalization';
  currentModule?: string;
  currentAction?: string;
  
  // Execution options
  options: {
    verbose: boolean;
    skipInstall: boolean;
    dryRun: boolean;
  };
  
  // Error and warning tracking
  errors: ExecutionError[];
  warnings: ExecutionWarning[];
}

export interface ExecutionError {
  id: string;
  message: string;
  module?: string;
  action?: string;
  timestamp: Date;
  stack?: string;
}

export interface ExecutionWarning {
  id: string;
  message: string;
  module?: string;
  action?: string;
  timestamp: Date;
}

// ============================================================================
// PROJECT STATE
// ============================================================================

export interface ProjectState {
  // Basic project info
  name: string;
  description: string;
  version: string;
  path: string;
  
  // Framework information
  framework: {
    type: string;
    version: string;
    configuration: Record<string, any>;
  };
  
  // Project structure
  structure: {
    srcDir: string;
    publicDir: string;
    configDir: string;
    libDir: string;
  };
  
  // Generated files tracking
  files: {
    created: string[];
    modified: string[];
    deleted: string[];
  };
}

// ============================================================================
// ENVIRONMENT STATE
// ============================================================================

export interface EnvironmentState {
  // Environment variables
  variables: Map<string, EnvironmentVariable>;
  
  // CLI options
  cliOptions: Record<string, any>;
  
  // Runtime environment
  runtime: {
    nodeVersion: string;
    platform: string;
    arch: string;
  };
  
  // Path resolution
  paths: {
    projectRoot: string;
    sourceRoot: string;
    configRoot: string;
    libRoot: string;
  };
}

export interface EnvironmentVariable {
  key: string;
  value: string;
  description: string;
  source: 'recipe' | 'module' | 'integration' | 'system';
  required: boolean;
}

// ============================================================================
// MODULE STATE
// ============================================================================

export interface ModuleState {
  // Module execution tracking
  executionOrder: string[];
  completed: Set<string>;
  failed: Set<string>;
  
  // Module configurations
  configurations: Map<string, ModuleConfiguration>;
  
  // Cross-module dependencies
  dependencies: Map<string, string[]>;
  
  // Module results
  results: Map<string, ModuleResult>;
}

export interface ModuleConfiguration {
  id: string;
  category: string;
  version: string;
  parameters: Record<string, any>;
  features: Record<string, boolean>;
}

export interface ModuleResult {
  success: boolean;
  files: string[];
  errors: string[];
  warnings: string[];
  dependencies: DependencyInfo[];
  environmentVariables: EnvironmentVariable[];
}

// ============================================================================
// DEPENDENCY STATE
// ============================================================================

export interface DependencyState {
  // Collected dependencies
  packages: {
    dependencies: Map<string, string>;
    devDependencies: Map<string, string>;
    peerDependencies: Map<string, string>;
    optionalDependencies: Map<string, string>;
  };
  
  // Scripts
  scripts: Map<string, string>;
  
  // Package.json metadata
  metadata: {
    name: string;
    version: string;
    description: string;
    author: string;
    license: string;
  };
}

export interface DependencyInfo {
  name: string;
  version: string;
  type: 'dependency' | 'devDependency' | 'peerDependency' | 'optionalDependency';
  source: string; // Which module added this dependency
}

// ============================================================================
// FILESYSTEM STATE
// ============================================================================

export interface FileSystemState {
  // VFS instances
  vfsInstances: Map<string, any>; // VirtualFileSystem type
  
  // File operations tracking
  operations: GlobalFileOperation[];
  
  // File conflicts
  conflicts: FileConflict[];
}

export interface GlobalFileOperation {
  type: 'create' | 'modify' | 'delete';
  path: string;
  timestamp: Date;
  source: string; // Which module performed this operation
}

export interface FileConflict {
  path: string;
  sources: string[];
  resolution: 'overwrite' | 'merge' | 'skip';
}

// ============================================================================
// INTEGRATION STATE
// ============================================================================

export interface IntegrationState {
  // Integration execution tracking
  integrations: Map<string, IntegrationInfo>;
  
  // Feature flags
  features: Map<string, boolean>;
  
  // Integration results
  results: Map<string, IntegrationResult>;
}

export interface IntegrationInfo {
  name: string;
  features: Record<string, boolean>;
  dependencies: string[];
  environmentVariables: EnvironmentVariable[];
}

export interface IntegrationResult {
  success: boolean;
  files: string[];
  errors: string[];
  warnings: string[];
}

// ============================================================================
// CONTEXT MANAGER INTERFACE
// ============================================================================

export interface ContextManager {
  getContext(): GlobalContext;
  getExecutionState(): ExecutionState;
  getProjectState(): ProjectState;
  getEnvironmentState(): EnvironmentState;
  getModuleState(): ModuleState;
  getDependencyState(): DependencyState;
  getFileSystemState(): FileSystemState;
  getIntegrationState(): IntegrationState;
  
  updateExecutionState(updates: Partial<ExecutionState>): void;
  updateProjectState(updates: Partial<ProjectState>): void;
  addEnvironmentVariable(variable: EnvironmentVariable): void;
  addDependency(dependency: DependencyInfo): void;
  addModuleResult(moduleId: string, result: ModuleResult): void;
  
  resolveTemplate(template: string): string;
  saveState(): void;
  rollbackToState(index: number): void;
  
  onStateChange(event: string, listener: (data: any) => void): void;
}

// ============================================================================
// TEMPLATE RESOLUTION
// ============================================================================

export interface TemplateResolver {
  resolve(template: string, context: GlobalContext): string;
}

// ============================================================================
// LEGACY COMPATIBILITY
// ============================================================================

/**
 * Legacy ProjectContext for backward compatibility during migration
 * @deprecated Use GlobalContext instead
 */
export interface LegacyProjectContext {
  project: {
    name: string;
    description?: string;
    version?: string;
    path: string;
    framework: string;
    author?: string;
    license?: string;
  };
  module: any;
  pathHandler?: any;
  adapter?: any;
  framework: string;
  modules?: Record<string, any>;
  cliArgs?: Record<string, any>;
  projectRoot?: string;
  databaseModule?: any;
  paymentModule?: any;
  authModule?: any;
  emailModule?: any;
  observabilityModule?: any;
  stateModule?: any;
  uiModule?: any;
  testingModule?: any;
  deploymentModule?: any;
  contentModule?: any;
  blockchainModule?: any;
}
