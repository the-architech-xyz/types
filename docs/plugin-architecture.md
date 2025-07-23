# Plugin Architecture

## Overview

The Plugin Architecture follows clean separation of concerns where **plugins provide data and execute functionality**, while **agents handle user interaction and orchestration**. This creates a maintainable, extensible system that's easy to understand and extend.

## Architecture Principles

### 🏗️ Core Principles

1. **Plugins = Data Providers & Executors**
   - Plugins provide parameter schemas
   - Plugins validate configuration
   - Plugins execute installation and setup
   - Plugins NEVER generate questions

2. **Agents = Question Handlers & Orchestrators**
   - Agents analyze user input
   - Agents generate intelligent questions
   - Agents orchestrate plugin execution
   - Agents handle user interaction

3. **Clean Separation**
   - No business logic in plugins
   - No user interaction in plugins
   - No question generation in plugins
   - Plugins focus on technology implementation

## Plugin Structure

### 📁 File Organization

```
src/plugins/
├── base/
│   ├── BasePlugin.ts              # Main base class
│   ├── PathResolver.ts            # Path resolution utility
│   └── index.ts                   # Exports
├── libraries/
│   ├── orm/
│   │   ├── drizzle/
│   │   │   ├── DrizzlePlugin.ts   # Main plugin
│   │   │   ├── DrizzleSchema.ts   # Parameter schema
│   │   │   └── DrizzleGenerator.ts # File generation
│   │   ├── prisma/
│   │   └── mongoose/
│   ├── auth/
│   │   ├── better-auth/
│   │   └── nextauth/
│   ├── ui/
│   │   ├── shadcn-ui/
│   │   ├── mui/
│   │   └── tamagui/
│   ├── framework/
│   │   └── nextjs/
│   └── testing/
│       └── vitest/
├── services/
│   ├── email/
│   ├── payment/
│   └── monitoring/
└── infrastructure/
    ├── database/
    ├── hosting/
    └── monitoring/
```

### 🔧 Plugin Components

Each plugin follows a consistent 3-file structure:

#### 1. Main Plugin (`PluginName.ts`)

The main plugin class that implements the plugin interface:

```typescript
export class DrizzlePlugin extends BasePlugin implements IUIDatabasePlugin {
  private generator: DrizzleGenerator;

  constructor() {
    super();
    this.generator = new DrizzleGenerator();
  }

  // ============================================================================
  // PLUGIN METADATA
  // ============================================================================

  getMetadata(): PluginMetadata {
    return {
      id: 'drizzle',
      name: 'Drizzle ORM',
      version: '0.44.3',
      description: 'TypeScript ORM for SQL databases',
      author: 'The Architech Team',
      category: PluginCategory.DATABASE,
      tags: ['orm', 'typescript', 'sql'],
      license: 'MIT'
    };
  }

  // ============================================================================
  // ENHANCED PLUGIN INTERFACE IMPLEMENTATION
  // ============================================================================

  getParameterSchema() {
    return DrizzleSchema.getParameterSchema();
  }

  validateConfiguration(config: Record<string, any>): ValidationResult {
    // Validate based on parameter schema
    return this.validateRequiredConfig(config, this.getParameterSchema().required || []);
  }

  generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate {
    return this.generator.generateUnifiedInterface(config);
  }

  async install(context: PluginContext): Promise<PluginResult> {
    // Initialize path resolver
    this.initializePathResolver(context);
    
    // Generate files using generator
    await this.generator.generateFiles(context, config);
    
    // Install dependencies
    await this.installDependencies(['drizzle-orm'], ['drizzle-kit']);
    
    return this.createSuccessResult(artifacts, dependencies, scripts, configs);
  }

  // ============================================================================
  // CATEGORY-SPECIFIC METHODS
  // ============================================================================

  getDatabaseProviders(): string[] {
    return DrizzleSchema.getDatabaseProviders();
  }

  getORMOptions(): string[] {
    return ['drizzle'];
  }

  getDatabaseFeatures(): string[] {
    return DrizzleSchema.getDatabaseFeatures();
  }

  getConnectionOptions(): string[] {
    return ['connectionString', 'host', 'port', 'username', 'password'];
  }

  getProviderLabel(provider: string): string {
    return DrizzleSchema.getProviderLabel(provider);
  }

  getProviderDescription(provider: string): string {
    return DrizzleSchema.getProviderDescription(provider);
  }

  getFeatureLabel(feature: string): string {
    return DrizzleSchema.getFeatureLabel(feature);
  }

  getFeatureDescription(feature: string): string {
    return DrizzleSchema.getFeatureDescription(feature);
  }
}
```

#### 2. Schema File (`PluginNameSchema.ts`)

Contains parameter definitions and configuration schemas:

