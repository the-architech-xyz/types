import { ParameterSchema, UILibrary, ComponentOption, ThemeOption, StylingOption, ParameterGroup } from '../../../../types/plugin-interfaces.js';
import { PluginCategory } from '../../../../types/plugin.js';

export class MuiSchema {
  static getParameterSchema(): ParameterSchema {
    return {
      category: PluginCategory.UI_LIBRARY,
      groups: [
        { id: 'core', name: 'Core Configuration', description: 'Configure the main MUI settings.', order: 1, parameters: ['theme', 'components'] },
        { id: 'styling', name: 'Styling Options', description: 'Configure styling and theming options.', order: 2, parameters: ['customTheme', 'cssBaseline'] },
        { id: 'features', name: 'Features', description: 'Enable additional MUI features.', order: 3, parameters: ['datePickers', 'dataGrid', 'charts'] },
      ],
      parameters: [
        {
          id: 'theme',
          name: 'Theme Mode',
          type: 'select',
          description: 'Choose the default theme mode for your application.',
          required: true,
          default: ThemeOption.LIGHT,
          options: [
            { value: ThemeOption.LIGHT, label: 'Light', description: 'Light theme for bright environments' },
            { value: ThemeOption.DARK, label: 'Dark', description: 'Dark theme for low-light environments' },
            { value: ThemeOption.AUTO, label: 'Auto', description: 'Automatically switch based on system preference' }
          ],
          group: 'core'
        },
        {
          id: 'components',
          name: 'Components',
          type: 'multiselect',
          description: 'Select the MUI components to include in your project.',
          required: true,
          default: [ComponentOption.BUTTON, ComponentOption.CARD, ComponentOption.INPUT, ComponentOption.FORM],
          options: [
            { value: ComponentOption.BUTTON, label: 'Button', description: 'Interactive buttons with various styles' },
            { value: ComponentOption.CARD, label: 'Card', description: 'Content containers with elevation' },
            { value: ComponentOption.INPUT, label: 'Input', description: 'Form input components' },
            { value: ComponentOption.FORM, label: 'Form', description: 'Form layout and validation components' },
            { value: ComponentOption.MODAL, label: 'Modal', description: 'Dialog and modal components' },
            { value: ComponentOption.TABLE, label: 'Table', description: 'Data table components' },
            { value: ComponentOption.NAVIGATION, label: 'Navigation', description: 'Menu and navigation components' },
            { value: ComponentOption.SELECT, label: 'Select', description: 'Dropdown and select components' },
            { value: ComponentOption.CHECKBOX, label: 'Checkbox', description: 'Checkbox and radio components' },
            { value: ComponentOption.SWITCH, label: 'Switch', description: 'Toggle switch components' },
            { value: ComponentOption.BADGE, label: 'Badge', description: 'Notification badge components' },
            { value: ComponentOption.AVATAR, label: 'Avatar', description: 'User avatar components' },
            { value: ComponentOption.ALERT, label: 'Alert', description: 'Alert and notification components' }
          ],
          group: 'core'
        },
        {
          id: 'customTheme',
          name: 'Custom Theme',
          type: 'boolean',
          description: 'Enable custom theme configuration with your brand colors.',
          required: true,
          default: true,
          group: 'styling'
        },
        {
          id: 'cssBaseline',
          name: 'CSS Baseline',
          type: 'boolean',
          description: 'Include MUI CSS baseline for consistent styling across browsers.',
          required: true,
          default: true,
          group: 'styling'
        },
        {
          id: 'datePickers',
          name: 'Date Pickers',
          type: 'boolean',
          description: 'Include MUI date and time picker components.',
          required: true,
          default: false,
          group: 'features'
        },
        {
          id: 'dataGrid',
          name: 'Data Grid',
          type: 'boolean',
          description: 'Include MUI Data Grid for advanced table functionality.',
          required: true,
          default: false,
          group: 'features'
        },
        {
          id: 'charts',
          name: 'Charts',
          type: 'boolean',
          description: 'Include MUI charts and visualization components.',
          required: true,
          default: false,
          group: 'features'
        }
      ],
      dependencies: [],
      validations: []
    };
  }

  static getUILibraries(): UILibrary[] {
    return [UILibrary.MUI];
  }

  static getComponentOptions(): ComponentOption[] {
    return Object.values(ComponentOption);
  }

  static getThemeOptions(): ThemeOption[] {
    return Object.values(ThemeOption);
  }

  static getStylingOptions(): StylingOption[] {
    return [StylingOption.EMOTION]; // MUI uses Emotion by default
  }
} 