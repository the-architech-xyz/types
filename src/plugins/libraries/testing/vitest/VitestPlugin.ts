import { BaseTestingPlugin } from '../../../base/index.js';
import { PluginContext, PluginResult, PluginMetadata, PluginCategory } from '../../../../types/plugin.js';
import { UIPluginConfig, TestingFramework, TestType, CoverageOption, ParameterSchema, UnifiedInterfaceTemplate } from '../../../../types/plugin-interfaces.js';
import { VitestSchema } from './VitestSchema.js';
import { VitestGenerator } from './VitestGenerator.js';

export class VitestPlugin extends BaseTestingPlugin {
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
  // ABSTRACT METHOD IMPLEMENTATIONS
  // ============================================================================

  getParameterSchema(): ParameterSchema {
    return VitestSchema.getParameterSchema();
  }

  getTestingFrameworks(): TestingFramework[] {
    return [TestingFramework.VITEST];
  }

  getTestTypes(): TestType[] {
    return [
      { name: 'Unit Tests', value: 'unit', description: 'Test individual functions and components' },
      { name: 'Integration Tests', value: 'integration', description: 'Test how components work together' },
      { name: 'E2E Tests', value: 'e2e', description: 'Test complete user workflows' }
    ];
  }

  getCoverageOptions(): CoverageOption[] {
    return [
      { name: 'Enable Coverage', value: true, description: 'Generate coverage reports', type: 'boolean' },
      { name: 'Coverage Threshold', value: 80, description: 'Minimum coverage percentage', type: 'number' }
    ];
  }

  generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate {
    return {
        category: PluginCategory.TESTING,
        exports: [], types: [], utilities: [], constants: [],
        documentation: 'Vitest testing framework integration',
    };
  }
  
  // ============================================================================
  // MAIN INSTALL METHOD
  // ============================================================================

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    const config = context.pluginConfig as UIPluginConfig;

    try {
      // 1. Generate all file contents
      const allFiles = this.generator.generateAllFiles(config);
      
      // 2. Use BasePlugin methods to write files
      for (const file of allFiles) {
        const filePath = this.pathResolver.getConfigPath(file.path);
        await this.generateFile(filePath, file.content);
      }

      // 3. Add dependencies
      await this.installDependencies(
        ['vitest'],
        ['@vitest/ui', '@vitest/coverage-v8']
      );

      // 4. Add scripts
      await this.addScripts({
        "test": "vitest",
        "test:ui": "vitest --ui",
        "test:coverage": "vitest --coverage"
      });

      return this.createSuccessResult([], [], [], [], [], startTime);

    } catch (error: any) {
      return this.createErrorResult('Vitest installation failed', [error], startTime);
    }
  }
} 