```typescript
export class DrizzleSchema {
  static getParameterSchema(): ParameterSchema {
    return {
      category: PluginCategory.ORM,
      groups: [
        { 
          id: 'provider', 
          name: 'Database Provider', 
          description: 'Choose your database provider.', 
          order: 1, 
          parameters: ['provider'] 
        },
        { 
          id: 'connection', 
          name: 'Connection Settings', 
          description: 'Configure database connection parameters.', 
          order: 2, 
          parameters: ['connectionString', 'host', 'port', 'username', 'password'] 
        }
      ],
      parameters: [
        {
          id: 'provider',
          name: 'Database Provider',
          type: 'select',
          description: 'Select your database provider.',
          required: true,
          default: DATABASE_PROVIDERS.NEON,
          options: [
            { value: DATABASE_PROVIDERS.NEON, label: 'Neon (PostgreSQL)', recommended: true },
            { value: DATABASE_PROVIDERS.SUPABASE, label: 'Supabase' },
            { value: DATABASE_PROVIDERS.MONGODB, label: 'MongoDB' }
          ],
          group: 'provider'
        },
        {
          id: 'connectionString',
          name: 'Connection String',
          type: 'string',
          description: 'Database connection string.',
          required: false,
          conditions: [
            { parameter: 'provider', operator: 'not_equals', value: DATABASE_PROVIDERS.LOCAL_SQLITE, action: 'show' }
          ],
          group: 'connection'
        }
      ],
      dependencies: [],
      validations: [],
      groups: []
    };
  }

  static getDatabaseProviders(): DatabaseProvider[] {
    return [
      DATABASE_PROVIDERS.NEON,
      DATABASE_PROVIDERS.SUPABASE,
      DATABASE_PROVIDERS.MONGODB,
      DATABASE_PROVIDERS.PLANETSCALE,
      DATABASE_PROVIDERS.LOCAL_SQLITE
    ];
  }

  static getProviderLabel(provider: DatabaseProvider): string {
    const labels: Record<DatabaseProvider, string> = {
      [DATABASE_PROVIDERS.NEON]: 'Neon (PostgreSQL)',
      [DATABASE_PROVIDERS.SUPABASE]: 'Supabase',
      [DATABASE_PROVIDERS.MONGODB]: 'MongoDB',
      [DATABASE_PROVIDERS.PLANETSCALE]: 'PlanetScale',
      [DATABASE_PROVIDERS.LOCAL_SQLITE]: 'Local SQLite'
    };
    return labels[provider] || provider;
  }

  static getProviderDescription(provider: DatabaseProvider): string {
    const descriptions: Record<DatabaseProvider, string> = {
      [DATABASE_PROVIDERS.NEON]: 'Serverless PostgreSQL with branching',
      [DATABASE_PROVIDERS.SUPABASE]: 'Open source Firebase alternative',
      [DATABASE_PROVIDERS.MONGODB]: 'NoSQL document database',
      [DATABASE_PROVIDERS.PLANETSCALE]: 'MySQL-compatible serverless database',
      [DATABASE_PROVIDERS.LOCAL_SQLITE]: 'Local SQLite for development'
    };
    return descriptions[provider] || '';
  }
}
```

#### 3. Generator File (`PluginNameGenerator.ts`)

Handles file generation and artifact creation:

