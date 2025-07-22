import { ParameterSchema, FrameworkOption, BuildOption, DeploymentOption } from '../../../../types/plugin-interfaces.js';
export declare class NextJSSchema {
    static getParameterSchema(): ParameterSchema;
    static getFrameworkOptions(): FrameworkOption[];
    static getBuildOptions(): BuildOption[];
    static getDeploymentOptions(): DeploymentOption[];
}
