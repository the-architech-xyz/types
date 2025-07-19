/**
 * Next.js Framework Plugin
 *
 * Provides Next.js framework setup and configuration.
 * Handles project structure, routing, and Next.js-specific features.
 */
import { PluginCategory, TargetPlatform } from '../../types/plugin.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { templateService } from '../../utils/template-service.js';
export class NextJSPlugin {
    templateService;
    constructor() {
        this.templateService = templateService;
    }
    // ============================================================================
    // PLUGIN METADATA
    // ============================================================================
    getMetadata() {
        return {
            id: 'nextjs',
            name: 'Next.js Framework',
            version: '1.0.0',
            description: 'React framework for production with App Router, Server Components, and TypeScript',
            author: 'The Architech Team',
            category: PluginCategory.FRAMEWORK,
            tags: ['react', 'nextjs', 'typescript', 'app-router', 'server-components'],
            license: 'MIT',
            repository: 'https://github.com/architech/nextjs-plugin',
            homepage: 'https://nextjs.org',
            documentation: 'https://nextjs.org/docs'
        };
    }
    // ============================================================================
    // PLUGIN LIFECYCLE
    // ============================================================================
    async install(context) {
        const startTime = Date.now();
        try {
            const validation = await this.validate(context);
            if (!validation.valid) {
                return this.createErrorResult('Plugin validation failed', startTime, validation.errors);
            }
            // Create project structure
            await this.createProjectStructure(context);
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: [
                    {
                        type: 'file',
                        path: 'next.config.js',
                        content: 'Next.js configuration file'
                    },
                    {
                        type: 'file',
                        path: 'tsconfig.json',
                        content: 'TypeScript configuration'
                    },
                    {
                        type: 'file',
                        path: '.eslintrc.json',
                        content: 'ESLint configuration'
                    }
                ],
                dependencies: [
                    {
                        name: 'next',
                        version: '^14.0.0',
                        type: 'production',
                        category: PluginCategory.FRAMEWORK
                    },
                    {
                        name: 'react',
                        version: '^18.0.0',
                        type: 'production',
                        category: PluginCategory.FRAMEWORK
                    },
                    {
                        name: 'react-dom',
                        version: '^18.0.0',
                        type: 'production',
                        category: PluginCategory.FRAMEWORK
                    },
                    {
                        name: '@types/react',
                        version: '^18.0.0',
                        type: 'development',
                        category: PluginCategory.FRAMEWORK
                    },
                    {
                        name: '@types/react-dom',
                        version: '^18.0.0',
                        type: 'development',
                        category: PluginCategory.FRAMEWORK
                    },
                    {
                        name: '@types/node',
                        version: '^20.0.0',
                        type: 'development',
                        category: PluginCategory.FRAMEWORK
                    },
                    {
                        name: 'typescript',
                        version: '^5.0.0',
                        type: 'development',
                        category: PluginCategory.FRAMEWORK
                    },
                    {
                        name: 'eslint',
                        version: '^8.0.0',
                        type: 'development',
                        category: PluginCategory.FRAMEWORK
                    },
                    {
                        name: 'eslint-config-next',
                        version: '^14.0.0',
                        type: 'development',
                        category: PluginCategory.FRAMEWORK
                    }
                ],
                scripts: [
                    {
                        name: 'dev',
                        command: 'next dev',
                        description: 'Start development server',
                        category: 'dev'
                    },
                    {
                        name: 'build',
                        command: 'next build',
                        description: 'Build for production',
                        category: 'build'
                    },
                    {
                        name: 'start',
                        command: 'next start',
                        description: 'Start production server',
                        category: 'deploy'
                    },
                    {
                        name: 'lint',
                        command: 'next lint',
                        description: 'Run ESLint',
                        category: 'dev'
                    },
                    {
                        name: 'type-check',
                        command: 'tsc --noEmit',
                        description: 'Run TypeScript type checking',
                        category: 'dev'
                    }
                ],
                configs: [],
                errors: [],
                warnings: [],
                duration
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return this.createErrorResult(`Failed to setup Next.js: ${errorMessage}`, startTime, [], error);
        }
    }
    async uninstall(context) {
        const startTime = Date.now();
        try {
            // Remove Next.js specific files
            const filesToRemove = [
                'next.config.js',
                'tsconfig.json',
                '.eslintrc.json',
                'src/app',
                'src/pages',
                'src/styles'
            ];
            for (const file of filesToRemove) {
                const filePath = path.join(context.projectPath, file);
                if (fsExtra.existsSync(filePath)) {
                    await fsExtra.remove(filePath);
                }
            }
            return {
                success: true,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [],
                warnings: [],
                duration: Date.now() - startTime
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return this.createErrorResult(`Failed to uninstall Next.js: ${errorMessage}`, startTime, [], error);
        }
    }
    async update(context) {
        return this.install(context);
    }
    // ============================================================================
    // VALIDATION & COMPATIBILITY
    // ============================================================================
    async validate(context) {
        const errors = [];
        const warnings = [];
        // Check if project directory exists
        if (!fsExtra.existsSync(context.projectPath)) {
            errors.push({
                field: 'projectPath',
                message: `Project directory does not exist: ${context.projectPath}`,
                code: 'DIRECTORY_NOT_FOUND',
                severity: 'error'
            });
        }
        // Check for conflicting frameworks
        const packageJsonPath = path.join(context.projectPath, 'package.json');
        if (fsExtra.existsSync(packageJsonPath)) {
            const packageJson = await fsExtra.readJSON(packageJsonPath);
            const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
            if (dependencies['vue']) {
                warnings.push('Vue.js detected - consider using only one framework');
            }
            if (dependencies['angular']) {
                warnings.push('Angular detected - consider using only one framework');
            }
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    getCompatibility() {
        return {
            frameworks: ['react'],
            platforms: [TargetPlatform.WEB, TargetPlatform.SERVER],
            nodeVersions: ['18.0.0', '20.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm'],
            conflicts: ['vue', 'angular', 'svelte']
        };
    }
    getDependencies() {
        return [];
    }
    getConflicts() {
        return ['vue', 'angular', 'svelte'];
    }
    getRequirements() {
        return [
            {
                type: 'package',
                name: 'next',
                version: '^14.0.0',
                description: 'Next.js framework'
            },
            {
                type: 'package',
                name: 'react',
                version: '^18.0.0',
                description: 'React library'
            },
            {
                type: 'package',
                name: 'react-dom',
                version: '^18.0.0',
                description: 'React DOM'
            },
            {
                type: 'package',
                name: 'typescript',
                version: '^5.0.0',
                description: 'TypeScript support'
            }
        ];
    }
    getDefaultConfig() {
        return {
            appRouter: true,
            strictMode: true,
            swcMinify: true,
            typescript: true,
            eslint: true
        };
    }
    getConfigSchema() {
        return {
            type: 'object',
            properties: {
                appRouter: {
                    type: 'boolean',
                    description: 'Use App Router instead of Pages Router'
                },
                strictMode: {
                    type: 'boolean',
                    description: 'Enable React Strict Mode'
                },
                swcMinify: {
                    type: 'boolean',
                    description: 'Use SWC for minification'
                },
                typescript: {
                    type: 'boolean',
                    description: 'Enable TypeScript support'
                },
                eslint: {
                    type: 'boolean',
                    description: 'Enable ESLint configuration'
                }
            }
        };
    }
    // ============================================================================
    // TECHNOLOGY IMPLEMENTATION
    // ============================================================================
    async createProjectStructure(context) {
        const useAppRouter = context.pluginConfig.appRouter !== false;
        // Create Next.js configuration
        const nextConfig = this.generateNextConfig(context);
        await fsExtra.writeFile(path.join(context.projectPath, 'next.config.js'), nextConfig);
        // Create TypeScript configuration
        const tsConfig = this.generateTsConfig(context);
        await fsExtra.writeFile(path.join(context.projectPath, 'tsconfig.json'), tsConfig);
        // Create ESLint configuration
        const eslintConfig = this.generateEslintConfig(context);
        await fsExtra.writeFile(path.join(context.projectPath, '.eslintrc.json'), eslintConfig);
        // Create project structure
        const projectStructure = this.generateProjectStructure(context);
        for (const [filePath, content] of Object.entries(projectStructure)) {
            const fullPath = path.join(context.projectPath, filePath);
            await fsExtra.ensureDir(path.dirname(fullPath));
            await fsExtra.writeFile(fullPath, content);
        }
    }
    generateNextConfig(context) {
        const config = context.pluginConfig;
        return `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: ${config.appRouter || true},
  },
  reactStrictMode: ${config.strictMode !== false},
  swcMinify: ${config.swcMinify !== false},
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    domains: [],
  },
  env: {
    CUSTOM_KEY: 'your-value',
  },
};

module.exports = nextConfig;
`;
    }
    generateTsConfig(context) {
        return `{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`;
    }
    generateEslintConfig(context) {
        return `{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "@next/next/no-img-element": "off",
    "react/no-unescaped-entities": "off"
  }
}`;
    }
    generateProjectStructure(context) {
        const useAppRouter = context.pluginConfig.appRouter !== false;
        if (useAppRouter) {
            return {
                'src/app/layout.tsx': `import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '${context.projectName}',
  description: 'Generated by The Architech',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}`,
                'src/app/page.tsx': `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">
          Welcome to ${context.projectName}
        </h1>
        <p className="text-lg text-gray-600">
          Generated with The Architech
        </p>
      </div>
    </main>
  );
}`,
                'src/app/globals.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}`,
                'src/app/favicon.ico': '',
                'public/next.svg': '',
                'public/vercel.svg': ''
            };
        }
        else {
            return {
                'src/pages/_app.tsx': `import type { AppProps } from 'next/app';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}`,
                'src/pages/_document.tsx': `import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}`,
                'src/pages/index.tsx': `import type { NextPage } from 'next';
import Head from 'next/head';

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>${context.projectName}</title>
        <meta name="description" content="Generated by The Architech" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Welcome to ${context.projectName}</h1>
        <p>Generated with The Architech</p>
      </main>
    </div>
  );
};

export default Home;`,
                'src/styles/globals.css': `@tailwind base;
@tailwind components;
@tailwind utilities;`
            };
        }
    }
    createErrorResult(message, startTime, errors = [], originalError) {
        return {
            success: false,
            artifacts: [],
            dependencies: [],
            scripts: [],
            configs: [],
            errors: [
                {
                    code: 'NEXTJS_ERROR',
                    message,
                    details: originalError,
                    severity: 'error'
                },
                ...errors
            ],
            warnings: [],
            duration: Date.now() - startTime
        };
    }
}
//# sourceMappingURL=nextjs-plugin.js.map