import { UILibrary, ComponentOption, ThemeOption, StylingOption } from '../../../../types/plugin-interfaces.js';
import { PluginCategory } from '../../../../types/plugin.js';
export class TamaguiSchema {
    static getParameterSchema() {
        return {
            category: PluginCategory.UI_LIBRARY,
            groups: [
                { id: 'core', name: 'Core Configuration', description: 'Configure the main Tamagui settings.', order: 1, parameters: ['theme', 'colorMode', 'components'] },
                { id: 'features', name: 'Features', description: 'Enable additional Tamagui features.', order: 2, parameters: ['enableAnimations', 'enableRTL', 'enableCSSReset', 'enableColorMode'] },
                { id: 'advanced', name: 'Advanced Options', description: 'Configure advanced Tamagui options.', order: 3, parameters: ['enableUniversalComponents', 'enableDesignTokens', 'enableResponsiveDesign', 'enableAccessibility'] },
                { id: 'development', name: 'Development Tools', description: 'Configure development and optimization tools.', order: 4, parameters: ['enablePerformanceOptimization', 'enableTreeShaking', 'enableHotReload', 'enableTypeScript'] },
                { id: 'tooling', name: 'Tooling', description: 'Configure additional development tooling.', order: 5, parameters: ['enableStorybook', 'enableTesting', 'enableDocumentation', 'enableExamples'] }
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
                    id: 'colorMode',
                    name: 'Color Mode',
                    type: 'select',
                    description: 'Default color mode for the application.',
                    required: true,
                    default: 'light',
                    options: [
                        { value: 'light', label: 'Light', description: 'Light color mode' },
                        { value: 'dark', label: 'Dark', description: 'Dark color mode' },
                        { value: 'system', label: 'System', description: 'Follow system preference' }
                    ],
                    group: 'core'
                },
                {
                    id: 'components',
                    name: 'Components',
                    type: 'multiselect',
                    description: 'Select the Tamagui components to include in your project.',
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
                    id: 'enableAnimations',
                    name: 'Enable Animations',
                    type: 'boolean',
                    description: 'Enable animations and transitions.',
                    required: true,
                    default: true,
                    group: 'features'
                },
                {
                    id: 'enableRTL',
                    name: 'Enable RTL',
                    type: 'boolean',
                    description: 'Enable right-to-left support.',
                    required: true,
                    default: false,
                    group: 'features'
                },
                {
                    id: 'enableCSSReset',
                    name: 'Enable CSS Reset',
                    type: 'boolean',
                    description: 'Enable CSS reset for consistent styling.',
                    required: true,
                    default: true,
                    group: 'features'
                },
                {
                    id: 'enableColorMode',
                    name: 'Enable Color Mode',
                    type: 'boolean',
                    description: 'Enable color mode switching.',
                    required: true,
                    default: true,
                    group: 'features'
                },
                {
                    id: 'enableUniversalComponents',
                    name: 'Enable Universal Components',
                    type: 'boolean',
                    description: 'Enable universal components for React Native and Web.',
                    required: true,
                    default: true,
                    group: 'advanced'
                },
                {
                    id: 'enableDesignTokens',
                    name: 'Enable Design Tokens',
                    type: 'boolean',
                    description: 'Enable design tokens and theming.',
                    required: true,
                    default: true,
                    group: 'advanced'
                },
                {
                    id: 'enableResponsiveDesign',
                    name: 'Enable Responsive Design',
                    type: 'boolean',
                    description: 'Enable responsive design utilities.',
                    required: true,
                    default: true,
                    group: 'advanced'
                },
                {
                    id: 'enableAccessibility',
                    name: 'Enable Accessibility',
                    type: 'boolean',
                    description: 'Enable accessibility features.',
                    required: true,
                    default: true,
                    group: 'advanced'
                },
                {
                    id: 'enablePerformanceOptimization',
                    name: 'Enable Performance Optimization',
                    type: 'boolean',
                    description: 'Enable performance optimizations.',
                    required: true,
                    default: true,
                    group: 'development'
                },
                {
                    id: 'enableTreeShaking',
                    name: 'Enable Tree Shaking',
                    type: 'boolean',
                    description: 'Enable tree shaking for smaller bundles.',
                    required: true,
                    default: true,
                    group: 'development'
                },
                {
                    id: 'enableHotReload',
                    name: 'Enable Hot Reload',
                    type: 'boolean',
                    description: 'Enable hot reload for development.',
                    required: true,
                    default: true,
                    group: 'development'
                },
                {
                    id: 'enableTypeScript',
                    name: 'Enable TypeScript',
                    type: 'boolean',
                    description: 'Enable TypeScript support.',
                    required: true,
                    default: true,
                    group: 'development'
                },
                {
                    id: 'enableStorybook',
                    name: 'Enable Storybook',
                    type: 'boolean',
                    description: 'Enable Storybook for component development.',
                    required: true,
                    default: false,
                    group: 'tooling'
                },
                {
                    id: 'enableTesting',
                    name: 'Enable Testing',
                    type: 'boolean',
                    description: 'Enable testing setup.',
                    required: true,
                    default: true,
                    group: 'tooling'
                },
                {
                    id: 'enableDocumentation',
                    name: 'Enable Documentation',
                    type: 'boolean',
                    description: 'Enable documentation generation.',
                    required: true,
                    default: false,
                    group: 'tooling'
                },
                {
                    id: 'enableExamples',
                    name: 'Enable Examples',
                    type: 'boolean',
                    description: 'Enable example components and templates.',
                    required: true,
                    default: false,
                    group: 'tooling'
                }
            ],
            dependencies: [],
            validations: []
        };
    }
    static getUILibraries() {
        return [UILibrary.TAMAGUI];
    }
    static getComponentOptions() {
        return Object.values(ComponentOption);
    }
    static getThemeOptions() {
        return Object.values(ThemeOption);
    }
    static getStylingOptions() {
        return [StylingOption.CSS_MODULES]; // Tamagui uses CSS modules by default
    }
}
//# sourceMappingURL=TamaguiSchema.js.map