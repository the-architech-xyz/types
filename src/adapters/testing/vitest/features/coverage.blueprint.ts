/**
 * Vitest Coverage Feature Blueprint
 * 
 * Adds comprehensive code coverage reporting
 */

import { Blueprint } from '../../../../types/adapter.js';

const coverageBlueprint: Blueprint = {
  id: 'vitest-coverage',
  name: 'Vitest Code Coverage',
  actions: [
    {
      type: 'RUN_COMMAND',
      command: 'npm install -D @vitest/coverage-v8 @vitest/coverage-c8'
    },
    {
      type: 'ADD_CONTENT',
      target: 'vitest.config.ts',
      content: `/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: '{{module.parameters.environment}}',
    setupFiles: ['./src/test/setup.ts'],
    {{#if module.parameters.watch}}
    watch: true,
    {{/if}}
    coverage: {
      provider: 'v8',
      reporter: {{module.parameters.reports}},
      threshold: {
        global: {
          branches: {{module.parameters.threshold}},
          functions: {{module.parameters.threshold}},
          lines: {{module.parameters.threshold}},
          statements: {{module.parameters.threshold}}
        }
      },
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/dist/**',
        '**/.{idea,git,cache,output,temp}/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})`
    },
    {
      type: 'ADD_CONTENT',
      target: '.gitignore',
      content: `# Coverage reports
coverage/
*.lcov
.nyc_output/`
    },
    {
      type: 'ADD_CONTENT',
      target: 'src/__tests__/coverage.test.ts',
      content: `import { describe, it, expect } from 'vitest'

describe('Coverage Example', () => {
  it('should calculate coverage correctly', () => {
    const result = calculateSum(2, 3)
    expect(result).toBe(5)
  })

  it('should handle edge cases', () => {
    const result = calculateSum(0, 0)
    expect(result).toBe(0)
  })
})

// Helper function to test coverage
function calculateSum(a: number, b: number): number {
  if (a < 0 || b < 0) {
    throw new Error('Negative numbers not allowed')
  }
  return a + b
}`
    }
  ]
};
export default coverageBlueprint;
