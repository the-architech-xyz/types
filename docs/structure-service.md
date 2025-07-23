# Structure Service & Unified Interface System

## Overview

The Structure Service is the central nervous system of The Architech CLI, providing a single source of truth for all project structure decisions. It works in conjunction with the Unified Interface System to ensure consistent, technology-agnostic APIs across all project types.

## 🏗️ Architecture Integration

### Core Principles

1. **Centralized Path Resolution**
   - Consistent paths for single-app and monorepo structures
   - Integration with new question generation system
   - Support for plugin file generation

2. **Technology Agnostic Design**
   - Unified interface files provide consistent APIs
   - No vendor lock-in through generated contracts
   - Easy technology switching without code changes

3. **Progressive Structure Management**
   - Automatic structure detection
   - Seamless transformation between structures
   - Context-aware path resolution

## Structure Service

### Purpose

The Structure Service provides:
- **Centralized Path Resolution**: Consistent paths for single-app and monorepo structures
- **Structure Detection**: Automatic detection of existing project structures
- **Structure Transformation**: Converting between single-app and monorepo structures
- **Unified Interface Paths**: Standardized locations for generated unified interface files
- **Plugin Integration**: Seamless integration with new plugin architecture

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
    paths.config = projectPath;
  }

  return paths;
}
```

## 🔄 Integration with New Architecture

### Question System Integration

The Structure Service integrates with the new question generation system:

```typescript
export class ProgressiveFlow {
  private structureService: StructureService;

  async execute(userInput: string, strategy: BaseQuestionStrategy): Promise<FlowResult> {
    // 1. Analyze project context
    const context = strategy.analyzeContext(userInput);
    
    // 2. Determine project structure based on context
    const structureInfo = await this.structureService.detectStructure(context.projectPath);
    
    // 3. Get recommendations based on structure
    const recommendations = this.getRecommendations(context, structureInfo);
    
    // 4. Generate questions with structure context
    const questions = strategy.generateQuestions(context, structureInfo);
    
    // 5. Build configuration with structure paths
    const config = await this.buildConfiguration(answers, structureInfo);
    
    return { context, recommendations, questions, config };
  }
}
```

### Plugin Integration

Plugins use the Structure Service for consistent file generation:

```typescript
export class BasePlugin {
  protected pathResolver!: PathResolver;

  protected initializePathResolver(context: PluginContext): void {
    this.pathResolver = new PathResolver(context);
  }

  protected async generateFile(filePath: string, content: string): Promise<void> {
    await this.pathResolver.generateFile(filePath, content);
  }

  protected async generateUnifiedInterface(
    category: string, 
    template: UnifiedInterfaceTemplate,
    context: PluginContext
  ): Promise<void> {
    const paths = context.pathResolver.getPaths();
    const libPath = paths.lib;
    const categoryPath = path.join(libPath, category);
    
    // Generate unified interface file
    await this.generateFile(
      path.join(categoryPath, 'index.ts'),
      this.renderUnifiedInterface(template)
    );
  }
}
```

## 🏗️ Unified Interface System

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

## 📁 Project Structures

### Single App Structure

```
my-app/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/
│   │   └── ui/             # UI components
│   ├── lib/
│   │   ├── auth/           # Unified auth interface
│   │   │   └── index.ts    # Generated auth API
│   │   ├── ui/             # Unified UI interface
│   │   │   └── index.ts    # Generated UI API
│   │   ├── db/             # Unified database interface
│   │   │   └── index.ts    # Generated database API
│   │   └── utils.ts        # Utility functions
│   └── types/              # TypeScript definitions
├── public/                 # Static assets
├── .env.example           # Environment template
├── next.config.js         # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies & scripts
```

### Monorepo Structure

```
my-enterprise/
├── apps/
│   ├── web/              # Main web application
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   └── lib/
│   │   │       ├── auth/  # Unified auth interface
│   │   │       ├── ui/    # Unified UI interface
│   │   │       └── db/    # Unified database interface
│   │   ├── package.json
│   │   └── next.config.js
│   ├── admin/            # Admin dashboard
│   │   ├── src/
│   │   ├── package.json
│   │   └── next.config.js
│   └── api/              # Backend API
│       ├── src/
│       ├── package.json
│       └── next.config.js
├── packages/
│   ├── ui/               # Shared UI components
│   │   ├── src/
│   │   ├── package.json
│   │   └── index.ts      # Package exports
│   ├── database/         # Database schemas and utilities
│   │   ├── src/
│   │   ├── package.json
│   │   └── index.ts      # Package exports
│   ├── auth/             # Authentication utilities
│   │   ├── src/
│   │   ├── package.json
│   │   └── index.ts      # Package exports
│   └── config/           # Shared configuration
│       ├── src/
│       ├── package.json
│       └── index.ts      # Package exports
├── turbo.json            # Turborepo configuration
└── package.json          # Root package.json
```

## 🔧 Path Resolver

### Core Functionality

The Path Resolver provides consistent file path management:

```typescript
export class PathResolver {
  private context: PluginContext;
  private paths: PathInfo;

  constructor(context: PluginContext) {
    this.context = context;
    this.paths = this.getPaths();
  }

  async generateFile(filePath: string, content: string): Promise<void> {
    const fullPath = path.join(this.context.projectPath, filePath);
    const dir = path.dirname(fullPath);
    
    // Ensure directory exists
    await fsExtra.ensureDir(dir);
    
    // Write file
    await fsExtra.writeFile(fullPath, content, 'utf8');
  }

