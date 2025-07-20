/**
 * Core Agent Interface Types
 *
 * Defines the standardized interface for all Architech agents.
 * Based on modern AI agent standards and designed for extensibility.
 */
import { CommandRunner } from '../utils/command-runner.js';
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
    projectStructure?: {
        type: 'single-app' | 'monorepo';
        userPreference: 'quick-prototype' | 'scalable-monorepo';
        modules: string[];
        template: string;
    };
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
export interface EnvironmentInfo {
    nodeVersion: string;
    platform: string;
    arch: string;
    cwd: string;
    env: Record<string, string>;
}
export interface UserContext {
    id?: string;
    preferences?: Record<string, any>;
    permissions?: string[];
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
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: string[];
    suggestions?: string[];
}
export interface AgentError {
    code: string;
    message: string;
    details?: any;
    recoverable: boolean;
    suggestion?: string;
    timestamp: Date;
}
export interface ValidationError {
    field: string;
    message: string;
    code: string;
    severity: 'error' | 'warning' | 'info';
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
    name: string;
    description: string;
    parameters: Parameter[];
    examples: Example[];
    category: CapabilityCategory;
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
    SETUP = "setup",
    CONFIGURATION = "configuration",
    GENERATION = "generation",
    VALIDATION = "validation",
    OPTIMIZATION = "optimization",
    INTEGRATION = "integration"
}
export interface Artifact {
    type: 'file' | 'directory' | 'config' | 'script' | 'template';
    path: string;
    content?: string;
    metadata?: Record<string, any>;
    size?: number;
    checksum?: string;
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
export interface Logger {
    info(message: string, data?: any): void;
    warn(message: string, data?: any): void;
    error(message: string, error?: Error, data?: any): void;
    debug(message: string, data?: any): void;
    success(message: string, data?: any): void;
    log(level: LogLevel, message: string, context?: LogContext): void;
}
export declare enum LogLevel {
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error",
    SUCCESS = "success"
}
export interface LogContext {
    agent?: string;
    step?: string;
    duration?: number;
    data?: any;
    error?: string;
    stack?: string;
}
export type AgentFactory = (context: AgentContext) => IAgent;
export type AgentValidator = (context: AgentContext) => Promise<ValidationResult>;
export type AgentExecutor = (context: AgentContext) => Promise<AgentResult>;
export declare const AGENT_INTERFACE_VERSION = "1.0.0";
export declare const DEFAULT_TIMEOUT = 300000;
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
