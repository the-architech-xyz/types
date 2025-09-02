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
  };
  module: Module;
}

export interface AgentResult {
  success: boolean;
  files: string[];
  errors: string[];
  warnings: string[];
}
