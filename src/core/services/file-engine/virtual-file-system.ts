/**
 * Virtual File System (VFS)
 * 
 * In-memory file system that tracks all file operations before writing to disk.
 * This ensures atomic operations and prevents partial writes.
 */

export interface VFSFile {
  path: string;
  content: string;
  exists: boolean;
  lastModified: Date;
}

export class VirtualFileSystem {
  private files: Map<string, VFSFile> = new Map();
  private operations: VFSOperation[] = [];

  /**
   * Create a new file in the VFS
   */
  createFile(path: string, content: string): void {
    const normalizedPath = this.normalizePath(path);
    
    if (this.files.has(normalizedPath)) {
      throw new Error(`File already exists: ${normalizedPath}`);
    }

    const file: VFSFile = {
      path: normalizedPath,
      content,
      exists: true,
      lastModified: new Date()
    };

    this.files.set(normalizedPath, file);
    this.operations.push({
      type: 'create',
      path: normalizedPath,
      content,
      timestamp: new Date()
    });
    
    console.log(`  🗂️ VFS: Created file ${normalizedPath} (${this.files.size} total files)`);
  }

  /**
   * Read file content from VFS
   */
  readFile(path: string): string {
    const normalizedPath = this.normalizePath(path);
    const file = this.files.get(normalizedPath);
    
    if (!file || !file.exists) {
      throw new Error(`File not found: ${normalizedPath}`);
    }

    return file.content;
  }

  /**
   * Check if file exists in VFS
   */
  fileExists(path: string): boolean {
    const normalizedPath = this.normalizePath(path);
    const file = this.files.get(normalizedPath);
    return file?.exists ?? false;
  }

  /**
   * Overwrite file content in VFS
   */
  overwriteFile(path: string, content: string): void {
    const normalizedPath = this.normalizePath(path);
    
    if (!this.files.has(normalizedPath)) {
      // Create file if it doesn't exist
      this.createFile(normalizedPath, content);
      return;
    }

    const file = this.files.get(normalizedPath)!;
    file.content = content;
    file.lastModified = new Date();

    this.operations.push({
      type: 'overwrite',
      path: normalizedPath,
      content,
      timestamp: new Date()
    });
  }

  /**
   * Append content to file in VFS
   */
  appendToFile(path: string, content: string): void {
    const normalizedPath = this.normalizePath(path);
    
    if (!this.files.has(normalizedPath)) {
      this.createFile(normalizedPath, content);
      return;
    }

    const file = this.files.get(normalizedPath)!;
    file.content += content;
    file.lastModified = new Date();

    this.operations.push({
      type: 'append',
      path: normalizedPath,
      content,
      timestamp: new Date()
    });
  }

  /**
   * Prepend content to file in VFS
   */
  prependToFile(path: string, content: string): void {
    const normalizedPath = this.normalizePath(path);
    
    if (!this.files.has(normalizedPath)) {
      this.createFile(normalizedPath, content);
      return;
    }

    const file = this.files.get(normalizedPath)!;
    file.content = content + file.content;
    file.lastModified = new Date();

    this.operations.push({
      type: 'prepend',
      path: normalizedPath,
      content,
      timestamp: new Date()
    });
  }

  /**
   * Get all files in VFS
   */
  getAllFiles(): VFSFile[] {
    const files = Array.from(this.files.values()).filter(file => file.exists);
    console.log(`  🗂️ VFS: getAllFiles() returning ${files.length} files (${this.files.size} total in map)`);
    return files;
  }

  /**
   * Get operation history
   */
  getOperations(): VFSOperation[] {
    return [...this.operations];
  }

  /**
   * Clear VFS (for testing)
   */
  clear(): void {
    this.files.clear();
    this.operations = [];
  }

  /**
   * Normalize file path
   */
  private normalizePath(path: string): string {
    return path.replace(/\\/g, '/').replace(/\/+/g, '/');
  }
}

export interface VFSOperation {
  type: 'create' | 'overwrite' | 'append' | 'prepend';
  path: string;
  content: string;
  timestamp: Date;
}
