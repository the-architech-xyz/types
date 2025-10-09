/**
 * Blueprint Context
 * 
 * Contains the VFS instance and context for a single blueprint execution.
 * Each blueprint gets its own isolated VFS instance.
 */

import { ConstitutionalExecutionContext } from './constitutional-architecture.js';

export interface BlueprintContext {
  vfs: any; // VFS is implementation-specific, not shared
  projectRoot: string;
  externalFiles: string[];
  constitutional?: ConstitutionalExecutionContext; // Constitutional Architecture support
}

export interface BlueprintContextOptions {
  projectRoot: string;
  externalFiles?: string[];
}
