# Plugin Development Guide

## Overview

The Architech CLI uses a modular plugin system that allows you to extend the functionality with custom technologies, frameworks, and tools. This guide will help you understand how to create, develop, and integrate plugins.

## Plugin Architecture

### Core Concepts

- **Plugin Interface**: Standardized interface all plugins must implement
- **Plugin Registry**: Centralized management and dependency resolution
- **Agent Integration**: Plugins are used by specialized agents
- **Context Sharing**: Shared project context across all plugins

### Plugin Lifecycle

1. **Registration**: Plugin is registered with the registry
2. **Validation**: Compatibility and dependencies are checked
3. **Setup**: Plugin is executed during project generation
4. **Validation**: Plugin validates its implementation
5. **Cleanup**: Optional cleanup after project generation

## Plugin Interface

### Basic Interface

All plugins must implement the `Plugin` interface:

```typescript
interface Plugin {
  // Metadata
  name: string;
  version: string;
  description: string;
  
  // Dependencies and compatibility
  dependencies: string[];
  peerDependencies: string[];
  conflicts: string[];
  
  // Core functionality
  setup(context: ProjectContext): Promise<void>;
  validate(context: ProjectContext): Promise<ValidationResult>;
  
  // Optional features
  configure?(context: ProjectContext): Promise<void>;
  cleanup?(context: ProjectContext): Promise<void>;
}
```

### Plugin Metadata

```typescript
class MyPlugin implements Plugin {
  name = 'my-plugin';
  version = '1.0.0';
  description = 'Description of what this plugin does';
  
  // Dependencies this plugin requires
  dependencies = ['some-package', 'another-package'];
  
  // Dependencies that should be installed but not required
  peerDependencies = ['optional-package'];
  
  // Plugins that conflict with this one
  conflicts = ['conflicting-plugin'];
}
```

## Creating Your First Plugin

### 1. Basic Plugin Structure

```typescript
import { Plugin, ProjectContext, ValidationResult } from '@the-architech/core';

export class MyFirstPlugin implements Plugin {
  name = 'my-first-plugin';
  version = '1.0.0';
  description = 'My first custom plugin';
  dependencies = [];
  peerDependencies = [];
  conflicts = [];

  async setup(context: ProjectContext): Promise<void> {
    const { logger, runner, rootPath } = context;
    
    logger.info('Setting up MyFirstPlugin...');
    
    // Install dependencies
    await runner.install(['my-package'], false, rootPath);
    
    // Create configuration file
    await this.createConfigFile(context);
    
    logger.success('MyFirstPlugin setup complete!');
  }

  async validate(context: ProjectContext): Promise<ValidationResult> {
    const { rootPath } = context;
    
    // Check if required files exist
    const configExists = await fs.exists(path.join(rootPath, 'my-config.json'));
    
    if (!configExists) {
      return {
        success: false,
        errors: ['my-config.json not found']
      };
    }
    
    return { success: true };
  }

  private async createConfigFile(context: ProjectContext): Promise<void> {
    const { rootPath } = context;
    const configPath = path.join(rootPath, 'my-config.json');
    
    const config = {
      name: context.name,
      version: '1.0.0',
      settings: {
        enabled: true,
        debug: false
      }
    };
    
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
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
import { BaseAgent } from '@the-architech/core';

export class CustomAgent extends BaseAgent {
  async setup(context: ProjectContext): Promise<void> {
    const plugin = this.registry.getPlugin('my-first-plugin');
    
    if (plugin) {
      await plugin.setup(context);
    }
  }
}
```

## Advanced Plugin Development

### 1. Template Rendering

Plugins can render templates for configuration files:

```typescript
import { renderTemplate } from '@the-architech/core';

export class ConfigPlugin implements Plugin {
  // ... metadata

  async setup(context: ProjectContext): Promise<void> {
    const { rootPath } = context;
    
    // Render template with context
    const configContent = await renderTemplate('config-template.json', {
      projectName: context.name,
      version: context.config.version,
      features: context.options.features
    });
    
    await fs.writeFile(
      path.join(rootPath, 'config.json'),
      configContent
    );
  }
}
```

