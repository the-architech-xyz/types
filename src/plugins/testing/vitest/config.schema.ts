export interface ConfigSchema {
  environment?: 'jsdom' | 'node' | 'happy-dom';
  globals?: boolean;
  coverage?: boolean;
  ui?: boolean;
} 