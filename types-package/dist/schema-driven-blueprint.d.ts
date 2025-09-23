/**
 * Schema-Driven Blueprint Types
 *
 * Self-schematizing blueprint system using TypeScript inference
 * This enables type-safe parameter validation and auto-completion
 */
/**
 * Base schema property definition
 */
export interface SchemaProperty {
    type: 'string' | 'boolean' | 'number' | 'array' | 'object';
    description?: string;
    default?: any;
}
/**
 * String schema property with enum validation
 */
export interface StringSchemaProperty extends SchemaProperty {
    type: 'string';
    enum?: readonly string[];
    pattern?: string;
    minLength?: number;
    maxLength?: number;
}
/**
 * Array schema property with item validation
 */
export interface ArraySchemaProperty extends SchemaProperty {
    type: 'array';
    items: {
        type: 'string' | 'number' | 'boolean' | 'object';
        enum?: readonly string[];
    };
    minItems?: number;
    maxItems?: number;
}
/**
 * Boolean schema property
 */
export interface BooleanSchemaProperty extends SchemaProperty {
    type: 'boolean';
}
/**
 * Number schema property
 */
export interface NumberSchemaProperty extends SchemaProperty {
    type: 'number';
    minimum?: number;
    maximum?: number;
}
/**
 * Object schema property
 */
export interface ObjectSchemaProperty extends SchemaProperty {
    type: 'object';
    properties: Record<string, SchemaProperty>;
    required?: string[];
}
/**
 * Union of all schema property types
 */
export type SchemaPropertyType = StringSchemaProperty | ArraySchemaProperty | BooleanSchemaProperty | NumberSchemaProperty | ObjectSchemaProperty;
/**
 * Blueprint parameter schema
 */
export interface BlueprintSchema {
    parameters: Record<string, SchemaPropertyType>;
    features?: Record<string, BooleanSchemaProperty>;
}
/**
 * Infer the parameter type from a schema property
 */
export type InferSchemaProperty<T extends SchemaProperty> = T extends StringSchemaProperty ? T['enum'] extends readonly string[] ? T['enum'][number] : string : T extends ArraySchemaProperty ? T['items']['enum'] extends readonly string[] ? T['items']['enum'][number][] : T['items']['type'] extends 'string' ? string[] : T['items']['type'] extends 'number' ? number[] : T['items']['type'] extends 'boolean' ? boolean[] : any[] : T extends BooleanSchemaProperty ? boolean : T extends NumberSchemaProperty ? number : T extends ObjectSchemaProperty ? {
    [K in keyof T['properties']]: InferSchemaProperty<T['properties'][K]>;
} : any;
/**
 * Infer all parameters from a blueprint schema
 */
export type InferParams<T extends BlueprintSchema> = {
    [K in keyof T['parameters']]: InferSchemaProperty<T['parameters'][K]>;
} & {
    [K in keyof T['features']]?: T['features'] extends Record<string, SchemaProperty> ? InferSchemaProperty<T['features'][K]> : never;
};
import type { BlueprintAction } from './adapter.js';
/**
 * Schema-driven blueprint action function
 * Receives validated and typed parameters
 */
export type BlueprintActionFunction<T extends BlueprintSchema> = (params: InferParams<T>) => BlueprintAction[];
/**
 * Schema-driven blueprint definition
 */
export interface SchemaDrivenBlueprint<T extends BlueprintSchema = BlueprintSchema> {
    id: string;
    name: string;
    description?: string;
    version?: string;
    schema: T;
    actions: BlueprintActionFunction<T>;
    contextualFiles?: string[];
}
/**
 * Helper function to create a schema-driven blueprint with full type inference
 * This is the magic function that enables self-schematizing blueprints
 */
export declare function defineBlueprint<T extends BlueprintSchema>(blueprint: SchemaDrivenBlueprint<T>): SchemaDrivenBlueprint<T>;
/**
 * Validate parameters against a blueprint schema
 */
export declare function validateParameters<T extends BlueprintSchema>(schema: T, params: Record<string, any>): {
    valid: boolean;
    errors: string[];
    validatedParams: InferParams<T>;
};
/**
 * Convert a schema-driven blueprint to legacy blueprint format
 * This allows the existing CLI to work with new schema-driven blueprints
 */
export declare function toLegacyBlueprint<T extends BlueprintSchema>(schemaBlueprint: SchemaDrivenBlueprint<T>, params: InferParams<T>): Blueprint;
import type { Blueprint } from './adapter.js';
export type { Blueprint, BlueprintAction } from './adapter.js';
