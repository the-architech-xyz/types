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
└─────────────────────────────────────────────────────────────┘
```

## Layer 1: File Modification Engine

**Purpose**: Core file operations with Virtual File System (VFS)

**Responsibilities**:
- File creation, reading, writing
- JSON merging with deep-merge
- TypeScript AST manipulation with ts-morph
- Atomic writes to disk
- In-memory file tracking

**Key Components**:
```typescript
FileModificationEngine {
  createFile()      // Create new files
  readFile()        // Read existing files
  overwriteFile()   // Replace file content
  appendToFile()    // Add to end of file
  prependToFile()   // Add to beginning of file
  mergeJsonFile()   // Deep merge JSON files
  modifyTsFile()    // AST-based TypeScript modifications
  flushToDisk()     // Atomic write to disk
}
```

**Virtual File System**:
- In-memory file representation
- Operation tracking and history
- Atomic writes (all-or-nothing)
- Conflict detection

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
1. Blueprint Executor receives blueprint
2. For each action:
   a. Process template variables
   b. Evaluate conditions
   c. Delegate to Orchestrator
3. Orchestrator translates to primitives
4. File Engine performs operations in VFS
5. All changes flushed to disk atomically
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
