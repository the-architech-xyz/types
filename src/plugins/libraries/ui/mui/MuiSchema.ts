/**
 * Material-UI (MUI) Schema Definitions
 * 
 * Contains all configuration schemas and parameter definitions for the MUI plugin.
 * Based on: https://mui.com/getting-started/installation
 */

import { ConfigSchema } from '../../../../types/plugin.js';

export interface MuiConfig {
  theme: 'light' | 'dark' | 'system';
  colorPrimary: string;
  colorSecondary: string;
  enableEmotion: boolean;
  enableStyledComponents: boolean;
  enableIcons: boolean;
  enableAnimations: boolean;
  enableRTL: boolean;
  enableTypeScript: boolean;
  enableReact: boolean;
  enableNextJS: boolean;
  enableVue: boolean;
  enableSvelte: boolean;
  enableAngular: boolean;
  components: string[];
  enableCustomTheme: boolean;
  enableThemeTokens: boolean;
  enableResponsiveDesign: boolean;
  enableAccessibility: boolean;
  enablePerformance: boolean;
  enableSSR: boolean;
}

export const MuiConfigSchema: ConfigSchema = {
  type: 'object',
  properties: {
    theme: {
      type: 'string',
      enum: ['light', 'dark', 'system'],
      description: 'Default theme mode',
      default: 'light'
    },
    colorPrimary: {
      type: 'string',
      description: 'Primary color for the theme',
      default: '#1976d2'
    },
    colorSecondary: {
      type: 'string',
      description: 'Secondary color for the theme',
      default: '#dc004e'
    },
    enableEmotion: {
      type: 'boolean',
      description: 'Enable Emotion CSS-in-JS',
      default: true
    },
    enableStyledComponents: {
      type: 'boolean',
      description: 'Enable styled-components support',
      default: false
    },
    enableIcons: {
      type: 'boolean',
      description: 'Enable Material Icons',
      default: true
    },
    enableAnimations: {
      type: 'boolean',
      description: 'Enable animation utilities',
      default: true
    },
    enableRTL: {
      type: 'boolean',
      description: 'Enable RTL support',
      default: false
    },
    enableTypeScript: {
      type: 'boolean',
      description: 'Enable TypeScript support',
      default: true
    },
    enableReact: {
      type: 'boolean',
      description: 'Enable React components',
      default: true
    },
    enableNextJS: {
      type: 'boolean',
      description: 'Enable Next.js integration',
      default: false
    },
    enableVue: {
      type: 'boolean',
      description: 'Enable Vue components',
      default: false
    },
    enableSvelte: {
      type: 'boolean',
      description: 'Enable Svelte components',
      default: false
    },
    enableAngular: {
      type: 'boolean',
      description: 'Enable Angular components',
      default: false
    },
    components: {
      type: 'array',
      items: { 
        type: 'string',
        description: 'Component name to install'
      },
      description: 'Components to install',
      default: ['Button', 'TextField', 'Card', 'Typography', 'Box', 'Stack', 'Grid', 'AppBar', 'Drawer']
    },
    enableCustomTheme: {
      type: 'boolean',
      description: 'Enable custom theme configuration',
      default: false
    },
    enableThemeTokens: {
      type: 'boolean',
      description: 'Enable theme tokens',
      default: true
    },
    enableResponsiveDesign: {
      type: 'boolean',
      description: 'Enable responsive design utilities',
      default: true
    },
    enableAccessibility: {
      type: 'boolean',
      description: 'Enable accessibility features',
      default: true
    },
    enablePerformance: {
      type: 'boolean',
      description: 'Enable performance optimizations',
      default: true
    },
    enableSSR: {
      type: 'boolean',
      description: 'Enable server-side rendering support',
      default: true
    }
  },
  required: ['theme', 'colorPrimary', 'colorSecondary']
};

export const MuiDefaultConfig: MuiConfig = {
  theme: 'light',
  colorPrimary: '#1976d2',
  colorSecondary: '#dc004e',
  enableEmotion: true,
  enableStyledComponents: false,
  enableIcons: true,
  enableAnimations: true,
  enableRTL: false,
  enableTypeScript: true,
  enableReact: true,
  enableNextJS: false,
  enableVue: false,
  enableSvelte: false,
  enableAngular: false,
  components: ['Button', 'TextField', 'Card', 'Typography', 'Box', 'Stack', 'Grid', 'AppBar', 'Drawer'],
  enableCustomTheme: false,
  enableThemeTokens: true,
  enableResponsiveDesign: true,
  enableAccessibility: true,
  enablePerformance: true,
  enableSSR: true
}; 