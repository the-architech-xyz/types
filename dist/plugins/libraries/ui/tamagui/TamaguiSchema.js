/**
 * Tamagui Schema Definitions
 *
 * Contains all configuration schemas and parameter definitions for the Tamagui plugin.
 * Based on: https://tamagui.dev/
 */
import { PluginCategory } from '../../../../types/plugins.js';
import { UI_LIBRARIES, ComponentOption, ThemeOption } from '../../../../types/core.js';
export class TamaguiSchema {
    static getParameterSchema() {
        return {
            category: PluginCategory.UI_LIBRARY,
            groups: [
                { id: 'theme', name: 'Theme Configuration', description: 'Configure the theme and styling.', order: 1, parameters: ['theme'] },
                { id: 'components', name: 'Component Selection', description: 'Select which components to include.', order: 2, parameters: ['components'] },
                { id: 'features', name: 'Additional Features', description: 'Enable additional Tamagui features.', order: 3, parameters: ['enableAnimations', 'enableRTL'] },
            ],
            parameters: [
                {
                    id: 'theme',
                    name: 'Theme Mode',
                    type: 'select',
                    description: 'Choose the theme mode for your application.',
                    required: true,
                    default: ThemeOption.LIGHT,
                    options: [
                        { value: ThemeOption.LIGHT, label: 'Light', description: 'Light theme' },
                        { value: ThemeOption.DARK, label: 'Dark', description: 'Dark theme' },
                        { value: ThemeOption.SYSTEM, label: 'System', description: 'Follow system preference' }
                    ],
                    group: 'theme'
                },
                {
                    id: 'components',
                    name: 'Components',
                    type: 'multiselect',
                    description: 'Select the Tamagui components to include in your project.',
                    required: true,
                    default: [ComponentOption.BUTTON, ComponentOption.CARD, ComponentOption.INPUT, ComponentOption.FORM, ComponentOption.MODAL, ComponentOption.NAVIGATION, ComponentOption.TABLE, ComponentOption.BADGE, ComponentOption.AVATAR, ComponentOption.ALERT],
                    options: [
                        { value: ComponentOption.BUTTON, label: 'Button', description: 'Button components' },
                        { value: ComponentOption.INPUT, label: 'Input', description: 'Input and form field components' },
                        { value: ComponentOption.CARD, label: 'Card', description: 'Card and container components' },
                        { value: ComponentOption.FORM, label: 'Form', description: 'Form components and validation' },
                        { value: ComponentOption.MODAL, label: 'Modal', description: 'Modal and dialog components' },
                        { value: ComponentOption.TABLE, label: 'Table', description: 'Data table components' },
                        { value: ComponentOption.NAVIGATION, label: 'Navigation', description: 'Navigation and menu components' },
                        { value: ComponentOption.BADGE, label: 'Badge', description: 'Badge and notification components' },
                        { value: ComponentOption.AVATAR, label: 'Avatar', description: 'Avatar and profile components' },
                        { value: ComponentOption.ALERT, label: 'Alert', description: 'Alert and notification components' }
                    ],
                    group: 'components'
                },
                {
                    id: 'enableAnimations',
                    name: 'Enable Animations',
                    type: 'boolean',
                    description: 'Enable Tamagui animations and transitions.',
                    required: true,
                    default: true,
                    group: 'features'
                },
                {
                    id: 'enableRTL',
                    name: 'Enable RTL Support',
                    type: 'boolean',
                    description: 'Enable right-to-left language support.',
                    required: true,
                    default: false,
                    group: 'features'
                }
            ],
            dependencies: [],
            validations: []
        };
    }
    static getUILibraries() {
        return [UI_LIBRARIES.TAMAGUI];
    }
    static getComponentOptions() {
        return [
            ComponentOption.BUTTON,
            ComponentOption.INPUT,
            ComponentOption.CARD,
            ComponentOption.FORM,
            ComponentOption.MODAL,
            ComponentOption.TABLE,
            ComponentOption.NAVIGATION,
            ComponentOption.BADGE,
            ComponentOption.AVATAR,
            ComponentOption.ALERT
        ];
    }
    static getThemeOptions() {
        return [ThemeOption.LIGHT, ThemeOption.DARK, ThemeOption.SYSTEM];
    }
}
//# sourceMappingURL=TamaguiSchema.js.map