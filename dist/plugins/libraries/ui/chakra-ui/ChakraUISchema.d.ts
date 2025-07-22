/**
 * Chakra UI Schema Definitions
 *
 * Contains all configuration schemas and parameter definitions for the Chakra UI plugin.
 * Based on: https://chakra-ui.com/getting-started
 */
import { ConfigSchema } from '../../../../types/plugin.js';
export interface ChakraUIConfig {
    theme: 'default' | 'custom';
    colorMode: 'light' | 'dark' | 'system';
    enableColorMode: boolean;
    enableSSR: boolean;
    enableEmotion: boolean;
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
}
export declare const ChakraUIConfigSchema: ConfigSchema;
export declare const ChakraUIDefaultConfig: ChakraUIConfig;
