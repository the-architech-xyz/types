/**
 * Vitest Schema Definitions
 * 
 * Contains all configuration schemas and parameter definitions for the Vitest plugin.
 * Based on: https://vitest.dev/
 */

import { ParameterSchema, ParameterGroup, ParameterDependency, ParameterCondition } from '../../../../types/plugins.js';
import { PluginCategory } from '../../../../types/plugins.js';
import { TESTING_FRAMEWORKS, TestingFramework } from '../../../../types/core.js';

export class VitestSchema {
  static getParameterSchema(): ParameterSchema {
    return {
      category: PluginCategory.TESTING,
      groups: [
        { id: 'framework', name: 'Framework Configuration', description: 'Configure the testing framework.', order: 1, parameters: ['framework'] },
        { id: 'features', name: 'Testing Features', description: 'Enable additional testing features.', order: 2, parameters: ['coverage', 'ui', 'parallel'] },
        { id: 'environment', name: 'Test Environment', description: 'Configure the test environment.', order: 3, parameters: ['environment'] },
      ],
      parameters: [
        {
          id: 'framework',
          name: 'Testing Framework',
          type: 'select',
          description: 'Select the testing framework to use.',
          required: true,
          default: TESTING_FRAMEWORKS.VITEST,
          options: [{ value: TESTING_FRAMEWORKS.VITEST, label: 'Vitest', recommended: true }],
          group: 'framework'
        },
        {
          id: 'coverage',
          name: 'Code Coverage',
          type: 'boolean',
          description: 'Enable code coverage reporting.',
          required: true,
          default: true,
          group: 'features'
        },
        {
          id: 'ui',
          name: 'UI Testing',
          type: 'boolean',
          description: 'Enable Vitest UI for visual testing.',
          required: true,
          default: false,
          group: 'features'
        },
        {
          id: 'parallel',
          name: 'Parallel Execution',
          type: 'boolean',
          description: 'Run tests in parallel for faster execution.',
          required: true,
          default: true,
          group: 'features'
        },
        {
          id: 'environment',
          name: 'Test Environment',
          type: 'select',
          description: 'Select the test environment.',
          required: true,
          default: 'jsdom',
          options: [
            { value: 'jsdom', label: 'jsdom', description: 'Browser-like environment' },
            { value: 'happy-dom', label: 'happy-dom', description: 'Lightweight DOM implementation' },
            { value: 'node', label: 'Node.js', description: 'Node.js environment' }
          ],
          group: 'environment'
        }
      ],
      dependencies: [],
      validations: []
    };
  }

  static getTestingFrameworks(): TestingFramework[] {
    return [TESTING_FRAMEWORKS.VITEST];
  }
} 