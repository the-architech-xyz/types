/**
 * Scale Command - Transform Single App to Monorepo
 *
 * Transforms a single app project to a scalable monorepo structure.
 * This is the "killer feature" that allows users to scale their projects seamlessly.
 */
interface ScaleOptions {
    packageManager?: string;
    yes?: boolean;
}
export declare function scaleCommand(options?: ScaleOptions): Promise<void>;
export {};
