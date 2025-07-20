# Plugin Development Guide

## Overview

The Architech CLI uses a modular plugin system that allows you to extend the functionality with custom technologies, frameworks, and tools. This guide will help you understand how to create, develop, and integrate plugins that generate unified interface files.

## Plugin Architecture

### Core Concepts

- **Plugin Interface**: Standardized interface all plugins must implement
- **Plugin Registry**: Centralized management and dependency resolution
- **Agent Integration**: Plugins are used by specialized agents
- **Context Sharing**: Shared project context across all plugins
- **Unified Interface Files**: Generated files that provide consistent APIs
- **Structure Service**: Centralized path resolution for project structures

### Plugin Lifecycle

1. **Registration**: Plugin is registered with the registry
2. **Validation**: Compatibility and dependencies are checked
3. **Installation**: Plugin is executed during project generation
4. **File Generation**: Plugin generates unified interface files
5. **Validation**: Plugin validates its implementation
6. **Cleanup**: Optional cleanup after project generation

## Plugin Interface

### Basic Interface

All plugins must implement the `IPlugin` interface:

```typescript
interface IPlugin {
  // Metadata
  getMetadata(): PluginMetadata;
  
  // Core functionality
  install(context: PluginContext): Promise<PluginResult>;
  validate(context: PluginContext): Promise<ValidationResult>;
  
  // Optional features
  uninstall?(context: PluginContext): Promise<PluginResult>;
  update?(context: PluginContext): Promise<PluginResult>;
}
```

### Plugin Metadata

```typescript
interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: PluginCategory;
  tags: string[];
  license: string;
  repository: string;
  homepage: string;
}

class MyPlugin implements IPlugin {
  getMetadata(): PluginMetadata {
    return {
      id: 'my-plugin',
      name: 'My Plugin',
      version: '1.0.0',
      description: 'Description of what this plugin does',
      author: 'Your Name',
      category: PluginCategory.DATABASE,
      tags: ['database', 'orm', 'typescript'],
      license: 'MIT',
      repository: 'https://github.com/your-org/my-plugin',
      homepage: 'https://my-plugin.dev'
    };
  }
}
```

## Creating Your First Plugin

### 1. Basic Plugin Structure

```typescript
import { IPlugin, PluginContext, PluginResult, ValidationResult, PluginMetadata, PluginCategory } from '@the-architech/core';
import { structureService } from '@the-architech/core';

export class MyFirstPlugin implements IPlugin {
  getMetadata(): PluginMetadata {
    return {
      id: 'my-first-plugin',
      name: 'My First Plugin',
      version: '1.0.0',
      description: 'My first custom plugin',
      author: 'Your Name',
      category: PluginCategory.DATABASE,
      tags: ['database', 'custom'],
      license: 'MIT',
      repository: 'https://github.com/your-org/my-first-plugin',
      homepage: 'https://my-first-plugin.dev'
    };
  }

  async install(context: PluginContext): Promise<PluginResult> {
    const { logger, projectPath } = context;
    
    logger.info('Setting up MyFirstPlugin...');
    
    // Install dependencies
    await this.installDependencies(context);
    
    // Create configuration file
    await this.createConfigFile(context);
    
    // Generate unified interface files
    await this.generateUnifiedInterfaceFiles(context);
    
    logger.success('MyFirstPlugin setup complete!');
    
    return {
      success: true,
      artifacts: [
        {
          type: 'file',
          path: path.join(projectPath, 'my-config.json')
        }
      ],
      dependencies: [
        {
          name: 'my-package',
          version: '^1.0.0',
          type: 'production',
          category: PluginCategory.DATABASE
        }
      ],
      scripts: [],
      configs: [],
      errors: [],
      warnings: [],
      duration: 0
    };
  }

  async validate(context: PluginContext): Promise<ValidationResult> {
    const { projectPath } = context;
    
    // Check if required files exist
    const configExists = await fs.pathExists(path.join(projectPath, 'my-config.json'));
    
    if (!configExists) {
      return {
        valid: false,
        errors: [{
          field: 'config',
          message: 'my-config.json not found',
          code: 'CONFIG_NOT_FOUND',
          severity: 'error'
        }]
      };
    }
    
    return { valid: true, errors: [], warnings: [] };
  }

  private async installDependencies(context: PluginContext): Promise<void> {
    const { runner, projectPath } = context;
    await runner.install(['my-package'], false, projectPath);
  }

  private async createConfigFile(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    const configPath = path.join(projectPath, 'my-config.json');
    
    const config = {
      name: context.projectName,
      version: '1.0.0',
      settings: {
        enabled: true,
        debug: false
      }
    };
    
    await fs.writeJson(configPath, config, { spaces: 2 });
  }

  private async generateUnifiedInterfaceFiles(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    const structure = context.projectStructure!;
    
    // Get the correct path for unified interface files
    const unifiedPath = structureService.getUnifiedInterfacePath(projectPath, structure, 'my-module');
    
    await fs.ensureDir(unifiedPath);

    // Create index.ts for the unified interface
    const indexContent = `
