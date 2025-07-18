/**
 * Base Architech Agent - Monorepo Foundation Generator
 * 
 * Creates the core Turborepo monorepo structure:
 * - Root configuration (package.json, turbo.json)
 * - Root-level ESLint, TypeScript, and Tailwind configs
 * - apps/web: Next.js 14 application
 * - packages/: Foundation for specialized packages
 * - Workspace configuration and scripts
 */

import chalk from 'chalk';
import ora from 'ora';
import fsExtra from 'fs-extra';
import path from 'path';

const { ensureDir, writeFile, writeJSON } = fsExtra;

export class BaseArchitechAgent {
  async execute(config, runner) {
    const spinner = ora({
      text: chalk.blue('🏗️  Creating Turborepo monorepo structure...'),
      color: 'blue'
    }).start();

    try {
      const projectPath = path.resolve(process.cwd(), config.projectName);
      
      // Create base directories
      await this.createDirectoryStructure(projectPath);
      
      // Create root package.json with workspace configuration
      await this.createRootPackageJson(projectPath, config);
      
      // Create Turborepo configuration
      await this.createTurboConfig(projectPath);
      
      // Create Next.js app
      await this.createNextJSApp(projectPath, config, runner);
      
      // Create package directories
      await this.createPackageDirectories(projectPath);
      
      // Finalize workspace dependencies
      await this.finalizeWorkspaceDependencies(projectPath, config);
      
      // Setup post-installation configuration
      await this.setupPostInstallation(projectPath, config, runner);
      
      // Initialize git repository
      if (!config.skipGit) {
        await this.initializeGit(projectPath, runner);
      }
      
      spinner.succeed(chalk.green('✅ Base Architech structure created'));
      
    } catch (error) {
      spinner.fail(chalk.red('❌ Failed to create base structure'));
      throw error;
    }
  }

  async finalizeWorkspaceDependencies(projectPath, config) {
    console.log(chalk.blue('🔗 Finalizing workspace dependencies...'));
    
    // Update web app package.json with workspace dependencies
    const webAppPath = path.join(projectPath, 'apps', 'web');
    const packageJsonPath = path.join(webAppPath, 'package.json');
    
    try {
      const webPackageJson = await fsExtra.readJSON(packageJsonPath);
      
      // Detect package manager to use correct protocol
      const packageManager = await this.detectPackageManager(projectPath);
      const protocol = this.getWorkspaceProtocol(packageManager);
      
      // Add workspace dependencies using appropriate protocol
      webPackageJson.dependencies = {
        ...webPackageJson.dependencies,
        [`@${config.projectName}/ui`]: `${protocol}../../packages/ui`,
        [`@${config.projectName}/db`]: `${protocol}../../packages/db`,
        [`@${config.projectName}/auth`]: `${protocol}../../packages/auth`
      };
      
      await writeJSON(packageJsonPath, webPackageJson, { spaces: 2 });
      console.log(chalk.green('✅ Workspace dependencies configured'));
      
    } catch (error) {
      console.log(chalk.yellow('⚠️  Warning: Could not update workspace dependencies'));
    }
  }

  async detectPackageManager(projectPath) {
    const lockFiles = {
      'package-lock.json': 'npm',
      'yarn.lock': 'yarn',
      'pnpm-lock.yaml': 'pnpm',
      'bun.lockb': 'bun'
    };
    
    for (const [lockFile, manager] of Object.entries(lockFiles)) {
      if (await fsExtra.pathExists(path.join(projectPath, lockFile))) {
        return manager;
      }
    }
    
    return 'npm'; // Default fallback
  }

  getWorkspaceProtocol(packageManager) {
    switch (packageManager) {
      case 'npm':
        return 'file:';
      case 'yarn':
      case 'pnpm':
        return 'workspace:';
      case 'bun':
        return 'file:'; // Bun uses file: protocol for workspaces
      default:
        return 'file:';
    }
  }

