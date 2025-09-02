# The Architech - Architecture Documentation

## Overview

The Architech is a **Code Supply Chain** platform that elevates developers from "artisans" to "architects" by providing a declarative, agent-based approach to project generation and management.

## Core Mission

Fix three critical problems in modern software development:

1. **Disposable Code Syndrome** - Projects that can't be maintained or extended
2. **Organizational Amnesia** - Loss of architectural knowledge over time  
3. **The AI-Assistant Paradox** - AI tools that create more problems than they solve

## V1 Architecture: Agent-Based Recipe Executor

### Flow Architecture

```
architech.yaml → Orchestrator → Agents → Adapters → Blueprints
```

### Core Components

#### 1. Recipe System (`architech.yaml`)
- **Single Source of Truth** for project definition
- Declarative YAML format
- Defines project metadata, modules, and execution options

```yaml
version: "1.0"
project:
  name: "my-saas"
  framework: "nextjs"
  path: "./my-saas"
modules:
  - id: "nextjs"
    category: "framework"
    version: "latest"
    parameters:
      typescript: true
      tailwind: true
      appRouter: true
  - id: "shadcn-ui"
    category: "ui"
    version: "latest"
    parameters:
      components: ["button", "input", "card"]
options:
  skipInstall: false
```

#### 2. Orchestrator Agent
- **Central Coordinator** that manages the entire execution flow
- Reads and validates recipes
- Delegates module execution to specialized agents
- Manages project initialization and final dependency installation

#### 3. Specialized Agents
Each agent is a "Chef de Partie" responsible for their domain:

- **FrameworkAgent** - Handles framework setup (Next.js, React, Vue)
- **DatabaseAgent** - Manages database configuration (Drizzle, Prisma)
- **AuthAgent** - Sets up authentication (Better Auth, NextAuth)
- **UIAgent** - Configures UI libraries (Shadcn/ui, Chakra UI)
- **TestingAgent** - Sets up testing frameworks (Vitest, Jest)

#### 4. Adapter System
- **Pure Technology Implementations** with zero cross-knowledge
- Each adapter contains:
  - `adapter.json` - Metadata and configuration
  - `blueprint.ts` - Declarative action list
  - `main.ts` - Implementation logic (V2)

#### 5. Blueprint System
- **Declarative Action Lists** using standardized actions:
  - `ADD_CONTENT` - Add or merge file content
  - `RUN_COMMAND` - Execute CLI commands
  - `CREATE_DIRECTORY` - Create directory structure
  - `INSTALL_DEPENDENCY` - Add package dependencies

### CLI Commands

#### V1 Commands
- `architech new <recipe.yaml>` - Create new project from recipe

#### V2 Commands (Planned)
- `architech add <module-id>` - Add modules to existing project
- `architech scale [options]` - Scale to monorepo structure

### Service Layer

#### Core Services
- **PathHandler** - Centralized path management and file operations
- **ProjectManager** - Project structure initialization and state management
- **AdapterLoader** - Dynamic adapter loading and validation
- **BlueprintExecutor** - Action execution engine

#### CLI Services
- **CommandRunner** - Safe command execution with error handling
- **Logger** - Structured logging with verbosity levels
- **Banner** - User-friendly output formatting

## Design Principles

### 1. Declarative Over Imperative
- Everything is defined in YAML recipes
- No complex logic in configuration files
- Clear separation between "what" and "how"

### 2. Agent-Based Architecture
- Each agent is responsible for their domain
- Agents don't know about other agents
- Orchestrator coordinates without implementing

### 3. Adapter Isolation
- Pure technology implementations
- Zero cross-knowledge between adapters
- Easy to add new technologies

### 4. CLI-First Approach
- Blueprints prioritize CLI commands over file operations
- Leverages existing tooling (create-next-app, shadcn init)
- Reduces maintenance burden

### 5. Progressive Enhancement
- V1: Simple recipe execution
- V2: Dynamic module addition and AI integration
- V3: Full AI-powered development assistant

## File Structure

```
src/
├── agents/                 # Agent system
│   ├── base/              # Base agent class
│   ├── core/              # Specialized agents
│   └── orchestrator-agent.ts
├── adapters/              # Technology adapters
│   ├── framework/         # Framework adapters
│   ├── database/          # Database adapters
│   ├── auth/              # Auth adapters
│   ├── ui/                # UI adapters
│   └── testing/           # Testing adapters
├── commands/              # CLI commands
│   ├── new.ts             # Project creation
│   ├── add.ts             # Module addition (V2)
│   └── scale.ts           # Monorepo scaling (V2)
├── core/                  # Core services
│   ├── services/          # Service layer
│   └── cli/               # CLI utilities
└── types/                 # Type definitions
```

## Technology Stack

### Core Technologies
- **TypeScript** - Type-safe development
- **Commander.js** - CLI framework
- **js-yaml** - YAML parsing
- **Chalk** - Terminal styling

### Package Managers
- **npm** - Default package manager
- **yarn** - Alternative package manager
- **pnpm** - Fast package manager
- **bun** - Modern package manager

### Supported Frameworks
- **Next.js** - React framework with App Router
- **React** - Component library
- **Vue** - Progressive framework
- **Svelte** - Compile-time framework

## Execution Flow

### 1. Recipe Validation
- Parse and validate YAML structure
- Check module compatibility
- Validate parameters

### 2. Project Initialization
- Create project directory structure
- Initialize basic files (package.json, tsconfig.json)
- Set up environment configuration

### 3. Module Execution
- For each module in recipe:
  - Load appropriate agent
  - Validate module parameters
  - Execute adapter blueprint
  - Handle errors gracefully

### 4. Finalization
- Install all dependencies
- Generate project documentation
- Create project genome (architech.json)

## Error Handling

### Graceful Degradation
- Stop on first module failure
- Provide clear error messages
- Maintain partial project state

### Validation Layers
- Recipe structure validation
- Module parameter validation
- Agent-specific validation
- Adapter execution validation

## Future Roadmap

### V2 Features
- Dynamic module addition
- Project state management
- AI-powered recommendations
- Intelligent dependency resolution

### V3 Features
- Full AI development assistant
- Natural language project generation
- Automated testing and deployment
- Cross-project knowledge sharing

## Contributing

### Adding New Adapters
1. Create adapter directory in `src/adapters/<category>/<id>/`
2. Implement `adapter.json` and `blueprint.ts`
3. Add validation to appropriate agent
4. Test with sample recipe

### Adding New Agents
1. Extend `SimpleAgent` base class
2. Implement domain-specific validation
3. Register in `OrchestratorAgent`
4. Add to agent exports

### Adding New Commands
1. Create command file in `src/commands/`
2. Implement command logic
3. Register in main CLI
4. Add help documentation
