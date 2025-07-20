# The Architech CLI User Guide

## Getting Started

### Installation

The Architech CLI can be installed globally or run directly with npx:

```bash
# Global installation (recommended)
npm install -g the-architech

# Or run directly
npx the-architech new my-app
```

### Prerequisites

- Node.js 16.0.0 or higher
- Any package manager (npm, yarn, pnpm, bun)
- Git (optional, for version control)

## Basic Usage

### Interactive Mode (Recommended)

The easiest way to get started is using interactive mode:

```bash
architech new
```

This will guide you through:
1. **Project Name**: Enter your project name
2. **Project Type**: Choose between quick-prototype (single app) or scalable-monorepo
3. **Package Manager**: Select your preferred package manager
4. **Features**: Choose which features to include
5. **Configuration**: Customize project settings

### Quick Start with Defaults

For rapid prototyping, use the `--yes` flag to accept all defaults:

```bash
architech new my-app --yes
```

This creates a Next.js 14 project with:
- TypeScript
- Tailwind CSS
- ESLint
- Prettier
- Basic project structure

### Custom Configuration

Specify options directly for more control:

```bash
architech new my-app \
  --project-type quick-prototype \
  --package-manager yarn \
  --no-git \
  --no-install
```

## Project Types

### Quick Prototype (Default)

Single application structure for rapid development:

```bash
architech new my-app --project-type quick-prototype
```

**Features:**
- Single application structure
- Next.js 14 with App Router
- TypeScript support
- Tailwind CSS integration
- ESLint configuration
- Optimized build setup

### Scalable Monorepo

Enterprise monorepo structure for large-scale projects:

```bash
architech new my-enterprise --project-type scalable-monorepo
```

**Features:**
- Monorepo structure with Turborepo
- Shared packages for UI, database, and auth
- Multiple applications
- TypeScript end-to-end
- Consistent code quality tools

## Enterprise Monorepo

For large-scale projects, generate an enterprise monorepo:

```bash
architech new my-enterprise --project-type scalable-monorepo --yes
```

### Monorepo Structure

```
my-enterprise/
├── apps/
│   ├── web/               # Main application
│   ├── admin/             # Admin dashboard
│   └── docs/              # Documentation site
├── packages/
│   ├── ui/                # Shared UI components (unified interface)
│   │   ├── index.ts       # Unified UI interface
│   │   ├── components.tsx # UI components
│   │   └── package.json
│   ├── db/                # Database schemas & utilities (unified interface)
│   │   ├── index.ts       # Unified database interface
│   │   ├── schema.ts      # Database schema
│   │   ├── migrations.ts  # Migration utilities
│   │   └── package.json
│   ├── auth/              # Authentication logic (unified interface)
│   │   ├── index.ts       # Unified auth interface
│   │   ├── config.ts      # Auth configuration
│   │   └── package.json
│   ├── config/            # Shared configurations
│   └── utils/             # Common utilities
├── turbo.json             # Turborepo configuration
├── package.json           # Root dependencies
└── tsconfig.json          # TypeScript configuration
```

### Monorepo Features

- **Turborepo**: Fast, incremental builds
- **Shared Packages**: Reusable components and utilities with unified interfaces
- **TypeScript**: End-to-end type safety
- **ESLint**: Consistent code quality
- **Prettier**: Unified code formatting

## Package Manager Support

The CLI supports all major package managers:

### Automatic Detection

The CLI automatically detects your preferred package manager:

```bash
# Detects based on lock files
yarn.lock found → yarn
package-lock.json found → npm
pnpm-lock.yaml found → pnpm
bun.lockb found → bun
```

### Manual Selection

Override automatic detection:

```bash
architech new my-app --package-manager yarn
architech new my-app --package-manager pnpm
architech new my-app --package-manager bun
```

### Package Manager Comparison

| Manager | Speed | Disk Usage | Lock File | CLI Support |
|---------|-------|------------|-----------|-------------|
| npm | ⭐⭐⭐ | ⭐⭐⭐ | package-lock.json | ✅ Full |
| yarn | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | yarn.lock | ✅ Full |
| pnpm | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | pnpm-lock.yaml | ⚠️ Partial |
| bun | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | bun.lockb | ✅ Full |

## Plugin System

### Available Plugins

The CLI uses a plugin system for technology integration:

#### UI Plugins
- **Shadcn/ui**: Modern component system with Tailwind CSS
- **NextUI**: React component library
- **Tamagui**: Cross-platform UI framework

#### Database Plugins
- **Drizzle**: Type-safe SQL ORM
- **Prisma**: Database toolkit and ORM
- **TypeORM**: Object-relational mapping

#### Auth Plugins
- **Better Auth**: Modern authentication for Next.js
- **NextAuth.js**: Complete authentication solution
- **Clerk**: User management platform

### Plugin Management

List available plugins:

