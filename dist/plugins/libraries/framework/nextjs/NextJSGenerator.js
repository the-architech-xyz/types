export class NextJSGenerator {
    generateAllFiles(config) {
        return [
            this.generateNextConfig(config),
            this.generatePackageJson(config),
            this.generateTsConfig(config),
            this.generateTailwindConfig(config),
            this.generateESLintConfig(config),
            this.generateReadme(config)
        ];
    }
    generateNextConfig(config) {
        const content = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: ${config.appRouter || true},
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  ${config.importAlias ? `
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };
    return config;
  },` : ''}
};

module.exports = nextConfig;
`;
        return { path: 'next.config.js', content };
    }
    generatePackageJson(config) {
        const content = `{
  "name": "nextjs-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    ${config.typescript ? '"@types/node": "^20.0.0",' : ''}
    ${config.typescript ? '"@types/react": "^18.0.0",' : ''}
    ${config.typescript ? '"@types/react-dom": "^18.0.0",' : ''}
    ${config.eslint ? '"eslint": "^8.0.0",' : ''}
    ${config.eslint ? '"eslint-config-next": "^14.0.0",' : ''}
    ${config.tailwind ? '"tailwindcss": "^3.0.0",' : ''}
    ${config.tailwind ? '"autoprefixer": "^10.0.0",' : ''}
    ${config.tailwind ? '"postcss": "^8.0.0"' : ''}
  }
}`;
        return { path: 'package.json', content };
    }
    generateTsConfig(config) {
        if (!config.typescript) {
            return { path: 'tsconfig.json', content: '// TypeScript disabled' };
        }
        const content = `{
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
    ${config.importAlias ? `
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }` : ''}
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`;
        return { path: 'tsconfig.json', content };
    }
    generateTailwindConfig(config) {
        if (!config.tailwind) {
            return { path: 'tailwind.config.js', content: '// Tailwind CSS disabled' };
        }
        const content = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}`;
        return { path: 'tailwind.config.js', content };
    }
    generateESLintConfig(config) {
        if (!config.eslint) {
            return { path: '.eslintrc.json', content: '// ESLint disabled' };
        }
        const content = `{
  "extends": ["next/core-web-vitals"]
}`;
        return { path: '.eslintrc.json', content };
    }
    generateReadme(config) {
        const content = `# Next.js Application

This is a [Next.js](https://nextjs.org/) project bootstrapped with \`create-next-app\`.

## Getting Started

First, run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

${config.typescript ? '- ✅ TypeScript support' : '- ❌ TypeScript disabled'}
${config.appRouter ? '- ✅ App Router' : '- ❌ Pages Router'}
${config.tailwind ? '- ✅ Tailwind CSS' : '- ❌ Tailwind CSS disabled'}
${config.eslint ? '- ✅ ESLint configuration' : '- ❌ ESLint disabled'}
${config.srcDir ? '- ✅ src/ directory structure' : '- ❌ Root directory structure'}

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.
`;
        return { path: 'README.md', content };
    }
    generateScripts(config) {
        const scripts = {
            'dev': 'next dev',
            'build': 'next build',
            'start': 'next start',
            'lint': 'next lint'
        };
        if (config.typescript) {
            scripts['type-check'] = 'tsc --noEmit';
        }
        return scripts;
    }
    generateEnvConfig(config) {
        return {
            'NEXT_PUBLIC_APP_NAME': 'Next.js App',
            'NEXT_PUBLIC_APP_URL': 'http://localhost:3000'
        };
    }
}
//# sourceMappingURL=NextJSGenerator.js.map