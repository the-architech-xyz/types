/**
 * Path Resolver for Plugin File Generation
 *
 * Automatically resolves file paths for both single-app and monorepo structures.
 * Handles common patterns like lib files, config files, components, etc.
 */
import { PluginContext } from '../../types/plugin.js';
export declare class PathResolver {
    private context;
    private structure;
    constructor(context: PluginContext);
    /**
     * Get lib path for main module files
     * Single app: src/lib/{moduleName}/{fileName}
     * Monorepo: packages/{moduleName}/{fileName}
     */
    getLibPath(moduleName: string, fileName: string): string;
    /**
     * Get config file path
     * Root config: {projectPath}/{fileName}
     * Module config: {modulePath}/{fileName}
     */
    getConfigPath(fileName: string, inModuleDir?: boolean): string;
    /**
     * Get component path (for UI plugins)
     * Single app: src/components/{componentName}
     * Monorepo: packages/ui/components/{componentName}
     */
    getComponentPath(componentName: string): string;
    /**
     * Get migration path (for database plugins)
     * Single app: src/lib/db/migrations/{fileName}
     * Monorepo: packages/db/migrations/{fileName}
     */
    getMigrationPath(fileName: string): string;
    /**
     * Get schema path (for database plugins)
     * Single app: src/lib/db/schema.ts
     * Monorepo: packages/db/schema.ts
     */
    getSchemaPath(): string;
    /**
     * Get auth config path (for auth plugins)
     * Single app: src/lib/auth/config.ts
     * Monorepo: packages/auth/config.ts
     */
    getAuthConfigPath(): string;
    /**
     * Get root layout path (for UI plugins)
     * Assumes Next.js App Router structure for now.
     * Single app: src/app/layout.tsx
     * Monorepo: apps/web/src/app/layout.tsx
     */
    getRootLayoutPath(): string;
    /**
     * Get UI components path (for UI plugins)
     * Single app: src/components/ui/{componentName}.tsx
     * Monorepo: packages/ui/components/{componentName}.tsx
     */
    getUIComponentPath(componentName: string): string;
    /**
     * Get package.json path for a module
     * Single app: package.json (root)
     * Monorepo: packages/{moduleName}/package.json
     */
    getPackageJsonPath(moduleName?: string): string;
    /**
     * Get tsconfig path for a module
     * Single app: tsconfig.json (root)
     * Monorepo: packages/{moduleName}/tsconfig.json
     */
    getTsConfigPath(moduleName?: string): string;
    /**
     * Get environment file path
     * Always in root: .env.local
     */
    getEnvPath(): string;
    /**
     * Get unified interface path for a module
     * Single app: src/lib/{moduleName}/index.ts
     * Monorepo: packages/{moduleName}/index.ts
     */
    getUnifiedInterfacePath(moduleName: string): string;
    getStylePath(fileName: string): string;
    /**
     * Extract module name from plugin ID
     */
    private getModuleName;
    /**
     * Ensure directory exists
     */
    ensureDirectory(filePath: string): Promise<void>;
    /**
     * Get relative path from project root
     */
    getRelativePath(fullPath: string): string;
}
