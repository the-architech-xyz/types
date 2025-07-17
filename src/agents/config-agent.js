/**
 * Config Agent - Shared Configuration Package Generator
 * 
 * Sets up the packages/config shared configurations with:
 * - ESLint rules for TypeScript and React
 * - Prettier formatting configuration
 * - TypeScript base configuration
 * - Shared development tools
 */

import chalk from 'chalk';
import ora from 'ora';
import fsExtra from 'fs-extra';
import path from 'path';

const { writeFile, writeJSON, ensureDir } = fsExtra;

export class ConfigAgent {
  async execute(config, runner) {
    const spinner = ora({
      text: chalk.blue('⚙️  Setting up shared configuration package...'),
      color: 'blue'
    }).start();

    try {
      const projectPath = path.resolve(process.cwd(), config.projectName);
      const configPackagePath = path.join(projectPath, 'packages', 'config');
      
      // Update package.json with dependencies
      await this.updatePackageJson(configPackagePath, config);
      
      // Create ESLint configurations
      await this.createESLintConfig(configPackagePath);
      
      // Create Prettier configuration
      await this.createPrettierConfig(configPackagePath);
      
      // Create TypeScript configurations
      await this.createTypeScriptConfig(configPackagePath);
      
      // Create Tailwind configuration
      await this.createTailwindConfig(configPackagePath);
      
      // Create additional development tools
      await this.createDevTools(configPackagePath);
      
      // Create index exports
      await this.createIndex(configPackagePath);
      
      // Update web app to use shared configs
      await this.updateWebAppConfigs(projectPath, config);
      
      spinner.succeed(chalk.green('✅ Shared configuration package configured'));
      
    } catch (error) {
      spinner.fail(chalk.red('❌ Failed to configure config package'));
      throw error;
    }
  }

  async updatePackageJson(configPackagePath, config) {
    const packageJson = {
      name: `@${config.projectName}/config`,
      version: "0.1.0",
      private: true,
      description: "Shared configuration files for the monorepo",
      main: "index.js",
      scripts: {
        "lint": "echo 'Config package - no linting needed'",
        "type-check": "echo 'Config package - no type checking needed'"
      },
      dependencies: {
        "@typescript-eslint/eslint-plugin": "^6.13.0",
        "@typescript-eslint/parser": "^6.13.0",
        "eslint": "^8.54.0",
        "eslint-config-next": "^14.0.0",
        "eslint-plugin-react": "^7.33.0",
        "eslint-plugin-react-hooks": "^4.6.0",
        "eslint-plugin-import": "^2.29.0",
        "eslint-plugin-jsx-a11y": "^6.8.0",
        "prettier": "^3.1.0",
        "prettier-plugin-tailwindcss": "^0.5.7",
        "typescript": "^5.3.0"
      },
      devDependencies: {
        "@types/node": "^20.0.0"
      }
    };

    await writeJSON(path.join(configPackagePath, 'package.json'), packageJson, { spaces: 2 });
  }

