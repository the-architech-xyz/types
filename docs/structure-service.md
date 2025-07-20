# Structure Service & Unified Interface System

## Overview

The Structure Service is the central nervous system of The Architech CLI, providing a single source of truth for all project structure decisions. It works in conjunction with the Unified Interface System to ensure consistent, technology-agnostic APIs across all project types.

## Structure Service

### Purpose

The Structure Service provides:
- **Centralized Path Resolution**: Consistent paths for single-app and monorepo structures
- **Structure Detection**: Automatic detection of existing project structures
- **Structure Transformation**: Converting between single-app and monorepo structures
- **Unified Interface Paths**: Standardized locations for generated unified interface files

### Core Concepts

```typescript
export type ProjectStructure = 'single-app' | 'monorepo';

export interface StructureInfo {
  type: ProjectStructure;
  userPreference: UserPreference;
  isMonorepo: boolean;
  isSingleApp: boolean;
  modules: string[];
  template: string;
}

export interface PathInfo {
  root: string;
  src: string;
  app: string;
  components: string;
  lib: string;
  types: string;
  public: string;
  packages: Record<string, string>;
  apps: Record<string, string>;
  config: string;
}
```

### Structure Detection

The service automatically detects project structure:

```typescript
async detectStructure(projectPath: string): Promise<StructureInfo> {
  const hasTurboJson = await fsExtra.pathExists(path.join(projectPath, 'turbo.json'));
  const hasAppsDir = await fsExtra.pathExists(path.join(projectPath, 'apps'));
  const hasPackagesDir = await fsExtra.pathExists(path.join(projectPath, 'packages'));
  
  if (hasTurboJson && hasAppsDir && hasPackagesDir) {
    return {
      type: 'monorepo',
      userPreference: 'scalable-monorepo',
      isMonorepo: true,
      isSingleApp: false,
      modules: ['ui', 'db', 'auth'],
      template: 'nextjs-14'
    };
  } else {
    return {
      type: 'single-app',
      userPreference: 'quick-prototype',
      isMonorepo: false,
      isSingleApp: true,
      modules: [],
      template: 'nextjs-14'
    };
  }
}
```

### Path Resolution

The service provides consistent path resolution for both structures:

```typescript
getPaths(projectPath: string, structure: StructureInfo): PathInfo {
  const paths: PathInfo = {
    root: projectPath,
    src: '',
    app: '',
    components: '',
    lib: '',
    types: '',
    public: '',
    packages: {},
    apps: {},
    config: ''
  };

  if (structure.isMonorepo) {
    // Monorepo structure
    paths.src = path.join(projectPath, 'apps', 'web', 'src');
    paths.app = path.join(paths.src, 'app');
    paths.components = path.join(paths.src, 'components');
    paths.lib = path.join(paths.src, 'lib');
    paths.types = path.join(paths.src, 'types');
    paths.public = path.join(projectPath, 'apps', 'web', 'public');
    paths.config = path.join(projectPath, 'apps', 'web');

    // Package paths
    paths.packages = {
      ui: path.join(projectPath, 'packages', 'ui'),
      db: path.join(projectPath, 'packages', 'db'),
      auth: path.join(projectPath, 'packages', 'auth'),
      config: path.join(projectPath, 'packages', 'config')
    };

    // App paths
    paths.apps = {
      web: path.join(projectPath, 'apps', 'web')
    };
  } else {
    // Single app structure
    paths.src = path.join(projectPath, 'src');
    paths.app = path.join(paths.src, 'app');
    paths.components = path.join(paths.src, 'components');
    paths.lib = path.join(paths.src, 'lib');
    paths.types = path.join(paths.src, 'types');
    paths.public = path.join(projectPath, 'public');
    paths.config = projectPath;

    // For single app, packages are virtual (same as lib)
    paths.packages = {
      ui: path.join(paths.lib, 'ui'),
      db: path.join(paths.lib, 'db'),
      auth: path.join(paths.lib, 'auth'),
      config: path.join(paths.lib, 'config')
    };

    // For single app, apps is just the root
    paths.apps = {
      web: projectPath
    };
  }

  return paths;
}
```

