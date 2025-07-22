import { ConfigSchema } from '../../../types/plugin.js';

export interface TamaguiConfig {
  theme: 'light' | 'dark' | 'system';
  colorMode: 'light' | 'dark' | 'system';
  enableAnimations: boolean;
  enableRTL: boolean;
  enableCSSReset: boolean;
  enableColorMode: boolean;
  enableUniversalComponents: boolean;
  enableDesignTokens: boolean;
  enableResponsiveDesign: boolean;
  enableAccessibility: boolean;
  enablePerformanceOptimization: boolean;
  enableTreeShaking: boolean;
  enableHotReload: boolean;
  enableTypeScript: boolean;
  enableStorybook: boolean;
  enableTesting: boolean;
  enableDocumentation: boolean;
  enableExamples: boolean;
  enableTemplates: boolean;
  enablePlugins: boolean;
}

export const TamaguiConfigSchema: ConfigSchema = {
  type: 'object',
  properties: {
    theme: {
      type: 'string',
      description: 'Theme to use (light, dark, system)',
      default: 'light',
      enum: ['light', 'dark', 'system']
    },
    colorMode: {
      type: 'string',
      description: 'Default color mode',
      default: 'light',
      enum: ['light', 'dark', 'system']
    },
    enableAnimations: {
      type: 'boolean',
      description: 'Enable animations and transitions',
      default: true
    },
    enableRTL: {
      type: 'boolean',
      description: 'Enable right-to-left support',
      default: false
    },
    enableCSSReset: {
      type: 'boolean',
      description: 'Enable CSS reset',
      default: true
    },
    enableColorMode: {
      type: 'boolean',
      description: 'Enable color mode switching',
      default: true
    },
    enableUniversalComponents: {
      type: 'boolean',
      description: 'Enable universal components for React Native and Web',
      default: true
    },
    enableDesignTokens: {
      type: 'boolean',
      description: 'Enable design tokens and theming',
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
    enablePerformanceOptimization: {
      type: 'boolean',
      description: 'Enable performance optimizations',
      default: true
    },
    enableTreeShaking: {
      type: 'boolean',
      description: 'Enable tree shaking for smaller bundles',
      default: true
    },
    enableHotReload: {
      type: 'boolean',
      description: 'Enable hot reload for development',
      default: true
    },
    enableTypeScript: {
      type: 'boolean',
      description: 'Enable TypeScript support',
      default: true
    },
    enableStorybook: {
      type: 'boolean',
      description: 'Enable Storybook for component development',
      default: true
    },
    enableTesting: {
      type: 'boolean',
      description: 'Enable testing utilities',
      default: true
    },
    enableDocumentation: {
      type: 'boolean',
      description: 'Enable documentation generation',
      default: true
    },
    enableExamples: {
      type: 'boolean',
      description: 'Enable example components',
      default: true
    },
    enableTemplates: {
      type: 'boolean',
      description: 'Enable component templates',
      default: true
    },
    enablePlugins: {
      type: 'boolean',
      description: 'Enable Tamagui plugins',
      default: true
    }
  },
  required: ['theme', 'colorMode'],
  additionalProperties: false
};

export const TamaguiDefaultConfig: TamaguiConfig = {
  theme: 'light',
  colorMode: 'light',
  enableAnimations: true,
  enableRTL: false,
  enableCSSReset: true,
  enableColorMode: true,
  enableUniversalComponents: true,
  enableDesignTokens: true,
  enableResponsiveDesign: true,
  enableAccessibility: true,
  enablePerformanceOptimization: true,
  enableTreeShaking: true,
  enableHotReload: true,
  enableTypeScript: true,
  enableStorybook: true,
  enableTesting: true,
  enableDocumentation: true,
  enableExamples: true,
  enableTemplates: true,
  enablePlugins: true
}; 