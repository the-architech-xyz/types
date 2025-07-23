/**
 * Next.js Schema Definitions
 *
 * Contains all configuration schemas and parameter definitions for the Next.js plugin.
 * Based on: https://nextjs.org/
 */
import { ParameterSchema } from '../../../../types/plugins.js';
import { FrameworkOption, BuildOption, DeploymentOption } from '../../../../types/core.js';
export declare class NextJSSchema {
    static getParameterSchema(): ParameterSchema;
    static getFrameworkOptions(): FrameworkOption[];
    static getBuildOptions(): BuildOption[];
    static getDeploymentOptions(): DeploymentOption[];
}