// My Plugin Unified Interface
// This file provides a unified interface for my plugin functionality

export const myModule = {
  client: {
    query: async (sql: string, params?: any[]) => {
      // Implementation specific to my plugin
      return await this.myClient.execute(sql, params);
    },
    insert: async (table: string, data: any) => {
      return await this.myClient.insert(table, data);
    },
    update: async (table: string, where: any, data: any) => {
      return await this.myClient.update(table, where, data);
    },
    delete: async (table: string, where: any) => {
      return await this.myClient.delete(table, where);
    }
  },
  
  schema: {
    // Define your schema here
    users: { /* user table schema */ },
    posts: { /* post table schema */ }
  },
  
  migrations: {
    generate: async (name: string) => {
      // Generate migration
      console.log('Generating migration:', name);
    },
    run: async () => {
      // Run migrations
      console.log('Running migrations');
    },
    reset: async () => {
      // Reset database
      console.log('Resetting database');
    }
  },
  
  connection: {
    connect: async () => {
      // Connect to database
      console.log('Connected to database');
    },
    disconnect: async () => {
      // Disconnect from database
      console.log('Disconnected from database');
    },
    isConnected: () => true,
    health: async () => ({
      status: 'healthy',
      latency: 10
    })
  }
};

export default myModule;
`;
    
    await fs.writeFile(path.join(unifiedPath, 'index.ts'), indexContent);
  }
}
```

### 2. Register Your Plugin

```typescript
import { PluginRegistry } from '@the-architech/core';
import { MyFirstPlugin } from './MyFirstPlugin';

const registry = new PluginRegistry();
registry.register(new MyFirstPlugin());
```

### 3. Use in an Agent

```typescript
import { AbstractAgent } from '@the-architech/core';

export class CustomAgent extends AbstractAgent {
  async executeInternal(context: AgentContext): Promise<AgentResult> {
    const plugin = this.pluginSystem.getRegistry().get('my-first-plugin');
    
    if (plugin) {
      const result = await plugin.install(context);
      
      // Validate the setup
      const validation = await plugin.validate(context);
      if (!validation.valid) {
        throw new Error(`Plugin validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }
    }
  }
}
```

## Advanced Plugin Development

### 1. Template Rendering

Plugins can render templates for configuration files:

```typescript
import { renderTemplate } from '@the-architech/core';

export class ConfigPlugin implements IPlugin {
  // ... metadata