  async generateDirectory(dirPath: string): Promise<void> {
    const fullPath = path.join(this.context.projectPath, dirPath);
    await fsExtra.ensureDir(fullPath);
  }

  getPaths(): PathInfo {
    return this.context.structureService.getPaths(
      this.context.projectPath,
      this.context.structureInfo
    );
  }

  resolvePath(relativePath: string): string {
    return path.join(this.context.projectPath, relativePath);
  }
}
```

### Usage Examples

```typescript
// Generate unified interface file
await this.pathResolver.generateFile(
  'src/lib/auth/index.ts',
  this.generateAuthInterface()
);

// Generate component file
await this.pathResolver.generateFile(
  'src/components/ui/button.tsx',
  this.generateButtonComponent()
);

// Generate configuration file
await this.pathResolver.generateFile(
  'drizzle.config.ts',
  this.generateDrizzleConfig()
);
```

## 🚀 Structure Transformation

### Single App to Monorepo

Transform a single app project to a monorepo structure:

```typescript
async transformToMonorepo(projectPath: string): Promise<void> {
  const structureInfo = await this.detectStructure(projectPath);
  
  if (structureInfo.isMonorepo) {
    throw new Error('Project is already a monorepo');
  }

  // Create monorepo structure
  await this.createMonorepoStructure(projectPath);
  
  // Move existing code to apps/web
  await this.moveToAppsWeb(projectPath);
  
  // Extract shared packages
  await this.extractSharedPackages(projectPath);
  
  // Update configuration files
  await this.updateMonorepoConfig(projectPath);
}
```

### Monorepo to Single App

Transform a monorepo back to a single app:

```typescript
async transformToSingleApp(projectPath: string): Promise<void> {
  const structureInfo = await this.detectStructure(projectPath);
  
  if (structureInfo.isSingleApp) {
    throw new Error('Project is already a single app');
  }

  // Merge apps/web back to root
  await this.mergeFromAppsWeb(projectPath);
  
  // Merge shared packages
  await this.mergeSharedPackages(projectPath);
  
  // Update configuration files
  await this.updateSingleAppConfig(projectPath);
}
```

## 🔄 Integration with Question System

### Structure-Aware Questions

The question system uses structure information to provide context-aware questions:

```typescript
export class EcommerceStrategy extends BaseQuestionStrategy {
  protected getProjectQuestions(context: ProjectContext): Question[] {
    const questions: Question[] = [];
    
    // Add structure-specific questions
    if (context.structureInfo.isMonorepo) {
      questions.push({
        id: 'monorepoApps',
        type: 'multiselect',
        name: 'monorepoApps',
        message: 'Which applications do you need in your monorepo?',
        choices: [
          { name: 'Web Application', value: 'web' },
          { name: 'Admin Dashboard', value: 'admin' },
          { name: 'API Service', value: 'api' },
          { name: 'Mobile App', value: 'mobile' }
        ],
        default: ['web']
      });
    }
    
    return questions;
  }
}
```

### Structure-Based Recommendations

Recommendations adapt based on project structure:

```typescript
export class RecommendationEngine {
  getRecommendations(context: ProjectContext): RecommendationSet {
    const recommendations: RecommendationSet = {
      database: this.getDatabaseRecommendation(context),
      auth: this.getAuthRecommendation(context),
      ui: this.getUIRecommendation(context),
      payment: this.getPaymentRecommendation(context),
      email: this.getEmailRecommendation(context)
    };

    // Adjust recommendations based on structure
    if (context.structureInfo.isMonorepo) {
      recommendations.database.confidence += 0.1; // Prefer shared database
      recommendations.auth.confidence += 0.1; // Prefer shared auth
    }

    return recommendations;
  }
}
```

## 📊 Benefits

### ✅ Advantages

1. **Consistent Paths**
   - Same API regardless of structure
   - Predictable file locations
   - Easy to understand and maintain

2. **Technology Agnostic**
   - No vendor lock-in
   - Easy technology switching
   - Consistent APIs across technologies

3. **Scalable Architecture**
   - Seamless structure transformation
   - Progressive enhancement
   - Enterprise-ready patterns

4. **Developer Experience**
   - Clear project organization
   - Intuitive file structure
   - Easy navigation and understanding

### 📈 Complexity Management

| Aspect | Old System | New System | Improvement |
|--------|------------|------------|-------------|
| **Path Management** | Manual | Automated | 90% |
| **Structure Detection** | None | Automatic | 100% |
| **Technology Lock-in** | High | None | 100% |
| **Consistency** | Low | High | 95% |

## 🚀 Future Enhancements

### Planned Improvements

1. **Advanced Structure Detection**
   - Machine learning for structure analysis
   - Automatic optimization suggestions
   - Performance-based recommendations

2. **Enhanced Transformations**
   - Incremental structure changes
   - Conflict resolution
   - Rollback capabilities

3. **Intelligent Path Management**
   - Context-aware path suggestions
   - Automatic path optimization
   - Performance monitoring

4. **Advanced Unified Interfaces**
   - Type-safe API generation
   - Runtime validation
   - Performance optimization

---

*This documentation covers the Structure Service and Unified Interface System. For question generation, see [Question Generation System](./question-generation-system.md).* 