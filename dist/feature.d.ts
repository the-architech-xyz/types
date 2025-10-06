/**
 * Feature Types - V1 Enhanced with Capability Resolution
 *
 * Feature configuration for intelligent dependency resolution
 */
import type { BlueprintAction, Blueprint, ParameterDefinition } from './adapter.js';
export interface FeatureConfig {
    id: string;
    name: string;
    description: string;
    version: string;
    category: 'feature';
    blueprint: string;
    prerequisites: {
        capabilities: string[];
        adapters?: string[];
        integrators?: string[];
        modules?: string[];
    };
    provides: {
        capabilities: string[];
    };
    parameters?: Record<string, ParameterDefinition>;
    constraints?: {
        [key: string]: string;
    };
}
export interface Feature {
    config: FeatureConfig;
    blueprint: Blueprint;
}
export type { BlueprintAction, Blueprint, ParameterDefinition };
