import { UIPluginConfig } from '../../../../types/plugins.js'; // Assuming testing config will be similar to UI

export interface GeneratedFile {
    path: string;
    content: string;
}

export class VitestGenerator {

  generateAllFiles(config: UIPluginConfig): GeneratedFile[] {
    return [
      this.generateVitestConfig(config),
      this.generateSetupFile(config),
      this.generateTestExample(config),
      this.generateReadme(),
      this.generateGitIgnore(),
    ];
  }

  generateVitestConfig(config: UIPluginConfig): GeneratedFile {
    const content = `import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: ${(config as any).globals},
    environment: '${(config as any).environment}',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    }
  },
});
`;
    return { path: 'vitest.config.ts', content };
  }

  generateSetupFile(config: UIPluginConfig): GeneratedFile {
    const content = `import '@testing-library/jest-dom';
import { vi } from 'vitest';
global.fetch = vi.fn();
`;
    return { path: 'test/setup.ts', content };
  }

  generateTestExample(config: UIPluginConfig): GeneratedFile {
    const content = `import { describe, it, expect } from 'vitest';
describe('Example Test', () => {
  it('should pass', () => {
    expect(1 + 1).toBe(2);
  });
});
`;
    return { path: 'test/example.test.tsx', content };
  }
  
  generateReadme(): GeneratedFile {
    const content = `# Vitest Testing Setup
This project uses Vitest for fast unit testing.
- \`npm run test\` - Run tests in watch mode
- \`npm run test:ui\` - Open Vitest UI
- \`npm run test:coverage\` - Run tests with coverage
`;
    return { path: 'test/README.md', content };
  }

  generateGitIgnore(): GeneratedFile {
    const content = `
# Vitest
coverage/
.vitest/
`;
    return { path: '.gitignore', content };
  }

  generateScripts(config: UIPluginConfig): Record<string, string> {
    const scripts: Record<string, string> = {
      'test': 'vitest',
      'test:run': 'vitest run',
    };
    if ((config as any).features.ui) {
      scripts['test:ui'] = 'vitest --ui';
    }
    if ((config as any).features.coverage) {
      scripts['test:coverage'] = 'vitest run --coverage';
    }
    return scripts;
  }
} 