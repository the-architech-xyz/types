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
    paths.types = path.join(projectPath, 'packages', 'types');
    paths.public = path.join(projectPath, 'apps', 'web', 'public');
    paths.config = path.join(projectPath, 'packages', 'config');
    
    // Package paths
    paths.packages = {
      ui: path.join(projectPath, 'packages', 'ui'),
      db: path.join(projectPath, 'packages', 'db'),
      auth: path.join(projectPath, 'packages', 'auth'),
      config: path.join(projectPath, 'packages', 'config')
    };
    
    // App paths
    paths.apps = {
      web: path.join(projectPath, 'apps', 'web'),
      admin: path.join(projectPath, 'apps', 'admin'),
      api: path.join(projectPath, 'apps', 'api')
    };
  } else {
    // Single app structure
    paths.src = path.join(projectPath, 'src');
    paths.app = path.join(paths.src, 'app');
    paths.components = path.join(paths.src, 'components');
    paths.lib = path.join(paths.src, 'lib');
    paths.types = path.join(paths.src, 'types');
    paths.public = path.join(projectPath, 'public');
    paths.config = path.join(projectPath, 'config');
  }

  return paths;
}
```

## Unified Interface System

### Overview

The Unified Interface System provides technology-agnostic APIs through generated files that act as contracts between your application and the underlying technologies.

### Key Benefits

1. **Technology Agnostic**: Same API for all auth, UI, and database systems
2. **No Lock-in**: Easy to switch between technologies without code changes
3. **Consistent Validation**: All technologies validated the same way
4. **Extensible**: Add new technologies without changing agent code

### Generated Files Structure

```
src/lib/
├── auth/
│   └── index.ts          # Unified auth interface
├── ui/
│   └── index.ts          # Unified UI interface
├── db/
│   └── index.ts          # Unified database interface
└── config/
    └── index.ts          # Configuration management
```

### Example Unified Interface

```typescript
// src/lib/auth/index.ts (generated)
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface AuthSession {
  user: AuthUser;
  expires: Date;
}

export class AuthService {
  async signIn(email: string, password: string): Promise<AuthSession> {
    // Implementation varies by auth provider
  }

  async signOut(): Promise<void> {
    // Implementation varies by auth provider
  }

  async getSession(): Promise<AuthSession | null> {
    // Implementation varies by auth provider
  }
}

export const auth = new AuthService();
```

### Plugin Integration

Plugins generate these unified interfaces:

```typescript
export class BetterAuthPlugin extends BasePlugin {
  generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate {
    return {
      category: PluginCategory.AUTH,
      exports: [
        {
          name: 'auth',
          type: 'class',
          implementation: 'AuthService',
          documentation: 'Authentication service',
          examples: ['await auth.signIn(email, password)']
        }
      ],
      types: [
        {
          name: 'AuthUser',
          type: 'interface',
          definition: 'interface AuthUser { id: string; email: string; }',
          documentation: 'User authentication data'
        }
      ],
      utilities: [],
      constants: [],
      documentation: 'Better Auth integration'
    };
  }
}
```

## Integration with New Architecture

### Agent Integration

The structure service integrates with the new question generation system:

```typescript
export class OrchestratorAgent {
  private structureService: StructureService;

  async execute(context: AgentContext): Promise<AgentResult> {
    // 1. Analyze project context
    const projectContext = this.analyzeProjectContext(context.userInput);
    
    // 2. Determine project structure
    const structureInfo = await this.structureService.detectStructure(context.projectPath);
    
    // 3. Get question strategy
    const strategy = this.getQuestionStrategy(projectContext.type);
    
    // 4. Execute question flow
    const flowResult = await this.progressiveFlow.execute(context.userInput, strategy);
    
    // 5. Generate project with unified interfaces
    await this.generateProject(flowResult.config, structureInfo);
  }

  private async generateProject(config: Record<string, any>, structure: StructureInfo): Promise<void> {
    const paths = this.structureService.getPaths(this.projectPath, structure);
    
    // Generate unified interface files
    for (const plugin of this.selectedPlugins) {
      const unifiedInterface = plugin.generateUnifiedInterface(config);
      await this.generateUnifiedInterfaceFile(unifiedInterface, paths);
    }
  }
}
```

### Plugin Integration

Plugins use the structure service for path resolution:

```typescript
export class BasePlugin {
  protected pathResolver!: PathResolver;

  protected initializePathResolver(context: PluginContext): void {
    this.pathResolver = new PathResolver(context);
  }