### Unified Interface Path Resolution

The service provides standardized paths for unified interface files:

```typescript
getUnifiedInterfacePath(projectPath: string, structure: StructureInfo, moduleName: string): string {
  const paths = this.getPaths(projectPath, structure);
  
  if (structure.isMonorepo) {
    // In monorepo, unified interfaces are in packages/moduleName
    return paths.packages[moduleName] || path.join(projectPath, 'packages', moduleName);
  } else {
    // In single app, unified interfaces are in src/lib/moduleName
    return path.join(paths.lib, moduleName);
  }
}
```

## Unified Interface System

### Purpose

The Unified Interface System provides:
- **Technology Agnostic APIs**: Same interface for all technologies
- **Generated Files**: Plugins generate consistent interface files
- **No Lock-in**: Easy to switch between technologies
- **Consistent Validation**: All technologies validated the same way

### Generated File Structure

Plugins generate unified interface files in standardized locations:

#### Single App Structure
```
my-app/
├── src/
│   └── lib/
│       ├── auth/
│       │   └── index.ts    # Unified auth interface
│       ├── ui/
│       │   └── index.ts    # Unified UI interface
│       └── db/
│           └── index.ts    # Unified database interface
```

#### Monorepo Structure
```
my-enterprise/
├── packages/
│   ├── auth/
│   │   └── index.ts        # Unified auth interface
│   ├── ui/
│   │   └── index.ts        # Unified UI interface
│   └── db/
│       └── index.ts        # Unified database interface
```

### Interface Examples

#### Authentication Interface

```typescript
// Generated by BetterAuthPlugin: src/lib/auth/index.ts
export const auth = {
  client: {
    signIn: async (provider: string, options?: any) => {
      // Technology-specific implementation
      return await this.betterAuthClient.signIn(provider, options);
    },
    signOut: async (options?: any) => {
      return await this.betterAuthClient.signOut(options);
    },
    getSession: async () => {
      return await this.betterAuthClient.getSession();
    },
    getUser: async () => {
      return await this.betterAuthClient.getUser();
    },
    isAuthenticated: async () => {
      return await this.betterAuthClient.isAuthenticated();
    }
  },
  
  server: {
    auth: async (req: Request, res: Response) => {
      return await this.betterAuthServer.auth(req, res);
    },
    protect: (handler: Function) => {
      return this.betterAuthServer.protect(handler);
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
```

#### UI Interface

```typescript
// Generated by ShadcnUIPlugin: src/lib/ui/index.ts
export const ui = {
  components: {
    Button: (props: any) => <Button {...props} />,
    Input: (props: any) => <Input {...props} />,
    Card: (props: any) => <Card {...props} />,
    Modal: (props: any) => <Modal {...props} />
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
```

#### Database Interface

```typescript
// Generated by DrizzlePlugin: src/lib/db/index.ts
export const db = {
  client: {
    query: async (sql: string, params?: any[]) => {
      // Technology-specific implementation
      return await this.drizzleClient.execute(sql, params);
    },
    insert: async (table: string, data: any) => {
      return await this.drizzleClient.insert(table, data);
    },
    update: async (table: string, where: any, data: any) => {
      return await this.drizzleClient.update(table, where, data);
    },
    delete: async (table: string, where: any) => {
      return await this.drizzleClient.delete(table, where);
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
```

## Plugin Integration

### Plugin File Generation

Plugins use the Structure Service to generate unified interface files:

```typescript
class BetterAuthPlugin implements IPlugin {
  private async generateUnifiedInterfaceFiles(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    const structure = context.projectStructure!;
    
    // Get the correct path for unified interface files
    const unifiedPath = structureService.getUnifiedInterfacePath(projectPath, structure, 'auth');
    
    await fsExtra.ensureDir(unifiedPath);

    // Create index.ts for the unified interface
    const indexContent = `
export const auth = new BetterAuth({
  adapter: DrizzleAdapter(db, {
    users,
    sessions,
    accounts,
    verificationTokens,
  }),
  providers: [
    // Configure your providers here
  ],
  session: {
    strategy: "jwt",
    maxAge: 604800, // 7 days
  },
});