  async install(context: PluginContext): Promise<PluginResult> {
    const { projectPath } = context;
    
    // Render template with context
    const configContent = await renderTemplate('config-template.json', {
      projectName: context.projectName,
      version: context.config.version,
      features: context.options.features
    });
    
    await fs.writeFile(
      path.join(projectPath, 'config.json'),
      configContent
    );
    
    // Generate unified interface files
    await this.generateUnifiedInterfaceFiles(context);
  }
}
```

### 2. Package Management

Handle package installation and configuration:

```typescript
export class PackagePlugin implements IPlugin {
  async install(context: PluginContext): Promise<PluginResult> {
    const { runner, projectPath, logger } = context;
    
    // Install dependencies
    logger.info('Installing packages...');
    await runner.install(['my-package@^2.0.0'], false, projectPath);
    
    // Update package.json scripts
    await this.updatePackageScripts(context);
    
    // Generate unified interface files
    await this.generateUnifiedInterfaceFiles(context);
  }
  
  private async updatePackageScripts(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    const packagePath = path.join(projectPath, 'package.json');
    
    const pkg = await fs.readJson(packagePath);
    
    pkg.scripts = {
      ...pkg.scripts,
      'my-command': 'my-package run',
      'my-build': 'my-package build'
    };
    
    await fs.writeJson(packagePath, pkg, { spaces: 2 });
  }
}
```

### 3. File System Operations

Handle complex file operations:

```typescript
export class FileSystemPlugin implements IPlugin {
  async install(context: PluginContext): Promise<PluginResult> {
    const { projectPath } = context;
    
    // Create directory structure
    await this.createDirectories(context);
    
    // Copy template files
    await this.copyTemplates(context);
    
    // Generate dynamic files
    await this.generateFiles(context);
    
    // Generate unified interface files
    await this.generateUnifiedInterfaceFiles(context);
  }
  
  private async createDirectories(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    const structure = context.projectStructure!;
    
    // Use structure service to get correct paths
    const paths = structureService.getPaths(projectPath, structure);
    
    const dirs = [
      path.join(paths.components, 'my-components'),
      path.join(paths.lib, 'my-utils'),
      path.join(paths.types, 'my-types')
    ];
    
    for (const dir of dirs) {
      await fs.ensureDir(dir);
    }
  }
  
  private async copyTemplates(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    const structure = context.projectStructure!;
    const paths = structureService.getPaths(projectPath, structure);
    
    const templates = [
      { from: 'templates/component.tsx', to: path.join(paths.components, 'MyComponent.tsx') },
      { from: 'templates/util.ts', to: path.join(paths.lib, 'my-util.ts') }
    ];
    
    for (const template of templates) {
      const content = await fs.readFile(template.from, 'utf-8');
      const rendered = content.replace(/\{\{projectName\}\}/g, context.projectName);
      await fs.writeFile(template.to, rendered);
    }
  }
}
```

### 4. Configuration Management

Handle complex configuration scenarios:

```typescript
export class ConfigPlugin implements IPlugin {
  async install(context: PluginContext): Promise<PluginResult> {
    await this.createMainConfig(context);
    await this.createEnvironmentConfig(context);
    await this.updateExistingConfigs(context);
    await this.generateUnifiedInterfaceFiles(context);
  }
  
  private async createMainConfig(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    const configPath = path.join(projectPath, 'my-config.js');
    
    const config = `
module.exports = {
  name: '${context.projectName}',
  version: '${context.config.version}',
  features: ${JSON.stringify(context.options.features)},
  development: {
    debug: true,
    hotReload: true
  },
  production: {
    debug: false,
    optimization: true
  }
};
`;
    
    await fs.writeFile(configPath, config);
  }
  
  private async createEnvironmentConfig(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    const envPath = path.join(projectPath, '.env.example');
    
    const envVars = `
# My Plugin Configuration
MY_PLUGIN_API_KEY=your-api-key-here
MY_PLUGIN_ENVIRONMENT=development
MY_PLUGIN_DEBUG=false
`;
    
    await fs.appendFile(envPath, envVars);
  }
}
```

## Plugin Categories

### UI Plugins

Plugins for UI frameworks and component libraries:

```typescript
export class UIComponentPlugin implements IPlugin {
  getMetadata(): PluginMetadata {
    return {
      id: 'ui-component-library',
      name: 'UI Component Library',
      version: '1.0.0',
      description: 'UI component library plugin',
      author: 'Your Name',
      category: PluginCategory.UI,
      tags: ['ui', 'components', 'react'],
      license: 'MIT',
      repository: 'https://github.com/your-org/ui-component-library',
      homepage: 'https://ui-component-library.dev'
    };
  }
  
