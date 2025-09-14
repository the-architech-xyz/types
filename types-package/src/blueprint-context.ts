/**
 * Blueprint Context
 * 
 * Contains the VFS instance and context for a single blueprint execution.
 * Each blueprint gets its own isolated VFS instance.
 */

export interface BlueprintContext {
  vfs: any; // VFS is implementation-specific, not shared
  projectRoot: string;
  externalFiles: string[];
}

export interface BlueprintContextOptions {
  projectRoot: string;
  externalFiles?: string[];
}