  protected async generateUnifiedInterfaceFile(
    template: UnifiedInterfaceTemplate, 
    paths: PathInfo
  ): Promise<void> {
    const libPath = paths.lib;
    const categoryPath = path.join(libPath, template.category.toLowerCase());
    
    await this.pathResolver.generateFile(
      path.join(categoryPath, 'index.ts'),
      this.generateInterfaceCode(template)
    );
  }
}
```

## Project Structures

### Single App Structure

For rapid prototyping and simple applications:

```
my-app/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # React components
│   ├── lib/             # Unified interfaces
│   │   ├── auth/
│   │   │   └── index.ts # Auth interface
│   │   ├── db/
│   │   │   └── index.ts # Database interface
│   │   └── ui/
│   │       └── index.ts # UI interface
│   └── types/           # TypeScript types
├── public/              # Static assets
├── package.json
├── next.config.js
└── tsconfig.json
```

### Monorepo Structure

For enterprise applications and teams:

```
my-enterprise/
├── apps/
│   ├── web/             # Main web application
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   └── lib/     # App-specific interfaces
│   │   └── package.json
│   ├── admin/           # Admin dashboard
│   └── api/             # Backend API
├── packages/
│   ├── ui/              # Shared UI components
│   │   ├── src/
│   │   └── package.json
│   ├── db/              # Database schemas
│   │   ├── src/
│   │   └── package.json
│   ├── auth/            # Auth utilities
│   │   ├── src/
│   │   └── package.json
│   └── config/          # Shared configuration
│       ├── src/
│       └── package.json
├── turbo.json           # Turborepo configuration
└── package.json         # Root package.json
```

## Path Resolution

### PathResolver Class

The PathResolver handles file generation with proper path resolution:

```typescript
export class PathResolver {
  private context: PluginContext;
  private paths: PathInfo;

  constructor(context: PluginContext) {
    this.context = context;
    this.paths = context.structureService.getPaths(context.projectPath, context.structureInfo);
  }

  async generateFile(filePath: string, content: string): Promise<void> {
    const fullPath = path.join(this.context.projectPath, filePath);
    const dir = path.dirname(fullPath);
    
    // Ensure directory exists
    await fsExtra.ensureDir(dir);
    
    // Generate file
    await fsExtra.writeFile(fullPath, content, 'utf8');
  }

  async generateDirectory(dirPath: string): Promise<void> {
    const fullPath = path.join(this.context.projectPath, dirPath);
    await fsExtra.ensureDir(fullPath);
  }

  getUnifiedInterfacePath(category: string): string {
    return path.join(this.paths.lib, category.toLowerCase());
  }

  getComponentPath(): string {
    return this.paths.components;
  }

  getAppPath(): string {
    return this.paths.app;
  }
}
```

## Configuration Management

### Environment Variables

The structure service manages environment variable templates:

```typescript
export class EnvironmentManager {
  generateEnvTemplate(config: Record<string, any>): string {
    const template = `
# Database Configuration
DATABASE_URL="${config.database?.connectionString || 'your-database-url'}"

# Authentication
AUTH_SECRET="${config.auth?.secret || 'your-auth-secret'}"

# Payment Processing
STRIPE_SECRET_KEY="${config.payments?.stripeSecret || 'your-stripe-secret-key'}"
STRIPE_PUBLISHABLE_KEY="${config.payments?.stripePublishable || 'your-stripe-publishable-key'}"

# Email Service
RESEND_API_KEY="${config.email?.resendApiKey || 'your-resend-api-key'}"

# Application
NEXT_PUBLIC_APP_URL="${config.app?.url || 'http://localhost:3000'}"
`;

    return template.trim();
  }
}
```

### Package.json Management

The service manages package.json files for different structures:

```typescript
export class PackageManager {
  generateRootPackageJson(projectName: string, structure: StructureInfo): any {
    if (structure.isMonorepo) {
      return {
        name: projectName,
        version: '0.1.0',
        private: true,
        workspaces: ['apps/*', 'packages/*'],
        scripts: {
          build: 'turbo run build',
          dev: 'turbo run dev',
          lint: 'turbo run lint',
          test: 'turbo run test'
        },
        devDependencies: {
          turbo: '^1.10.0'
        }
      };
    } else {
      return {
        name: projectName,
        version: '0.1.0',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          lint: 'next lint'
        }
      };
    }
  }
}
```

## Best Practices

### Structure Selection

1. **Single App**: Use for rapid prototyping, MVPs, and simple applications
2. **Monorepo**: Use for enterprise applications, teams, and complex projects

### Path Management

1. **Use PathResolver**: Always use the PathResolver for file generation
2. **Respect Structure**: Follow the established structure patterns
3. **Unified Interfaces**: Place all unified interfaces in `src/lib/`

### Configuration

1. **Environment Variables**: Use templates for consistent configuration
2. **Package Management**: Let the service handle package.json generation
3. **TypeScript**: Ensure proper TypeScript configuration for each structure

---

*This documentation covers the Structure Service and Unified Interface System. For plugin development, see [Plugin Development Guide](./plugin-development.md).* 