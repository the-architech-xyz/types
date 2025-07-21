import { PluginCategory, TargetPlatform, ProjectType } from '../../../types/plugin.js';
import { AgentLogger as Logger } from '../../../core/cli/logger.js';
import { CommandRunner } from '../../../core/cli/command-runner.js';
export class VitestPlugin {
    logger;
    commandRunner;
    constructor() {
        this.logger = new Logger(false, 'VitestPlugin');
        this.commandRunner = new CommandRunner();
    }
    getMetadata() {
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
    async install(context) {
        try {
            this.logger.info('Installing Vitest testing plugin...');
            // Install Vitest and related packages
            const packages = ['vitest', '@vitest/ui', '@testing-library/react', '@testing-library/jest-dom', 'jsdom'];
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
            // Create Vitest configuration
            const vitestConfig = `import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/*.setup.*'
      ]
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});`;
            // Create test setup file
            const testSetup = `import '@testing-library/jest-dom';
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

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});`;
            // Create example test file
            const exampleTest = `import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Example Test', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });

  it('should render component', () => {
    render(<div data-testid="test-component">Hello World</div>);
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
  });
});`;
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
                    }
                ],
                dependencies: [
                    {
                        name: 'vitest',
                        version: 'latest',
                        type: 'development',
                        category: PluginCategory.TESTING
                    },
                    {
                        name: '@vitest/ui',
                        version: 'latest',
                        type: 'development',
                        category: PluginCategory.TESTING
                    },
                    {
                        name: '@testing-library/react',
                        version: 'latest',
                        type: 'development',
                        category: PluginCategory.TESTING
                    },
                    {
                        name: '@testing-library/jest-dom',
                        version: 'latest',
                        type: 'development',
                        category: PluginCategory.TESTING
                    },
                    {
                        name: 'jsdom',
                        version: 'latest',
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
        }
        catch (error) {
            this.logger.error('Failed to install Vitest testing plugin:', error);
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
    async uninstall(context) {
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
        }
        catch (error) {
            this.logger.error('Failed to uninstall Vitest testing plugin:', error);
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
    async update(context) {
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
        }
        catch (error) {
            this.logger.error('Failed to update Vitest testing plugin:', error);
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
    async validate(context) {
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
        }
        catch (error) {
            this.logger.error('Vitest testing plugin validation failed:', error);
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
    getCompatibility() {
        return {
            frameworks: [ProjectType.NEXTJS, ProjectType.REACT, ProjectType.VUE, ProjectType.SVELTE, ProjectType.NODE, ProjectType.EXPRESS],
            platforms: [TargetPlatform.WEB, TargetPlatform.SERVER],
            nodeVersions: ['16.x', '18.x', '20.x'],
            packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
            conflicts: []
        };
    }
    getDependencies() {
        return ['vitest', '@vitest/ui', '@testing-library/react', '@testing-library/jest-dom', 'jsdom'];
    }
    getConflicts() {
        return ['jest'];
    }
    getRequirements() {
        return [
            {
                type: 'package',
                name: 'vitest',
                description: 'Fast unit testing framework',
                version: 'latest'
            },
            {
                type: 'package',
                name: '@testing-library/react',
                description: 'React testing utilities',
                version: 'latest'
            }
        ];
    }
    getDefaultConfig() {
        return {
            environment: 'jsdom',
            globals: true,
            coverage: true,
            ui: false
        };
    }
    getConfigSchema() {
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
                }
            },
            required: [],
            additionalProperties: false
        };
    }
}
//# sourceMappingURL=vitest.plugin.js.map