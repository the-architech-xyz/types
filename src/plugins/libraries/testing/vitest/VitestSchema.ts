import { ConfigSchema } from '../../../../types/plugin.js';

export interface VitestConfig {
  environment: 'jsdom' | 'node' | 'happy-dom' | 'edge-runtime';
  globals: boolean;
  coverage: boolean;
  ui: boolean;
  setupFiles: string[];
  include: string[];
  exclude: string[];
  reporters: string[];
  testTimeout: number;
  hookTimeout: number;
  pool: 'threads' | 'forks' | 'vmThreads';
  poolOptions: {
    threads: {
      singleThread: boolean;
      maxThreads: number;
      minThreads: number;
    };
  };
  isolate: boolean;
  browser: boolean;
  api: boolean;
  css: boolean;
  deps: {
    inline: string[];
    external: string[];
  };
  serverDeps: {
    inline: string[];
  };
  define: Record<string, any>;
  alias: Record<string, string>;
  resolve: {
    conditions: string[];
  };
  optimizeDeps: {
    include: string[];
    exclude: string[];
  };
  ssr: {
    noExternal: string[];
    external: string[];
  };
  worker: {
    plugins: string[];
  };
  appType: 'spa' | 'mpa' | 'custom';
  base: string;
  build: {
    target: string;
    outDir: string;
    assetsDir: string;
    sourcemap: boolean;
    minify: boolean;
    rollupOptions: Record<string, any>;
  };
  preview: {
    port: number;
    host: string;
    strictPort: boolean;
  };
  devServer: {
    port: number;
    host: string;
    strictPort: boolean;
    https: boolean;
    open: boolean;
    cors: boolean;
  };
}

export const VitestConfigSchema: ConfigSchema = {
  type: 'object',
  properties: {
    environment: {
      type: 'string',
      description: 'Test environment to use',
      default: 'jsdom',
      enum: ['jsdom', 'node', 'happy-dom', 'edge-runtime']
    },
    globals: {
      type: 'boolean',
      description: 'Enable global test functions',
      default: true
    },
    coverage: {
      type: 'boolean',
      description: 'Enable code coverage',
      default: true
    },
    ui: {
      type: 'boolean',
      description: 'Enable Vitest UI',
      default: true
    },
    setupFiles: {
      type: 'array',
      description: 'Setup files to run before tests',
      items: {
        type: 'string',
        description: 'Setup file path'
      },
      default: ['./src/test/setup.ts']
    },
    include: {
      type: 'array',
      description: 'Test files to include',
      items: {
        type: 'string',
        description: 'Test file pattern'
      },
      default: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}']
    },
    exclude: {
      type: 'array',
      description: 'Files to exclude from testing',
      items: {
        type: 'string',
        description: 'Exclude pattern'
      },
      default: [
        '**/node_modules/**',
        '**/dist/**',
        '**/cypress/**',
        '**/.{idea,git,cache,output,temp}/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*'
      ]
    },
    reporters: {
      type: 'array',
      description: 'Test reporters to use',
      items: {
        type: 'string',
        description: 'Reporter name',
        enum: ['default', 'verbose', 'dot', 'junit', 'json', 'html', 'text']
      },
      default: ['default', 'html']
    },
    testTimeout: {
      type: 'number',
      description: 'Test timeout in milliseconds',
      default: 5000
    },
    hookTimeout: {
      type: 'number',
      description: 'Hook timeout in milliseconds',
      default: 10000
    },
    pool: {
      type: 'string',
      description: 'Test pool type',
      default: 'threads',
      enum: ['threads', 'forks', 'vmThreads']
    },
    isolate: {
      type: 'boolean',
      description: 'Isolate test environment',
      default: true
    },
    browser: {
      type: 'boolean',
      description: 'Enable browser testing',
      default: false
    },
    api: {
      type: 'boolean',
      description: 'Enable API testing',
      default: false
    },
    css: {
      type: 'boolean',
      description: 'Enable CSS testing',
      default: false
    }
  },
  required: ['environment'],
  additionalProperties: false
};

export const VitestDefaultConfig: VitestConfig = {
  environment: 'jsdom',
  globals: true,
  coverage: true,
  ui: true,
  setupFiles: ['./src/test/setup.ts'],
  include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  exclude: [
    '**/node_modules/**',
    '**/dist/**',
    '**/cypress/**',
    '**/.{idea,git,cache,output,temp}/**',
    '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*'
  ],
  reporters: ['default', 'html'],
  testTimeout: 5000,
  hookTimeout: 10000,
  pool: 'threads',
  poolOptions: {
    threads: {
      singleThread: false,
      maxThreads: 4,
      minThreads: 1
    }
  },
  isolate: true,
  browser: false,
  api: false,
  css: false,
  deps: {
    inline: [],
    external: []
  },
  serverDeps: {
    inline: []
  },
  define: {},
  alias: {},
  resolve: {
    conditions: []
  },
  optimizeDeps: {
    include: [],
    exclude: []
  },
  ssr: {
    noExternal: [],
    external: []
  },
  worker: {
    plugins: []
  },
  appType: 'spa',
  base: '/',
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: false,
    rollupOptions: {}
  },
  preview: {
    port: 4173,
    host: 'localhost',
    strictPort: false
  },
  devServer: {
    port: 3000,
    host: 'localhost',
    strictPort: false,
    https: false,
    open: false,
    cors: false
  }
}; 