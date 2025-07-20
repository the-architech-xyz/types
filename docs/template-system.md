# Template System Documentation

## Overview

The Architech CLI uses a streamlined template system that follows a **CLI-first approach**. This means we prioritize using official CLIs for technology setup and only use templates for essential customizations and post-processing.

## Template Structure

```
src/templates/
├── shared/                    # Shared templates for all projects
│   ├── config/               # Essential configuration files
│   │   ├── turbo.json.ejs    # Turborepo configuration
│   │   ├── gitignore.ejs     # Git ignore patterns
│   │   ├── prettier.config.js.ejs  # Prettier configuration
│   │   ├── eslint.config.js.ejs    # ESLint configuration
│   │   └── tsconfig.json.ejs       # TypeScript configuration
│   ├── packages/             # Package structure templates
│   │   └── index.ts.ejs      # Package index file
│   ├── docs/                 # Documentation templates
│   │   └── README.md.ejs     # Project README
│   └── scripts/              # Script templates
│       ├── package.json.ejs  # Root package.json
│       └── monorepo-package.json.ejs  # Monorepo package.json
└── frameworks/               # Framework-specific templates
    └── nextjs/               # Next.js templates
        └── config/           # Next.js configuration
            ├── next.config.js.ejs    # Next.js configuration
            └── postcss.config.js.ejs # PostCSS configuration
```

## CLI-First Approach

### What We Use Official CLIs For

1. **Next.js Setup**: `create-next-app` handles project creation, dependencies, and basic configuration
2. **Shadcn/ui Setup**: `shadcn init` and `shadcn add` handle component installation and configuration
3. **Drizzle ORM Setup**: `drizzle-kit` handles schema generation, migrations, and database setup
4. **Better Auth Setup**: `@better-auth/cli` handles authentication configuration and schema generation

### What We Use Templates For

1. **Monorepo Configuration**: Turborepo setup, package structure
2. **Essential Configurations**: ESLint, Prettier, TypeScript, Git ignore
3. **Documentation**: README files, project documentation
4. **Custom Post-Processing**: Framework-specific customizations after CLI setup

## Template Categories

### Shared Templates (`shared/`)

These templates are used across all project types and provide essential configuration and structure.

#### Config Templates (`shared/config/`)

- **`turbo.json.ejs`**: Turborepo configuration for monorepo projects
- **`gitignore.ejs`**: Comprehensive Git ignore patterns
- **`prettier.config.js.ejs`**: Prettier code formatting configuration
- **`eslint.config.js.ejs`**: ESLint linting configuration
- **`tsconfig.json.ejs`**: TypeScript configuration

#### Package Templates (`shared/packages/`)

- **`index.ts.ejs`**: Package index file for monorepo packages

#### Documentation Templates (`shared/docs/`)

- **`README.md.ejs`**: Project README with setup instructions

#### Script Templates (`shared/scripts/`)

- **`package.json.ejs`**: Root package.json for single applications
- **`monorepo-package.json.ejs`**: Root package.json for monorepo projects

### Framework Templates (`frameworks/`)

Framework-specific templates for customizations that aren't handled by official CLIs.

#### Next.js Templates (`frameworks/nextjs/`)

- **`config/next.config.js.ejs`**: Custom Next.js configuration
- **`config/postcss.config.js.ejs`**: PostCSS configuration

## Template Rendering

### Template Service Usage

```typescript
import { TemplateService } from '../utils/template-service.js';

const templateService = new TemplateService();

// Render a shared template
const content = await templateService.renderTemplateNew(
  'shared',
  'config/turbo.json.ejs',
  { projectName: 'my-app', isMonorepo: true }
);

// Render a framework template
const nextConfig = await templateService.renderFrameworkTemplate(
  'nextjs',
  'config/next.config.js.ejs',
  { projectName: 'my-app' }
);

// Render and write to file
await templateService.renderAndWriteNew(
  'shared',
  'config/gitignore.ejs',
  '.gitignore',
  { projectName: 'my-app' }
);
```

### Template Variables

Common variables available in all templates:

- `projectName`: Name of the project
- `projectPath`: Full path to the project
- `isMonorepo`: Boolean indicating if this is a monorepo project
- `packageManager`: Package manager being used (npm, yarn, pnpm, bun)
- `framework`: Framework being used (nextjs, react, etc.)
- `plugins`: Array of enabled plugins
- `options`: Project generation options

## Migration from Old Template System

### Removed Templates

The following templates have been removed as they're now handled by official CLIs:

- **Database Templates**: `packages/db/` - Now handled by `drizzle-kit`
- **Authentication Templates**: `packages/auth/` - Now handled by `@better-auth/cli`
- **UI Component Templates**: `packages/ui/` - Now handled by `shadcn`
- **Next.js App Templates**: `frameworks/nextjs/app/` - Now handled by `create-next-app`
- **Shadcn Configuration**: `shared/config/components.json.ejs` - Now handled by `shadcn init`
- **Tailwind Configuration**: `shared/config/tailwind.config.ts.ejs` - Now handled by `shadcn init`

### Benefits of CLI-First Approach

1. **Up-to-date Dependencies**: Official CLIs always use the latest versions
2. **Reduced Maintenance**: Less custom code to maintain
3. **Better Compatibility**: Official CLIs handle edge cases and compatibility
4. **Faster Updates**: New features are available immediately
5. **Community Support**: Official CLIs have better documentation and support

## Best Practices

### When to Use Templates

1. **Essential Configuration**: Files that must be customized for the project
2. **Monorepo Setup**: Complex monorepo configurations
3. **Documentation**: Project-specific documentation
4. **Post-Processing**: Customizations after CLI setup

### When to Use Official CLIs

1. **Technology Setup**: Framework, UI library, database, authentication setup
2. **Dependency Management**: Installing and configuring packages
3. **Code Generation**: Schema generation, component creation
4. **Configuration**: Standard configuration files

### Template Development

1. **Keep Templates Minimal**: Only include essential customizations
2. **Use Official CLIs First**: Always try to use official CLIs before creating templates
3. **Document Dependencies**: Clearly document what each template depends on
4. **Test Templates**: Ensure templates work with different project configurations
5. **Version Compatibility**: Keep templates compatible with latest CLI versions

## Future Enhancements

1. **Template Validation**: Add validation for template variables
2. **Template Testing**: Automated testing for template rendering
3. **Template Marketplace**: Allow community-contributed templates
4. **Template Versioning**: Version control for templates
5. **Template Migration**: Tools for migrating between template versions 