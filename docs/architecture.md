# The Architech Architecture

## Overview

The Architech CLI implements a sophisticated **three-layer unified interface architecture** with AI-powered agents, modular plugins, and generated unified interface files. This design provides maximum extensibility, maintainability, and enterprise-grade scalability while eliminating technology lock-in.

## Core Architecture Principles

### 1. Three-Layer Separation of Concerns
- **Agents (Brain)**: AI-powered decision making and orchestration
- **Plugins (Hands)**: Technology-specific implementation and unified interface file generation
- **Generated Files (Contract)**: Unified interface files that provide consistent APIs

### 2. Unified Interface System
- **Technology Agnostic**: Same API for all auth, UI, and database systems through generated files
- **No Lock-in**: Easy to switch between technologies without code changes
- **Consistent Validation**: All technologies validated the same way through generated files
- **Extensible**: Add new technologies without changing agent code

### 3. AI-Powered Orchestration
- **Intelligent Planning**: AI-powered project analysis and planning
- **Agent Coordination**: Centralized execution and error handling
- **Context Sharing**: Shared project context across all agents

### 4. Centralized Structure Management
- **Structure Service**: Single source of truth for project structure decisions
- **Path Resolution**: Consistent path resolution for single-app and monorepo structures
- **Unified Interface Paths**: Standardized locations for generated unified interface files

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CLI Interface                            │
├─────────────────────────────────────────────────────────────┤
│                 Command Runner                              │
│              (Package Manager Abstraction)                 │
├─────────────────────────────────────────────────────────────┤
│                Orchestrator Agent                           │
│              (AI-Powered Planning)                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │Framework    │ │UI Agent     │ │Database     │          │
│  │   Agent     │ │             │ │   Agent     │          │
│  │  (Brain)    │ │  (Brain)    │ │  (Brain)    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │Auth Agent   │ │Validation   │ │Deployment   │          │
│  │             │ │   Agent     │ │   Agent     │          │
│  │  (Brain)    │ │  (Brain)    │ │  (Brain)    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │Next.js      │ │Shadcn/ui    │ │Drizzle      │          │
│  │  Plugin     │ │  Plugin     │ │  Plugin     │          │
│  │  (Hands)    │ │  (Hands)    │ │  (Hands)    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │Better Auth  │ │Tamagui      │ │Prisma       │          │
│  │  Plugin     │ │  Plugin     │ │  Plugin     │          │
│  │  (Hands)    │ │  (Hands)    │ │  (Hands)    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│              Generated Unified Interface Files             │
│              (Technology-Agnostic APIs)                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │src/lib/auth/│ │src/lib/ui/  │ │src/lib/db/  │          │
│  │  index.ts   │ │  index.ts   │ │  index.ts   │          │
│  │(Contract)   │ │(Contract)   │ │(Contract)   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## Layer 1: Agents (The "Brain")

Agents handle AI-powered decision making, user interaction, and orchestration. They are technology-agnostic and work through generated unified interface files.

### Orchestrator Agent

The central coordinator that manages the entire project generation process.

**Responsibilities:**
- AI-powered project analysis and planning
- Agent coordination and execution
- Plugin compatibility assessment
- Project validation and health checks
- Error handling and rollback

**Key Features:**
```typescript
class OrchestratorAgent extends AbstractAgent {
  async analyzeProject(requirements: ProjectRequirements): Promise<ProjectPlan> {
    // AI analyzes requirements and creates execution plan
  }

  async executePlan(plan: ProjectPlan): Promise<void> {
    // Coordinates all agents in the correct order
  }

  async validateProject(context: ProjectContext): Promise<ValidationResult> {
    // Comprehensive project validation through generated unified interface files
  }
}
```

### Specialized Agents

Each agent handles a specific domain and works through generated unified interface files:

#### Framework Agent
- **Purpose**: Creates application foundation
- **Unified Interface**: Works with any framework plugin
- **Features**: Template rendering, framework configuration

#### UI Agent
- **Purpose**: Sets up design systems and UI components
- **Unified Interface**: Works with any UI plugin (Shadcn/ui, Tamagui, Chakra UI)
- **Features**: Component installation, theme configuration

#### Database Agent
- **Purpose**: Configures databases and ORMs
- **Unified Interface**: Works with any database plugin (Drizzle, Prisma, Supabase)
- **Features**: Schema generation, migration setup

#### Auth Agent
- **Purpose**: Implements authentication systems
- **Unified Interface**: Works with any auth plugin (Better Auth, NextAuth, Clerk)
- **Features**: Security configuration, user management

#### Validation Agent
- **Purpose**: Ensures code quality and best practices
- **Plugins**: ESLint, Prettier, Husky
- **Features**: Linting setup, git hooks

#### Deployment Agent
- **Purpose**: Prepares production infrastructure
- **Plugins**: Docker, GitHub Actions, Vercel
- **Features**: Containerization, CI/CD setup

## Layer 2: Plugins (The "Hands")

Plugins handle technology-specific implementation and installation. They do the actual work of setting up technologies and generate unified interface files.

### Plugin Interface