  async setupPostInstallation(projectPath, config, runner) {
    console.log(chalk.blue('🔧 Setting up post-installation configuration...'));
    
    try {
      // Create root-level configuration files
      await this.createRootConfigFiles(projectPath, config);
      
      // Setup Shadcn/ui at root level for better integration
      await this.setupRootShadcn(projectPath, config, runner);
      
      // Update TypeScript paths for better imports
      await this.updateTypeScriptPaths(projectPath, config);
      
      console.log(chalk.green('✅ Post-installation setup completed'));
      
    } catch (error) {
      console.log(chalk.yellow('⚠️  Warning: Post-installation setup failed'));
    }
  }

  async createRootConfigFiles(projectPath, config) {
    // Create root-level ESLint config
    const rootEslintConfig = {
      root: true,
      extends: [
        "next/core-web-vitals",
        "@typescript-eslint/recommended",
        "prettier"
      ],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint", "import"],
      rules: {
        "@typescript-eslint/no-unused-vars": [
          "error",
          { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
        ],
        "import/order": [
          "error",
          {
            groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
            "newlines-between": "always",
            alphabetize: { order: "asc", caseInsensitive: true }
          }
        ]
      },
      ignorePatterns: [
        "node_modules/",
        ".next/",
        "out/",
        "build/",
        "dist/",
        "*.config.js"
      ]
    };
    
    await writeJSON(path.join(projectPath, '.eslintrc.json'), rootEslintConfig, { spaces: 2 });

    // Create root-level Prettier config
    const rootPrettierConfig = {
      printWidth: 80,
      tabWidth: 2,
      useTabs: false,
      semi: true,
      singleQuote: true,
      quoteProps: "as-needed",
      jsxSingleQuote: true,
      trailingComma: "es5",
      bracketSpacing: true,
      bracketSameLine: false,
      arrowParens: "avoid",
      endOfLine: "lf",
      plugins: ["prettier-plugin-tailwindcss"]
    };
    
    await writeJSON(path.join(projectPath, '.prettierrc.json'), rootPrettierConfig, { spaces: 2 });

    // Create root-level TypeScript config
    const rootTsConfig = {
      compilerOptions: {
        target: "es2022",
        lib: ["dom", "dom.iterable", "es6"],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "preserve",
        incremental: true,
        plugins: [{ name: "next" }],
        baseUrl: ".",
        paths: {
          "@/*": ["./apps/web/src/*"],
          "@/ui": ["./packages/ui"],
          "@/db": ["./packages/db"],
          "@/auth": ["./packages/auth"],
          "@/config": ["./packages/config"]
        }
      },
      include: [
        "apps/web/next-env.d.ts",
        "apps/web/**/*.ts",
        "apps/web/**/*.tsx",
        "packages/**/*.ts",
        "packages/**/*.tsx",
        ".next/types/**/*.ts"
      ],
      exclude: ["node_modules"]
    };
    
    await writeJSON(path.join(projectPath, 'tsconfig.json'), rootTsConfig, { spaces: 2 });
  }

  async setupRootShadcn(projectPath, config, runner) {
    // Create root-level components.json for better Shadcn integration
    const rootComponentsConfig = {
      "$schema": "https://ui.shadcn.com/schema.json",
      "style": "default",
      "rsc": true,
      "tsx": true,
      "tailwind": {
        "config": "tailwind.config.js",
        "css": "apps/web/src/app/globals.css",
        "baseColor": "slate",
        "cssVariables": true,
        "prefix": ""
      },
      "aliases": {
        "components": "@/components",
        "utils": "@/lib/utils"
      }
    };
    
    await writeJSON(path.join(projectPath, 'components.json'), rootComponentsConfig, { spaces: 2 });

    // Create root-level Tailwind config
    const rootTailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./apps/web/src/**/*.{js,ts,jsx,tsx,mdx}",
    "./packages/ui/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}`;

    await writeFile(path.join(projectPath, 'tailwind.config.js'), rootTailwindConfig);
  }

  async updateTypeScriptPaths(projectPath, config) {
    // Update web app TypeScript config to extend root config
    const webAppPath = path.join(projectPath, 'apps', 'web');
    const webTsConfig = {
      extends: "../../tsconfig.json",
      compilerOptions: {
        plugins: [{ name: "next" }],
        baseUrl: ".",
        paths: {
          "@/*": ["./src/*"],
          "@/ui": ["../../packages/ui"],
          "@/db": ["../../packages/db"],
          "@/auth": ["../../packages/auth"],
          "@/config": ["../../packages/config"]
        }
      },
      include: [
        "next-env.d.ts",
        "**/*.ts",
        "**/*.tsx",
        ".next/types/**/*.ts"
      ]
    };
    
    await writeJSON(path.join(webAppPath, 'tsconfig.json'), webTsConfig, { spaces: 2 });
  }

  async createDirectoryStructure(projectPath) {
    const directories = [
      'apps',
      'apps/web',
      'packages',
      'packages/ui',
      'packages/db', 
      'packages/auth'
    ];

    for (const dir of directories) {
      await ensureDir(path.join(projectPath, dir));
    }
  }

  async createRootPackageJson(projectPath, config) {
    const packageJson = {
      name: config.projectName,
      version: "0.1.0",
      private: true,
      description: "Enterprise-grade monorepo created with The Architech",
      workspaces: [
        "apps/*",
        "packages/*"
      ],
      scripts: {
        "build": "turbo run build",
        "dev": "turbo run dev",
        "lint": "turbo run lint",
        "format": "prettier --write \"**/*.{ts,tsx,md}\"",
        "format:check": "prettier --check \"**/*.{ts,tsx,md}\"",
        "clean": "turbo run clean && rm -rf node_modules .turbo",
        "type-check": "turbo run type-check",
        "test": "turbo run test",
        "db:generate": "turbo run db:generate",
        "db:migrate": "turbo run db:migrate",
        "db:studio": "turbo run db:studio"
      },
      devDependencies: {
        "turbo": "^1.10.16",
        "prettier": "^3.0.0",
        "@types/node": "^20.0.0",
        "typescript": "^5.0.0",
        "@typescript-eslint/eslint-plugin": "^6.13.0",
        "@typescript-eslint/parser": "^6.13.0",
        "eslint": "^8.54.0",
        "eslint-config-next": "^14.0.0",
        "eslint-plugin-react": "^7.33.0",
        "eslint-plugin-react-hooks": "^4.6.0",
        "eslint-plugin-import": "^2.29.0",
        "eslint-plugin-jsx-a11y": "^6.8.0",
        "prettier-plugin-tailwindcss": "^0.5.7",
        "tailwindcss": "^3.3.6",
        "autoprefixer": "^10.4.16",
        "postcss": "^8.4.32"
      },
      dependencies: {
        "tailwindcss-animate": "^1.0.7"
      },
      packageManager: config.packageManager === 'auto' ? 'npm@9.0.0' : `${config.packageManager}@latest`,
      engines: {
        "node": ">=16.0.0"
      },
      // Add resolutions to ensure consistent versions across packages
      resolutions: {
        "typescript": "^5.0.0",
        "react": "^18.0.0",
        "react-dom": "^18.0.0",
        "next": "14.0.0"
      }
    };

    await writeJSON(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 });
  }