export const { handlers, signIn, signOut, auth: getAuth } = auth;
`;
    
    await fsExtra.writeFile(path.join(unifiedPath, 'index.ts'), indexContent);
  }
}
```

### Agent Usage

Agents use the Structure Service for path resolution and validation:

```typescript
class AuthAgent extends AbstractAgent {
  private async validateAuthSetupUnified(
    context: AgentContext,
    pluginName: string,
    installPath: string
  ): Promise<void> {
    const structure = context.projectStructure!;
    const unifiedPath = structureService.getUnifiedInterfacePath(context.projectPath, structure, 'auth');
    
    // Check for unified interface files
    const requiredFiles = [
      'index.ts'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(unifiedPath, file);
      if (!await fsExtra.pathExists(filePath)) {
        throw new Error(`Missing unified interface file: ${filePath}`);
      }
    }

    context.logger.success(`✅ ${pluginName} unified interface validation passed`);
  }
}
```

## Structure Transformation

### Single App to Monorepo

The Structure Service can transform single app projects to monorepo:

```typescript
async transformToMonorepo(projectPath: string): Promise<void> {
  this.logger?.info('Transforming single app to monorepo structure...');

  // Create monorepo directories
  await fsExtra.ensureDir(path.join(projectPath, 'apps'));
  await fsExtra.ensureDir(path.join(projectPath, 'packages'));

  // Move src to apps/web/src
  const srcPath = path.join(projectPath, 'src');
  const webSrcPath = path.join(projectPath, 'apps', 'web', 'src');
  
  if (await fsExtra.pathExists(srcPath)) {
    // Check if destination already exists
    if (await fsExtra.pathExists(webSrcPath)) {
      this.logger?.warn('apps/web/src already exists, merging contents...');
      // Copy contents instead of moving
      await fsExtra.copy(srcPath, webSrcPath, { overwrite: true });
      await fsExtra.remove(srcPath);
    } else {
      await fsExtra.move(srcPath, webSrcPath);
    }
  }

  // Move public to apps/web/public
  const publicPath = path.join(projectPath, 'public');
  const webPublicPath = path.join(projectPath, 'apps', 'web', 'public');
  
  if (await fsExtra.pathExists(publicPath)) {
    // Check if destination already exists
    if (await fsExtra.pathExists(webPublicPath)) {
      this.logger?.warn('apps/web/public already exists, merging contents...');
      // Copy contents instead of moving
      await fsExtra.copy(publicPath, webPublicPath, { overwrite: true });
      await fsExtra.remove(publicPath);
    } else {
      await fsExtra.move(publicPath, webPublicPath);
    }
  }

  // Create package directories
  const packages = ['ui', 'db', 'auth', 'config'];
  for (const pkg of packages) {
    const pkgPath = path.join(projectPath, 'packages', pkg);
    await fsExtra.ensureDir(pkgPath);
  }

  this.logger?.success('Successfully transformed to monorepo structure');
}
```

### Monorepo to Single App

The service can also transform monorepo back to single app:

```typescript
async transformToSingleApp(projectPath: string): Promise<void> {
  this.logger?.info('Transforming monorepo to single app structure...');

  const webAppPath = path.join(projectPath, 'apps', 'web');
  
  if (!await fsExtra.pathExists(webAppPath)) {
    throw new Error('Web app not found in monorepo structure');
  }

  // Move apps/web/src to root src
  const webSrcPath = path.join(webAppPath, 'src');
  const rootSrcPath = path.join(projectPath, 'src');
  
  if (await fsExtra.pathExists(webSrcPath)) {
    await fsExtra.move(webSrcPath, rootSrcPath);
  }

  // Move apps/web/public to root public
  const webPublicPath = path.join(webAppPath, 'public');
  const rootPublicPath = path.join(projectPath, 'public');
  
  if (await fsExtra.pathExists(webPublicPath)) {
    await fsExtra.move(webPublicPath, rootPublicPath);
  }

  // Move package contents to lib
  const libPath = path.join(rootSrcPath, 'lib');
  await fsExtra.ensureDir(libPath);

  const packages = ['ui', 'db', 'auth', 'config'];
  for (const pkg of packages) {
    const pkgPath = path.join(projectPath, 'packages', pkg);
    const pkgLibPath = path.join(libPath, pkg);
    
    if (await fsExtra.pathExists(pkgPath)) {
      await fsExtra.move(pkgPath, pkgLibPath);
    }
  }

  // Clean up monorepo directories
  await fsExtra.remove(path.join(projectPath, 'apps'));
  await fsExtra.remove(path.join(projectPath, 'packages'));

  this.logger?.success('Successfully transformed to single app structure');
}
```