All plugins implement a standardized interface for consistency:

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

### Plugin Registry

Centralized plugin management with dependency resolution:

```typescript
class PluginRegistry {
  private plugins: Map<string, IPlugin> = new Map();
  
  register(plugin: IPlugin): void {
    // Register plugin with validation
  }
  
  get(name: string): IPlugin | undefined {
    // Retrieve plugin by name
  }
  
  resolveDependencies(pluginNames: string[]): IPlugin[] {
    // Resolve dependencies and handle conflicts
  }
  
  validateCompatibility(plugins: IPlugin[]): ValidationResult {
    // Check for conflicts and missing dependencies
  }
}
```

### Available Plugins

#### UI Plugins
- **Shadcn/ui**: Modern component system with Tailwind CSS
- **Tamagui**: Cross-platform UI framework
- **Chakra UI**: React component library
- **Material-UI**: React component library

#### Database Plugins
- **Drizzle**: Type-safe SQL ORM
- **Prisma**: Database toolkit and ORM
- **Supabase**: Backend-as-a-Service
- **TypeORM**: Object-relational mapping

#### Auth Plugins
- **Better Auth**: Modern authentication for Next.js
- **NextAuth.js**: Complete authentication solution
- **Clerk**: User management platform
- **Auth0**: Enterprise authentication

#### Framework Plugins
- **Next.js**: React framework for production
- **React**: JavaScript library for user interfaces
- **Vue**: Progressive JavaScript framework

## Layer 3: Generated Unified Interface Files (The "Contract")

Plugins generate unified interface files that provide consistent APIs for all technologies. These files serve as the contract between different technologies and the application code.

### Unified Interface System

The core of the architecture is the generated unified interface files:

```typescript
// Generated by BetterAuthPlugin: src/lib/auth/index.ts
export const auth = {
  client: {
    signIn: (provider: string, options?: AuthSignInOptions) => Promise<AuthResult>;
    signOut: (options?: AuthSignOutOptions) => Promise<AuthResult>;
    getSession: () => Promise<AuthSession | null>;
    getUser: () => Promise<AuthUser | null>;
    isAuthenticated: () => Promise<boolean>;
  };
  server: {
    auth: (req: Request, res: Response) => Promise<AuthSession | null>;
    protect: (handler: Function) => Function;
  };
  components: {
    LoginButton: ComponentType<LoginButtonProps>;
    AuthForm: ComponentType<AuthFormProps>;
    UserProfile: ComponentType<UserProfileProps>;
    AuthGuard: ComponentType<AuthGuardProps>;
  };
};

// Generated by ShadcnUIPlugin: src/lib/ui/index.ts
export const ui = {
  tokens: {
    colors: ColorTokens;
    spacing: SpacingTokens;
    typography: TypographyTokens;
  };
  components: {
    Button: ComponentType<ButtonProps>;
    Input: ComponentType<InputProps>;
    Card: ComponentType<CardProps>;
    // ... more components
  };
  theme: {
    light: ThemeColors;
    dark: ThemeColors;
    switchTheme: () => void;
  };
};

// Generated by DrizzlePlugin: src/lib/db/index.ts
export const db = {
  client: {
    query: (sql: string, params?: any[]) => Promise<any[]>;
    insert: (table: string, data: any) => Promise<InsertResult>;
    update: (table: string, where: any, data: any) => Promise<UpdateResult>;
    delete: (table: string, where: any) => Promise<DeleteResult>;
  };
  schema: {
    users: TableSchema;
    posts: TableSchema;
    comments: TableSchema;
  };
  migrations: {
    generate: (name: string) => Promise<void>;
    run: () => Promise<void>;
    reset: () => Promise<void>;
  };
};
```

### Structure Service Integration

The Structure Service provides centralized path resolution for unified interface files:

```typescript
class StructureService {
  /**
   * Get unified interface path for a module
   */
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
}
```

### Plugin File Generation

Plugins generate unified interface files in the correct location:

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

## Execution Flow

### 1. Project Initialization
```bash
architech new my-app
```

### 2. AI Analysis
The Orchestrator Agent analyzes requirements and creates an execution plan:

```typescript
const plan = await orchestrator.analyzeProject({
  name: 'my-app',
  template: 'nextjs-14',
  features: ['ui', 'database', 'auth']
});
```

### 3. Plugin Selection
Based on the plan, relevant plugins are selected:

```typescript
const plugins = registry.resolveDependencies([
  'nextjs',
  'shadcn-ui', 
  'drizzle',
  'better-auth'
]);
```

### 4. Three-Layer Execution
Agents execute through the unified interface system:

```typescript
// Layer 1: Agent Decision Making
const selectedPlugin = await authAgent.selectAuthPlugin(context);

// Layer 2: Plugin Implementation and File Generation
const result = await authAgent.executeAuthPluginUnified(context, selectedPlugin);

// Layer 3: Generated Unified Interface Files
// Plugin generates: src/lib/auth/index.ts
import { auth } from '@/lib/auth';
await auth.client.signIn('email', { email, password });
```

### 5. Validation
Comprehensive validation through generated unified interface files:

