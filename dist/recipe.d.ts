/**
 * Core CLI Types
 *
 * Essential types for The Architech CLI orchestration
 */
export interface ProjectConfig {
    name: string;
    framework: string;
    path: string;
    description?: string;
    version?: string;
    author?: string;
    license?: string;
}
export type ModuleType = 'adapter' | 'integrator' | 'feature';
export interface Module {
    id: string;
    category?: string;
    version?: string;
    parameters: Record<string, any>;
    features?: {
        [key: string]: boolean | string | string[];
    };
    externalFiles?: string[];
    config?: {
        id: string;
        name: string;
        description: string;
        version: string;
        category: string;
        capabilities?: Record<string, any>;
        prerequisites?: {
            modules?: string[];
            capabilities?: string[];
        };
        provides?: {
            capabilities?: string[];
            files?: string[];
            components?: string[];
            pages?: string[];
        };
        [key: string]: any;
    };
}
export interface ExecutionOptions {
    skipInstall?: boolean;
    skipGit?: boolean;
    verbose?: boolean;
}
export interface ExecutionResult {
    success: boolean;
    modulesExecuted: number;
    errors?: string[];
    warnings?: string[];
}
export interface Genome {
    version: string;
    project: ProjectConfig;
    modules: Module[];
    features?: string[];
    options?: ExecutionOptions;
}
