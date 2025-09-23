/**
 * Schema-Driven Blueprint Types
 *
 * Self-schematizing blueprint system using TypeScript inference
 * This enables type-safe parameter validation and auto-completion
 */
// ============================================================================
// DEFINE BLUEPRINT HELPER FUNCTION
// ============================================================================
/**
 * Helper function to create a schema-driven blueprint with full type inference
 * This is the magic function that enables self-schematizing blueprints
 */
export function defineBlueprint(blueprint) {
    return blueprint;
}
// ============================================================================
// VALIDATION UTILITIES
// ============================================================================
/**
 * Validate parameters against a blueprint schema
 */
export function validateParameters(schema, params) {
    const errors = [];
    const validatedParams = {};
    // Validate parameters
    for (const [key, property] of Object.entries(schema.parameters)) {
        const value = params[key];
        if (value === undefined) {
            if (property.default !== undefined) {
                validatedParams[key] = property.default;
            }
            else {
                errors.push(`Missing required parameter: ${key}`);
            }
            continue;
        }
        // Type validation
        if (property.type === 'string' && typeof value !== 'string') {
            errors.push(`Parameter '${key}' must be a string`);
            continue;
        }
        if (property.type === 'boolean' && typeof value !== 'boolean') {
            errors.push(`Parameter '${key}' must be a boolean`);
            continue;
        }
        if (property.type === 'number' && typeof value !== 'number') {
            errors.push(`Parameter '${key}' must be a number`);
            continue;
        }
        if (property.type === 'array' && !Array.isArray(value)) {
            errors.push(`Parameter '${key}' must be an array`);
            continue;
        }
        // Enum validation for strings
        if (property.type === 'string' && 'enum' in property && property.enum) {
            if (!property.enum.includes(value)) {
                errors.push(`Parameter '${key}' must be one of: ${property.enum.join(', ')}`);
                continue;
            }
        }
        // Array item validation
        if (property.type === 'array' && 'items' in property && Array.isArray(value)) {
            const itemProperty = property.items;
            for (const item of value) {
                if (itemProperty.type === 'string' && typeof item !== 'string') {
                    errors.push(`Array item in '${key}' must be a string`);
                    break;
                }
                if ('enum' in itemProperty && itemProperty.enum && !itemProperty.enum.includes(item)) {
                    errors.push(`Array item in '${key}' must be one of: ${itemProperty.enum.join(', ')}`);
                    break;
                }
            }
        }
        validatedParams[key] = value;
    }
    // Validate features
    if (schema.features) {
        for (const [key, property] of Object.entries(schema.features)) {
            const value = params[key];
            if (value === undefined) {
                if (property.default !== undefined) {
                    validatedParams[key] = property.default;
                }
                continue;
            }
            if (typeof value !== 'boolean') {
                errors.push(`Feature '${key}' must be a boolean`);
                continue;
            }
            validatedParams[key] = value;
        }
    }
    return {
        valid: errors.length === 0,
        errors,
        validatedParams: validatedParams
    };
}
// ============================================================================
// LEGACY COMPATIBILITY
// ============================================================================
/**
 * Convert a schema-driven blueprint to legacy blueprint format
 * This allows the existing CLI to work with new schema-driven blueprints
 */
export function toLegacyBlueprint(schemaBlueprint, params) {
    const blueprint = {
        id: schemaBlueprint.id,
        name: schemaBlueprint.name,
        actions: schemaBlueprint.actions(params)
    };
    if (schemaBlueprint.description) {
        blueprint.description = schemaBlueprint.description;
    }
    if (schemaBlueprint.version) {
        blueprint.version = schemaBlueprint.version;
    }
    if (schemaBlueprint.contextualFiles) {
        blueprint.contextualFiles = schemaBlueprint.contextualFiles;
    }
    return blueprint;
}
