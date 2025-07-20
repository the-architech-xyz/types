/**
 * Scale to Monorepo Command
 *
 * Automatically restructures a single-app project into a full monorepo.
 * This is the "killer feature" that demonstrates the power of The Architech.
 *
 * Transforms:
 * my-quick-project/
 * ├── src/
 * │   ├── app/
 * │   ├── components/     # @my-project/ui
 * │   └── lib/            # @my-project/db, @my-project/auth
 * └── package.json
 *
 * Into:
 * my-quick-project/
 * ├── apps/
 * │   └── web/
 * ├── packages/
 * │   ├── ui/
 * │   ├── db/
 * │   └── auth/
 * ├── turbo.json
 * └── package.json
 */
export interface ScaleOptions {
    packageManager?: string;
    yes?: boolean;
}
export interface ScaleConfig {
    projectPath: string;
    projectName: string;
    packageManager: string;
    useDefaults: boolean;
    hasComponents: boolean;
    hasDatabase: boolean;
    hasAuth: boolean;
    hasConfig: boolean;
}
export declare function scaleToMonorepoCommand(options?: ScaleOptions): Promise<void>;