```typescript
const result = await orchestrator.validateProject(context);
if (!result.success) {
  await orchestrator.rollback(context);
}
```

## Benefits of the Three-Layer Architecture

### 1. Technology Agnostic
```typescript
// Same code works with ANY technology through generated files
import { auth } from '@/lib/auth';
await auth.client.signIn('email', { email, password });
```

### 2. No Lock-in
```typescript
// Easy to switch technologies without changing agent code
// Just change the plugin and regenerate unified interface files
const selectedPlugin = 'nextauth'; // instead of 'better-auth'
```

### 3. Consistent APIs
```typescript
// All auth systems have the same interface through generated files
import { auth } from '@/lib/auth';
interface UnifiedAuth {
  client: { signIn, signOut, getSession }
  server: { auth, protect }
  components: { LoginButton, AuthForm }
}
```

### 4. Easy to Extend
```typescript
// Add new technology in 2 steps:
// 1. Create plugin (implementation + file generation)
// 2. Register in registry
// Agents automatically work with it!
```

## Extending the Architecture

### Adding New Agents

1. **Create Agent Class**:
```typescript
class CustomAgent extends AbstractAgent {
  async executeInternal(context: AgentContext): Promise<AgentResult> {
    // 1. Select appropriate plugin
    const selectedPlugin = await this.selectPlugin(context);
    
    // 2. Execute plugin which generates unified interface files
    const result = await this.executePluginUnified(context, selectedPlugin);
    
    // 3. Validate using generated unified interface files
    await this.validateSetupUnified(context, selectedPlugin);
  }
}
```

2. **Register with Orchestrator**:
```typescript
orchestrator.registerAgent(new CustomAgent());
```

### Adding New Technologies

1. **Create Plugin (Implementation + File Generation)**:
```typescript
class ClerkPlugin implements IPlugin {
  getMetadata(): PluginMetadata {
    return {
      id: 'clerk',
      name: 'Clerk',
      version: '1.0.0',
      description: 'User management platform',
      category: PluginCategory.AUTH
    };
  }
  
  async install(context: PluginContext): Promise<PluginResult> {
    // Install Clerk dependencies
    await this.installDependencies();
    
    // Create Clerk configuration
    await this.createClerkConfig();
    
    // Generate unified interface files
    await this.generateUnifiedInterfaceFiles(context);
  }
  
  private async generateUnifiedInterfaceFiles(context: PluginContext): Promise<void> {
    const unifiedPath = structureService.getUnifiedInterfacePath(
      context.projectPath, 
      context.projectStructure!, 
      'auth'
    );
    
    const indexContent = `
export const auth = {
  client: {
    signIn: (provider, options) => {
      // Clerk-specific implementation
      return this.clerkClient.signIn(provider, options);
    },
    signOut: () => this.clerkClient.signOut(),
    getSession: () => this.clerkClient.getSession()
  }
};
`;
    
    await fsExtra.writeFile(path.join(unifiedPath, 'index.ts'), indexContent);
  }
}
```

2. **Register in Registry**:
```typescript
// Register in plugin registry
registry.register(new ClerkPlugin());
```

3. **Agents Automatically Work!**:
```typescript
// Same agent code works with Clerk through generated files
import { auth } from '@/lib/auth';
await auth.client.signIn('email', { email, password });
```

## Best Practices

### Agent Development
- Keep agents focused on decision making and orchestration
- Use generated unified interface files for all technology interactions
- Implement proper error handling and rollback
- Add comprehensive validation through generated unified interface files

### Plugin Development
- Follow the standard plugin interface
- Generate unified interface files in the correct location using StructureService
- Document dependencies and conflicts
- Implement proper validation
- Handle configuration gracefully

### Unified Interface File Generation
- Generate files in the correct location based on project structure
- Provide consistent API across all technologies
- Include proper TypeScript types
- Add escape hatches for advanced use cases
- Maintain consistent API behavior

### Testing
- Test agents with different technology combinations
- Mock generated unified interface files for testing
- Test error scenarios and rollback
- Validate generated projects

## Performance Considerations

### Lazy Loading
- Plugins are instantiated on-demand
- Generated files are loaded only when needed
- Reduces initial load time and memory usage

### Caching
- Cache plugin resolutions
- Cache generated file lookups
- Cache unified interface file imports

### Parallelization
- Execute independent agents in parallel
- Parallel plugin installations
- Concurrent file operations

## Security

### Plugin Security
- Validate plugin sources
- Sandbox plugin execution
- Audit plugin dependencies

### Generated File Security
- Validate generated file content
- Secure API implementation
- Handle sensitive data properly

### Project Security
- Secure default configurations
- Environment variable handling
- Dependency vulnerability scanning

## Future Enhancements

### AI Integration
- Advanced project analysis
- Intelligent plugin selection
- Automated code generation
- Performance optimization

### Plugin Marketplace
- Community plugin repository
- Plugin versioning and updates
- Plugin compatibility testing
- Plugin rating system

### Enterprise Features
- Multi-tenant support
- Advanced project templates
- Custom plugin development
- Enterprise plugin marketplace 