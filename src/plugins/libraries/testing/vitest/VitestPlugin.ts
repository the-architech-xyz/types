import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginContext, PluginResult, PluginMetadata, PluginCategory, IUITestingPlugin, UnifiedInterfaceTemplate } from '../../../../types/plugins.js';
import { VitestSchema } from './VitestSchema.js';
import { VitestGenerator } from './VitestGenerator.js';

export class VitestPlugin extends BasePlugin implements IUITestingPlugin {
  private generator: VitestGenerator;

  constructor() {
    super();
    this.generator = new VitestGenerator();
  }

  // ============================================================================
  // METADATA
  // ============================================================================

  getMetadata(): PluginMetadata {
    return {
      id: 'vitest',
      name: 'Vitest',
      version: '1.0.0',
      description: 'Fast unit test framework powered by Vite',
      author: 'The Architech Team',
      category: PluginCategory.TESTING,
      tags: ['testing', 'unit', 'vitest', 'vite'],
      license: 'MIT',
    };
  }
  
  // ============================================================================
  // ENHANCED PLUGIN INTERFACE IMPLEMENTATION
  // ============================================================================

  getParameterSchema() {
    return VitestSchema.getParameterSchema();
  }

  // Plugins NEVER generate questions - agents handle this
  getDynamicQuestions(context: PluginContext): any[] {
    return [];
  }

  validateConfiguration(config: Record<string, any>): any {
    const errors: any[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!config.testTypes || config.testTypes.length === 0) {
      errors.push({
        field: 'testTypes',
        message: 'At least one test type is required',
        code: 'MISSING_FIELD',
        severity: 'error'
      });
    }

    // Validate coverage threshold
    if (config.coverage && config.coverageThreshold && (config.coverageThreshold < 0 || config.coverageThreshold > 100)) {
      warnings.push('Coverage threshold should be between 0 and 100');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate {
    return {
      category: PluginCategory.TESTING,
      exports: [
        {
          name: 'describe',
          type: 'function',
          implementation: 'Test suite function',
          documentation: 'Define a test suite',
          examples: ['describe("MyComponent", () => {})']
        },
        {
          name: 'it',
          type: 'function',
          implementation: 'Test case function',
          documentation: 'Define a test case',
          examples: ['it("should render correctly", () => {})']
        },
        {
          name: 'expect',
          type: 'function',
          implementation: 'Assertion function',
          documentation: 'Make assertions in tests',
          examples: ['expect(element).toBeInTheDocument()']
        }
      ],
      types: [
        {
          name: 'TestConfig',
          type: 'interface',
          definition: 'interface TestConfig { coverage?: boolean; threshold?: number; }',
          documentation: 'Test configuration interface'
        }
      ],
      utilities: [
        {
          name: 'render',
          type: 'function',
          implementation: 'Component render utility',
          documentation: 'Render React components for testing',
          parameters: [],
          returnType: 'RenderResult',
          examples: ['const { getByText } = render(<MyComponent />)']
        }
      ],
      constants: [
        {
          name: 'TEST_TIMEOUT',
          value: '5000',
          documentation: 'Default test timeout in milliseconds',
          type: 'number'
        }
      ],
      documentation: 'Vitest testing framework integration'
    };
  }

  // ============================================================================
  // TESTING PLUGIN INTERFACE IMPLEMENTATION
  // ============================================================================

  getTestingFrameworks(): string[] {
    return ['vitest'];
  }

  getTestTypes(): string[] {
    return ['unit', 'integration', 'e2e'];
  }

  getCoverageOptions(): string[] {
    return ['coverage', 'threshold', 'reports'];
  }

  getEnvironmentOptions(): string[] {
    return ['jsdom', 'node', 'happy-dom'];
  }

  // ============================================================================
  // PLUGIN INSTALLATION
  // ============================================================================

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();

    try {
      // Initialize path resolver
      this.initializePathResolver(context);

      // Get configuration from context
      const config = context.pluginConfig;

      // Validate configuration
      const validation = this.validateConfiguration(config);
      if (!validation.valid) {
        return this.createErrorResult('Configuration validation failed', validation.errors, startTime);
      }

      // Install dependencies
      const dependencies = this.getDependencies();
      const devDependencies = this.getDevDependencies();
      await this.installDependencies(dependencies, devDependencies);

      // Generate files
      const allFiles = this.generator.generateAllFiles(config as any);
      for (const file of allFiles) {
        const filePath = this.pathResolver.getConfigPath(file.path);
        await this.generateFile(filePath, file.content);
      }

      // Add scripts
      await this.addScripts({
        "test": "vitest",
        "test:ui": "vitest --ui",
        "test:coverage": "vitest --coverage"
      });

      return this.createSuccessResult(
        [
          { type: 'config', path: 'vitest.config.ts', description: 'Vitest configuration' },
          { type: 'config', path: 'coverage.config.js', description: 'Coverage configuration' },
          { type: 'interface', path: this.pathResolver.getUnifiedInterfacePath('testing'), description: 'Unified testing interface' }
        ],
        dependencies,
        ['test', 'test:ui', 'test:coverage'],
        [],
        validation.warnings,
        startTime
      );

    } catch (error) {
      return this.createErrorResult('Vitest plugin installation failed', [error], startTime);
    }
  }

  // ============================================================================
  // DEPENDENCIES AND CONFIGURATION
  // ============================================================================

  getDependencies(): string[] {
    return ['vitest'];
  }

  getDevDependencies(): string[] {
    return ['@vitest/ui', '@vitest/coverage-v8', '@testing-library/react', '@testing-library/jest-dom'];
  }

  getCompatibility(): any {
    return {
      frameworks: ['react', 'vue', 'svelte', 'nextjs'],
      platforms: ['node', 'browser'],
      nodeVersions: ['>=16.0.0'],
      packageManagers: ['npm', 'yarn', 'pnpm'],
      conflicts: ['jest', 'mocha']
    };
  }

  getConflicts(): string[] {
    return ['jest', 'mocha'];
  }

  getRequirements(): any[] {
    return [
      { type: 'node', version: '>=16.0.0' },
      { type: 'framework', name: 'React, Vue, or Svelte' }
    ];
  }

  getDefaultConfig(): Record<string, any> {
    return {
      testTypes: ['unit'],
      coverage: true,
      coverageThreshold: 80
    };
  }

  getConfigSchema(): any {
    return {
      type: 'object',
      properties: {
        testTypes: { type: 'array', items: { type: 'string' } },
        coverage: { type: 'boolean' },
        coverageThreshold: { type: 'number' }
      },
      required: ['testTypes']
    };
  }
} 