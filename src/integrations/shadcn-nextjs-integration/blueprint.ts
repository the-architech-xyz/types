import { Blueprint } from '../../types/adapter.js';

export const blueprint: Blueprint = {
  id: 'shadcn-nextjs-integration',
  name: 'Shadcn Next.js Integration',
  description: 'Complete Next.js integration for Shadcn/ui',
  version: '1.0.0',
  actions: [
    // Install Shadcn packages
    {
      type: 'INSTALL_PACKAGES',
      packages: ['@radix-ui/react-slot', 'class-variance-authority', 'clsx', 'tailwind-merge'],
      isDev: false
    },
    // Enhance Tailwind config using modifier
    {
      type: 'ENHANCE_FILE',
      path: 'tailwind.config.js',
      modifier: 'tailwind-config-enhancer',
      params: {
        plugins: ['tailwindcss-animate'],
        content: [
          './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
          './src/components/**/*.{js,ts,jsx,tsx,mdx}',
          './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        ],
        theme: {
          extend: {
            borderRadius: {
              lg: 'var(--radius)',
              md: 'calc(var(--radius) - 2px)',
              sm: 'calc(var(--radius) - 4px)',
            },
            colors: {
              background: 'hsl(var(--background))',
              foreground: 'hsl(var(--foreground))',
              card: {
                DEFAULT: 'hsl(var(--card))',
                foreground: 'hsl(var(--card-foreground))',
              },
              popover: {
                DEFAULT: 'hsl(var(--popover))',
                foreground: 'hsl(var(--popover-foreground))',
              },
        primary: {
                DEFAULT: 'hsl(var(--primary))',
                foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
                DEFAULT: 'hsl(var(--secondary))',
                foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
                DEFAULT: 'hsl(var(--muted))',
                foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
                DEFAULT: 'hsl(var(--accent))',
                foreground: 'hsl(var(--accent-foreground))',
              },
              destructive: {
                DEFAULT: 'hsl(var(--destructive))',
                foreground: 'hsl(var(--destructive-foreground))',
              },
              border: 'hsl(var(--border))',
              input: 'hsl(var(--input))',
              ring: 'hsl(var(--ring))',
              chart: {
                '1': 'hsl(var(--chart-1))',
                '2': 'hsl(var(--chart-2))',
                '3': 'hsl(var(--chart-3))',
                '4': 'hsl(var(--chart-4))',
                '5': 'hsl(var(--chart-5))',
              },
            },
          },
        },
      }
    },
    // Enhance TypeScript config using modifier
    {
      type: 'ENHANCE_FILE',
      path: 'tsconfig.json',
      modifier: 'tsconfig-enhancer',
      params: {
        compilerOptions: {
          baseUrl: '.',
          paths: {
            '@/*': ['./src/*']
          }
        }
      }
    }
  ]
};