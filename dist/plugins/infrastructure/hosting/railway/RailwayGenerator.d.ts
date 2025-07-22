import { RailwayConfig } from './RailwaySchema.js';
export declare class RailwayGenerator {
    static generateRailwayConfig(config: RailwayConfig): string;
    static generatePackageJsonScripts(): string;
    static generateEnvConfig(config: RailwayConfig): string;
    static generateReadme(): string;
}
