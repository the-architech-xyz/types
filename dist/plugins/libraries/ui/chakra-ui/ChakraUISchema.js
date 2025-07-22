/**
 * Chakra UI Schema Definitions
 *
 * Contains all configuration schemas and parameter definitions for the Chakra UI plugin.
 * Based on: https://chakra-ui.com/getting-started
 */
export const ChakraUIConfigSchema = {
    type: 'object',
    properties: {
        theme: {
            type: 'string',
            enum: ['default', 'custom'],
            description: 'Chakra UI theme variant',
            default: 'default'
        },
        colorMode: {
            type: 'string',
            enum: ['light', 'dark', 'system'],
            description: 'Default color mode',
            default: 'light'
        },
        enableColorMode: {
            type: 'boolean',
            description: 'Enable color mode switching',
            default: true
        },
        enableSSR: {
            type: 'boolean',
            description: 'Enable server-side rendering support',
            default: true
        },
        enableEmotion: {
            type: 'boolean',
            description: 'Enable Emotion CSS-in-JS',
            default: true
        },
        enableIcons: {
            type: 'boolean',
            description: 'Enable Chakra UI icons',
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
            default: ['Button', 'Box', 'Text', 'Heading', 'Stack', 'HStack', 'VStack', 'Input', 'FormControl']
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
        }
    },
    required: ['theme', 'colorMode']
};
export const ChakraUIDefaultConfig = {
    theme: 'default',
    colorMode: 'light',
    enableColorMode: true,
    enableSSR: true,
    enableEmotion: true,
    enableIcons: true,
    enableAnimations: true,
    enableRTL: false,
    enableTypeScript: true,
    enableReact: true,
    enableNextJS: false,
    enableVue: false,
    enableSvelte: false,
    enableAngular: false,
    components: ['Button', 'Box', 'Text', 'Heading', 'Stack', 'HStack', 'VStack', 'Input', 'FormControl'],
    enableCustomTheme: false,
    enableThemeTokens: true,
    enableResponsiveDesign: true,
    enableAccessibility: true,
    enablePerformance: true
};
//# sourceMappingURL=ChakraUISchema.js.map