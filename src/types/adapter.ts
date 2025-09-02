/**
 * Adapter Types - V1 Simplified
 * 
 * Simple adapter structure for declarative blueprint execution
 */

export interface Adapter {
  config: AdapterConfig;
  blueprint: Blueprint;
}

export interface AdapterConfig {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  blueprint: string;
}

export interface Blueprint {
  id: string;
  name: string;
  actions: BlueprintAction[];
}

export interface BlueprintAction {
  type: 'ADD_CONTENT' | 'RUN_COMMAND';
  target?: string;
  content?: string;
  command?: string;
}

export interface BlueprintExecutionResult {
  success: boolean;
  files: string[];
  errors: string[];
  warnings: string[];
}
