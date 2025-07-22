import { NextJSConfig } from './NextJSSchema.js';

export class NextJSGenerator {
  static generateNextConfig(config: NextJSConfig): string {
    const version = config.version || '15';
    const appRouter = config.appRouter !== false;
    const typescript = config.typescript !== false;
    const eslint = config.eslint !== false;
    const tailwind = config.tailwind !== false;
    const sass = config.sass || false;
    const less = config.less || false;
    const styledComponents = config.styledComponents || false;
    const emotion = config.emotion || false;
    const mdx = config.mdx || false;
    const pwa = config.pwa || false;
    const i18n = config.i18n || false;
    const docker = config.docker || false;
    
    return `/** @type {import('next').NextConfig} */
const nextConfig = {
  // React strict mode for better development experience
  reactStrictMode: true,
  
  // Enable SWC minification for better performance
  swcMinify: true,
  
  // Experimental features
  experimental: {
    ${appRouter ? `
    // App Router features
    appDir: true,
    serverComponentsExternalPackages: [],
    ` : ''}
    ${typescript ? `
    // TypeScript features
    typedRoutes: true,
    ` : ''}
  },
  
  // Image optimization
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/old-page',
        destination: '/new-page',
        permanent: true,
      },
    ];
  },
  
  // Rewrites
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  
  ${i18n ? `
  // Internationalization
  i18n: {
    locales: ['en', 'es', 'fr'],
    defaultLocale: 'en',
  },
  ` : ''}
  
  ${pwa ? `
  // PWA configuration
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
  },
  ` : ''}
  
  ${docker ? `
  // Docker configuration
  output: 'standalone',
  ` : ''}
};

module.exports = nextConfig;
`;
  }

  static generatePackageJson(config: NextJSConfig): string {
    const version = config.version || '15';
    const typescript = config.typescript !== false;
    const eslint = config.eslint !== false;
    const tailwind = config.tailwind !== false;
    const postcss = config.postcss !== false;
    const sass = config.sass || false;
    const less = config.less || false;
    const styledComponents = config.styledComponents || false;
    const emotion = config.emotion || false;
    const mdx = config.mdx || false;
    const testing = config.testing !== false;
    const storybook = config.storybook || false;
    
    const dependencies: Record<string, string> = {
      'next': `^${version}.0.0`,
      'react': '^18.0.0',
      'react-dom': '^18.0.0'
    };
    
    const devDependencies: Record<string, string> = {};
    
    if (typescript) {
      devDependencies['typescript'] = '^5.0.0';
      devDependencies['@types/node'] = '^20.0.0';
      devDependencies['@types/react'] = '^18.0.0';
      devDependencies['@types/react-dom'] = '^18.0.0';
    }
    
    if (eslint) {
      devDependencies['eslint'] = '^8.0.0';
      devDependencies['eslint-config-next'] = `^${version}.0.0`;
    }
    
    if (tailwind) {
      devDependencies['tailwindcss'] = '^3.3.0';
      devDependencies['autoprefixer'] = '^10.4.0';
    }
    
    if (postcss) {
      devDependencies['postcss'] = '^8.4.0';
    }
    
    if (sass) {
      devDependencies['sass'] = '^1.60.0';
    }
    
    if (less) {
      devDependencies['less'] = '^4.1.0';
      devDependencies['@zeit/next-less'] = '^2.0.0';
    }
    
    if (styledComponents) {
      dependencies['styled-components'] = '^6.0.0';
      devDependencies['@types/styled-components'] = '^5.1.0';
    }
    
    if (emotion) {
      dependencies['@emotion/react'] = '^11.11.0';
      dependencies['@emotion/styled'] = '^11.11.0';
    }
    
    if (mdx) {
      dependencies['@next/mdx'] = `^${version}.0.0`;
      dependencies['@mdx-js/loader'] = '^2.3.0';
      dependencies['@mdx-js/react'] = '^2.3.0';
    }
    
    if (testing) {
      devDependencies['jest'] = '^29.0.0';
      devDependencies['@testing-library/react'] = '^13.0.0';
      devDependencies['@testing-library/jest-dom'] = '^5.16.0';
    }
    
    if (storybook) {
      devDependencies['@storybook/react'] = '^7.0.0';
      devDependencies['@storybook/addon-essentials'] = '^7.0.0';
      devDependencies['@storybook/addon-interactions'] = '^7.0.0';
      devDependencies['@storybook/testing-library'] = '^0.2.0';
    }
    
    return JSON.stringify({
      name: 'nextjs-app',
      version: '0.1.0',
      private: true,
      scripts: {
        'dev': 'next dev',
        'build': 'next build',
        'start': 'next start',
        'lint': 'next lint',
        ...(testing && {
          'test': 'jest',
          'test:watch': 'jest --watch'
        }),
        ...(storybook && {
          'storybook': 'storybook dev -p 6006',
          'build-storybook': 'storybook build'
        })
      },
      dependencies,
      devDependencies
    }, null, 2);
  }

  static generateTsConfig(config: NextJSConfig): string {
    const version = config.version || '15';
    
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
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/styles/*": ["./src/styles/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`;
  }

  static generateTailwindConfig(config: NextJSConfig): string {
    return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        chart: {
          '1': 'var(--chart-1)',
          '2': 'var(--chart-2)',
          '3': 'var(--chart-3)',
          '4': 'var(--chart-4)',
          '5': 'var(--chart-5)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}`;
  }

  static generatePostCSSConfig(config: NextJSConfig): string {
    return `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
  }

  static generateESLintConfig(config: NextJSConfig): string {
    const version = config.version || '15';
    
    return `module.exports = {
  extends: [
    'next/core-web-vitals',
    'next/typescript',
  ],
  rules: {
    // Add custom rules here
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
  },
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'out/',
    'dist/',
    'build/',
  ],
}`;
  }

  static generateAppLayout(config: NextJSConfig): string {
    const tailwind = config.tailwind !== false;
    
    return `import type { Metadata } from 'next'
${tailwind ? `import './globals.css'` : ''}

export const metadata: Metadata = {
  title: 'Next.js App',
  description: 'Generated by The Architech',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  )
}`;
  }

  static generateAppPage(config: NextJSConfig): string {
    return `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">Welcome to Next.js</h1>
        <p className="text-lg text-muted-foreground">
          Generated by The Architech
        </p>
      </div>
    </main>
  )
}`;
  }

  static generateGlobalsCSS(config: NextJSConfig): string {
    return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}`;
  }

  static generateEnvConfig(config: NextJSConfig): string {
    return `# Next.js Configuration
NEXT_PUBLIC_APP_NAME="Next.js App"
NEXT_PUBLIC_APP_VERSION="${config.version || '15'}"
NEXT_PUBLIC_APP_ENV="development"

# Database Configuration
${config.database !== 'none' ? `
DATABASE_URL="your-database-url-here"
DATABASE_TYPE="${config.database}"
` : ''}

# Authentication Configuration
${config.authentication !== 'none' ? `
AUTH_SECRET="your-auth-secret-here"
AUTH_TYPE="${config.authentication}"
` : ''}

# API Configuration
${config.api !== 'none' ? `
API_BASE_URL="http://localhost:3000/api"
API_TYPE="${config.api}"
` : ''}

# Monitoring Configuration
${config.monitoring !== 'none' ? `
MONITORING_TYPE="${config.monitoring}"
` : ''}

# Email Configuration
${config.email !== 'none' ? `
EMAIL_PROVIDER="${config.email}"
EMAIL_FROM="noreply@example.com"
` : ''}

# Payment Configuration
${config.payment !== 'none' ? `
PAYMENT_PROVIDER="${config.payment}"
` : ''}

# File Storage Configuration
${config.fileStorage !== 'none' ? `
STORAGE_PROVIDER="${config.fileStorage}"
` : ''}
`;
  }
} 