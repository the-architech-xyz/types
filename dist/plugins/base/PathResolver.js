/**
 * Path Resolver for Plugin File Generation
 *
 * Automatically resolves file paths for both single-app and monorepo structures.
 * Handles common patterns like lib files, config files, components, etc.
 */
import * as path from 'path';
export class PathResolver {
    context;
    structure;
    constructor(context) {
        this.context = context;
        this.structure = context.projectStructure;
    }
    /**
     * Get lib path for main module files
     * Single app: src/lib/{moduleName}/{fileName}
     * Monorepo: packages/{moduleName}/{fileName}
     */
    getLibPath(moduleName, fileName) {
        if (this.structure.isMonorepo) {
            return path.join(this.context.projectPath, 'packages', moduleName, fileName);
        }
        else {
            return path.join(this.context.projectPath, 'src', 'lib', moduleName, fileName);
        }
    }
    /**
     * Get config file path
     * Root config: {projectPath}/{fileName}
     * Module config: {modulePath}/{fileName}
     */
    getConfigPath(fileName, inModuleDir = false) {
        if (inModuleDir) {
            const moduleName = this.getModuleName();
            if (this.structure.isMonorepo) {
                return path.join(this.context.projectPath, 'packages', moduleName, fileName);
            }
            else {
                return path.join(this.context.projectPath, 'src', 'lib', moduleName, fileName);
            }
        }
        else {
            return path.join(this.context.projectPath, fileName);
        }
    }
    /**
     * Get component path (for UI plugins)
     * Single app: src/components/{componentName}
     * Monorepo: packages/ui/components/{componentName}
     */
    getComponentPath(componentName) {
        if (this.structure.isMonorepo) {
            return path.join(this.context.projectPath, 'packages', 'ui', 'components', componentName);
        }
        else {
            return path.join(this.context.projectPath, 'src', 'components', componentName);
        }
    }
    /**
     * Get migration path (for database plugins)
     * Single app: src/lib/db/migrations/{fileName}
     * Monorepo: packages/db/migrations/{fileName}
     */
    getMigrationPath(fileName) {
        if (this.structure.isMonorepo) {
            return path.join(this.context.projectPath, 'packages', 'db', 'migrations', fileName);
        }
        else {
            return path.join(this.context.projectPath, 'src', 'lib', 'db', 'migrations', fileName);
        }
    }
    /**
     * Get schema path (for database plugins)
     * Single app: src/lib/db/schema.ts
     * Monorepo: packages/db/schema.ts
     */
    getSchemaPath() {
        if (this.structure.isMonorepo) {
            return path.join(this.context.projectPath, 'packages', 'db', 'schema.ts');
        }
        else {
            return path.join(this.context.projectPath, 'src', 'lib', 'db', 'schema.ts');
        }
    }
    /**
     * Get auth config path (for auth plugins)
     * Single app: src/lib/auth/config.ts
     * Monorepo: packages/auth/config.ts
     */
    getAuthConfigPath() {
        if (this.structure.isMonorepo) {
            return path.join(this.context.projectPath, 'packages', 'auth', 'config.ts');
        }
        else {
            return path.join(this.context.projectPath, 'src', 'lib', 'auth', 'config.ts');
        }
    }
    /**
     * Get UI components path (for UI plugins)
     * Single app: src/components/ui/{componentName}.tsx
     * Monorepo: packages/ui/components/{componentName}.tsx
     */
    getUIComponentPath(componentName) {
        if (this.structure.isMonorepo) {
            return path.join(this.context.projectPath, 'packages', 'ui', 'components', `${componentName}.tsx`);
        }
        else {
            return path.join(this.context.projectPath, 'src', 'components', 'ui', `${componentName}.tsx`);
        }
    }
    /**
     * Get package.json path for a module
     * Single app: package.json (root)
     * Monorepo: packages/{moduleName}/package.json
     */
    getPackageJsonPath(moduleName) {
        if (this.structure.isMonorepo && moduleName) {
            return path.join(this.context.projectPath, 'packages', moduleName, 'package.json');
        }
        else {
            return path.join(this.context.projectPath, 'package.json');
        }
    }
    /**
     * Get tsconfig path for a module
     * Single app: tsconfig.json (root)
     * Monorepo: packages/{moduleName}/tsconfig.json
     */
    getTsConfigPath(moduleName) {
        if (this.structure.isMonorepo && moduleName) {
            return path.join(this.context.projectPath, 'packages', moduleName, 'tsconfig.json');
        }
        else {
            return path.join(this.context.projectPath, 'tsconfig.json');
        }
    }
    /**
     * Get environment file path
     * Always in root: .env.local
     */
    getEnvPath() {
        return path.join(this.context.projectPath, '.env.local');
    }
    /**
     * Get unified interface path for a module
     * Single app: src/lib/{moduleName}/index.ts
     * Monorepo: packages/{moduleName}/index.ts
     */
    getUnifiedInterfacePath(moduleName) {
        if (this.structure.isMonorepo) {
            return path.join(this.context.projectPath, 'packages', moduleName, 'index.ts');
        }
        else {
            return path.join(this.context.projectPath, 'src', 'lib', moduleName, 'index.ts');
        }
    }
    /**
     * Extract module name from plugin ID
     */
    getModuleName() {
        const pluginId = this.context.pluginId;
        // Database plugins
        if (pluginId.includes('drizzle') || pluginId.includes('prisma') ||
            pluginId.includes('typeorm') || pluginId.includes('neon') ||
            pluginId.includes('supabase') || pluginId.includes('mongodb')) {
            return 'db';
        }
        // Auth plugins
        if (pluginId.includes('auth') || pluginId.includes('nextauth') ||
            pluginId.includes('better-auth')) {
            return 'auth';
        }
        // UI plugins
        if (pluginId.includes('ui') || pluginId.includes('shadcn') ||
            pluginId.includes('chakra') || pluginId.includes('mui') ||
            pluginId.includes('tamagui')) {
            return 'ui';
        }
        // Deployment plugins
        if (pluginId.includes('deploy') || pluginId.includes('vercel') ||
            pluginId.includes('railway') || pluginId.includes('netlify')) {
            return 'deployment';
        }
        // Testing plugins
        if (pluginId.includes('test') || pluginId.includes('vitest') ||
            pluginId.includes('jest') || pluginId.includes('playwright')) {
            return 'testing';
        }
        // Email plugins
        if (pluginId.includes('email') || pluginId.includes('resend') ||
            pluginId.includes('sendgrid')) {
            return 'email';
        }
        // Monitoring plugins
        if (pluginId.includes('monitor') || pluginId.includes('sentry') ||
            pluginId.includes('analytics')) {
            return 'monitoring';
        }
        // Payment plugins
        if (pluginId.includes('payment') || pluginId.includes('stripe') ||
            pluginId.includes('paypal')) {
            return 'payment';
        }
        // Blockchain plugins
        if (pluginId.includes('blockchain') || pluginId.includes('ethereum') ||
            pluginId.includes('solana')) {
            return 'blockchain';
        }
        return 'custom';
    }
    /**
     * Ensure directory exists
     */
    async ensureDirectory(filePath) {
        const dir = path.dirname(filePath);
        await import('fs-extra').then(fs => fs.ensureDir(dir));
    }
    /**
     * Get relative path from project root
     */
    getRelativePath(fullPath) {
        return path.relative(this.context.projectPath, fullPath);
    }
}
//# sourceMappingURL=PathResolver.js.map