## Usage Examples

### In Plugins

```typescript
// Get unified interface path
const unifiedPath = structureService.getUnifiedInterfacePath(
  context.projectPath, 
  context.projectStructure!, 
  'auth'
);

// Generate unified interface files
await fsExtra.ensureDir(unifiedPath);
await fsExtra.writeFile(path.join(unifiedPath, 'index.ts'), content);
```

### In Agents

```typescript
// Get all paths for a project
const paths = structureService.getPaths(context.projectPath, context.projectStructure!);

// Use paths for file operations
const configPath = path.join(paths.config, 'next.config.js');
const libPath = paths.lib;
const componentsPath = paths.components;
```

### In CLI Commands

```typescript
// Detect existing structure
const structure = await structureService.detectStructure(projectPath);

// Transform structure
if (structure.isSingleApp) {
  await structureService.transformToMonorepo(projectPath);
} else {
  await structureService.transformToSingleApp(projectPath);
}
```

## Benefits

### 1. Consistency

- **Standardized Paths**: All plugins and agents use the same path resolution
- **Predictable Structure**: Known locations for all project files
- **Cross-Platform**: Works consistently across different operating systems

### 2. Flexibility

- **Structure Agnostic**: Same code works with single-app and monorepo
- **Easy Transformation**: Convert between structures without code changes
- **Extensible**: Easy to add new project structures

### 3. Maintainability

- **Single Source of Truth**: All structure logic in one place
- **Centralized Updates**: Changes propagate to all components
- **Clear Separation**: Structure logic separated from business logic

### 4. Developer Experience

- **Intuitive APIs**: Simple, consistent method names
- **Type Safety**: Full TypeScript support
- **Error Handling**: Comprehensive error messages and validation

## Best Practices

### 1. Always Use Structure Service

```typescript
// ✅ Good - Use structure service
const paths = structureService.getPaths(projectPath, structure);
const configPath = path.join(paths.config, 'next.config.js');

// ❌ Bad - Hardcode paths
const configPath = path.join(projectPath, 'next.config.js');
```

### 2. Handle Both Structures

```typescript
// ✅ Good - Handle both structures
const unifiedPath = structureService.getUnifiedInterfacePath(projectPath, structure, 'auth');

// ❌ Bad - Assume single structure
const unifiedPath = path.join(projectPath, 'src', 'lib', 'auth');
```

### 3. Validate Paths

```typescript
// ✅ Good - Validate paths exist
const paths = structureService.getPaths(projectPath, structure);
await fsExtra.ensureDir(paths.lib);

// ❌ Bad - Assume directories exist
const libPath = paths.lib;
```

### 4. Use Consistent Naming

```typescript
// ✅ Good - Use consistent module names
const modules = ['ui', 'db', 'auth', 'config'];

// ❌ Bad - Inconsistent naming
const modules = ['ui', 'database', 'authentication', 'config'];
```

## Future Enhancements

### 1. Additional Structures

- **Microservices**: Support for microservice architectures
- **Serverless**: Support for serverless function structures
- **Mobile**: Support for React Native and mobile app structures

### 2. Advanced Transformations

- **Incremental**: Transform only changed parts
- **Validation**: Validate transformations before applying
- **Rollback**: Automatic rollback on transformation failures

### 3. Plugin Marketplace Integration

- **Structure Templates**: Community-contributed structure templates
- **Validation Rules**: Custom validation rules for structures
- **Migration Scripts**: Custom migration scripts for transformations

### 4. AI Integration

- **Smart Detection**: AI-powered structure detection
- **Optimization**: AI-suggested structure optimizations
- **Migration Planning**: AI-generated migration plans 