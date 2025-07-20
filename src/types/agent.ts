/**
 * Agent Types and Interfaces
 * 
 * Defines the core types and interfaces for the agent system.
 */

import { CommandRunner } from '../core/cli/command-runner.js';

// ============================================================================
// CORE INTERFACES
// ============================================================================

export interface IAgent {
  // Core execution
  execute(context: AgentContext): Promise<AgentResult>;
  
  // Lifecycle hooks
  validate?(context: AgentContext): Promise<ValidationResult>;
  prepare?(context: AgentContext): Promise<void>;
  cleanup?(context: AgentContext): Promise<void>;
  
  // Error handling & recovery
  rollback?(context: AgentContext): Promise<void>;
  retry?(context: AgentContext, attempt: number): Promise<AgentResult>;
  
  // Metadata & capabilities
  getMetadata(): AgentMetadata;
  getCapabilities(): AgentCapability[];
  
  // State management (optional)
  getState?(): AgentState | undefined;
  setState?(state: AgentState): void;
}

// ============================================================================
// CONTEXT & CONFIGURATION
// ============================================================================

export interface AgentContext {
  // Project configuration
  projectName: string;
  projectPath: string;
  packageManager: string;
  
  // Project structure and preferences
  projectStructure?: {
    type: 'single-app' | 'monorepo';
    userPreference: 'quick-prototype' | 'scalable-monorepo';
    modules: string[];
    template: string;
  };
  
  // User input and requirements
  userInput?: string;
  
  // Execution options
  options: ExecutionOptions;
  
  // Agent-specific configuration
  config: Record<string, any>;
  
  // Shared utilities
  runner: CommandRunner;
  logger: Logger;
  
  // State management (immutable)
  state: Map<string, any>;
  
  // Dependencies on other agents
  dependencies: string[];
  
  // Environment information
  environment: EnvironmentInfo;
  
  // User context (for future use)
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

// ============================================================================
// RESULTS & VALIDATION
// ============================================================================

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

// ============================================================================
// METADATA & CAPABILITIES
// ============================================================================

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

// ============================================================================
// ENUMS
// ============================================================================

export enum AgentCategory {
  FOUNDATION = 'foundation',
  UI = 'ui',
  DATABASE = 'database',
  AUTHENTICATION = 'authentication',
  DEPLOYMENT = 'deployment',
  TESTING = 'testing',
  PAYMENT = 'payment',
  EMAIL = 'email',
  ADMIN = 'admin',
  MONITORING = 'monitoring',
  CUSTOM = 'custom'
}

export enum CapabilityCategory {
  SETUP = 'setup',
  CONFIGURATION = 'configuration',
  GENERATION = 'generation',
  VALIDATION = 'validation',
  OPTIMIZATION = 'optimization',
  INTEGRATION = 'integration'
}

// ============================================================================
// ARTIFACTS & STATE
// ============================================================================

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

// ============================================================================
// PERFORMANCE & MONITORING
// ============================================================================

export interface PerformanceMetrics {
  executionTime: number;
  memoryUsage: number;
  cpuUsage: number;
  networkRequests: number;
  artifactsGenerated: number;
  filesCreated: number;
  dependenciesInstalled: number;
}

// ============================================================================
// LOGGING
// ============================================================================

export interface Logger {
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, error?: Error, data?: any): void;
  debug(message: string, data?: any): void;
  success(message: string, data?: any): void;
  
  // Structured logging
  log(level: LogLevel, message: string, context?: LogContext): void;
}

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  SUCCESS = 'success'
}

export interface LogContext {
  agent?: string;
  step?: string;
  duration?: number;
  data?: any;
  error?: string;
  stack?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type AgentFactory = (context: AgentContext) => IAgent;

export type AgentValidator = (context: AgentContext) => Promise<ValidationResult>;

export type AgentExecutor = (context: AgentContext) => Promise<AgentResult>;

// ============================================================================
// CONSTANTS
// ============================================================================

export const AGENT_INTERFACE_VERSION = '1.0.0';

export const DEFAULT_TIMEOUT = 300000; // 5 minutes

export const SUPPORTED_AGENT_CATEGORIES = Object.values(AgentCategory);

export const AGENT_ERROR_CODES = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  EXECUTION_FAILED: 'EXECUTION_FAILED',
  DEPENDENCY_MISSING: 'DEPENDENCY_MISSING',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  TIMEOUT: 'TIMEOUT',
  ROLLBACK_FAILED: 'ROLLBACK_FAILED',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const; 