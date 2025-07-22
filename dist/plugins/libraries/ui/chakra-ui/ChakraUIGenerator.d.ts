/**
 * Chakra UI Code Generator
 *
 * Handles all code generation for Chakra UI design system integration.
 * Based on: https://chakra-ui.com/getting-started
 */
import { ChakraUIConfig } from './ChakraUISchema.js';
export declare class ChakraUIGenerator {
    static generateThemeConfig(config: ChakraUIConfig): string;
    static generateProviderSetup(config: ChakraUIConfig): string;
    static generateComponentExamples(config: ChakraUIConfig): string;
    static generateUnifiedIndex(): string;
    static generateEnvConfig(config: ChakraUIConfig): string;
    static generatePackageJson(config: ChakraUIConfig): string;
}
