/**
 * Blueprint Action Type Enums
 *
 * Type-safe enums for all blueprint action types currently supported by the CLI.
 * This provides compile-time validation and IntelliSense for action types.
 */
/**
 * Supported Blueprint Action Types
 *
 * Only includes action types that have corresponding handlers in the CLI.
 * Add new action types here when new handlers are implemented.
 */
export declare enum BlueprintActionType {
    INSTALL_PACKAGES = "INSTALL_PACKAGES",
    CREATE_FILE = "CREATE_FILE",
    ENHANCE_FILE = "ENHANCE_FILE",
    RUN_COMMAND = "RUN_COMMAND",
    ADD_ENV_VAR = "ADD_ENV_VAR",
    ADD_SCRIPT = "ADD_SCRIPT",
    ADD_DEPENDENCY = "ADD_DEPENDENCY",
    ADD_DEV_DEPENDENCY = "ADD_DEV_DEPENDENCY"
}
/**
 * Type guard to check if a string is a valid action type
 */
export declare function isValidActionType(value: string): value is BlueprintActionType;
/**
 * Get all supported action types
 */
export declare function getSupportedActionTypes(): BlueprintActionType[];
