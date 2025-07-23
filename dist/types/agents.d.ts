/**
 * Agent Types
 *
 * Agent-specific types and interfaces for the AI-powered orchestration system.
 * Agents are the "brains" that coordinate plugin execution and make intelligent decisions.
 */
import { ValidationResult, ValidationError, Artifact, Logger, LogLevel, LogContext, EnvironmentInfo, UserContext, ProjectType, TargetPlatform, DEFAULT_TIMEOUT, ERROR_CODES } from './core.js';
import { CommandRunner } from '../core/cli/command-runner.js';
import { StructureInfo } from '../core/project/structure-service.js';
export type { ValidationResult, ValidationError, Artifact, Logger, LogContext, EnvironmentInfo, UserContext };
export { LogLevel, ProjectType, TargetPlatform, DEFAULT_TIMEOUT, ERROR_CODES };
export interface IAgent {
    execute(context: AgentContext): Promise<AgentResult>;
    validate?(context: AgentContext): Promise<ValidationResult>;
    prepare?(context: AgentContext): Promise<void>;
    cleanup?(context: AgentContext): Promise<void>;
    rollback?(context: AgentContext): Promise<void>;
    retry?(context: AgentContext, attempt: number): Promise<AgentResult>;
    getMetadata(): AgentMetadata;
    getCapabilities(): AgentCapability[];
    getState?(): AgentState | undefined;
    setState?(state: AgentState): void;
}
export interface AgentContext {
    projectName: string;
    projectPath: string;
    packageManager: string;
    projectStructure?: StructureInfo;
    userInput?: string;
    options: ExecutionOptions;
    config: Record<string, any>;
    runner: CommandRunner;
    logger: Logger;
    state: Map<string, any>;
    dependencies: string[];
    environment: EnvironmentInfo;
    user?: UserContext;
}
export interface ExecutionOptions {
    skipGit: boolean;
    skipInstall: boolean;
    useDefaults: boolean;
    verbose: boolean;
    dryRun?: boolean;
    force?: boolean;
    timeout?: number;
}
export interface AgentResult {
    success: boolean;
    data?: any;
    errors?: AgentError[];
    warnings?: string[];
    duration: number;
    artifacts?: Artifact[];
    nextSteps?: string[];
    state?: AgentState;
    metrics?: PerformanceMetrics;
}
export interface AgentError {
    code: string;
    message: string;
    details?: any;
    recoverable: boolean;
    suggestion?: string;
    timestamp: Date;
}
export interface AgentMetadata {
    name: string;
    version: string;
    description: string;
    author: string;
    category: AgentCategory;
    tags: string[];
    dependencies: string[];
    conflicts?: string[];
    requirements: AgentRequirement[];
    license?: string;
    repository?: string;
}
export interface AgentCapability {
    id?: string;
    name: string;
    description: string;
    parameters?: Parameter[];
    examples?: Example[];
    category: CapabilityCategory;
    requirements?: string[];
    conflicts?: string[];
}
export interface Parameter {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required: boolean;
    description: string;
    defaultValue?: any;
    validation?: ValidationRule[];
}
export interface Example {
    name: string;
    description: string;
    parameters: Record<string, any>;
    expectedResult: any;
}
export interface ValidationRule {
    type: 'regex' | 'range' | 'enum' | 'custom';
    value: any;
    message: string;
}
export interface AgentRequirement {
    type: 'package' | 'file' | 'permission' | 'environment';
    name: string;
    version?: string;
    description: string;
}
export declare enum AgentCategory {
    FOUNDATION = "foundation",
    FRAMEWORK = "framework",
    UI = "ui",
    DATABASE = "database",
    AUTHENTICATION = "authentication",
    DEPLOYMENT = "deployment",
    TESTING = "testing",
    PAYMENT = "payment",
    EMAIL = "email",
    ADMIN = "admin",
    MONITORING = "monitoring",
    CUSTOM = "custom"
}
export declare enum CapabilityCategory {
    FOUNDATION = "foundation",
    FRAMEWORK = "framework",
    SETUP = "setup",
    CONFIGURATION = "configuration",
    GENERATION = "generation",
    VALIDATION = "validation",
    OPTIMIZATION = "optimization",
    INTEGRATION = "integration"
}
export interface AgentState {
    version: string;
    data: Record<string, any>;
    timestamp: Date;
    checksum: string;
}
export interface PerformanceMetrics {
    executionTime: number;
    memoryUsage: number;
    cpuUsage: number;
    networkRequests: number;
    artifactsGenerated: number;
    filesCreated: number;
    dependenciesInstalled: number;
}
export type AgentFactory = (context: AgentContext) => IAgent;
export type AgentValidator = (context: AgentContext) => Promise<ValidationResult>;
export type AgentExecutor = (context: AgentContext) => Promise<AgentResult>;
export declare const AGENT_INTERFACE_VERSION = "1.0.0";
export declare const SUPPORTED_AGENT_CATEGORIES: AgentCategory[];
export declare const AGENT_ERROR_CODES: {
    readonly VALIDATION_FAILED: "VALIDATION_FAILED";
    readonly EXECUTION_FAILED: "EXECUTION_FAILED";
    readonly DEPENDENCY_MISSING: "DEPENDENCY_MISSING";
    readonly PERMISSION_DENIED: "PERMISSION_DENIED";
    readonly TIMEOUT: "TIMEOUT";
    readonly ROLLBACK_FAILED: "ROLLBACK_FAILED";
    readonly UNKNOWN_ERROR: "UNKNOWN_ERROR";
};