  async install(context: PluginContext): Promise<PluginResult> {
    // Install UI library
    await this.installLibrary(context);
    
    // Create component configuration
    await this.createComponentConfig(context);
    
    // Set up theme system
    await this.setupTheme(context);
    
    // Create example components
    await this.createExamples(context);
    
    // Generate unified interface files
    await this.generateUnifiedInterfaceFiles(context);
  }
  
  private async createComponentConfig(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    const configPath = path.join(projectPath, 'ui.config.js');
    
    const config = `
module.exports = {
  components: {
    Button: true,
    Input: true,
    Modal: true
  },
  theme: {
    colors: {
      primary: '#007bff',
      secondary: '#6c757d'
    }
  }
};
`;
    
    await fs.writeFile(configPath, config);
  }
  
  private async generateUnifiedInterfaceFiles(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    const structure = context.projectStructure!;
    const unifiedPath = structureService.getUnifiedInterfacePath(projectPath, structure, 'ui');
    
    await fs.ensureDir(unifiedPath);

    // Create index.ts for the unified interface
    const indexContent = `
// UI Component Library Unified Interface
// This file provides a unified interface for UI components

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Modal } from '../components/ui/modal';

export const ui = {
  components: {
    Button,
    Input,
    Modal,
  },
  theme: {
    colors: {
      primary: '#007bff',
      secondary: '#6c757d'
    },
    useTheme: () => {
      // Theme hook implementation
      return { colors: { primary: '#007bff', secondary: '#6c757d' } };
    }
  },
  utils: {
    cn: (...classes: (string | undefined | null | false)[]) => {
      return classes.filter(Boolean).join(' ');
    },
  },
};

export default ui;
`;
    
    await fs.writeFile(path.join(unifiedPath, 'index.ts'), indexContent);
  }
}
```

### Database Plugins

Plugins for database ORMs and configurations:

```typescript
export class DatabasePlugin implements IPlugin {
  getMetadata(): PluginMetadata {
    return {
      id: 'database-orm',
      name: 'Database ORM',
      version: '1.0.0',
      description: 'Database ORM plugin',
      author: 'Your Name',
      category: PluginCategory.DATABASE,
      tags: ['database', 'orm', 'sql'],
      license: 'MIT',
      repository: 'https://github.com/your-org/database-orm',
      homepage: 'https://database-orm.dev'
    };
  }
  
  async install(context: PluginContext): Promise<PluginResult> {
    // Install ORM
    await this.installORM(context);
    
    // Create database configuration
    await this.createDatabaseConfig(context);
    
    // Generate initial schema
    await this.generateSchema(context);
    
    // Set up migrations
    await this.setupMigrations(context);
    
    // Generate unified interface files
    await this.generateUnifiedInterfaceFiles(context);
  }
  
  private async createDatabaseConfig(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    const configPath = path.join(projectPath, 'database.config.js');
    
    const config = `
module.exports = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || '${context.projectName}',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || ''
  },
  migrations: {
    directory: './src/database/migrations'
  },
  seeds: {
    directory: './src/database/seeds'
  }
};
`;
    
    await fs.writeFile(configPath, config);
  }
  
