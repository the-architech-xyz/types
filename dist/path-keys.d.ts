import type { Genome, ProjectConfig } from './recipe.js';
export type PathKeyStructure = 'single-app' | 'monorepo' | 'both';
export interface MarketplacePathKeyDefinition {
    /** Canonical path key identifier, e.g. packages.database.src or packages.{packageName}.src */
    key: string;
    /** Human readable description for documentation */
    description?: string;
    /** Whether the key must be populated by the adapter */
    required?: boolean;
    /** Which project structures the key applies to */
    structure?: PathKeyStructure;
    /** If true, adapter should compute from genome; otherwise defaultValue can be used */
    computed?: boolean;
    /** Static default when computed is false. Can be a string or object with framework-specific values */
    defaultValue?: string | Record<string, string>;
    /** Optional grouping for docs / IDE */
    group?: string;
    /** Mark key as deprecated */
    deprecated?: boolean;
    /** Suggested replacement key when deprecated */
    replacement?: string;
    /**
     * Dynamic variables that can be used in the key or defaultValue
     * Example: ["packageName", "appId"] for keys like "packages.{packageName}.src"
     * Variables will be replaced at runtime with actual values
     */
    variables?: string[];
    /**
     * Whether this path key is semantic (expands to multiple apps)
     * Semantic keys expand based on resolveToApps metadata
     *
     * Example: apps.frontend.components (semantic: true) expands to:
     * - apps.web.components
     * - apps.mobile.components
     */
    semantic?: boolean;
    /**
     * For semantic keys: which apps this key resolves to
     * - Array of app types: ["web", "mobile"]
     * - "all" for all apps
     *
     * Only used when semantic: true
     */
    resolveToApps?: string[] | "all";
    /**
     * For semantic keys: resolution strategy (optional)
     * Used for complex resolution (e.g., backend.api, backend.server)
     *
     * Example:
     * {
     *   priority: ["api", "web"],  // Try API first, then web
     *   fallback: "web"  // Fallback to web if API not available
     * }
     */
    resolutionStrategy?: {
        priority?: string[];
        fallback?: string;
    };
}
export interface MarketplacePathKeys {
    version: string;
    marketplace: string;
    pathKeys: MarketplacePathKeyDefinition[];
}
/** Resolved map of path key -> absolute/relative directory string. */
export type PathKeyValueSet = Record<string, string>;
export interface PathResolutionContext {
    /** Genome supplied by the CLI – adapters can inspect modules/options. */
    genome: Genome;
    /** Convenience access to the normalized project configuration. */
    project?: ProjectConfig;
    /** Workspace root on disk (resolved by the CLI). */
    workspaceRoot?: string;
    /** User supplied overrides to honour when computing defaults. */
    overrides?: Record<string, string>;
    /** Extra metadata or adapter-specific context. */
    metadata?: Record<string, unknown>;
}