  async createESLintConfig(configPackagePath) {
    // Base ESLint configuration
    const baseESLintConfig = {
      extends: [
        "next/core-web-vitals",
        "@typescript-eslint/recommended",
        "prettier"
      ],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint", "import"],
      rules: {
        // TypeScript specific rules
        "@typescript-eslint/no-unused-vars": [
          "error",
          { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
        ],
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/prefer-const": "error",
        "@typescript-eslint/no-non-null-assertion": "warn",
        
        // Import rules
        "import/order": [
          "error",
          {
            groups: [
              "builtin",
              "external", 
              "internal",
              "parent",
              "sibling",
              "index"
            ],
            "newlines-between": "always",
            alphabetize: { order: "asc", caseInsensitive: true }
          }
        ],
        "import/no-duplicates": "error",
        "import/no-unused-modules": "warn",
        
        // General rules
        "prefer-const": "error",
        "no-var": "error",
        "no-console": ["warn", { allow: ["warn", "error"] }],
        "eqeqeq": ["error", "always"]
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

    await writeJSON(path.join(configPackagePath, 'eslint-base.json'), baseESLintConfig, { spaces: 2 });

    // React-specific ESLint configuration
    const reactESLintConfig = {
      extends: ["./eslint-base.json"],
      plugins: ["react", "react-hooks", "jsx-a11y"],
      rules: {
        // React rules
        "react/react-in-jsx-scope": "off",
        "react/prop-types": "off",
        "react/no-unescaped-entities": "warn",
        "react/jsx-key": "error",
        "react/jsx-no-duplicate-props": "error",
        "react/jsx-no-undef": "error",
        "react/jsx-uses-react": "off",
        "react/jsx-uses-vars": "error",
        
        // React hooks rules
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
        
        // Accessibility rules
        "jsx-a11y/alt-text": "warn",
        "jsx-a11y/anchor-is-valid": "warn",
        "jsx-a11y/click-events-have-key-events": "warn",
        "jsx-a11y/no-static-element-interactions": "warn"
      }
    };

    await writeJSON(path.join(configPackagePath, 'eslint-react.json'), reactESLintConfig, { spaces: 2 });

    // Node.js specific ESLint configuration
    const nodeESLintConfig = {
      extends: ["./eslint-base.json"],
      env: {
        node: true,
        es2022: true
      },
      rules: {
        "no-console": "off", // Allow console in Node.js
        "@typescript-eslint/no-var-requires": "off"
      }
    };

    await writeJSON(path.join(configPackagePath, 'eslint-node.json'), nodeESLintConfig, { spaces: 2 });
  }

  async createPrettierConfig(configPackagePath) {
    const prettierConfig = {
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

    await writeJSON(path.join(configPackagePath, 'prettier.json'), prettierConfig, { spaces: 2 });

    // Create .prettierignore
    const prettierIgnore = `node_modules
.next
.turbo
out
build
dist
*.min.js
*.min.css
*.map
.env*
coverage
*.log
.DS_Store`;

    await writeFile(path.join(configPackagePath, 'prettierignore'), prettierIgnore);
  }

  async createTypeScriptConfig(configPackagePath) {
    // Base TypeScript configuration
    const baseTsConfig = {
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
        plugins: [
          {
            name: "next"
          }
        ],
        baseUrl: ".",
        paths: {
          "@/*": ["./src/*"],
          "@/ui": ["../../packages/ui"],
          "@/db": ["../../packages/db"],
          "@/auth": ["../../packages/auth"],
          "@/config": ["../../packages/config"]
        }
      },
      include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
      exclude: ["node_modules"]
    };

    await writeJSON(path.join(configPackagePath, 'tsconfig-base.json'), baseTsConfig, { spaces: 2 });

    // Next.js specific TypeScript configuration
    const nextTsConfig = {
      extends: "./tsconfig-base.json",
      compilerOptions: {
        plugins: [{ name: "next" }],
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

    await writeJSON(path.join(configPackagePath, 'tsconfig-nextjs.json'), nextTsConfig, { spaces: 2 });

    // Package TypeScript configuration
    const packageTsConfig = {
      extends: "./tsconfig-base.json",
      compilerOptions: {
        outDir: "dist",
        rootDir: "src",
        declaration: true,
        declarationMap: true,
        noEmit: false
      },
      include: ["src/**/*"],
      exclude: ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
    };

    await writeJSON(path.join(configPackagePath, 'tsconfig-package.json'), packageTsConfig, { spaces: 2 });
  }

  async createTailwindConfig(configPackagePath) {
    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}`;

    await writeFile(path.join(configPackagePath, 'tailwind-base.js'), tailwindConfig);
  }

  async createDevTools(configPackagePath) {
    // Create GitHub workflow template
    await ensureDir(path.join(configPackagePath, 'github'));
    
    const workflowTemplate = `name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Type check
      run: npm run type-check
    
    - name: Lint
      run: npm run lint
    
    - name: Format check
      run: npm run format:check
    
    - name: Build
      run: npm run build`;

    await writeFile(path.join(configPackagePath, 'github', 'ci.yml'), workflowTemplate);

    // Create VS Code settings
    await ensureDir(path.join(configPackagePath, 'vscode'));
    
    const vscodeSettings = {
      "typescript.preferences.importModuleSpecifier": "relative",
      "editor.formatOnSave": true,
      "editor.defaultFormatter": "esbenp.prettier-vscode",
      "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true,
        "source.organizeImports": true
      },
      "files.associations": {
        "*.css": "tailwindcss"
      },
      "emmet.includeLanguages": {
        "javascript": "javascriptreact"
      },
      "tailwindCSS.includeLanguages": {
        "javascript": "javascript",
        "html": "HTML"
      }
    };

    await writeJSON(path.join(configPackagePath, 'vscode', 'settings.json'), vscodeSettings, { spaces: 2 });

    const vscodeExtensions = {
      recommendations: [
        "esbenp.prettier-vscode",
        "dbaeumer.vscode-eslint",
        "bradlc.vscode-tailwindcss",
        "ms-vscode.vscode-typescript-next",
        "formulahendry.auto-rename-tag",
        "christian-kohler.path-intellisense"
      ]
    };

    await writeJSON(path.join(configPackagePath, 'vscode', 'extensions.json'), vscodeExtensions, { spaces: 2 });
  }

  async updateWebAppConfigs(projectPath, config) {
    const webAppPath = path.join(projectPath, 'apps', 'web');
    
    // Update web app's ESLint config
    const webEslintConfig = {
      extends: [`@${config.projectName}/config/eslint-react`]
    };
    
    await writeJSON(path.join(webAppPath, '.eslintrc.json'), webEslintConfig, { spaces: 2 });

    // Update web app's Prettier config
    const webPrettierConfig = `"@${config.projectName}/config/prettier.json"`;
    await writeFile(path.join(webAppPath, '.prettierrc'), webPrettierConfig);

    // Update web app's TypeScript config
    const webTsConfig = {
      extends: `@${config.projectName}/config/tsconfig-nextjs`
    };
    
    await writeJSON(path.join(webAppPath, 'tsconfig.json'), webTsConfig, { spaces: 2 });
  }

  async createIndex(configPackagePath) {
    const indexContent = `// Export configuration objects for programmatic use
export { default as eslintBase } from './eslint-base.json';
export { default as eslintReact } from './eslint-react.json';
export { default as eslintNode } from './eslint-node.json';
export { default as prettier } from './prettier.json';
export { default as tsConfigBase } from './tsconfig-base.json';
export { default as tsConfigNextjs } from './tsconfig-nextjs.json';
export { default as tsConfigPackage } from './tsconfig-package.json';`;

    await writeFile(path.join(configPackagePath, 'index.ts'), indexContent);
  }
} 