```typescript
export class DrizzleGenerator {
  generateDrizzleConfig(config: Record<string, any>): string {
    return `
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: '${config.provider}',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
`;
  }

  generateSchemaFile(config: Record<string, any>): string {
    return `
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content'),
  authorId: uuid('author_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});
`;
  }

  generateConnectionFile(config: Record<string, any>): string {
    return `
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
`;
  }

  generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate {
    return {
      category: PluginCategory.DATABASE,
      exports: [
        {
          name: 'db',
          type: 'constant',
          implementation: 'Database connection instance',
          documentation: 'Main database connection object',
          examples: ['import { db } from "@/lib/db"']
        },
        {
          name: 'query',
          type: 'function',
          implementation: 'Database query function',
          documentation: 'Execute database queries',
          examples: ['const users = await query(usersTable.select())']
        }
      ],
      types: [
        {
          name: 'DatabaseConfig',
          type: 'interface',
          definition: 'interface DatabaseConfig { url: string; }',
          documentation: 'Database configuration interface'
        }
      ],
      utilities: [],
      constants: [],
      documentation: 'Drizzle ORM integration for database operations'
    };
  }

  async generateFiles(context: PluginContext, config: Record<string, any>): Promise<void> {
    const { pathResolver } = context;
    
    // Generate drizzle config
    await pathResolver.generateFile(
      'drizzle.config.ts',
      this.generateDrizzleConfig(config)
    );

    // Generate schema file
    await pathResolver.generateFile(
      'src/lib/db/schema.ts',
      this.generateSchemaFile(config)
    );

    // Generate connection file
    await pathResolver.generateFile(
      'src/lib/db/index.ts',
      this.generateConnectionFile(config)
    );
  }
}
```

## Base Plugin Class

### 🔧 BasePlugin.ts

The foundation for all plugins:

```typescript
export abstract class BasePlugin implements IPlugin {
  protected pathResolver!: PathResolver;
  protected runner: CommandRunner;
  protected templateService: TemplateService;

  constructor() {
    this.runner = new CommandRunner();
    this.templateService = templateService;
  }

  // ============================================================================
  // ABSTRACT METHODS - TO BE IMPLEMENTED BY SUBCLASSES
  // ============================================================================

  abstract getMetadata(): PluginMetadata;
  abstract install(context: PluginContext): Promise<PluginResult>;
  abstract getParameterSchema(): ParameterSchema;
  abstract generateUnifiedInterface(config: Record<string, any>): any;

  // ============================================================================
  // PLUGIN INTERFACE IMPLEMENTATIONS
  // ============================================================================

  validateConfiguration(config: Record<string, any>): ValidationResult {
    const schema = this.getParameterSchema();
    const required = schema.parameters
      .filter(param => param.required)
      .map(param => param.id);
    
    return this.validateRequiredConfig(config, required);
  }

  getDynamicQuestions(context: any): any[] {
    // Plugins NEVER generate questions - agents handle this
    return [];
  }

  // ============================================================================
  // COMMON UTILITIES
  // ============================================================================

  protected initializePathResolver(context: PluginContext): void {
    this.pathResolver = new PathResolver(context);
  }

  protected async generateFile(filePath: string, content: string): Promise<void> {
    await this.pathResolver.generateFile(filePath, content);
  }

  protected async installDependencies(dependencies: string[], devDependencies: string[] = []): Promise<void> {
    // Implementation for installing dependencies
  }

  protected createSuccessResult(artifacts: any[] = [], dependencies: any[] = [], scripts: any[] = [], configs: any[] = []): PluginResult {
    return {
      success: true,
      artifacts,
      dependencies,
      scripts,
      configs,
      errors: [],
      warnings: [],
      duration: Date.now() - this.startTime
    };
  }

  protected createErrorResult(message: string, errors: any[] = []): PluginResult {
    return {
      success: false,
      artifacts: [],
      dependencies: [],
      scripts: [],
      configs: [],
      errors: errors.map(error => ({
        code: 'PLUGIN_ERROR',
        message: error.message || error,
        details: error,
        severity: 'error'
      })),
      warnings: [],
      duration: Date.now() - this.startTime
    };
  }
}
```

## Plugin Categories

### 📊 Category-Specific Interfaces

Each plugin category has a specific interface that extends the base plugin:

#### Database Plugins (`IUIDatabasePlugin`)

```typescript
export interface IUIDatabasePlugin extends IEnhancedPlugin {
  getDatabaseProviders(): string[];
  getORMOptions(): string[];
  getDatabaseFeatures(): string[];
  getConnectionOptions(): string[];
  getProviderLabel(provider: string): string;
  getProviderDescription(provider: string): string;
  getFeatureLabel(feature: string): string;
  getFeatureDescription(feature: string): string;
}
```

#### Auth Plugins (`IUIAuthPlugin`)

```typescript
export interface IUIAuthPlugin extends IEnhancedPlugin {
  getAuthProviders(): string[];
  getAuthFeatures(): string[];
  getSessionOptions(): string[];
  getSecurityOptions(): string[];
}
```

#### UI Plugins (`IUIPlugin`)

```typescript
export interface IUIPlugin extends IEnhancedPlugin {
  getUILibraries(): string[];
  getComponentOptions(): string[];
  getThemeOptions(): string[];
  getStylingOptions(): string[];
}
```

## Data Flow

### 🔄 How Plugins and Agents Work Together

```
1. User provides input to agent
2. Agent analyzes input and determines project context
3. Agent gets recommendations from recommendation engine
4. Agent presents recommendations to user
5. Agent asks questions based on project context
6. Agent collects user answers
7. Agent validates answers using plugin.validateConfiguration()
8. Agent calls plugin.install() with validated configuration
9. Plugin executes installation and returns results
10. Agent handles any errors and provides feedback
```

### 📋 Example Flow

**User Input:** "I want to build an e-commerce store"

**Agent Analysis:**
1. Detects project type: `ecommerce`
2. Gets recommendations: Drizzle + Better Auth + Shadcn UI + Stripe
3. Presents recommendations to user
4. Asks e-commerce specific questions

**Plugin Interaction:**
1. Agent calls `drizzlePlugin.getParameterSchema()`
2. Agent uses schema to generate questions
3. Agent validates answers with `drizzlePlugin.validateConfiguration()`
4. Agent calls `drizzlePlugin.install()` with config
5. Plugin generates files and installs dependencies

## Best Practices

### 🎯 For Plugin Developers

1. **Never Generate Questions**
   ```typescript
   // ❌ WRONG
   getDynamicQuestions(context: PluginContext): Question[] {
     return this.questionGenerator.generateQuestions(this, context);
   }

   // ✅ CORRECT
   getDynamicQuestions(context: PluginContext): Question[] {
     return []; // Agents handle questions
   }
   ```

2. **Provide Comprehensive Schemas**
   ```typescript
   getParameterSchema(): ParameterSchema {
     return {
       category: PluginCategory.DATABASE,
       parameters: [
         {
           id: 'provider',
           name: 'Database Provider',
           type: 'select',
           description: 'Choose your database provider',
           required: true,
           options: [
             { value: 'neon', label: 'Neon', recommended: true },
             { value: 'supabase', label: 'Supabase' }
           ]
         }
       ]
     };
   }
   ```

3. **Implement Proper Validation**
   ```typescript
   validateConfiguration(config: Record<string, any>): ValidationResult {
     const errors: ValidationError[] = [];
     
     if (!config.provider) {
       errors.push({
         field: 'provider',
         message: 'Database provider is required',
         code: 'MISSING_FIELD',
         severity: 'error'
       });
     }
     
     return {
       valid: errors.length === 0,
       errors,
       warnings: []
     };
   }
   ```

4. **Use Path Resolver**
   ```typescript
   async install(context: PluginContext): Promise<PluginResult> {
     this.initializePathResolver(context);
     
     await this.pathResolver.generateFile(
       'src/lib/db/schema.ts',
       this.generateSchema()
     );
   }
   ```

5. **Generate Unified Interfaces**
   ```typescript
   generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate {
     return {
       category: PluginCategory.DATABASE,
       exports: [
         {
           name: 'db',
           type: 'constant',
           implementation: 'Database connection',
           documentation: 'Main database object'
         }
       ],
       types: [],
       utilities: [],
       constants: [],
       documentation: 'Database integration'
     };
   }
   ```

### 🚀 For Agent Developers

1. **Use Plugin Schemas for Questions**
   ```typescript
   const schema = plugin.getParameterSchema();
   const questions = schema.parameters.map(param => ({
     id: param.id,
     type: param.type,
     name: param.name,
     message: param.description,
     choices: param.options
   }));
   ```

2. **Validate with Plugins**
   ```typescript
   const validation = plugin.validateConfiguration(config);
   if (!validation.valid) {
     // Handle validation errors
   }
   ```

3. **Handle Plugin Results**
   ```typescript
   const result = await plugin.install(context);
   if (result.success) {
     // Handle success
   } else {
     // Handle errors
   }
   ```

## Benefits

### ✅ Advantages of This Architecture

1. **Clean Separation**
   - Plugins focus on technology implementation
   - Agents handle user interaction
   - No mixing of concerns

2. **Easy to Extend**
   - Add new plugins by implementing interfaces
   - Add new project types by extending strategies
   - Modular and composable

3. **Better Maintainability**
   - Simple, focused code
   - Clear responsibilities
   - Easy to test

4. **Consistent Interface**
   - All plugins follow the same pattern
   - Predictable behavior
   - Standardized approach

### 📊 Complexity Reduction

| Aspect | Old System | New System | Improvement |
|--------|------------|------------|-------------|
| Plugin Questions | 500+ lines | 0 lines | 100% |
| Question Generation | 1,200+ lines | 0 lines | 100% |
| Plugin Complexity | High | Low | 85% |
| Maintainability | Difficult | Easy | 90% |

## Migration Guide

### From Old Plugin System

1. **Remove Question Generation**
   ```typescript
   // Remove these from plugins
   private questionGenerator: DynamicQuestionGenerator;
   getDynamicQuestions(context: PluginContext): PluginQuestion[] { ... }
   ```

2. **Add Parameter Schema**
   ```typescript
   // Add this to plugins
   getParameterSchema(): ParameterSchema {
     return YourPluginSchema.getParameterSchema();
   }
   ```

3. **Update Validation**
   ```typescript
   // Use schema-based validation
   validateConfiguration(config: Record<string, any>): ValidationResult {
     return this.validateRequiredConfig(config, this.getParameterSchema().required || []);
   }
   ```

4. **Extend BasePlugin**
   ```typescript
   // Change from old base class
   export class YourPlugin extends BasePlugin implements IUIYourCategoryPlugin {
     // Implementation
   }
   ```

---

*This documentation covers the Plugin Architecture. For question generation, see [Question Generation System](./question-generation-system.md).* 