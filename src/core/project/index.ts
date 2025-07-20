/**
 * Project Management - Core Module
 * 
 * Consolidated project management that includes:
 * - Project structure management
 * - Configuration management
 * - Context factory
 */

export { ProjectStructureManager } from './project-structure-manager.js';
export { ConfigurationManager } from './configuration-manager.js';
export { ContextFactory } from './context-factory.js';

// Re-export types for convenience
export type {
  ProjectStructure,
  StructureConfig,
  DirectoryStructure,
  FileStructure
} from './project-structure-manager.js'; 