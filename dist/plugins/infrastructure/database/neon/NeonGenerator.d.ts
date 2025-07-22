import { NeonConfig } from './NeonSchema.js';
export declare class NeonGenerator {
    static generateNeonConfig(config: NeonConfig): string;
    static generateNeonConnection(config: NeonConfig): string;
    static generateEnvConfig(config: NeonConfig): string;
    static generatePackageJson(config: NeonConfig): string;
    static generateReadme(): string;
    static generateCLIConfig(): string;
}
