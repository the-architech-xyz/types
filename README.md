# 🏗️ The Architech

> **The fastest way to build production-ready applications**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/the-architech/cli)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

The Architech is a **Code Supply Chain** platform that elevates developers from "artisans" to "architects" by providing a declarative, agent-based approach to project generation and management.

## 🎯 Mission

Fix three critical problems in modern software development:

- **🔧 Disposable Code Syndrome** - Projects that can't be maintained or extended
- **🧠 Organizational Amnesia** - Loss of architectural knowledge over time  
- **🤖 The AI-Assistant Paradox** - AI tools that create more problems than they solve

## ✨ Features

### V1: Agent-Based Recipe Executor
- **📋 Declarative YAML Recipes** - Define your project in simple YAML files
- **🤖 Specialized Agents** - Each agent handles their domain (framework, database, auth, UI, testing)
- **🔌 Pure Adapters** - Isolated technology implementations with zero cross-knowledge
- **⚡ CLI-First Approach** - Leverages existing tools like `create-next-app` and `shadcn init`
- **🛡️ Type-Safe** - Built with TypeScript for reliability and developer experience

### V2: Dynamic Module Management (Coming Soon)
- **➕ Dynamic Module Addition** - Add features to existing projects
- **📈 Monorepo Scaling** - Scale projects to monorepo structures
- **🧠 AI-Powered Recommendations** - Intelligent suggestions for project improvements
- **📊 Project State Management** - Track and manage project evolution

## 🚀 Quick Start

### Installation

```bash
npm install -g @the-architech/cli
```

### Create Your First Project

1. **Create a recipe file** (`my-saas.yaml`):

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
      components: ["button", "input", "card", "dialog"]
  - id: "drizzle"
    category: "database"
    version: "latest"
    parameters:
      databaseType: "postgresql"
      includeMigrations: true
  - id: "better-auth"
    category: "auth"
    version: "latest"
    parameters:
      providers: ["github", "google"]
      sessionStrategy: "jwt"
  - id: "vitest"
    category: "testing"
    version: "latest"
    parameters:
      coverage: true
      ui: true
options:
  skipInstall: false
```

2. **Generate your project**:

```bash
architech new my-saas.yaml
```

3. **Start developing**:

```bash
cd my-saas
npm run dev
```

## 🏗️ Architecture

### Flow Architecture

```
architech.yaml → Orchestrator → Agents → Adapters → Blueprints
```

### Core Components

- **📋 Recipe System** - Declarative YAML project definitions
- **🎯 Orchestrator Agent** - Central coordinator for execution
- **🤖 Specialized Agents** - Domain-specific execution engines
- **🔌 Adapter System** - Pure technology implementations
- **📝 Blueprint System** - Declarative action lists

### Supported Technologies

#### Frameworks
- **Next.js** - React framework with App Router
- **React** - Component library
- **Vue** - Progressive framework
- **Svelte** - Compile-time framework

#### Databases
- **Drizzle** - Type-safe SQL ORM
- **Prisma** - Next-generation ORM
- **TypeORM** - TypeScript ORM
- **Sequelize** - Promise-based ORM

#### Authentication
- **Better Auth** - Modern authentication library
- **NextAuth.js** - Authentication for Next.js
- **Auth0** - Identity platform
- **Firebase Auth** - Google's authentication service

#### UI Libraries
- **Shadcn/ui** - Re-usable components
- **Chakra UI** - Modular component library
- **Material-UI** - React components
- **Ant Design** - Enterprise-class UI design

#### Testing
- **Vitest** - Fast unit test framework
- **Jest** - JavaScript testing framework
- **Cypress** - End-to-end testing
- **Playwright** - Cross-browser testing

## 📚 Documentation

- **[Architecture Guide](docs/ARCHITECTURE.md)** - Detailed architecture documentation
- **[Design Choices](docs/CHOICES.md)** - Rationale behind design decisions
- **[API Reference](docs/API.md)** - Complete API documentation
- **[Contributing Guide](docs/CONTRIBUTING.md)** - How to contribute to The Architech

## 🛠️ CLI Commands

### V1 Commands

```bash
# Create a new project from a recipe
architech new <recipe.yaml>

# Show help
architech --help

# Show version
architech --version
```

### V2 Commands (Coming Soon)

```bash
# Add modules to existing project
architech add <module-id> [options]

# Scale project to monorepo
architech scale [options]
```

## 🔧 Development

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- TypeScript 5.0+

### Setup

```bash
# Clone the repository
git clone https://github.com/the-architech/cli.git
cd cli

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run in development mode
npm run dev
```

### Project Structure

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
├── core/                  # Core services
└── types/                 # Type definitions
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details.

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

## 📈 Roadmap

### V1 (Current)
- ✅ Agent-based architecture
- ✅ Declarative YAML recipes
- ✅ Core technology adapters
- ✅ CLI command structure

### V2 (Q2 2024)
- 🔄 Dynamic module addition
- 🔄 Project state management
- 🔄 AI-powered recommendations
- 🔄 Intelligent dependency resolution

### V3 (Q4 2024)
- 🔮 Full AI development assistant
- 🔮 Natural language project generation
- 🔮 Automated testing and deployment
- 🔮 Cross-project knowledge sharing

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing framework
- **Shadcn/ui** - For beautiful, accessible components
- **Drizzle Team** - For type-safe database tools
- **Better Auth** - For modern authentication
- **Vitest Team** - For fast testing framework

## 📞 Support

- **Documentation**: [docs.the-architech.dev](https://docs.the-architech.dev)
- **GitHub Issues**: [github.com/the-architech/cli/issues](https://github.com/the-architech/cli/issues)
- **Discord**: [discord.gg/the-architech](https://discord.gg/the-architech)
- **Twitter**: [@the_architech](https://twitter.com/the_architech)

---

**Built with ❤️ by The Architech Team**

*Elevating developers from artisans to architects, one project at a time.*