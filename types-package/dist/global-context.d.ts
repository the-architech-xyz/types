/**
 * Global Context & State Management Types
 *
 * Centralized state management for the entire generation process.
 * Provides a clean API for accessing and modifying state.
 */
export interface GlobalContext {
    execution: ExecutionState;
    project: ProjectState;
    environment: EnvironmentState;
    modules: ModuleState;
    filesystem: FileSystemState;
    dependencies: DependencyState;
    integrations: IntegrationState;
}
export interface ExecutionState {
    traceId: string;
    startTime: Date;
    endTime?: Date;
    status: 'pending' | 'running' | 'completed' | 'failed';
    currentPhase: 'initialization' | 'framework' | 'modules' | 'integrations' | 'finalization';
    currentModule?: string;
    currentAction?: string;
    options: {
        verbose: boolean;
        skipInstall: boolean;
        dryRun: boolean;
    };
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
export interface ProjectState {
    name: string;
    description: string;
    version: string;
    path: string;
    framework: {
        type: string;
        version: string;
        configuration: Record<string, any>;
    };
    structure: {
        srcDir: string;
        publicDir: string;
        configDir: string;
        libDir: string;
    };
    files: {
        created: string[];
        modified: string[];
        deleted: string[];
    };
}
export interface EnvironmentState {
    variables: Map<string, EnvironmentVariable>;
    cliOptions: Record<string, any>;
    runtime: {
        nodeVersion: string;
        platform: string;
        arch: string;
    };
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
export interface ModuleState {
    executionOrder: string[];
    completed: Set<string>;
    failed: Set<string>;
    configurations: Map<string, ModuleConfiguration>;
    dependencies: Map<string, string[]>;
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
export interface DependencyState {
    packages: {
        dependencies: Map<string, string>;
        devDependencies: Map<string, string>;
        peerDependencies: Map<string, string>;
        optionalDependencies: Map<string, string>;
    };
    scripts: Map<string, string>;
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
    source: string;
}
export interface FileSystemState {
    vfsInstances: Map<string, any>;
    operations: GlobalFileOperation[];
    conflicts: FileConflict[];
}
export interface GlobalFileOperation {
    type: 'create' | 'modify' | 'delete';
    path: string;
    timestamp: Date;
    source: string;
}
export interface FileConflict {
    path: string;
    sources: string[];
    resolution: 'overwrite' | 'merge' | 'skip';
}
export interface IntegrationState {
    integrations: Map<string, IntegrationInfo>;
    features: Map<string, boolean>;
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
export interface TemplateResolver {
    resolve(template: string, context: GlobalContext): string;
}
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
