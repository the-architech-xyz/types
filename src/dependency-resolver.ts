/**
 * Dependency Resolver Types - V1 High-Level Resolution
 * 
 * Types for the High-Level Dependency Resolver system
 */

export interface CapabilityRegistry {
  [capabilityName: string]: {
    providers: ModuleProvider[];
    consumers: ModuleConsumer[];
    conflicts: CapabilityConflict[];
  };
}

export interface ModuleProvider {
  moduleId: string;
  capabilityVersion: string;
  confidence: number;
  metadata: {
    description?: string;
    provides?: string[];
    requires?: string[];
  };
}

export interface ModuleConsumer {
  moduleId: string;
  requiredVersion: string;
  metadata: {
    description?: string;
    context?: string;
  };
}

export interface CapabilityConflict {
  capability: string;
  providers: ModuleProvider[];
  severity: 'error' | 'warning';
  message: string;
}

export interface ResolutionResult {
  success: boolean;
  modules: ResolvedModule[];
  executionOrder: ResolvedModule[];
  conflicts: ResolutionError[];
  warnings: ResolutionWarning[];
  capabilityRegistry: CapabilityRegistry;
}

export interface ResolvedModule {
  id: string;
  category: 'framework' | 'adapter' | 'integrator' | 'feature';
  version?: string;
  parameters: Record<string, any>;
  features?: Record<string, boolean | string | string[]>;
  externalFiles?: string[];
  // Resolution metadata
  resolutionPath: string[]; // How this module was resolved
  capabilities: string[]; // Capabilities this module provides
  prerequisites: string[]; // Prerequisites this module requires
  confidence: number; // Resolution confidence (0-100)
}

export interface ResolutionError {
  type: 'MISSING_CAPABILITY' | 'CONFLICTING_PROVIDERS' | 'CIRCULAR_DEPENDENCY' | 'MISSING_MODULE';
  module: string;
  capability?: string;
  message: string;
  suggestions: string[];
  severity: 'error' | 'warning';
}

export interface ResolutionWarning {
  type: 'LOW_CONFIDENCE' | 'POTENTIAL_CONFLICT' | 'DEPRECATED_CAPABILITY';
  module: string;
  capability?: string;
  message: string;
  suggestions: string[];
}

export interface DependencyGraph {
  nodes: Map<string, DependencyNode>;
  edges: Map<string, string[]>; // moduleId -> [dependentModuleIds]
  cycles: string[][]; // Detected cycles
}

export interface DependencyNode {
  id: string;
  category: 'framework' | 'adapter' | 'integrator' | 'feature';
  dependencies: string[];
  dependents: string[];
  level: number; // Topological level
  visited: boolean;
  inProgress: boolean;
}

export interface CapabilityResolution {
  capability: string;
  provider: ModuleProvider;
  alternatives: ModuleProvider[];
  confidence: number;
  conflicts: CapabilityConflict[];
}

export interface ModuleConfig {
  id: string;
  category: 'framework' | 'adapter' | 'integrator' | 'feature';
  version: string;
  capabilities: {
    [capabilityName: string]: {
      version?: string;
      description?: string;
      provides?: string[];
      requires?: string[];
    };
  };
  prerequisites: {
    modules?: string[];
    capabilities?: string[];
    adapters?: string[];
    integrators?: string[];
  };
  parameters: Record<string, any>;
  features?: Record<string, boolean | string | string[]>;
  provides?: {
    capabilities?: string[];
    files?: string[];
    components?: string[];
    pages?: string[];
  };
}

export interface ResolutionOptions {
  failFast: boolean; // Stop on first conflict (default: true)
  maxDepth: number; // Maximum resolution depth (default: 10)
  allowConflicts: boolean; // Allow conflicting providers (default: false)
  strictMode: boolean; // Strict capability matching (default: true)
  verbose: boolean; // Verbose logging (default: false)
}
