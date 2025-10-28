/**
 * Core CLI Types
 *
 * Essential types for The Architech CLI orchestration
 */
export interface ProjectConfig {
    name: string;
    framework: string;
    path?: string;
    description?: string;
    version?: string;
    author?: string;
    license?: string;
    structure?: 'monorepo' | 'single-app';
    monorepo?: MonorepoConfig;
}
export interface MonorepoConfig {
    tool: 'turborepo' | 'nx' | 'pnpm-workspaces' | 'yarn-workspaces';
    packages: {
        api?: string;
        web?: string;
        mobile?: string;
        shared?: string;
        [key: string]: string | undefined;
    };
}
export type ModuleType = 'adapter' | 'connector' | 'feature';
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
    modules: GenomeModule[];
    features?: string[];
    options?: ExecutionOptions;
}
export interface GenomeModule {
    id: string;
    targetPackage?: string;
    parameters?: Record<string, any>;
    features?: Record<string, boolean | string | string[]>;
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
