import { ConfigSchema } from '../../../../types/plugin.js';
export interface RailwayConfig {
    projectId?: string;
    serviceId?: string;
    token?: string;
    environment: string;
    autoDeploy: boolean;
    healthcheckPath: string;
    build: {
        builder: 'nixpacks' | 'dockerfile';
        dockerfilePath?: string;
        buildCommand?: string;
        watchPatterns?: string[];
    };
    deploy: {
        startCommand?: string;
        restartPolicyType: 'on_failure' | 'always' | 'never';
        restartPolicyMaxRetries?: number;
        healthcheckTimeout?: number;
        healthcheckInterval?: number;
        healthcheckRetries?: number;
    };
}
export declare const RailwayConfigSchema: ConfigSchema;
export declare const RailwayDefaultConfig: RailwayConfig;
