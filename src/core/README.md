# Core Module - Consolidated Architecture

## Overview

The `src/core/` directory contains the consolidated core functionality of The Architech CLI, organized into logical domains for better maintainability and clarity.

## Structure

```
src/core/
├── index.ts                 # Main entry point - exports all core functionality
├── plugin/                  # Plugin system and management
│   ├── index.ts            # Plugin module exports
│   ├── plugin-system.ts    # Main plugin orchestrator
│   ├── plugin-registry.ts  # Plugin discovery and registration
│   ├── plugin-manager.ts   # Plugin lifecycle management
│   ├── plugin-adapter.ts   # CLI-to-plugin bridge
│   ├── plugin-selection-service.ts    # Interactive plugin selection
│   └── plugin-configuration-manager.ts # Plugin configuration schemas
├── project/                # Project management and structure
│   ├── index.ts            # Project module exports
│   ├── project-structure-manager.ts    # Project structure creation
│   ├── configuration-manager.ts        # Project configuration
│   └── context-factory.ts  # Agent context creation
├── cli/                    # CLI utilities and tools
│   ├── index.ts            # CLI module exports
│   ├── command-runner.ts   # Package manager agnostic command execution
│   ├── logger.ts           # Structured logging
│   └── banner.ts           # CLI messaging and display
└── templates/              # Template system
    ├── index.ts            # Templates module exports
    └── template-service.ts # EJS-based template rendering
```

## Module Responsibilities

### Plugin Module (`src/core/plugin/`)
- **Plugin System**: Central orchestrator for all plugin operations
- **Plugin Registry**: Plugin discovery, registration, and compatibility checking
- **Plugin Manager**: Plugin lifecycle operations (install, uninstall, update)
- **Plugin Adapter**: Bridge between CLI commands and plugin system
- **Plugin Selection Service**: Interactive plugin selection with recommendations
- **Plugin Configuration Manager**: Schema-based plugin configuration

### Project Module (`src/core/project/`)
- **Project Structure Manager**: Creates and manages project directory structures
- **Configuration Manager**: Handles project configuration and settings
- **Context Factory**: Creates and validates agent execution contexts

### CLI Module (`src/core/cli/`)
- **Command Runner**: Package manager agnostic command execution
- **Logger**: Structured logging with different verbosity levels
- **Banner**: CLI messaging, success/error display, and branding

### Templates Module (`src/core/templates/`)
- **Template Service**: EJS-based template rendering with variable substitution

## Benefits of Consolidation

1. **Clear Separation of Concerns**: Each module has a specific domain responsibility
2. **Better Maintainability**: Related functionality is grouped together
3. **Improved Discoverability**: Easy to find specific functionality
4. **Reduced Coupling**: Modules are self-contained with clear interfaces
5. **Enhanced Testing**: Each module can be tested independently
6. **Simplified Imports**: Single entry points for each domain

## Usage

### Importing Core Functionality

```typescript
// Import everything from core
import { 
  PluginSystem, 
  ProjectStructureManager, 
  CommandRunner, 
  TemplateService 
} from '../core/index.js';

// Import specific modules
import { PluginSystem } from '../core/plugin/index.js';
import { ProjectStructureManager } from '../core/project/index.js';
import { CommandRunner } from '../core/cli/index.js';
import { TemplateService } from '../core/templates/index.js';
```

### Module-Specific Imports

```typescript
// Plugin system
import { PluginSystem, PluginSelectionService } from '../core/plugin/index.js';

// Project management
import { ProjectStructureManager, ContextFactory } from '../core/project/index.js';

// CLI utilities
import { CommandRunner, Logger, displayBanner } from '../core/cli/index.js';

// Template system
import { TemplateService } from '../core/templates/index.js';
```

## Migration from Utils

The old `src/utils/` directory has been completely replaced with this new structure:

| Old Path | New Path | Module |
|----------|----------|--------|
| `utils/plugin-system.ts` | `core/plugin/plugin-system.ts` | Plugin |
| `utils/plugin-registry.ts` | `core/plugin/plugin-registry.ts` | Plugin |
| `utils/plugin-manager.ts` | `core/plugin/plugin-manager.ts` | Plugin |
| `utils/plugin-adapter.ts` | `core/plugin/plugin-adapter.ts` | Plugin |
| `utils/plugin-selection-service.ts` | `core/plugin/plugin-selection-service.ts` | Plugin |
| `utils/plugin-configuration-manager.ts` | `core/plugin/plugin-configuration-manager.ts` | Plugin |
| `utils/project-structure-manager.ts` | `core/project/project-structure-manager.ts` | Project |
| `utils/configuration-manager.ts` | `core/project/configuration-manager.ts` | Project |
| `utils/context-factory.ts` | `core/project/context-factory.ts` | Project |
| `utils/command-runner.ts` | `core/cli/command-runner.ts` | CLI |
| `utils/logger.ts` | `core/cli/logger.ts` | CLI |
| `utils/banner.ts` | `core/cli/banner.ts` | CLI |
| `utils/template-service.ts` | `core/templates/template-service.ts` | Templates |

## Future Enhancements

This consolidated structure provides a solid foundation for:

1. **Plugin Marketplace**: Easy to extend with external plugin discovery
2. **Configuration Management**: Centralized configuration with validation
3. **Testing Framework**: Each module can be tested independently
4. **Documentation**: Clear module boundaries make documentation easier
5. **Performance Optimization**: Module-specific optimizations
6. **Type Safety**: Better TypeScript support with clear interfaces 