  async createRootConfigs(projectPath) {
    // Create root ESLint config
    const rootESLintConfig = {
      extends: [
        "eslint:recommended",
        "@typescript-eslint/recommended"
      ],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint"],
      env: {
        node: true,
        es2022: true
      },
      rules: {
        "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
        "@typescript-eslint/no-explicit-any": "warn"
      },
      root: true
    };

    await writeJSON(path.join(projectPath, '.eslintrc.json'), rootESLintConfig, { spaces: 2 });

    // Create root TypeScript config
    const rootTSConfig = {
      compilerOptions: {
        target: "ES2020",
        lib: ["dom", "dom.iterable", "es6"],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "preserve",
        incremental: true,
        plugins: [
          {
            name: "next"
          }
        ],
        baseUrl: ".",
        paths: {
          "@/*": ["./src/*"]
        }
      },
      include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
      exclude: ["node_modules"]
    };

    await writeJSON(path.join(projectPath, 'tsconfig.json'), rootTSConfig, { spaces: 2 });

    // Create root Tailwind config
    const rootTailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./apps/**/*.{js,ts,jsx,tsx,mdx}",
    "./packages/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};`;

    await writeFile(path.join(projectPath, 'tailwind.config.js'), rootTailwindConfig);

    // Create root Prettier config
    const rootPrettierConfig = {
      printWidth: 80,
      tabWidth: 2,
      useTabs: false,
      semi: true,
      singleQuote: true,
      trailingComma: "es5",
      bracketSpacing: true,
      bracketSameLine: false,
      arrowParens: "avoid",
      plugins: ["prettier-plugin-tailwindcss"]
    };

    await writeJSON(path.join(projectPath, '.prettierrc'), rootPrettierConfig, { spaces: 2 });
  }

