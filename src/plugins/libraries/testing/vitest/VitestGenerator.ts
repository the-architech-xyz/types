import { VitestConfig } from './VitestSchema.js';

export class VitestGenerator {
  static generateVitestConfig(config: VitestConfig): string {
    const environment = config.environment || 'jsdom';
    const globals = config.globals !== false;
    const coverage = config.coverage !== false;
    const ui = config.ui !== false;
    const setupFiles = config.setupFiles || ['./src/test/setup.ts'];
    const include = config.include || ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'];
    const exclude = config.exclude || [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*'
    ];
    const reporters = config.reporters || ['default', 'html'];
    const testTimeout = config.testTimeout || 5000;
    const hookTimeout = config.hookTimeout || 10000;
    const pool = config.pool || 'threads';
    const isolate = config.isolate !== false;
    const browser = config.browser || false;
    const api = config.api || false;
    const css = config.css || false;
    
    return `import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: ${globals},
    environment: '${environment}',
    setupFiles: ${JSON.stringify(setupFiles)},
    include: ${JSON.stringify(include)},
    exclude: ${JSON.stringify(exclude)},
    reporters: ${JSON.stringify(reporters)},
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/test/**',
        '**/tests/**',
        '**/__tests__/**',
        '**/*.test.*',
        '**/*.spec.*'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    testTimeout: ${testTimeout},
    hookTimeout: ${hookTimeout},
    pool: '${pool}',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1
      }
    },
    isolate: ${isolate},
    ${browser ? `
    browser: {
      enabled: true,
      name: 'chrome',
      headless: true
    },
    ` : ''}
    ${api ? `
    api: {
      port: 3001
    },
    ` : ''}
    ${css ? `
    css: true,
    ` : ''}
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/lib': resolve(__dirname, './src/lib'),
      '@/types': resolve(__dirname, './src/types'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/hooks': resolve(__dirname, './src/hooks'),
      '@/styles': resolve(__dirname, './src/styles')
    }
  },
  ${ui ? `
  // Vitest UI configuration
  server: {
    port: 51204,
    strictPort: true
  }
  ` : ''}
});
`;
  }

  static generateSetupFile(config: VitestConfig): string {
    const environment = config.environment || 'jsdom';
    
    return `// Vitest setup file
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock fetch globally
global.fetch = vi.fn();

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
  }),
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
  vi.clearAllTimers();
});

// Global test utilities
global.testUtils = {
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  mockConsole: () => {
    const originalConsole = { ...console };
    const mockConsole = {
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
    };
    Object.assign(console, mockConsole);
    return {
      mockConsole,
      restore: () => Object.assign(console, originalConsole),
    };
  },
};
`;
  }

  static generateTestExample(config: VitestConfig): string {
    return `import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  beforeEach(() => {
    // Setup before each test
  });

  it('renders button with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

// Example API test
describe('API Tests', () => {
  it('fetches data successfully', async () => {
    const mockData = { id: 1, name: 'Test' };
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const response = await fetch('/api/test');
    const data = await response.json();

    expect(data).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith('/api/test');
  });

  it('handles fetch errors', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

    await expect(fetch('/api/test')).rejects.toThrow('Network error');
  });
});

// Example utility function test
describe('Utility Functions', () => {
  it('formats date correctly', () => {
    const date = new Date('2023-01-01');
    const formatted = date.toLocaleDateString('en-US');
    expect(formatted).toBe('1/1/2023');
  });

  it('validates email format', () => {
    const isValidEmail = (email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
  });
});
`;
  }

  static generatePackageJson(config: VitestConfig): string {
    const ui = config.ui !== false;
    const coverage = config.coverage !== false;
    const browser = config.browser || false;
    
    const dependencies: Record<string, string> = {
      'vitest': '^1.0.0',
      '@testing-library/react': '^14.0.0',
      '@testing-library/jest-dom': '^6.0.0',
      '@testing-library/user-event': '^14.0.0',
      'jsdom': '^23.0.0',
      '@vitejs/plugin-react': '^4.0.0'
    };
    
    if (ui) {
      dependencies['@vitest/ui'] = '^1.0.0';
    }
    
    if (coverage) {
      dependencies['@vitest/coverage-v8'] = '^1.0.0';
    }
    
    if (browser) {
      dependencies['@vitest/browser'] = '^1.0.0';
    }
    
    return JSON.stringify({
      name: 'vitest-testing',
      version: '0.1.0',
      private: true,
      scripts: {
        'test': 'vitest',
        'test:ui': 'vitest --ui',
        'test:run': 'vitest run',
        'test:coverage': 'vitest run --coverage',
        'test:watch': 'vitest --watch',
        'test:related': 'vitest run --related',
        'test:update': 'vitest -u'
      },
      dependencies
    }, null, 2);
  }

  static generateEnvConfig(config: VitestConfig): string {
    return `# Vitest Configuration
VITEST_ENVIRONMENT="${config.environment || 'jsdom'}"
VITEST_GLOBALS="${config.globals !== false ? 'true' : 'false'}"
VITEST_COVERAGE="${config.coverage !== false ? 'true' : 'false'}"
VITEST_UI="${config.ui !== false ? 'true' : 'false'}"

# Test Configuration
TEST_TIMEOUT="${config.testTimeout || 5000}"
HOOK_TIMEOUT="${config.hookTimeout || 10000}"
TEST_POOL="${config.pool || 'threads'}"

# Browser Testing
${config.browser ? `
VITEST_BROWSER="true"
BROWSER_NAME="chrome"
BROWSER_HEADLESS="true"
` : ''}

# API Testing
${config.api ? `
VITEST_API="true"
API_PORT="3001"
` : ''}

# CSS Testing
${config.css ? `
VITEST_CSS="true"
` : ''}
`;
  }

  static generateGitIgnore(): string {
    return `# Vitest
coverage/
.nyc_output/
.vitest/
test-results/
playwright-report/
playwright/.cache/

# Test artifacts
*.lcov
*.log
*.tmp
*.temp

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
`;
  }

  static generateReadme(): string {
    return `# Vitest Testing Setup

This project uses Vitest for fast unit testing with native TypeScript support.

## Available Scripts

- \`npm run test\` - Run tests in watch mode
- \`npm run test:ui\` - Open Vitest UI for interactive testing
- \`npm run test:run\` - Run tests once
- \`npm run test:coverage\` - Run tests with coverage report
- \`npm run test:watch\` - Run tests in watch mode
- \`npm run test:related\` - Run tests related to changed files
- \`npm run test:update\` - Update test snapshots

## Test Structure

- Test files should be named \`*.test.ts\` or \`*.spec.ts\`
- Tests are located in the same directory as the source files
- Setup file: \`src/test/setup.ts\`

## Writing Tests

\`\`\`typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
\`\`\`

## Configuration

The Vitest configuration is in \`vitest.config.ts\`. Key features:

- React testing with jsdom environment
- TypeScript support
- Path aliases configured
- Coverage reporting
- UI for interactive testing

## Best Practices

1. Use descriptive test names
2. Test one thing per test
3. Use setup and teardown appropriately
4. Mock external dependencies
5. Test both success and error cases
6. Use accessibility queries when testing UI components
`;
  }
} 