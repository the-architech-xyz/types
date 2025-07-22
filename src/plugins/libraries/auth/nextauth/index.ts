/**
 * NextAuth Plugin Index
 * 
 * Exports all NextAuth plugin components.
 */

export { NextAuthPlugin } from './NextAuthPlugin.js';
export type { NextAuthConfig } from './NextAuthSchema.js';
export { NextAuthConfigSchema, NextAuthDefaultConfig } from './NextAuthSchema.js';
export { NextAuthGenerator } from './NextAuthGenerator.js';

// Default export
import { NextAuthPlugin } from './NextAuthPlugin.js';
export default NextAuthPlugin; 