### 2. Package Management

Handle package installation and configuration:

```typescript
export class PackagePlugin implements Plugin {
  dependencies = ['my-package@^2.0.0'];
  
  async setup(context: ProjectContext): Promise<void> {
    const { runner, rootPath, logger } = context;
    
    // Install dependencies
    logger.info('Installing packages...');
    await runner.install(this.dependencies, false, rootPath);
    
    // Update package.json scripts
    await this.updatePackageScripts(context);
  }
  
  private async updatePackageScripts(context: ProjectContext): Promise<void> {
    const { rootPath } = context;
    const packagePath = path.join(rootPath, 'package.json');
    
    const pkg = JSON.parse(await fs.readFile(packagePath, 'utf-8'));
    
    pkg.scripts = {
      ...pkg.scripts,
      'my-command': 'my-package run',
      'my-build': 'my-package build'
    };
    
    await fs.writeFile(packagePath, JSON.stringify(pkg, null, 2));
  }
}
```

### 3. File System Operations

Handle complex file operations:

```typescript
export class FileSystemPlugin implements Plugin {
  async setup(context: ProjectContext): Promise<void> {
    const { rootPath, srcPath } = context;
    
    // Create directory structure
    await this.createDirectories(context);
    
    // Copy template files
    await this.copyTemplates(context);
    
    // Generate dynamic files
    await this.generateFiles(context);
  }
  
  private async createDirectories(context: ProjectContext): Promise<void> {
    const { srcPath } = context;
    const dirs = [
      path.join(srcPath, 'components', 'my-components'),
      path.join(srcPath, 'lib', 'my-utils'),
      path.join(srcPath, 'types', 'my-types')
    ];
    
    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }
  
  private async copyTemplates(context: ProjectContext): Promise<void> {
    const { rootPath, srcPath } = context;
    
    const templates = [
      { from: 'templates/component.tsx', to: path.join(srcPath, 'components', 'MyComponent.tsx') },
      { from: 'templates/util.ts', to: path.join(srcPath, 'lib', 'my-util.ts') }
    ];
    
    for (const template of templates) {
      const content = await fs.readFile(template.from, 'utf-8');
      const rendered = content.replace(/\{\{projectName\}\}/g, context.name);
      await fs.writeFile(template.to, rendered);
    }
  }
}
```

### 4. Configuration Management

Handle complex configuration scenarios:

```typescript
export class ConfigPlugin implements Plugin {
  async setup(context: ProjectContext): Promise<void> {
    await this.createMainConfig(context);
    await this.createEnvironmentConfig(context);
    await this.updateExistingConfigs(context);
  }
  
  private async createMainConfig(context: ProjectContext): Promise<void> {
    const { rootPath } = context;
    const configPath = path.join(rootPath, 'my-config.js');
    
    const config = `
