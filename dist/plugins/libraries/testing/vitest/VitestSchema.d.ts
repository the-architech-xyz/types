/**
 * Vitest Schema Definitions
 *
 * Contains all configuration schemas and parameter definitions for the Vitest plugin.
 * Based on: https://vitest.dev/
 */
import { ParameterSchema } from '../../../../types/plugins.js';
import { TestingFramework } from '../../../../types/core.js';
export declare class VitestSchema {
    static getParameterSchema(): ParameterSchema;
    static getTestingFrameworks(): TestingFramework[];
}
