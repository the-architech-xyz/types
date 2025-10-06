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
export var BlueprintActionType;
(function (BlueprintActionType) {
    BlueprintActionType["INSTALL_PACKAGES"] = "INSTALL_PACKAGES";
    BlueprintActionType["CREATE_FILE"] = "CREATE_FILE";
    BlueprintActionType["ENHANCE_FILE"] = "ENHANCE_FILE";
    BlueprintActionType["RUN_COMMAND"] = "RUN_COMMAND";
    BlueprintActionType["ADD_ENV_VAR"] = "ADD_ENV_VAR";
    BlueprintActionType["ADD_SCRIPT"] = "ADD_SCRIPT";
    BlueprintActionType["ADD_DEPENDENCY"] = "ADD_DEPENDENCY";
    BlueprintActionType["ADD_DEV_DEPENDENCY"] = "ADD_DEV_DEPENDENCY";
})(BlueprintActionType || (BlueprintActionType = {}));
/**
 * Type guard to check if a string is a valid action type
 */
export function isValidActionType(value) {
    return Object.values(BlueprintActionType).includes(value);
}
/**
 * Get all supported action types
 */
export function getSupportedActionTypes() {
    return Object.values(BlueprintActionType);
}