  private async generateUnifiedInterfaceFiles(context: PluginContext): Promise<PluginResult> {
    const { projectPath } = context;
    const structure = context.projectStructure!;
    const unifiedPath = structureService.getUnifiedInterfacePath(projectPath, structure, 'db');
    
    await fs.ensureDir(unifiedPath);

    // Create index.ts for the unified interface
    const indexContent = `
// Database ORM Unified Interface
// This file provides a unified interface for database operations

export const db = {
  client: {
    query: async (sql: string, params?: any[]) => {
      // ORM-specific implementation
      return await this.ormClient.execute(sql, params);
    },
    insert: async (table: string, data: any) => {
      return await this.ormClient.insert(table, data);
    },
    update: async (table: string, where: any, data: any) => {
      return await this.ormClient.update(table, where, data);
    },
    delete: async (table: string, where: any) => {
      return await this.ormClient.delete(table, where);
    }
  },
  
  schema: {
    users: { /* user table schema */ },
    posts: { /* post table schema */ }
  },
  
  migrations: {
    generate: async (name: string) => {
      // Generate migration
      console.log('Generating migration:', name);
    },
    run: async () => {
      // Run migrations
      console.log('Running migrations');
    },
    reset: async () => {
      // Reset database
      console.log('Resetting database');
    }
  },
  
  connection: {
    connect: async () => {
      // Connect to database
      console.log('Connected to database');
    },
    disconnect: async () => {
      // Disconnect from database
      console.log('Disconnected from database');
    },
    isConnected: () => true,
    health: async () => ({
      status: 'healthy',
      latency: 10
    })
  }
};

export default db;
`;
    
    await fs.writeFile(path.join(unifiedPath, 'index.ts'), indexContent);
  }
}
```

### Authentication Plugins

Plugins for authentication systems:

```typescript
export class AuthPlugin implements IPlugin {
  getMetadata(): PluginMetadata {
    return {
      id: 'auth-system',
      name: 'Authentication System',
      version: '1.0.0',
      description: 'Authentication system plugin',
      author: 'Your Name',
      category: PluginCategory.AUTH,
      tags: ['auth', 'authentication', 'security'],
      license: 'MIT',
      repository: 'https://github.com/your-org/auth-system',
      homepage: 'https://auth-system.dev'
    };
  }
  
  async install(context: PluginContext): Promise<PluginResult> {
    // Install auth library
    await this.installAuth(context);
    
    // Create auth configuration
    await this.createAuthConfig(context);
    
    // Set up providers
    await this.setupProviders(context);
    
    // Create auth utilities
    await this.createAuthUtils(context);
    
    // Generate unified interface files
    await this.generateUnifiedInterfaceFiles(context);
  }
  
  private async createAuthConfig(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    const configPath = path.join(projectPath, 'auth.config.js');
    
    const config = `
module.exports = {
  providers: [
    {
      id: 'google',
      name: 'Google',
      type: 'oauth',
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    },
    {
      id: 'github',
      name: 'GitHub',
      type: 'oauth',
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    }
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  }
};
`;
    
    await fs.writeFile(configPath, config);
  }
  
