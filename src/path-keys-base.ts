/**
 * Base Path Keys Interface
 * 
 * Defines the base path structure that ALL marketplaces can use/extend.
 * This provides type safety and a common foundation for path key definitions.
 * 
 * Marketplaces extend this interface to add framework-specific paths.
 */

/**
 * Base path keys structure - common across all marketplaces
 * 
 * Path values are arrays to support multi-app expansion:
 * - Single value: ["apps/web/src/components/"] → Generate 1 file
 * - Multiple values: ["apps/web/...", "apps/mobile/..."] → Generate multiple files
 */
export interface BasePathKeys {
  workspace: {
    root: string[];
    config: string[];
    docs: string[];
    scripts: string[];
    env: string[];
  };
  apps: {
    web?: {
      root: string[];
      src: string[];
      components: string[];
      public: string[];
      app?: string[];  // Next.js App Router
      middleware?: string[];  // Next.js middleware
      server?: string[];  // Next.js server
    };
    mobile?: {
      root: string[];
      src: string[];
      components: string[];
      public: string[];
    };
    api?: {
      root: string[];
      src: string[];
      routes: string[];
    };
    frontend?: {  // Semantic category: web + mobile
      root: string[];
      src: string[];
      components: string[];
      public: string[];
      app?: string[];  // Next.js only
      middleware?: string[];  // Next.js only
    };
    backend?: {  // Semantic category: api
      root: string[];
      src: string[];
      routes: string[];
      api?: string[];  // Resolves to api.routes or web.app/api
      server?: string[];  // Resolves to api.src or web.server
    };
    all?: {  // Semantic category: all apps
      root: string[];
      src: string[];
      components: string[];
      public: string[];
      app?: string[];  // Next.js only
      middleware?: string[];  // Next.js only
    };
  };
  packages: {
    shared?: {
      root: string[];
      src: string[];
      components?: string[];
      hooks?: string[];
      providers?: string[];
      stores?: string[];
      types?: string[];
      utils?: string[];
    };
    database?: {
      root: string[];
      src: string[];
    };
    ui?: {
      root: string[];
      src: string[];
    };
    auth?: {
      root: string[];
      src: string[];
    };
    [packageName: string]: {  // Dynamic packages
      root: string[];
      src: string[];
      [key: string]: string[] | undefined;
    };
  };
}

/**
 * Path mappings type
 * 
 * Maps path keys to arrays of concrete paths.
 * Used by PathMappingGenerator to store pre-computed mappings.
 */
export type PathMappings = Record<string, string[]>;

/**
 * Marketplace can extend this interface
 */
export interface MarketplacePathKeys extends BasePathKeys {
  // Marketplace-specific additions
}

