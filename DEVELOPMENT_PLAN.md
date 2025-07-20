# Development Plan: Enhanced Plugin-Aware Agent Workflow

## Problem Statement

The current CLI has a fundamental workflow issue where:
1. Plugin selection happens in the orchestrator but agents don't properly use the detailed configuration
2. Agents don't handle plugin-specific parameters collected during interactive selection
3. The workflow doesn't follow the proper order: Plugin Selection → Parameter Collection → Agent Execution

## Solution Overview

Transform the agents to be truly plugin-aware and handle the complete plugin lifecycle:
1. **Plugin Selection** (Orchestrator)
2. **Parameter Collection** (Plugin-specific prompts)
3. **Agent Execution** (Plugin-aware with full configuration)

## Phase 1: Enhanced Plugin Selection Service

### 1.1 Plugin-Specific Parameter Collection
- [ ] Extend `PluginSelectionService` to collect plugin-specific parameters
- [ ] Add parameter collection methods for each plugin type
- [ ] Store detailed configuration in context

### 1.2 Plugin Configuration Schema
- [ ] Define configuration schemas for each plugin
- [ ] Add validation for plugin-specific parameters
- [ ] Create type-safe configuration interfaces

## Phase 2: Plugin-Aware Agent Architecture

### 2.1 Agent Plugin Context
- [ ] Enhance `AgentContext` to include detailed plugin configuration
- [ ] Add plugin-specific configuration access methods
- [ ] Create plugin execution context

### 2.2 Agent Plugin Execution Flow
- [ ] Update agents to use plugin selection from context
- [ ] Add plugin-specific parameter handling
- [ ] Implement plugin validation before execution

## Phase 3: Enhanced Plugin System

### 3.1 Plugin Configuration Interface
- [ ] Add `getConfigurationSchema()` method to plugins
- [ ] Add `validateConfiguration()` method to plugins
- [ ] Add `getDefaultConfiguration()` method to plugins

### 3.2 Plugin Parameter Collection
- [ ] Create plugin-specific parameter collectors
- [ ] Add interactive parameter prompts
- [ ] Add parameter validation and defaults

## Phase 4: Implementation Details

### 4.1 Database Agent Enhancements
```typescript
// Enhanced DBAgent workflow
class DBAgent {
  async executeInternal(context: AgentContext): Promise<AgentResult> {
    // 1. Get plugin selection from context
    const pluginSelection = context.state.get('pluginSelection');
    const dbConfig = pluginSelection.database;
    
    // 2. Validate plugin selection
    if (!dbConfig.enabled || dbConfig.type === 'none') {
      return this.skipResult('Database not selected');
    }
    
    // 3. Get plugin-specific configuration
    const pluginConfig = await this.getPluginConfiguration(context, dbConfig);
    
    // 4. Execute selected plugin with full configuration
    return await this.executePlugin(dbConfig.type, pluginConfig, context);
  }
}
```

### 4.2 Authentication Agent Enhancements
```typescript
// Enhanced AuthAgent workflow
class AuthAgent {
  async executeInternal(context: AgentContext): Promise<AgentResult> {
    // 1. Get plugin selection from context
    const pluginSelection = context.state.get('pluginSelection');
    const authConfig = pluginSelection.authentication;
    
    // 2. Validate plugin selection
    if (!authConfig.enabled || authConfig.type === 'none') {
      return this.skipResult('Authentication not selected');
    }
    
    // 3. Get plugin-specific configuration
    const pluginConfig = await this.getPluginConfiguration(context, authConfig);
    
    // 4. Execute selected plugin with full configuration
    return await this.executePlugin(authConfig.type, pluginConfig, context);
  }
}
```

### 4.3 UI Agent Enhancements
```typescript
// Enhanced UIAgent workflow
class UIAgent {
  async executeInternal(context: AgentContext): Promise<AgentResult> {
    // 1. Get plugin selection from context
    const pluginSelection = context.state.get('pluginSelection');
    const uiConfig = pluginSelection.ui;
    
    // 2. Validate plugin selection
    if (!uiConfig.enabled || uiConfig.type === 'none') {
      return this.skipResult('UI library not selected');
    }
    
    // 3. Get plugin-specific configuration
    const pluginConfig = await this.getPluginConfiguration(context, uiConfig);
    
    // 4. Execute selected plugin with full configuration
    return await this.executePlugin(uiConfig.type, pluginConfig, context);
  }
}
```

## Phase 5: Plugin Configuration Collection

### 5.1 Database Plugin Configuration
```typescript
// Drizzle plugin configuration
const drizzleConfig = {
  provider: 'neon', // From user selection
  features: {
    migrations: true,
    seeding: true,
    backup: false
  },
  schema: {
    tables: ['users', 'posts', 'comments'],
    relationships: true
  },
  connection: {
    url: process.env.DATABASE_URL,
    ssl: true
  }
};
```

### 5.2 Authentication Plugin Configuration
```typescript
// Better Auth plugin configuration
const betterAuthConfig = {
  providers: ['email', 'github'], // From user selection
  features: {
    emailVerification: true,
    passwordReset: true,
    socialLogin: true,
    sessionManagement: true
  },
  database: {
    adapter: 'drizzle',
    url: process.env.DATABASE_URL
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  }
};
```

### 5.3 UI Plugin Configuration
```typescript
// Shadcn/ui plugin configuration
const shadcnConfig = {
  theme: 'system', // From user selection
  components: ['button', 'input', 'card', 'dialog', 'form'],
  features: {
    animations: true,
    icons: true,
    responsive: true
  },
  styling: {
    framework: 'tailwind',
    cssVariables: true,
    darkMode: true
  }
};
```

## Phase 6: Testing and Validation

### 6.1 Workflow Testing
- [ ] Test complete plugin selection flow
- [ ] Test parameter collection for each plugin
- [ ] Test agent execution with full configuration
- [ ] Test error handling and validation

### 6.2 Integration Testing
- [ ] Test end-to-end project generation
- [ ] Test plugin compatibility validation
- [ ] Test configuration persistence
- [ ] Test rollback functionality

## Phase 7: Documentation and Examples

### 7.1 User Documentation
- [ ] Update CLI usage documentation
- [ ] Add plugin selection examples
- [ ] Document configuration options
- [ ] Add troubleshooting guide

### 7.2 Developer Documentation
- [ ] Document agent plugin interface
- [ ] Add plugin development guide
- [ ] Document configuration schemas
- [ ] Add testing guidelines

## Implementation Order

1. **Phase 1**: Enhanced Plugin Selection Service
2. **Phase 2**: Plugin-Aware Agent Architecture
3. **Phase 3**: Enhanced Plugin System
4. **Phase 4**: Implementation Details
5. **Phase 5**: Plugin Configuration Collection
6. **Phase 6**: Testing and Validation
7. **Phase 7**: Documentation and Examples

## Expected Benefits

1. **Proper Workflow**: Plugin selection → Parameter collection → Agent execution
2. **Plugin-Aware Agents**: Agents understand which plugins were selected and their configuration
3. **Better User Experience**: Interactive parameter collection for each plugin
4. **Type Safety**: Full type safety for plugin configurations
5. **Extensibility**: Easy to add new plugins with their own configuration schemas
6. **Validation**: Proper validation of plugin configurations before execution

## Success Criteria

1. ✅ User can select plugins interactively
2. ✅ Plugin-specific parameters are collected
3. ✅ Agents execute the correct plugins with full configuration
4. ✅ Generated projects work correctly
5. ✅ Error handling and validation work properly
6. ✅ Documentation is complete and accurate 