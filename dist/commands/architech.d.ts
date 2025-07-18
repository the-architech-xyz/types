/**
 * Architech Command - Enterprise-Grade Monorepo Generator
 *
 * Creates production-ready monorepo structure with Turborepo and specialized packages:
 * - apps/web: Next.js 14 main application
 * - packages/ui: Tailwind + Shadcn/ui design system
 * - packages/db: Drizzle ORM + Neon PostgreSQL
 * - packages/auth: Better Auth integration
 * - packages/config: Shared ESLint/Prettier/TypeScript configs
 */
interface ArchitechOptions {
    packageManager?: string;
    noGit?: boolean;
    noInstall?: boolean;
    yes?: boolean;
    modules?: string;
}
export declare function architechCommand(projectName?: string, options?: ArchitechOptions): Promise<void>;
export {};
