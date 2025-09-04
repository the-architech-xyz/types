# 🔌 Adapter Development Guide

> **Complete guide to creating custom adapters for The Architech**

## 📋 Table of Contents

1. [Overview](#overview)
2. [Adapter Structure](#adapter-structure)
3. [Creating Your First Adapter](#creating-your-first-adapter)
4. [Blueprint Actions](#blueprint-actions)
5. [Template Variables](#template-variables)
6. [Best Practices](#best-practices)
7. [Testing Your Adapter](#testing-your-adapter)
8. [Publishing Your Adapter](#publishing-your-adapter)

## 🎯 Overview

Adapters are the core building blocks of The Architech. Each adapter represents a specific technology or service that can be integrated into a project. They follow a **CLI-first approach** and use **declarative blueprints** to define their behavior.

### Key Principles

- **🔌 Pure Adapters** - Zero cross-knowledge between adapters
- **⚡ CLI-First** - Leverage existing tools and commands
- **📋 Declarative** - Blueprints define actions, not implementation
- **🛡️ Type-Safe** - Full TypeScript support

## 🏗️ Adapter Structure

Every adapter follows this structure:

```
src/adapters/{category}/{adapter-id}/
├── adapter.json          # Adapter metadata and configuration
└── blueprint.ts          # Blueprint definition with actions
```

### Example Structure

```
src/adapters/database/drizzle/
├── adapter.json
└── blueprint.ts
```

## 📄 Adapter Configuration (`adapter.json`)

The `adapter.json` file defines the adapter's metadata and capabilities:

```json
{
  "id": "drizzle",
  "name": "Drizzle ORM",
  "description": "Type-safe SQL ORM with excellent TypeScript support",
  "category": "database",
  "version": "1.0.0",
  "blueprint": "blueprint.ts",
  "dependencies": {
    "required": ["framework"],
    "optional": ["auth"],
    "conflicts": []
  },
  "capabilities": {
    "database": {
      "orm": true,
      "migrations": true,
      "studio": true,
      "relations": true
    },
    "integrations": {
      "auth": "User schema generation",
      "framework": "Next.js API routes"
    }
  },
  "environment": {
    "required": ["DATABASE_URL"],
    "optional": ["DATABASE_POOL_SIZE"]
  },
  "files": {
    "generates": ["src/lib/db/", "drizzle.config.ts"],
    "modifies": ["package.json", ".env.example"]
  }
}
```

### Configuration Fields

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `id` | string | Unique adapter identifier | ✅ |
| `name` | string | Human-readable name | ✅ |
| `description` | string | Brief description | ✅ |
| `category` | string | Category (framework, database, auth, etc.) | ✅ |
| `version` | string | Semantic version | ✅ |
| `blueprint` | string | Blueprint file name | ✅ |
| `dependencies` | object | Module dependencies | ❌ |
| `capabilities` | object | Feature capabilities | ❌ |
| `environment` | object | Environment variables | ❌ |
| `files` | object | File generation info | ❌ |

## 🔧 Creating Your First Adapter

Let's create a simple adapter for a logging library:

### Step 1: Create the Directory Structure

```bash
mkdir -p src/adapters/logging/winston
cd src/adapters/logging/winston
```

### Step 2: Create `adapter.json`

```json
{
  "id": "winston",
  "name": "Winston Logger",
  "description": "A multi-transport async logging library for Node.js",
  "category": "logging",
  "version": "1.0.0",
  "blueprint": "blueprint.ts",
  "capabilities": {
    "logging": {
      "transports": ["console", "file", "database"],
      "formats": ["json", "simple", "colorize"],
      "levels": ["error", "warn", "info", "debug"]
    }
  },
  "environment": {
    "optional": ["LOG_LEVEL", "LOG_FILE_PATH"]
  },
  "files": {
    "generates": ["src/lib/logger/"],
    "modifies": ["package.json"]
  }
}
```

### Step 3: Create `blueprint.ts`

```typescript
import { Blueprint } from '../../../types/adapter.js';

export const winstonBlueprint: Blueprint = {
  id: 'winston-logging-setup',
  name: 'Winston Logging Setup',
  actions: [
    {
      type: 'RUN_COMMAND',
      command: 'npm install winston'
    },
    {
      type: 'ADD_CONTENT',
      target: 'src/lib/logger/config.ts',
      content: `import winston from 'winston';

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: '{{project.name}}' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Add file transport in production
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({
    filename: process.env.LOG_FILE_PATH || 'logs/error.log',
    level: 'error'
  }));
}

export default logger;`
    },
    {
      type: 'ADD_CONTENT',
      target: 'src/lib/logger/index.ts',
      content: `export { logger, default } from './config.js';
export * from './types.js';`
    },
    {
      type: 'ADD_CONTENT',
      target: 'src/lib/logger/types.ts',
      content: `export interface LogContext {
  userId?: string;
  requestId?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';`
    }
  ]
};
```

## ⚡ Blueprint Actions

Blueprints use two types of actions:

### 1. `RUN_COMMAND` Actions

Execute CLI commands:

```typescript
{
  type: 'RUN_COMMAND',
  command: 'npm install express'
}
```

**Best Practices:**
- Use specific package versions when possible
- Group related installations together
- Use `-D` flag for dev dependencies

### 2. `ADD_CONTENT` Actions

Create or modify files:

```typescript
{
  type: 'ADD_CONTENT',
  target: 'src/lib/config.ts',
  content: `export const config = {
  apiUrl: '{{project.apiUrl}}',
  version: '{{project.version}}'
};`
}
```

**Best Practices:**
- Use template variables for dynamic content
- Follow project structure conventions
- Include proper TypeScript types

## 🔄 Template Variables

Use template variables to make your adapters dynamic:

### Project Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{{project.name}}` | Project name | `my-saas` |
| `{{project.version}}` | Project version | `1.0.0` |
| `{{project.description}}` | Project description | `My awesome SaaS` |

### Module Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{{module.id}}` | Module ID | `drizzle` |
| `{{module.version}}` | Module version | `latest` |
| `{{module.parameters.key}}` | Module parameter | `postgresql` |

### Example Usage

```typescript
{
  type: 'ADD_CONTENT',
  target: 'src/lib/{{module.id}}/config.ts',
  content: `export const {{module.id}}Config = {
  name: '{{project.name}}',
  version: '{{project.version}}',
  database: '{{module.parameters.databaseType}}'
};`
}
```

## 🎯 Best Practices

### 1. CLI-First Approach

Always use existing CLI tools when possible:

```typescript
// ✅ Good - Use existing CLI
{
  type: 'RUN_COMMAND',
  command: 'npx create-next-app@latest . --typescript --tailwind'
}

// ❌ Bad - Reimplement everything
{
  type: 'ADD_CONTENT',
  target: 'package.json',
  content: '{"dependencies": {"next": "14.0.0"}}'
}
```

### 2. Error Handling

Include proper error handling in generated code:

```typescript
{
  type: 'ADD_CONTENT',
  target: 'src/lib/database/connection.ts',
  content: `import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

export const db = drizzle(postgres(connectionString));`
}
```

### 3. TypeScript Support

Always include proper TypeScript types:

```typescript
{
  type: 'ADD_CONTENT',
  target: 'src/types/{{module.id}}.ts',
  content: `export interface {{module.id}}Config {
  apiKey: string;
  baseUrl: string;
  timeout?: number;
}

export interface {{module.id}}Response {
  success: boolean;
  data?: any;
  error?: string;
}`
}
```

### 4. Environment Variables

Document required environment variables:

```typescript
{
  type: 'ADD_CONTENT',
  target: '.env.example',
  content: `# {{module.name}} Configuration
{{module.id | upper}}_API_KEY=your_api_key_here
{{module.id | upper}}_BASE_URL=https://api.example.com
{{module.id | upper}}_TIMEOUT=5000`
}
```

## 🧪 Testing Your Adapter

### 1. Create a Test Recipe

Create a test recipe to verify your adapter:

```yaml
# test-winston.yaml
version: "1.0"
project:
  name: "test-winston"
  framework: "nextjs"
  path: "./test-winston"
modules:
  - id: "nextjs"
    category: "framework"
    version: "latest"
  - id: "winston"
    category: "logging"
    version: "latest"
    parameters:
      level: "debug"
      filePath: "logs/app.log"
```

### 2. Test the Adapter

```bash
# Build the project
npm run build

# Test your adapter
node dist/index.js new test-winston.yaml
```

### 3. Verify Generated Files

Check that all expected files are created:

```bash
ls -la test-winston/src/lib/logger/
# Should show: config.ts, index.ts, types.ts
```

## 📦 Publishing Your Adapter

### 1. Add to Agent Registry

Update the appropriate agent to recognize your adapter:

```typescript
// src/agents/core/logging-agent.ts
export class LoggingAgent extends SimpleAgent {
  constructor(pathHandler: PathHandler) {
    super('logging', pathHandler);
  }

  private validateLoggingModule(module: Module): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    const supportedLogging = ['winston', 'pino', 'bunyan'];
    if (!supportedLogging.includes(module.id)) {
      errors.push(`Unsupported logging library: ${module.id}. Supported: ${supportedLogging.join(', ')}`);
    }
    
    return { valid: errors.length === 0, errors };
  }
}
```

### 2. Update Documentation

Add your adapter to the official documentation:

```markdown
## Logging Adapters

### Winston
- **ID**: `winston`
- **Description**: Multi-transport async logging library
- **Features**: Console, file, database transports
- **Usage**: `architech new my-project.yaml` (include winston module)
```

### 3. Create Examples

Provide example recipes using your adapter:

```yaml
# examples/logging-example.yaml
version: "1.0"
project:
  name: "logging-example"
  framework: "nextjs"
  path: "./logging-example"
modules:
  - id: "nextjs"
    category: "framework"
  - id: "winston"
    category: "logging"
    parameters:
      level: "info"
      transports: ["console", "file"]
```

## 🚀 Advanced Features

### Conditional Actions

Use template conditions for dynamic behavior:

```typescript
{
  type: 'ADD_CONTENT',
  target: 'src/lib/config.ts',
  content: `export const config = {
  database: {
    url: process.env.DATABASE_URL,
    {{#if module.parameters.ssl}}
    ssl: true,
    {{/if}}
    pool: {
      min: 2,
      max: 10
    }
  }
};`
}
```

### Multiple File Generation

Generate multiple related files:

```typescript
export const complexBlueprint: Blueprint = {
  id: 'complex-setup',
  name: 'Complex Setup',
  actions: [
    // Install dependencies
    {
      type: 'RUN_COMMAND',
      command: 'npm install express cors helmet'
    },
    // Create main server file
    {
      type: 'ADD_CONTENT',
      target: 'src/server.ts',
      content: `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

export default app;`
    },
    // Create middleware
    {
      type: 'ADD_CONTENT',
      target: 'src/middleware/auth.ts',
      content: `export const authMiddleware = (req: any, res: any, next: any) => {
  // Auth logic here
  next();
};`
    }
  ]
};
```

## 📚 Additional Resources

- [Blueprint Types Reference](../types/adapter.ts)
- [Agent Development Guide](./AGENT_DEVELOPMENT_GUIDE.md)
- [Recipe Format Documentation](./RECIPE_FORMAT.md)
- [Example Adapters](../src/adapters/)

## 🤝 Contributing

1. Fork the repository
2. Create your adapter following this guide
3. Add tests and documentation
4. Submit a pull request

---

**Happy coding! 🚀**