  async createTurboConfig(projectPath) {
    const turboConfig = {
      "$schema": "https://turbo.build/schema.json",
      "globalDependencies": ["**/.env.*local"],
      "pipeline": {
        "build": {
          "dependsOn": ["^build"],
          "outputs": [".next/**", "!.next/cache/**", "dist/**", "build/**"]
        },
        "dev": {
          "cache": false,
          "persistent": true
        },
        "lint": {
          "dependsOn": ["^lint"],
          "outputs": []
        },
        "type-check": {
          "dependsOn": ["^type-check"],
          "outputs": []
        },
        "test": {
          "dependsOn": ["^test"],
          "outputs": ["coverage/**"]
        },
        "clean": {
          "cache": false
        },
        "db:generate": {
          "dependsOn": ["^db:generate"],
          "outputs": ["migrations/**"]
        },
        "db:migrate": {
          "dependsOn": ["^db:migrate"],
          "outputs": []
        },
        "db:studio": {
          "cache": false,
          "persistent": true
        },
        "format": {
          "outputs": []
        },
        "format:check": {
          "outputs": []
        }
      }
    };

    await writeJSON(path.join(projectPath, 'turbo.json'), turboConfig, { spaces: 2 });
  }

  async createNextJSApp(projectPath, config, runner) {
    const appPath = path.join(projectPath, 'apps', 'web');
    
    // Create Next.js app with create-next-app
    const createNextArgs = [
      'web',
      '--typescript',
      '--tailwind',
      '--eslint',
      '--app',
      '--src-dir',
      '--import-alias', '@/*'
    ];

    // Change to apps directory to run create-next-app
    const originalCwd = process.cwd();
    const appsPath = path.join(projectPath, 'apps');
    
    try {
      process.chdir(appsPath);
      await runner.exec('npx', ['create-next-app@latest', ...createNextArgs, '--yes']);
    } finally {
      process.chdir(originalCwd);
    }

    // Always generate next.config.js
    const nextConfigContent = `/** @type {import('next').NextConfig} */\nconst nextConfig = {\n  /* config options here */\n};\n\nmodule.exports = nextConfig;`;
    await writeFile(path.join(appPath, 'next.config.js'), nextConfigContent);
    // Remove next.config.ts if it exists
    try { await fsExtra.remove(path.join(appPath, 'next.config.ts')); } catch {}

    // Update the web app's package.json for monorepo
    await this.updateWebAppPackageJson(appPath, config);
    
    // Create ESLint config for web app
    await this.createWebAppESLintConfig(appPath);
  }