  private async generateUnifiedInterfaceFiles(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    const structure = context.projectStructure!;
    const unifiedPath = structureService.getUnifiedInterfacePath(projectPath, structure, 'auth');
    
    await fs.ensureDir(unifiedPath);

    // Create index.ts for the unified interface
    const indexContent = `
// Authentication System Unified Interface
// This file provides a unified interface for authentication

export const auth = {
  client: {
    signIn: async (provider: string, options?: any) => {
      // Auth-specific implementation
      return await this.authClient.signIn(provider, options);
    },
    signOut: async (options?: any) => {
      return await this.authClient.signOut(options);
    },
    getSession: async () => {
      return await this.authClient.getSession();
    },
    getUser: async () => {
      return await this.authClient.getUser();
    },
    isAuthenticated: async () => {
      return await this.authClient.isAuthenticated();
    }
  },
  
  server: {
    auth: async (req: Request, res: Response) => {
      return await this.authServer.auth(req, res);
    },
    protect: (handler: Function) => {
      return this.authServer.protect(handler);
    }
  },
  
  components: {
    LoginButton: (props: any) => {
      // Login button component
      return <button {...props}>Sign In</button>;
    },
    AuthForm: (props: any) => {
      // Auth form component
      return <form {...props}>Auth Form</form>;
    },
    UserProfile: (props: any) => {
      // User profile component
      return <div {...props}>User Profile</div>;
    },
    AuthGuard: (props: any) => {
      // Auth guard component
      return <div {...props}>Auth Guard</div>;
    }
  }
};

export default auth;
`;
    
    await fs.writeFile(path.join(unifiedPath, 'index.ts'), indexContent);
  }
}
```

## Plugin Testing

### Unit Testing

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { MyPlugin } from './MyPlugin';
import { createMockContext } from '@the-architech/testing';

describe('MyPlugin', () => {
  let plugin: MyPlugin;
  let context: PluginContext;
  
  beforeEach(() => {
    plugin = new MyPlugin();
    context = createMockContext();
  });
  
  it('should setup correctly', async () => {
    const result = await plugin.install(context);
    
    expect(result.success).toBe(true);
    // Verify files were created
    expect(await fs.pathExists(path.join(context.projectPath, 'my-config.json'))).toBe(true);
  });
  
  it('should validate correctly', async () => {
    const result = await plugin.validate(context);
    expect(result.valid).toBe(true);
  });
  
  it('should generate unified interface files', async () => {
    await plugin.install(context);
    
    const structure = context.projectStructure!;
    const unifiedPath = structureService.getUnifiedInterfacePath(
      context.projectPath, 
      structure, 
      'my-module'
    );
    
    expect(await fs.pathExists(path.join(unifiedPath, 'index.ts'))).toBe(true);
  });
  
  it('should handle missing dependencies', async () => {
    // Test error handling
    const result = await plugin.validate(createMockContext({ missingFiles: true }));
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        message: 'my-config.json not found'
      })
    );
  });
});
```

### Integration Testing

```typescript
import { describe, it, expect } from 'vitest';
import { PluginRegistry } from '@the-architech/core';
import { MyPlugin } from './MyPlugin';

describe('Plugin Integration', () => {
  it('should register and retrieve plugin', () => {
    const registry = new PluginRegistry();
    const plugin = new MyPlugin();
    
    registry.register(plugin);
    
    const retrieved = registry.get('my-plugin');
    expect(retrieved).toBe(plugin);
  });
  
  it('should resolve dependencies correctly', () => {
    const registry = new PluginRegistry();
    registry.register(new MyPlugin());
    registry.register(new DependencyPlugin());
    
    const plugins = registry.resolveDependencies(['my-plugin']);
    expect(plugins).toHaveLength(2); // Includes dependency
  });
});
```

## Best Practices

### 1. Plugin Design

- **Single Responsibility**: Each plugin should handle one technology or concern
- **Dependency Management**: Clearly define dependencies and conflicts
- **Error Handling**: Implement proper error handling and validation
- **Documentation**: Document your plugin's purpose and usage
- **Unified Interface Generation**: Always generate unified interface files

### 2. File Operations

- **Path Safety**: Use `path.join()` for cross-platform compatibility
- **Structure Service**: Use the structure service for path resolution
- **Async Operations**: Use async/await for file operations
- **Error Recovery**: Implement rollback mechanisms for failed operations
- **File Permissions**: Handle file permission issues gracefully

### 3. Configuration

- **Environment Variables**: Use environment variables for sensitive data
- **Default Values**: Provide sensible defaults for configuration
- **Validation**: Validate configuration values
- **Documentation**: Document all configuration options

### 4. Unified Interface Files

- **Consistent API**: Provide consistent API across all technologies
- **TypeScript Types**: Include proper TypeScript types
- **Escape Hatches**: Add escape hatches for advanced use cases
- **Documentation**: Document the unified interface API
- **Testing**: Test the generated unified interface files

### 5. Performance

- **Minimal Operations**: Minimize file system operations
- **Caching**: Cache expensive operations when possible
- **Parallelization**: Execute independent operations in parallel
- **Cleanup**: Clean up temporary files and resources

