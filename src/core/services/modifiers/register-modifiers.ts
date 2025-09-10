/**
 * Modifier Registration System
 * 
 * Registers all available modifiers with the global registry.
 * This is the central place where all modifiers are registered.
 */

import { getModifierRegistry } from './modifier-registry.js';
import { NextjsConfigWrapperModifier } from './nextjs-config-wrapper.js';
import { PackageJsonMergerModifier } from './package-json-merger.js';
import { TsconfigEnhancerModifier } from './tsconfig-enhancer.js';
import { SentryConfigMergerModifier } from './sentry-config-merger.js';
import { AuthConfigEnhancerModifier } from './auth-config-enhancer.js';
import { StripeConfigMergerModifier } from './stripe-config-merger.js';
import { TailwindConfigEnhancerModifier } from './tailwind-config-enhancer.js';
import { DrizzleConfigMergerModifier } from './drizzle-config-merger.js';
import { DrizzleSchemaAdderModifier } from './drizzle-schema-adder.js';
import { FileModificationEngine } from '../file-engine/file-modification-engine.js';

/**
 * Register all core modifiers
 */
export function registerCoreModifiers(engine: FileModificationEngine): void {
  const registry = getModifierRegistry();

  // Next.js Config Wrapper
  const nextjsWrapper = new NextjsConfigWrapperModifier(engine);
  registry.register('nextjs-config-wrapper', {
    handler: nextjsWrapper.execute.bind(nextjsWrapper),
    paramsSchema: nextjsWrapper.getParamsSchema(),
    description: nextjsWrapper.getDescription(),
    supportedFileTypes: nextjsWrapper.getSupportedFileTypes()
  });

  // Package.json Merger
  const packageMerger = new PackageJsonMergerModifier(engine);
  registry.register('package-json-merger', {
    handler: packageMerger.execute.bind(packageMerger),
    paramsSchema: packageMerger.getParamsSchema(),
    description: packageMerger.getDescription(),
    supportedFileTypes: packageMerger.getSupportedFileTypes()
  });

  // TypeScript Config Enhancer
  const tsconfigEnhancer = new TsconfigEnhancerModifier(engine);
  registry.register('tsconfig-enhancer', {
    handler: tsconfigEnhancer.execute.bind(tsconfigEnhancer),
    paramsSchema: tsconfigEnhancer.getParamsSchema(),
    description: tsconfigEnhancer.getDescription(),
    supportedFileTypes: tsconfigEnhancer.getSupportedFileTypes()
  });

  // Sentry Config Merger
  const sentryMerger = new SentryConfigMergerModifier(engine);
  registry.register('sentry-config-merger', {
    handler: sentryMerger.execute.bind(sentryMerger),
    paramsSchema: sentryMerger.getParamsSchema(),
    description: sentryMerger.getDescription(),
    supportedFileTypes: sentryMerger.getSupportedFileTypes()
  });

  // Auth Config Enhancer
  const authEnhancer = new AuthConfigEnhancerModifier(engine);
  registry.register('auth-config-enhancer', {
    handler: authEnhancer.execute.bind(authEnhancer),
    paramsSchema: authEnhancer.getParamsSchema(),
    description: authEnhancer.getDescription(),
    supportedFileTypes: authEnhancer.getSupportedFileTypes()
  });

  // Stripe Config Merger
  const stripeMerger = new StripeConfigMergerModifier(engine);
  registry.register('stripe-config-merger', {
    handler: stripeMerger.execute.bind(stripeMerger),
    paramsSchema: stripeMerger.getParamsSchema(),
    description: stripeMerger.getDescription(),
    supportedFileTypes: stripeMerger.getSupportedFileTypes()
  });

  // Tailwind Config Enhancer
  const tailwindEnhancer = new TailwindConfigEnhancerModifier(engine);
  registry.register('tailwind-config-enhancer', {
    handler: tailwindEnhancer.execute.bind(tailwindEnhancer),
    paramsSchema: tailwindEnhancer.getParamsSchema(),
    description: tailwindEnhancer.getDescription(),
    supportedFileTypes: tailwindEnhancer.getSupportedFileTypes()
  });

  // Drizzle Config Merger
  const drizzleConfigMerger = new DrizzleConfigMergerModifier(engine);
  registry.register('drizzle-config-merger', {
    handler: drizzleConfigMerger.execute.bind(drizzleConfigMerger),
    paramsSchema: drizzleConfigMerger.getParamsSchema(),
    description: drizzleConfigMerger.getDescription(),
    supportedFileTypes: drizzleConfigMerger.getSupportedFileTypes()
  });

  // Drizzle Schema Adder
  const drizzleSchemaAdder = new DrizzleSchemaAdderModifier(engine);
  registry.register('drizzle-schema-adder', {
    handler: drizzleSchemaAdder.execute.bind(drizzleSchemaAdder),
    paramsSchema: drizzleSchemaAdder.getParamsSchema(),
    description: drizzleSchemaAdder.getDescription(),
    supportedFileTypes: drizzleSchemaAdder.getSupportedFileTypes()
  });
}

/**
 * Register all modifiers (core + future modifiers)
 */
export function registerAllModifiers(engine: FileModificationEngine): void {
  registerCoreModifiers(engine);
  
  // Future modifiers will be registered here
  // registerAdvancedModifiers(engine);
  // registerIntegrationModifiers(engine);
}