```bash
architech plugins list
```

Get plugin information:

```bash
architech plugins info shadcn-ui
```

## Common Use Cases

### 1. Quick Prototype

Create a simple prototype with minimal setup:

```bash
architech new my-prototype --yes
cd my-prototype
npm run dev
```

### 2. Production-Ready App

Create a full-featured application:

```bash
architech new my-production-app
# Select all features during interactive setup
```

### 3. Enterprise Application

Create a scalable enterprise application:

```bash
architech new my-enterprise --project-type scalable-monorepo --yes
cd my-enterprise
npm install
npm run dev
```

### 4. Team Project

Create a project optimized for team development:

```bash
architech new team-project \
  --project-type quick-prototype \
  --package-manager yarn \
  --yes
```

## Generated Project Structure

### Single Application

```
my-app/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/
│   │   └── ui/             # Shadcn/ui components
│   ├── lib/
│   │   ├── db/             # Database utilities (unified interface)
│   │   │   ├── index.ts    # Unified database interface
│   │   │   ├── schema.ts   # Database schema
│   │   │   └── migrations.ts # Migration utilities
│   │   ├── auth/           # Authentication helpers (unified interface)
│   │   │   ├── index.ts    # Unified auth interface
│   │   │   └── config.ts   # Auth configuration
│   │   ├── ui/             # UI components (unified interface)
│   │   │   ├── index.ts    # Unified UI interface
│   │   │   └── components.tsx # UI components
│   │   └── utils.ts        # Utility functions
│   └── types/              # TypeScript definitions
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions
├── .husky/                 # Git hooks
├── components.json         # Shadcn/ui config
├── drizzle.config.ts       # Database configuration
├── Dockerfile              # Production container
├── docker-compose.yml      # Docker orchestration
├── .eslintrc.json         # ESLint configuration
├── .prettierrc.json       # Prettier configuration
├── .env.example           # Environment template
├── next.config.js         # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies & scripts
```

### Enterprise Monorepo

```
my-enterprise/
├── apps/
│   ├── web/               # Main application
│   │   ├── src/
│   │   ├── package.json
│   │   └── next.config.js
│   ├── admin/             # Admin dashboard
│   │   ├── src/
│   │   ├── package.json
│   │   └── next.config.js
│   └── docs/              # Documentation site
│       ├── src/
│       ├── package.json
│       └── next.config.js
├── packages/
│   ├── ui/                # Shared UI components (unified interface)
│   │   ├── index.ts       # Unified UI interface
│   │   ├── components.tsx # UI components
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── db/                # Database schemas & utilities (unified interface)
│   │   ├── index.ts       # Unified database interface
│   │   ├── schema.ts      # Database schema
│   │   ├── migrations.ts  # Migration utilities
│   │   ├── package.json
│   │   └── drizzle.config.ts
│   ├── auth/              # Authentication logic (unified interface)
│   │   ├── index.ts       # Unified auth interface
│   │   ├── config.ts      # Auth configuration
│   │   ├── package.json
│   │   └── auth.config.ts
│   ├── config/            # Shared configurations
│   │   ├── eslint/
│   │   ├── typescript/
│   │   └── package.json
│   └── utils/             # Common utilities
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
├── turbo.json             # Turborepo configuration
├── package.json           # Root dependencies
├── tsconfig.json          # TypeScript configuration
└── .eslintrc.json         # ESLint configuration
```

## Available Scripts

### Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type checking
npm run type-check
```

### Quality Scripts

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# Run all quality checks
npm run quality
```

### Testing Scripts

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Monorepo Scripts (Turborepo)

```bash
# Build all packages
npm run build

# Dev all packages
npm run dev

# Lint all packages
npm run lint

# Test all packages
npm run test
```

## Configuration Files

### ESLint Configuration

```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

### Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false
}
```

### Tailwind Configuration

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## Environment Variables

### Development Environment

Create a `.env.local` file for local development:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# External Services
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### Production Environment

Set environment variables in your deployment platform:

```bash
# Vercel
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET

# Railway
railway variables set DATABASE_URL=...
railway variables set NEXTAUTH_SECRET=...
```

## Project Scaling

### Scale Command

Transform a single app project to a monorepo structure:

```bash
# Scale current directory
architech scale

# Scale specific project
architech scale ./my-project
```

### Scaling Process

The scale command:

1. **Analyzes** the current project structure
2. **Creates** monorepo directories (apps/, packages/)
3. **Moves** source code to apps/web/
4. **Extracts** shared code to packages/
5. **Updates** configuration files
6. **Generates** unified interface files

### Before Scaling

```
my-app/
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── types/
├── package.json
└── next.config.js
```

### After Scaling

```
my-app/
├── apps/
│   └── web/
│       ├── src/
│       ├── package.json
│       └── next.config.js
├── packages/
│   ├── ui/
│   ├── db/
│   ├── auth/
│   └── config/
├── turbo.json
└── package.json
```