  async updateWebAppPackageJson(appPath, config) {
    const packageJsonPath = path.join(appPath, 'package.json');
    
    const webPackageJson = {
      name: `@${config.projectName}/web`,
      version: "0.1.0",
      private: true,
      scripts: {
        "build": "next build",
        "dev": "next dev",
        "lint": "next lint",
        "start": "next start",
        "type-check": "tsc --noEmit",
        "test": "echo 'No tests configured yet'",
        "clean": "rm -rf .next out"
      },
      dependencies: {
        "react": "^18",
        "react-dom": "^18",
        "next": "14.0.0"
        // Workspace dependencies will be added after all packages are created
      },
      devDependencies: {
        "typescript": "^5",
        "@types/node": "^20",
        "@types/react": "^18",
        "@types/react-dom": "^18",
        "autoprefixer": "^10",
        "postcss": "^8",
        "tailwindcss": "^3",
        "eslint": "^8",
        "eslint-config-next": "14.0.0"
      }
    };

    await writeJSON(packageJsonPath, webPackageJson, { spaces: 2 });
  }

  async createWebAppESLintConfig(appPath) {
    const eslintConfig = {
      extends: ["../../.eslintrc.json", "next/core-web-vitals"],
      env: {
        browser: true
      }
    };

    await writeJSON(path.join(appPath, '.eslintrc.json'), eslintConfig, { spaces: 2 });
  }

  async createPackageDirectories(projectPath) {
    // Create basic package.json for each package directory
    const packages = ['ui', 'db', 'auth'];
    
    for (const pkg of packages) {
      const packagePath = path.join(projectPath, 'packages', pkg);
      const packageJson = {
        name: `@${path.basename(projectPath)}/${pkg}`,
        version: "0.1.0",
        private: true,
        description: `${pkg.charAt(0).toUpperCase() + pkg.slice(1)} package for ${path.basename(projectPath)}`,
        main: "index.ts",
        types: "index.ts",
        scripts: {
          "build": "tsc",
          "dev": "tsc --watch",
          "lint": "eslint . --ext .ts,.tsx",
          "type-check": "tsc --noEmit",
          "test": "echo 'No tests configured yet'",
          "clean": "rm -rf dist"
        },
        // Add workspace dependencies for cross-package imports
        dependencies: this.getPackageDependencies(pkg, path.basename(projectPath)),
        devDependencies: {
          "typescript": "^5.0.0",
          "@types/node": "^20.0.0"
        }
      };
      
      await writeJSON(path.join(packagePath, 'package.json'), packageJson, { spaces: 2 });
      
      // Create basic index file
      const indexContent = `/**
 * ${pkg.charAt(0).toUpperCase() + pkg.slice(1)} Package
 * 
 * This package will be configured by The Architech ${pkg.charAt(0).toUpperCase() + pkg.slice(1)} Agent.
 */

export default {};
`;
      
      await writeFile(path.join(packagePath, 'index.ts'), indexContent);
      
      // Create TypeScript configuration for each package
      await this.createPackageTypeScriptConfig(packagePath, pkg);
    }
  }

  getPackageDependencies(pkg, projectName) {
    const baseDeps = {};
    
    // Add cross-package dependencies using file: protocol for npm compatibility
    switch (pkg) {
      case 'auth':
        baseDeps[`@${projectName}/db`] = "file:../db";
        break;
      case 'ui':
        // UI package is standalone
        break;
      case 'db':
        // DB package is standalone
        break;
    }
    
    return baseDeps;
  }

  async createPackageTypeScriptConfig(packagePath, pkg) {
    const tsConfig = {
      extends: "../../tsconfig.json",
      compilerOptions: {
        outDir: "dist",
        rootDir: ".",
        baseUrl: ".",
        paths: {
          "@/*": ["./*"]
        }
      },
      include: [
        "**/*.ts",
        "**/*.tsx"
      ],
      exclude: [
        "node_modules",
        "dist",
        "**/*.test.ts",
        "**/*.spec.ts"
      ]
    };
    
    await writeJSON(path.join(packagePath, 'tsconfig.json'), tsConfig, { spaces: 2 });
  }

