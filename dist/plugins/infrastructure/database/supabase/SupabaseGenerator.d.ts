import { SupabaseConfig } from './SupabaseSchema.js';
export declare class SupabaseGenerator {
    static generateSupabaseClient(config: SupabaseConfig): string;
    static generateTypes(): string;
    static generateDatabaseClient(): string;
    static generateUnifiedIndex(): string;
    static generateEnvConfig(config: SupabaseConfig): string;
    static generatePackageJson(config: SupabaseConfig): string;
    static generateReadme(): string;
    static generateCLIConfig(): string;
}
