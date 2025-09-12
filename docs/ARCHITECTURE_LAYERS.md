# Three-Layer Architecture

## Overview

The Architech uses a clean three-layer architecture that separates concerns and makes the system maintainable, testable, and extensible.

```
┌─────────────────────────────────────────────────────────────┐
│                    Layer 3: Blueprint Executor              │
│                   (Orchestration & Coordination)            │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                Layer 2: Blueprint Orchestrator              │
│              (Semantic Action Translation)                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              Layer 1: File Modification Engine              │
│                (Primitive File Operations)                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                Layer 0: Blueprint Analyzer                  │
│              (File Analysis & VFS Pre-population)           │
└─────────────────────────────────────────────────────────────┘
```

## Layer 1: File Modification Engine

**Purpose**: Core file operations with Contextual, Isolated Virtual File System (VFS)

**Responsibilities**:
- File creation, reading, writing in VFS
- JSON merging with deep-merge
- TypeScript AST manipulation with ts-morph
- Atomic writes to disk
- In-memory file tracking per blueprint
- VFS pre-population with required files

**Key Components**:
```typescript
FileModificationEngine {
  createFile()      // Create new files in VFS
  readFile()        // Read existing files from VFS
  overwriteFile()   // Replace file content in VFS
  appendToFile()    // Add to end of file in VFS
  prependToFile()   // Add to beginning of file in VFS
  mergeJsonFile()   // Deep merge JSON files in VFS
  modifyTsFile()    // AST-based TypeScript modifications in VFS
  flushToDisk()     // Atomic write VFS to disk
}

VirtualFileSystem {
  constructor(blueprintId, projectRoot)  // Isolated per blueprint
  readFile(path)                         // Lazy loading from disk
  writeFile(path, content)               // Write to VFS
  fileExists(path)                       // Check VFS for file
  flushToDisk()                          // Atomic commit to disk
}
```

**Contextual, Isolated VFS**:
- Each blueprint gets its own VFS instance
- Pre-populated with required files from disk
- In-memory file representation per blueprint
- Atomic writes (all-or-nothing per blueprint)
- Perfect blueprint isolation

## Layer 0: Blueprint Analyzer

**Purpose**: File analysis and VFS pre-population

**Responsibilities**:
- Analyze blueprints to determine required files
- Scan actions for file references
- Extract contextualFiles property
- Validate required files exist on disk
- Determine execution strategy (VFS vs simple)

**Key Components**:
```typescript
BlueprintAnalyzer {
  analyzeBlueprint(blueprint)           // Analyze blueprint for required files
  validateRequiredFiles(analysis, root) // Validate files exist on disk
}

BlueprintAnalysis {
  allRequiredFiles: string[];    // All files needed by blueprint
  contextualFiles: string[];     // Files to pre-load into VFS
}
```

**Analysis Process**:
1. Scan all blueprint actions for file references
2. Extract files from ENHANCE_FILE, MERGE_JSON, etc.
3. Include files from contextualFiles property
4. Validate all required files exist on disk
5. Return complete file list for VFS pre-population

## Layer 2: Blueprint Orchestrator

**Purpose**: Translates semantic actions to file primitives

**Responsibilities**:
- Action type routing
- Template variable processing
- Strategy mapping
- Error handling and reporting
- File tracking

**Key Components**:
```typescript
BlueprintOrchestrator {
  executeSemanticAction()  // Main entry point
  handleCreateFile()       // CREATE_FILE → createFile()
  handleInstallPackages()  // INSTALL_PACKAGES → mergeJsonFile()
  handleAddScript()        // ADD_SCRIPT → mergeJsonFile()
  handleAddEnvVar()        // ADD_ENV_VAR → appendToFile()
  handleAddTsImport()      // ADD_TS_IMPORT → modifyTsFile()
  // ... 10 semantic actions total
}
```