  async initializeGit(projectPath, runner) {
    const originalCwd = process.cwd();
    
    try {
      process.chdir(projectPath);
      
      await runner.exec('git', ['init']);
      
      // Create .gitignore
      const gitignoreContent = `# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
*.lcov

# Next.js
.next/
out/
build/

# Production
dist/
*.tgz
*.tar.gz

# Environment variables
.env*.local
.env
.env.production
.env.development

# Vercel
.vercel

# Turbo
.turbo

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Package managers
.npm
.eslintcache
.stylelintcache

# TypeScript
*.tsbuildinfo

# Database
*.db
*.sqlite
*.sqlite3

# Temporary files
*.tmp
*.temp
.cache/

# Build outputs
.next/
out/
build/
dist/
coverage/

# Local development
.env.local
.env.development.local
.env.test.local
.env.production.local`;
      
      await writeFile(path.join(projectPath, '.gitignore'), gitignoreContent);
      
    } finally {
      process.chdir(originalCwd);
    }
  }

  async createReadme(projectPath, config) {
    const readmeContent = `# ${config.projectName}

This monorepo is built with The Architech Foundation.

## Project Structure

- \`apps/web\`: Next.js 14 application.
- \`packages/\`: Foundation for specialized packages.
  - \`packages/ui\`: Reusable UI components.
  - \`packages/db\`: Database utilities and ORM.
  - \`packages/auth\`: Authentication and user management.
  - \`packages/config\`: Shared configuration and TypeScript types.

## Scripts

\`\`\`bash
# Build and watch for changes
turbo run dev

# Build for production
turbo run build

# Lint and format code
turbo run lint
turbo run format

# Type check
turbo run type-check

# Test
turbo run test

# Database migrations
turbo run db:migrate
turbo run db:generate
turbo run db:studio
\`\`\`

## Development

\`\`\`bash
# Start the Next.js development server
next dev

# Build the Next.js application for production
next build

# Start the Next.js production server
next start

# Lint the Next.js application
next lint
\`\`\`

## Packages

Each package in \`packages/\` is a standalone TypeScript project.

- \`packages/ui\`: Contains reusable UI components.
- \`packages/db\`: Contains database utilities and ORM.
- \`packages/auth\`: Contains authentication and user management logic.
- \`packages/config\`: Contains shared configuration and TypeScript types.

## Workspace Dependencies

The \`apps/web\` application and all packages are linked to each other.

- \`@${config.projectName}/web\`: The Next.js application.
- \`@${config.projectName}/ui\`: Reusable UI components.
- \`@${config.projectName}/db\`: Database utilities and ORM.
- \`@${config.projectName}/auth\`: Authentication and user management.
- \`@${config.projectName}/config\`: Shared configuration and TypeScript types.

## Environment Variables

\`\`\`
# Development
.env.development
.env.development.local

# Production
.env.production
.env.production.local

# Next.js
.next/
out/

# Database
.env*.local

# Vercel
.vercel
\`\`\`

## Git

\`\`\`bash
# Initialize git repository
git init

# Add files to staging
git add .

# Commit changes
git commit -m "Initial commit"
\`\`\`

## TypeScript

\`\`\`bash
# Type check
tsc --noEmit

# Build
turbo run build
\`\`\`

## Tailwind CSS

\`\`\`bash
# Start the Tailwind CSS development server
tailwindcss -i ./src/styles/index.css -o ./dist/styles/index.css --watch
\`\`\`

## Prettier

\`\`\`bash
# Format code
turbo run format

# Check formatting
turbo run format:check
\`\`\`

## ESLint

\`\`\`bash
# Lint code
turbo run lint

# Check linting
turbo run lint:check
\`\`\`

## Testing

\`\`\`bash
# Run tests
turbo run test

# Coverage
turbo run test:coverage
\`\`\`

## Database

\`\`\`bash
# Generate migrations
turbo run db:generate

# Migrate database
turbo run db:migrate

# Open Studio
turbo run db:studio
\`\`\`

## Vercel

\`\`\`bash
# Deploy to Vercel
vercel
\`\`\`

## IDE

\`\`\`bash
# VS Code
code .

# VS Code Extensions
- Prettier
- ESLint
- Tailwind CSS
\`\`\`
`;

    await writeFile(path.join(projectPath, 'README.md'), readmeContent);
  }
} 