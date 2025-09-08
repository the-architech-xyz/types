/**
 * VFS Manager - Centralized Virtual File System Management
 * 
 * Singleton that manages a shared VFS instance across all agents.
 * This ensures atomic operations and prevents file duplication.
 */

import { VirtualFileSystem } from './virtual-file-system.js';
import { FileModificationEngine } from './file-modification-engine.js';

export class VFSManager {
  private static instance: VFSManager | null = null;
  private vfs: VirtualFileSystem;
  private engine: FileModificationEngine;
  private projectRoot: string;

  private constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.vfs = new VirtualFileSystem();
    this.engine = new FileModificationEngine(projectRoot, this.vfs);
  }

  /**
   * Get the singleton instance
   */
  static getInstance(projectRoot: string): VFSManager {
    if (!VFSManager.instance) {
      VFSManager.instance = new VFSManager(projectRoot);
    }
    return VFSManager.instance;
  }

  /**
   * Reset the singleton (for testing)
   */
  static reset(): void {
    VFSManager.instance = null;
  }

  /**
   * Get the shared file modification engine
   */
  getEngine(): FileModificationEngine {
    return this.engine;
  }

  /**
   * Get the shared VFS instance
   */
  getVFS(): VirtualFileSystem {
    return this.vfs;
  }

  /**
   * Flush all changes to disk
   */
  async flushToDisk(): Promise<void> {
    await this.engine.flushToDisk();
  }

  /**
   * Get all files in the VFS
   */
  getAllFiles() {
    return this.vfs.getAllFiles();
  }

  /**
   * Get operation history
   */
  getOperations() {
    return this.vfs.getOperations();
  }

  /**
   * Clear VFS (for testing)
   */
  clear(): void {
    this.vfs.clear();
  }

  /**
   * Check if file exists in VFS
   */
  fileExists(filePath: string): boolean {
    return this.vfs.fileExists(filePath);
  }

  /**
   * Read file from VFS or disk
   */
  async readFile(filePath: string): Promise<string> {
    return await this.engine.readFile(filePath);
  }
}