module.exports = {
  name: '${context.name}',
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
  
  private async createEnvironmentConfig(context: ProjectContext): Promise<void> {
    const { rootPath } = context;
    const envPath = path.join(rootPath, '.env.example');
    
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
export class UIComponentPlugin implements Plugin {
  name = 'ui-component-library';
  dependencies = ['@ui-library/core', '@ui-library/components'];
  
  async setup(context: ProjectContext): Promise<void> {
    // Install UI library
    await this.installLibrary(context);
    
    // Create component configuration
    await this.createComponentConfig(context);
    
    // Set up theme system
    await this.setupTheme(context);
    
    // Create example components
    await this.createExamples(context);
  }
  
  private async createComponentConfig(context: ProjectContext): Promise<void> {
    const { rootPath } = context;
    const configPath = path.join(rootPath, 'ui.config.js');
    
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
}
```

### Database Plugins

Plugins for database ORMs and configurations:

```typescript
export class DatabasePlugin implements Plugin {
  name = 'database-orm';
  dependencies = ['@orm/core', '@orm/cli'];
  
  async setup(context: ProjectContext): Promise<void> {
    // Install ORM
    await this.installORM(context);
    
    // Create database configuration
    await this.createDatabaseConfig(context);
    
    // Generate initial schema
    await this.generateSchema(context);
    
    // Set up migrations
    await this.setupMigrations(context);
  }
  
  private async createDatabaseConfig(context: ProjectContext): Promise<void> {
    const { rootPath } = context;
    const configPath = path.join(rootPath, 'database.config.js');
    
    const config = `
module.exports = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || '${context.name}',
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
}
```

### Authentication Plugins

Plugins for authentication systems:

```typescript
export class AuthPlugin implements Plugin {
  name = 'auth-system';
  dependencies = ['@auth/core', '@auth/providers'];
  
  async setup(context: ProjectContext): Promise<void> {
    // Install auth library
    await this.installAuth(context);
    
    // Create auth configuration
    await this.createAuthConfig(context);
    
    // Set up providers
    await this.setupProviders(context);
    
    // Create auth utilities
    await this.createAuthUtils(context);
  }
  
  private async createAuthConfig(context: ProjectContext): Promise<void> {
    const { rootPath } = context;
    const configPath = path.join(rootPath, 'auth.config.js');
    
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
  let context: ProjectContext;
  
  beforeEach(() => {
    plugin = new MyPlugin();
    context = createMockContext();
  });
  
  it('should setup correctly', async () => {
    await plugin.setup(context);
    
    // Verify files were created
    expect(await fs.exists(path.join(context.rootPath, 'my-config.json'))).toBe(true);
  });
  
  it('should validate correctly', async () => {
    const result = await plugin.validate(context);
    expect(result.success).toBe(true);
  });
  
  it('should handle missing dependencies', async () => {
    // Test error handling
    const result = await plugin.validate(createMockContext({ missingFiles: true }));
    expect(result.success).toBe(false);
    expect(result.errors).toContain('Required file not found');
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
    
    const retrieved = registry.getPlugin('my-plugin');
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

### 2. File Operations

- **Path Safety**: Use `path.join()` for cross-platform compatibility
- **Async Operations**: Use async/await for file operations
- **Error Recovery**: Implement rollback mechanisms for failed operations
- **File Permissions**: Handle file permission issues gracefully

### 3. Configuration

- **Environment Variables**: Use environment variables for sensitive data
- **Default Values**: Provide sensible defaults for configuration
- **Validation**: Validate configuration values
- **Documentation**: Document all configuration options

### 4. Performance

- **Minimal Operations**: Minimize file system operations
- **Caching**: Cache expensive operations when possible
- **Parallelization**: Execute independent operations in parallel
- **Cleanup**: Clean up temporary files and resources

### 5. Security

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

## Troubleshooting

### Common Issues

#### 1. Plugin Not Found

**Problem**: Plugin not being found by the registry

**Solution**:
```typescript
// Ensure plugin is registered
registry.register(new MyPlugin());

// Check plugin name
console.log(plugin.name); // Should match what you're looking for
```

#### 2. Dependency Conflicts

**Problem**: Plugin dependencies conflicting with others

**Solution**:
```typescript
// Check conflicts
console.log(plugin.conflicts);

// Resolve manually
const plugins = registry.resolveDependencies(['my-plugin']);
```

#### 3. Template Rendering Errors

**Problem**: Templates not rendering correctly

**Solution**:
```typescript
// Check template path
const templatePath = path.join(__dirname, 'templates', 'template.ejs');

// Validate context
console.log('Context:', context);
```

#### 4. File Permission Errors

**Problem**: Cannot write files due to permissions

**Solution**:
```typescript
// Check directory permissions
await fs.access(rootPath, fs.constants.W_OK);

// Create directories with proper permissions
await fs.mkdir(dir, { recursive: true, mode: 0o755 });
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
- Contribute back to the community
- Keep security and performance in mind

Happy plugin development! 