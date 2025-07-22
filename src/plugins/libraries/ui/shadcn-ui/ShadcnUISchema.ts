/**
 * Shadcn/ui Schema Definitions
 * 
 * Contains all configuration schemas and parameter definitions for the Shadcn/ui plugin.
 * Based on: https://ui.shadcn.com/docs/installation
 */

import { ConfigSchema } from '../../../../types/plugin.js';

export interface ShadcnUIConfig {
  style: 'default' | 'new-york';
  baseColor: 'slate' | 'gray' | 'zinc' | 'neutral' | 'stone' | 'red' | 'orange' | 'green' | 'blue' | 'yellow' | 'violet';
  cssVariables: boolean;
  tailwindCSS: boolean;
  components: string[];
  enableAnimations: boolean;
  enableDarkMode: boolean;
  enableRTL: boolean;
  enableCustomCSS: boolean;
  enableTypeScript: boolean;
  enableReact: boolean;
  enableVue: boolean;
  enableSvelte: boolean;
  enableAngular: boolean;
}

export const ShadcnUIConfigSchema: ConfigSchema = {
  type: 'object',
  properties: {
    style: {
      type: 'string',
      enum: ['default', 'new-york'],
      description: 'Shadcn/ui style variant',
      default: 'default'
    },
    baseColor: {
      type: 'string',
      enum: ['slate', 'gray', 'zinc', 'neutral', 'stone', 'red', 'orange', 'green', 'blue', 'yellow', 'violet'],
      description: 'Base color for the design system',
      default: 'slate'
    },
    cssVariables: {
      type: 'boolean',
      description: 'Enable CSS variables for theming',
      default: true
    },
    tailwindCSS: {
      type: 'boolean',
      description: 'Enable Tailwind CSS integration',
      default: true
    },
    components: {
      type: 'array',
      items: { 
        type: 'string',
        description: 'Component name to install'
      },
      description: 'Components to install',
      default: ['button', 'card', 'input', 'label', 'form', 'dialog']
    },
    enableAnimations: {
      type: 'boolean',
      description: 'Enable animation utilities',
      default: true
    },
    enableDarkMode: {
      type: 'boolean',
      description: 'Enable dark mode support',
      default: true
    },
    enableRTL: {
      type: 'boolean',
      description: 'Enable RTL support',
      default: false
    },
    enableCustomCSS: {
      type: 'boolean',
      description: 'Enable custom CSS utilities',
      default: true
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
    }
  },
  required: ['style', 'baseColor']
};

export const ShadcnUIDefaultConfig: ShadcnUIConfig = {
  style: 'default',
  baseColor: 'slate',
  cssVariables: true,
  tailwindCSS: true,
  components: ['button', 'card', 'input', 'label', 'form', 'dialog'],
  enableAnimations: true,
  enableDarkMode: true,
  enableRTL: false,
  enableCustomCSS: true,
  enableTypeScript: true,
  enableReact: true,
  enableVue: false,
  enableSvelte: false,
  enableAngular: false
}; 