### 6. Security

- **Input Validation**: Validate all inputs and configuration
- **Path Traversal**: Prevent path traversal attacks
- **Dependency Scanning**: Scan dependencies for vulnerabilities
- **Secret Management**: Handle secrets securely

## Publishing Plugins

### 1. Package Structure

```
my-architech-plugin/
├── src/
│   ├── index.ts
│   ├── MyPlugin.ts
│   └── templates/
├── package.json
├── README.md
├── LICENSE
└── tsconfig.json
```

### 2. Package.json

```json
{
  "name": "@the-architech/my-plugin",
  "version": "1.0.0",
  "description": "My custom plugin for The Architech CLI",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "templates"
  ],
  "keywords": [
    "architech",
    "plugin",
    "cli"
  ],
  "peerDependencies": {
    "@the-architech/core": "^2.0.0"
  },
  "devDependencies": {
    "@the-architech/core": "^2.0.0",
    "typescript": "^5.0.0"
  }
}
```

### 3. Publishing

```bash
# Build the plugin
npm run build

# Publish to npm
npm publish

# Or publish with scope
npm publish --access public
```

## Community Plugins

### Plugin Marketplace

The Architech community maintains a plugin marketplace where developers can share and discover plugins:

- **Official Plugins**: Core plugins maintained by the team
- **Community Plugins**: Third-party plugins from the community
- **Enterprise Plugins**: Premium plugins for enterprise use

### Contributing Plugins

To contribute a plugin to the community:

1. **Develop**: Create your plugin following this guide
2. **Test**: Ensure comprehensive testing
3. **Document**: Write clear documentation
4. **Submit**: Submit to the plugin marketplace
5. **Maintain**: Keep your plugin updated

### Plugin Guidelines

- **Quality**: Maintain high code quality and testing standards
- **Documentation**: Provide clear documentation and examples
- **Compatibility**: Ensure compatibility with current CLI versions
- **Security**: Follow security best practices
- **Performance**: Optimize for performance and efficiency
- **Unified Interfaces**: Generate proper unified interface files

## Troubleshooting

### Common Issues

#### 1. Plugin Not Found

**Problem**: Plugin not being found by the registry

**Solution**:
```typescript
// Ensure plugin is registered
registry.register(new MyPlugin());

// Check plugin ID
console.log(plugin.getMetadata().id); // Should match what you're looking for
```

#### 2. Dependency Conflicts

**Problem**: Plugin dependencies conflicting with others

**Solution**:
```typescript
// Check conflicts
console.log(plugin.getMetadata().conflicts);

// Resolve manually
const plugins = registry.resolveDependencies(['my-plugin']);
```

#### 3. Unified Interface File Generation Errors

**Problem**: Unified interface files not generating correctly

**Solution**:
```typescript
// Check structure service path
const unifiedPath = structureService.getUnifiedInterfacePath(
  context.projectPath, 
  context.projectStructure!, 
  'my-module'
);

// Validate context
console.log('Context:', context);
console.log('Structure:', context.projectStructure);
```

#### 4. File Permission Errors

**Problem**: Cannot write files due to permissions

**Solution**:
```typescript
// Check directory permissions
await fs.access(projectPath, fs.constants.W_OK);

// Create directories with proper permissions
await fs.ensureDir(dir, { mode: 0o755 });
```

### Getting Help

- **Documentation**: Check the main documentation
- **Examples**: Look at existing plugin examples
- **Issues**: Report issues on GitHub
- **Discussions**: Ask questions in GitHub Discussions
- **Community**: Join the community Discord/Slack

## Conclusion

The plugin system provides a powerful way to extend The Architech CLI with custom functionality. By following this guide and best practices, you can create robust, maintainable plugins that enhance the development experience for yourself and the community.

Remember to:
- Start simple and iterate
- Test thoroughly
- Document your work
- Generate unified interface files
- Contribute back to the community
- Keep security and performance in mind

Happy plugin development! 