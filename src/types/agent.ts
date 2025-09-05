/**
 * Agent Types - V1 Simplified
 * 
 * Simple agent structure for sequential execution
 */

export interface Agent {
  category: string;
  execute(module: Module, context: ProjectContext): Promise<AgentResult>;
}

export interface Module {
  id: string;
  category: string;
  version: string;
  parameters: Record<string, any>;
}

export interface ProjectContext {
  project: {
    name: string;
    path: string;
    framework: string;
    description?: string;
    author?: string;
    version?: string;
    license?: string;
  };
  module: Module;
  pathHandler?: any; // DecentralizedPathHandler - will be properly typed later
  adapter?: any; // AdapterConfig - will be properly typed later
}

export interface AgentResult {
  success: boolean;
  files: string[];
  errors: string[];
  warnings: string[];
}
