import { IPlugin, PluginContext, PluginResult, PluginMetadata, PluginCategory, ValidationResult, CompatibilityMatrix, PluginRequirement, ConfigSchema, TargetPlatform, ProjectType } from '../../../types/plugin.js';
import { AgentLogger as Logger } from '../../../core/cli/logger.js';
import { CommandRunner } from '../../../core/cli/command-runner.js';
import { ConfigSchema as VitestConfigSchema } from './config.schema.js';

export class VitestPlugin implements IPlugin {
  private logger: Logger;
  private commandRunner: CommandRunner;

  constructor() {
    this.logger = new Logger(false, 'VitestPlugin');
    this.commandRunner = new CommandRunner();
  }

  getMetadata(): PluginMetadata {
    return {
      id: 'vitest',
      name: 'Vitest',
      version: '1.0.0',
      description: 'Fast unit testing framework with native TypeScript support',
      author: 'The Architech Team',
      category: PluginCategory.TESTING,
      tags: ['testing', 'vitest', 'unit', 'typescript', 'fast'],
      license: 'MIT',
      repository: 'https://github.com/architech/plugins',
      homepage: 'https://vitest.dev',
      documentation: 'https://vitest.dev/guide'
    };
  }

  async install(context: PluginContext): Promise<PluginResult> {
    try {
      this.logger.info('Installing Vitest testing plugin...');

      // Install Vitest and related packages with latest versions
      const packages = [
        'vitest@^1.0.0',
        '@vitest/ui@^1.0.0',
        '@testing-library/react@^14.0.0',
        '@testing-library/jest-dom@^6.0.0',
        '@testing-library/user-event@^14.0.0',
        'jsdom@^23.0.0',
        '@vitejs/plugin-react@^4.0.0'
      ];
      const installResult = await this.commandRunner.install(packages, true, context.projectPath);
      
      if (installResult.code !== 0) {
        return {
          success: false,
          artifacts: [],
          dependencies: [],
          scripts: [],
          configs: [],
          errors: [{
            code: 'INSTALL_FAILED',
            message: 'Failed to install Vitest packages',
            details: installResult.stderr,
            severity: 'error'
          }],
          warnings: [],
          duration: 0
        };
      }

      // Add test scripts to package.json
      const packageJsonPath = `${context.projectPath}/package.json`;
      const packageJson = require(packageJsonPath);
      
      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }
      
      packageJson.scripts.test = 'vitest';
      packageJson.scripts['test:ui'] = 'vitest --ui';
      packageJson.scripts['test:run'] = 'vitest run';
      packageJson.scripts['test:coverage'] = 'vitest run --coverage';
      packageJson.scripts['test:watch'] = 'vitest --watch';
      packageJson.scripts['test:related'] = 'vitest run --related';

      // Create improved Vitest configuration
      const vitestConfig = `import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/*.setup.*',
        '**/coverage/**',
        '**/dist/**',
        '**/.next/**',
        '**/cypress/**',
        '**/test{,s}/**',
        '**/test{,-*}.{js,cjs,mjs,ts,tsx,jsx}',
        '**/*{.,-}test.{js,cjs,mjs,ts,tsx,jsx}',
        '**/*{.,-}spec.{js,cjs,mjs,ts,tsx,jsx}',
        '**/__tests__/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*'
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
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 1000,
    isolate: true,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '~': resolve(__dirname, './')
    }
  }
});`;

      // Create improved test setup file
      const testSetup = `import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Extend expect matchers
import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);

// Mock fetch globally
global.fetch = vi.fn();

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
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

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

// Mock getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  writable: true,
  value: vi.fn(() => ({
    getPropertyValue: vi.fn(),
  })),
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
    return () => Object.assign(console, originalConsole);
  }
};`;

      // Create improved example test file
      const exampleTest = `import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Example component test
describe('Example Component', () => {
  beforeEach(() => {
    // Setup before each test
  });

  it('should render correctly', () => {
    render(<div data-testid="test-component">Hello World</div>);
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    const user = userEvent.setup();
    render(
      <button data-testid="test-button" onClick={() => alert('clicked')}>
        Click me
      </button>
    );
    
    const button = screen.getByTestId('test-button');
    await user.click(button);
    
    expect(button).toBeInTheDocument();
  });

  it('should handle async operations', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ data: 'test' }),
      })
    );
    global.fetch = mockFetch;

    // Your async test logic here
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });
});

// Example utility function test
describe('Utility Functions', () => {
  it('should add two numbers correctly', () => {
    const add = (a: number, b: number) => a + b;
    expect(add(2, 3)).toBe(5);
  });

  it('should handle edge cases', () => {
    const divide = (a: number, b: number) => {
      if (b === 0) throw new Error('Division by zero');
      return a / b;
    };
    
    expect(() => divide(1, 0)).toThrow('Division by zero');
    expect(divide(6, 2)).toBe(3);
  });
});`;

      // Create test utilities file
      const testUtils = `import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

// Custom render function with providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Test data factories
export const createMockUser = (overrides = {}) => ({
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  ...overrides,
});

export const createMockPost = (overrides = {}) => ({
  id: '1',
  title: 'Test Post',
  content: 'Test content',
  authorId: '1',
  createdAt: new Date().toISOString(),
  ...overrides,
});

// Mock API responses
export const mockApiResponses = {
  users: {
    list: [
      { id: '1', name: 'User 1', email: 'user1@example.com' },
      { id: '2', name: 'User 2', email: 'user2@example.com' },
    ],
    single: { id: '1', name: 'User 1', email: 'user1@example.com' },
  },
  posts: {
    list: [
      { id: '1', title: 'Post 1', content: 'Content 1' },
      { id: '2', title: 'Post 2', content: 'Content 2' },
    ],
    single: { id: '1', title: 'Post 1', content: 'Content 1' },
  },
};`;

      this.logger.success('Vitest testing plugin installed successfully');
      return {
        success: true,
        artifacts: [
          {
            type: 'config',
            path: 'vitest.config.ts',
            content: vitestConfig
          },
          {
            type: 'file',
            path: 'src/test/setup.ts',
            content: testSetup
          },
          {
            type: 'file',
            path: 'src/test/example.test.tsx',
            content: exampleTest
          },
          {
            type: 'file',
            path: 'src/test/utils.tsx',
            content: testUtils
          }
        ],
        dependencies: [
          {
            name: 'vitest',
            version: '^1.0.0',
            type: 'development',
            category: PluginCategory.TESTING
          },
          {
            name: '@vitest/ui',
            version: '^1.0.0',
            type: 'development',
            category: PluginCategory.TESTING
          },
          {
            name: '@testing-library/react',
            version: '^14.0.0',
            type: 'development',
            category: PluginCategory.TESTING
          },
          {
            name: '@testing-library/jest-dom',
            version: '^6.0.0',
            type: 'development',
            category: PluginCategory.TESTING
          },
          {
            name: '@testing-library/user-event',
            version: '^14.0.0',
            type: 'development',
            category: PluginCategory.TESTING
          },
          {
            name: 'jsdom',
            version: '^23.0.0',
            type: 'development',
            category: PluginCategory.TESTING
          },
          {
            name: '@vitejs/plugin-react',
            version: '^4.0.0',
            type: 'development',
            category: PluginCategory.TESTING
          }
        ],
        scripts: [
          {
            name: 'test',
            command: 'vitest',
            description: 'Run tests in watch mode',
            category: 'test'
          },
          {
            name: 'test:ui',
            command: 'vitest --ui',
            description: 'Run tests with UI',
            category: 'test'
          },
          {
            name: 'test:run',
            command: 'vitest run',
            description: 'Run tests once',
            category: 'test'
          },
          {
            name: 'test:coverage',
            command: 'vitest run --coverage',
            description: 'Run tests with coverage',
            category: 'test'
          },
          {
            name: 'test:watch',
            command: 'vitest --watch',
            description: 'Run tests in watch mode',
            category: 'test'
          },
          {
            name: 'test:related',
            command: 'vitest run --related',
            description: 'Run tests related to changed files',
            category: 'test'
          }
        ],
        configs: [
          {
            file: 'package.json',
            content: JSON.stringify(packageJson, null, 2),
            mergeStrategy: 'merge'
          }
        ],
        errors: [],
        warnings: [],
        duration: 0
      };
    } catch (error) {
      this.logger.error('Failed to install Vitest testing plugin:', error as Error);
      return {
        success: false,
        artifacts: [],
        dependencies: [],
        scripts: [],
        configs: [],
        errors: [{
          code: 'INSTALL_ERROR',
          message: 'Failed to install Vitest testing plugin',
          details: error,
          severity: 'error'
        }],
        warnings: [],
        duration: 0
      };
    }
  }

  async uninstall(context: PluginContext): Promise<PluginResult> {
    try {
      this.logger.info('Uninstalling Vitest testing plugin...');

      // Remove Vitest configuration files
      await this.commandRunner.exec('rm', ['-f', `${context.projectPath}/vitest.config.ts`]);
      await this.commandRunner.exec('rm', ['-rf', `${context.projectPath}/src/test`]);
      await this.commandRunner.exec('rm', ['-rf', `${context.projectPath}/coverage`]);

      this.logger.success('Vitest testing plugin uninstalled successfully');
      return {
        success: true,
        artifacts: [],
        dependencies: [],
        scripts: [],
        configs: [],
        errors: [],
        warnings: [],
        duration: 0
      };
    } catch (error) {
      this.logger.error('Failed to uninstall Vitest testing plugin:', error as Error);
      return {
        success: false,
        artifacts: [],
        dependencies: [],
        scripts: [],
        configs: [],
        errors: [{
          code: 'UNINSTALL_ERROR',
          message: 'Failed to uninstall Vitest testing plugin',
          details: error,
          severity: 'error'
        }],
        warnings: [],
        duration: 0
      };
    }
  }

  async update(context: PluginContext): Promise<PluginResult> {
    try {
      this.logger.info('Updating Vitest testing plugin...');

      // Update Vitest packages
      const packages = ['vitest', '@vitest/ui', '@testing-library/react', '@testing-library/jest-dom', 'jsdom'];
      const updateResult = await this.commandRunner.install(packages, true, context.projectPath);
      
      this.logger.success('Vitest testing plugin updated successfully');
      return {
        success: true,
        artifacts: [],
        dependencies: [],
        scripts: [],
        configs: [],
        errors: [],
        warnings: [],
        duration: 0
      };
    } catch (error) {
      this.logger.error('Failed to update Vitest testing plugin:', error as Error);
      return {
        success: false,
        artifacts: [],
        dependencies: [],
        scripts: [],
        configs: [],
        errors: [{
          code: 'UPDATE_ERROR',
          message: 'Failed to update Vitest testing plugin',
          details: error,
          severity: 'error'
        }],
        warnings: [],
        duration: 0
      };
    }
  }

  async validate(context: PluginContext): Promise<ValidationResult> {
    try {
      this.logger.info('Validating Vitest testing plugin...');

      // Check if vitest.config.ts exists
      const vitestConfigExists = await this.commandRunner.exec('test', ['-f', `${context.projectPath}/vitest.config.ts`]);
      if (vitestConfigExists.code !== 0) {
        return {
          valid: false,
          errors: [{
            field: 'vitest-config',
            message: 'vitest.config.ts configuration file is missing',
            code: 'CONFIG_MISSING',
            severity: 'error'
          }],
          warnings: []
        };
      }

      // Check if test setup file exists
      const testSetupExists = await this.commandRunner.exec('test', ['-f', `${context.projectPath}/src/test/setup.ts`]);
      if (testSetupExists.code !== 0) {
        return {
          valid: false,
          errors: [{
            field: 'test-setup',
            message: 'Test setup file is missing',
            code: 'SETUP_MISSING',
            severity: 'error'
          }],
          warnings: []
        };
      }

      this.logger.success('Vitest testing plugin validation passed');
      return {
        valid: true,
        errors: [],
        warnings: []
      };
    } catch (error) {
      this.logger.error('Vitest testing plugin validation failed:', error as Error);
      return {
        valid: false,
        errors: [{
          field: 'validation',
          message: `Validation failed: ${error}`,
          code: 'VALIDATION_ERROR',
          severity: 'error'
        }],
        warnings: []
      };
    }
  }

  getCompatibility(): CompatibilityMatrix {
    return {
      frameworks: [ProjectType.NEXTJS, ProjectType.REACT, ProjectType.VUE, ProjectType.SVELTE, ProjectType.NODE, ProjectType.EXPRESS],
      platforms: [TargetPlatform.WEB, TargetPlatform.SERVER],
      nodeVersions: ['16.x', '18.x', '20.x'],
      packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
      conflicts: []
    };
  }

  getDependencies(): string[] {
    return ['vitest', '@vitest/ui', '@testing-library/react', '@testing-library/jest-dom', '@testing-library/user-event', 'jsdom', '@vitejs/plugin-react'];
  }

  getConflicts(): string[] {
    return ['jest'];
  }

  getRequirements(): PluginRequirement[] {
    return [
      {
        type: 'package',
        name: 'vitest',
        description: 'Fast unit testing framework',
        version: '^1.0.0'
      },
      {
        type: 'package',
        name: '@testing-library/react',
        description: 'React testing utilities',
        version: '^14.0.0'
      }
    ];
  }

  getDefaultConfig(): Record<string, any> {
    return {
      environment: 'jsdom',
      globals: true,
      coverage: true,
      ui: false,
      userEvent: true
    };
  }

  getConfigSchema(): ConfigSchema {
    return {
      type: 'object',
      properties: {
        environment: {
          type: 'string',
          description: 'Test environment',
          enum: ['jsdom', 'node', 'happy-dom'],
          default: 'jsdom'
        },
        globals: {
          type: 'boolean',
          description: 'Enable global test functions',
          default: true
        },
        coverage: {
          type: 'boolean',
          description: 'Enable coverage reporting',
          default: true
        },
        ui: {
          type: 'boolean',
          description: 'Enable UI mode',
          default: false
        },
        userEvent: {
          type: 'boolean',
          description: 'Include user-event for interaction testing',
          default: true
        }
      },
      required: [],
      additionalProperties: false
    };
  }
}