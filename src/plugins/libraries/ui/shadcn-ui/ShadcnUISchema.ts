/**
 * Shadcn/ui Schema Definitions
 * 
 * Contains all configuration schemas and parameter definitions for the Shadcn/ui plugin.
 * Based on: https://ui.shadcn.com/docs/installation
 */

import { ParameterSchema, UILibrary, ComponentOption, ThemeOption, StylingOption, ParameterGroup } from '../../../../types/plugin-interfaces.js';
import { PluginCategory } from '../../../../types/plugin.js';

export class ShadcnUISchema {
  static getParameterSchema(): ParameterSchema {
    return {
      category: PluginCategory.DESIGN_SYSTEM,
      groups: [
        { id: 'styling', name: 'Styling & Theme', description: 'Configure the look and feel of your application.', order: 1, parameters: ['style', 'baseColor', 'themeMode', 'cssVariables'] },
        { id: 'components', name: 'Default Components', description: 'Select the initial set of UI components to install.', order: 2, parameters: ['components'] },
        { id: 'features', name: 'Advanced Features', description: 'Enable extra functionality for your UI.', order: 3, parameters: ['enableAnimations'] },
      ],
      parameters: [
        {
          id: 'library',
          name: 'UI Library',
          type: 'select',
          description: 'The core UI library to use.',
          required: true,
          default: UILibrary.SHADCN_UI,
          options: [{ value: UILibrary.SHADCN_UI, label: 'Shadcn/UI', recommended: true }],
          group: 'styling'
        },
        {
          id: 'style',
          name: 'Style',
          type: 'select',
          description: 'Choose between the default and New York styles.',
          required: true,
          default: 'default',
          options: [
            { value: 'default', label: 'Default', description: 'The default, more rounded style.' },
            { value: 'new-york', label: 'New York', description: 'A more squared, modern style.' }
          ],
          group: 'styling'
        },
        {
          id: 'baseColor',
          name: 'Base Color',
          type: 'select',
          description: 'The base color used for generating the color palette.',
          required: true,
          default: 'slate',
          options: ['slate', 'gray', 'zinc', 'neutral', 'stone'].map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) })),
          group: 'styling'
        },
        {
          id: 'themeMode',
          name: 'Theme Mode',
          type: 'select',
          description: 'Configure light/dark mode support.',
          required: true,
          default: ThemeOption.AUTO,
          options: [
              { value: ThemeOption.LIGHT, label: 'Light Only' },
              { value: ThemeOption.DARK, label: 'Dark Only' },
              { value: ThemeOption.AUTO, label: 'Light & Dark (System)' }
          ],
          group: 'styling'
        },
        {
          id: 'cssVariables',
          name: 'Use CSS Variables',
          type: 'boolean',
          description: 'Use CSS variables for theming instead of Tailwind utility classes.',
          required: true,
          default: true,
          group: 'styling'
        },
        {
          id: 'components',
          name: 'Default Components',
          type: 'multiselect',
          description: 'Select the components you want to install by default.',
          required: false,
          default: [ComponentOption.BUTTON, ComponentOption.CARD],
          options: Object.values(ComponentOption).map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) })),
          group: 'components'
        },
        {
          id: 'enableAnimations',
          name: 'Enable Animations',
          type: 'boolean',
          description: 'Include `tailwindcss-animate` for animations.',
          required: true,
          default: true,
          group: 'features'
        }
      ],
      dependencies: [],
      validations: []
    };
  }

  static getUILibraries(): UILibrary[] {
    return [UILibrary.SHADCN_UI];
  }

  static getComponentOptions(): ComponentOption[] {
    return Object.values(ComponentOption);
  }
} 