## Troubleshooting

### Common Issues

#### 1. Template Rendering Errors

**Problem**: Template files not found or rendering errors

**Solution**: 
```bash
# Rebuild the CLI
npm run build

# Clear cache and retry
rm -rf node_modules package-lock.json
npm install
```

#### 2. Package Manager Issues

**Problem**: Package installation fails

**Solution**:
```bash
# Try different package manager
architech new my-app --package-manager npm

# Or install manually
cd my-app
npm install
```

#### 3. Permission Errors

**Problem**: Permission denied errors

**Solution**:
```bash
# Fix npm permissions
sudo chown -R $USER:$GROUP ~/.npm
sudo chown -R $USER:$GROUP ~/.config

# Or use npx
npx the-architech new my-app
```

#### 4. TypeScript Errors

**Problem**: TypeScript compilation errors

**Solution**:
```bash
# Check TypeScript version
npx tsc --version

# Update TypeScript
npm install -g typescript@latest
```

#### 5. Unified Interface File Issues

**Problem**: Generated unified interface files not found

**Solution**:
```bash
# Check if files were generated
ls src/lib/auth/
ls src/lib/ui/
ls src/lib/db/

# Regenerate if missing
npm run build
```

### Getting Help

- **Documentation**: [https://the-architech.dev/docs](https://the-architech.dev/docs)
- **GitHub Issues**: [https://github.com/the-architech/cli/issues](https://github.com/the-architech/cli/issues)
- **Discussions**: [https://github.com/the-architech/cli/discussions](https://github.com/the-architech/cli/discussions)

## Best Practices

### Project Organization

1. **Use TypeScript**: Enable strict mode for better type safety
2. **Follow ESLint Rules**: Maintain consistent code style
3. **Use Prettier**: Ensure consistent formatting
4. **Organize Components**: Keep components in logical folders
5. **Use Environment Variables**: Never commit secrets
6. **Use Unified Interfaces**: Import from generated unified interface files

### Development Workflow

1. **Start with Interactive Mode**: Use `architech new` for best experience
2. **Customize Gradually**: Start with defaults, customize as needed
3. **Use Git Hooks**: Let Husky handle pre-commit quality checks
4. **Test Regularly**: Run quality checks before committing
5. **Update Dependencies**: Keep dependencies up to date
6. **Scale When Needed**: Use `architech scale` to transform to monorepo

### Deployment

1. **Use Environment Variables**: Configure production settings
2. **Optimize Builds**: Use production builds for deployment
3. **Monitor Performance**: Use built-in performance monitoring
4. **Set Up CI/CD**: Use generated GitHub Actions workflows
5. **Use Docker**: Leverage generated Docker configurations

## Advanced Usage

### Custom Templates

Create custom project templates:

```bash
# Create template directory
mkdir -p templates/my-template

# Add template files
cp -r my-project/* templates/my-template/

# Use custom template
architech new my-app --template my-template
```

### Plugin Development

Develop custom plugins:

```typescript
// Create plugin
class CustomPlugin implements IPlugin {
  getMetadata(): PluginMetadata {
    return {
      id: 'custom-plugin',
      name: 'Custom Plugin',
      version: '1.0.0',
      description: 'My custom plugin',
      author: 'Your Name',
      category: PluginCategory.DATABASE,
      tags: ['database', 'custom'],
      license: 'MIT',
      repository: 'https://github.com/your-org/custom-plugin',
      homepage: 'https://custom-plugin.dev'
    };
  }
  
  async install(context: PluginContext): Promise<PluginResult> {
    // Implementation
    await this.generateUnifiedInterfaceFiles(context);
  }
}

// Register plugin
registry.register(new CustomPlugin());
```

### CI/CD Integration

Use generated GitHub Actions:

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run test
```

## Migration Guide

### From Old Structure

If you have projects using the old agent structure:

1. **Backup**: Create a backup of your project
2. **Update CLI**: Install the latest version
3. **Regenerate**: Use the new CLI to regenerate configuration
4. **Migrate**: Manually migrate any custom configurations

### Version Compatibility

| CLI Version | Node.js | Package Managers | Project Types |
|-------------|---------|------------------|---------------|
| 2.x | 16+ | All | All |
| 1.x | 14+ | npm, yarn | Basic |

## Support and Community

### Resources

- **Documentation**: [https://the-architech.dev/docs](https://the-architech.dev/docs)
- **GitHub**: [https://github.com/the-architech/cli](https://github.com/the-architech/cli)
- **Discussions**: [https://github.com/the-architech/cli/discussions](https://github.com/the-architech/cli/discussions)
- **Twitter**: [@TheArchitechDev](https://twitter.com/TheArchitechDev)

### Contributing

We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) for details.

### License

MIT License - see the [LICENSE](LICENSE) file for details. 