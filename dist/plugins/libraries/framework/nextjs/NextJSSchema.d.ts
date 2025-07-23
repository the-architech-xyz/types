import { ParameterSchema, FrameworkOption, BuildOption, DeploymentOption } from '../../../../types/plugins.js';
export declare class NextJSSchema {
    static getParameterSchema(): ParameterSchema;
    static getFrameworkOptions(): FrameworkOption[];
    static getBuildOptions(): BuildOption[];
    static getDeploymentOptions(): DeploymentOption[];
}
