# @the-architech/types

Shared TypeScript type definitions for The Architech CLI and Marketplace ecosystem.

## Overview

This package provides centralized type definitions that are used across:
- **The Architech CLI** - Core CLI engine
- **The Architech Marketplace** - Blueprint and adapter definitions
- **Third-party integrations** - External tools and plugins

## Installation

```bash
npm install @the-architech/types
```

## Usage

### Legacy Blueprint

```typescript
import { Blueprint, AdapterConfig, BlueprintAction } from '@the-architech/types';

// Define a blueprint (legacy style)
const myBlueprint: Blueprint = {
  id: 'my-blueprint',
  name: 'My Blueprint',
  actions: [
    {
      type: 'CREATE_FILE',
      path: 'src/index.ts',
      content: 'console.log("Hello World");'
    }
  ]
};
```

### Schema-Driven Blueprint (New)

```typescript
import { defineBlueprint } from '@the-architech/types';

// Define valid options with 'as const' for type inference
const VALID_THEMES = ['light', 'dark', 'system'] as const;

// Create a schema-driven blueprint with type validation
export const blueprint = defineBlueprint({
  id: 'my-blueprint',
  name: 'My Blueprint',
  
  // Define the schema for parameters
  schema: {
    parameters: {
      theme: {
        type: 'string',
        enum: VALID_THEMES,
        default: 'light',
        description: 'UI theme to use'
      },
      features: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['auth', 'api', 'database'] as const
        },
        default: ['auth'],
        description: 'Features to enable'
      }
    }
  },
  
  // Actions function receives typed parameters
  actions: (params) => [
    {
      type: 'CREATE_FILE',
      path: `src/theme/${params.theme}/config.ts`,
      template: 'templates/theme-config.ts.tpl'
    },
    // Dynamic actions based on parameters
    ...params.features.map(feature => ({
      type: 'CREATE_FILE' as const,
      path: `src/features/${feature}/index.ts`,
      template: `templates/${feature}.ts.tpl`
    }))
  ]
});

// Define an adapter config
const adapterConfig: AdapterConfig = {
  id: 'my-adapter',
  name: 'My Adapter',
  description: 'A sample adapter',
  category: 'framework',
  version: '1.0.0',
  blueprint: 'blueprint.ts'
};
```

## Available Types

### Core Types
- `Blueprint` - Blueprint definition structure
- `BlueprintAction` - Individual blueprint actions
- `Adapter` - Adapter with config and blueprint
- `AdapterConfig` - Adapter configuration
- `IntegrationAdapter` - Integration adapter structure

### Agent Types
- `Agent` - Base agent interface
- `AgentResult` - Agent execution result
- `ProjectContext` - Project execution context

### Recipe Types
- `Recipe` - Complete project recipe
- `RecipeModule` - Individual module in a recipe
- `Project` - Project configuration

### Utility Types
- `ParameterDefinition` - Parameter schema definition
- `FeatureDefinition` - Feature definition structure
- `VirtualFileSystem` - VFS interface

### Schema-Driven Blueprint Types (New in v1.1.0)
- `defineBlueprint` - Helper function for creating schema-driven blueprints
- `BlueprintSchema` - Schema definition for blueprint parameters
- `SchemaDrivenBlueprint` - Type-safe blueprint with schema validation
- `InferParams<T>` - Type utility to infer parameter types from schema

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Watch mode for development
npm run dev

# Clean build artifacts
npm run clean
```

## Publishing

```bash
# Build and publish
npm run build
npm publish
```

## License

MIT