**Translation Table**:
| Semantic Action | File Primitive | Example |
|----------------|----------------|---------|
| `INSTALL_PACKAGES` | `mergeJsonFile('package.json')` | `{dependencies: {react: '^18.0.0'}}` |
| `ADD_SCRIPT` | `mergeJsonFile('package.json')` | `{scripts: {build: 'tsc'}}` |
| `ADD_ENV_VAR` | `appendToFile('.env')` | `API_KEY=secret123` |
| `ADD_TS_IMPORT` | `modifyTsFile()` | `import { useState } from 'react'` |

## Layer 3: Blueprint Executor

**Purpose**: High-level blueprint execution and orchestration

**Responsibilities**:
- Blueprint execution coordination
- Conditional action evaluation
- Error aggregation and reporting
- Atomic execution (all-or-nothing)
- Template processing

**Key Components**:
```typescript
BlueprintExecutor {
  executeBlueprint()       // Execute entire blueprint
  processTemplate()        // {{variable}} substitution
  evaluateCondition()      // Conditional execution
  // Uses orchestrator for all actions
  // Handles conditions, error reporting
  // Flushes changes atomically
}
```

## Data Flow

```
1. Blueprint Analyzer analyzes blueprint for required files
2. VFS is created and pre-populated with required files
3. Blueprint Executor receives blueprint with VFS context
4. For each action:
   a. Process template variables
   b. Evaluate conditions
   c. Delegate to Orchestrator
5. Orchestrator translates to primitives
6. File Engine performs operations in VFS
7. All changes flushed to disk atomically
```

### Detailed VFS Workflow

```
1. Analysis Phase:
   BlueprintAnalyzer.analyzeBlueprint(blueprint)
   → { allRequiredFiles: string[], contextualFiles: string[] }

2. VFS Initialization:
   new VirtualFileSystem(blueprintId, projectRoot)

3. Pre-population Phase:
   preloadFilesIntoVFS(vfs, analysis.allRequiredFiles, projectRoot)

4. Execution Phase:
   BlueprintExecutor.executeBlueprint(blueprint, context, blueprintContext)
   → All operations happen in VFS

5. Commit Phase:
   vfs.flushToDisk()
   → Atomic write to disk
```

## Benefits

### Separation of Concerns
- **Layer 1**: File system operations
- **Layer 2**: Business logic translation
- **Layer 3**: Execution orchestration

### Testability
- Each layer can be tested independently
- Mock interfaces between layers
- Clear input/output contracts

### Maintainability
- Changes to file operations don't affect orchestration
- New semantic actions only require Layer 2 changes
- Clear responsibility boundaries

### Extensibility
- Easy to add new semantic actions
- Easy to add new file primitives
- Easy to add new execution strategies

## Error Handling

### Layer 1 (File Engine)
- File system errors
- JSON parsing errors
- AST manipulation errors

### Layer 2 (Orchestrator)
- Action validation errors
- Template processing errors
- Strategy mapping errors

### Layer 3 (Executor)
- Blueprint validation errors
- Condition evaluation errors
- Execution coordination errors

## Performance

### Virtual File System
- In-memory operations are fast
- Atomic writes prevent partial states
- Operation batching reduces I/O

### Template Processing
- Simple regex-based substitution
- Cached context processing
- Minimal overhead

### Error Recovery
- Atomic execution prevents corruption
- Clear error messages for debugging
- Rollback capability through VFS

## Future Enhancements

### Layer 1 Improvements
- Parallel file operations
- File watching and hot reload
- Advanced AST transformations

### Layer 2 Improvements
- More semantic actions
- Custom modifier registry
- Plugin system for actions

### Layer 3 Improvements
- Parallel action execution
- Dependency resolution
- Blueprint validation

## Migration Path

The architecture was designed to support gradual migration:

1. **Phase 1**: Legacy `ADD_CONTENT` actions work through orchestrator
2. **Phase 2**: Blueprints migrate to semantic actions
3. **Phase 3**: Legacy support can be removed

This ensures backward compatibility while enabling the new architecture.
