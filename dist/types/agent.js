/**
 * Core Agent Interface Types
 *
 * Defines the standardized interface for all Architech agents.
 * Based on modern AI agent standards and designed for extensibility.
 */
// ============================================================================
// ENUMS
// ============================================================================
export var AgentCategory;
(function (AgentCategory) {
    AgentCategory["FOUNDATION"] = "foundation";
    AgentCategory["UI"] = "ui";
    AgentCategory["DATABASE"] = "database";
    AgentCategory["AUTHENTICATION"] = "authentication";
    AgentCategory["DEPLOYMENT"] = "deployment";
    AgentCategory["TESTING"] = "testing";
    AgentCategory["PAYMENT"] = "payment";
    AgentCategory["EMAIL"] = "email";
    AgentCategory["ADMIN"] = "admin";
    AgentCategory["MONITORING"] = "monitoring";
    AgentCategory["CUSTOM"] = "custom";
})(AgentCategory || (AgentCategory = {}));
export var CapabilityCategory;
(function (CapabilityCategory) {
    CapabilityCategory["SETUP"] = "setup";
    CapabilityCategory["CONFIGURATION"] = "configuration";
    CapabilityCategory["GENERATION"] = "generation";
    CapabilityCategory["VALIDATION"] = "validation";
    CapabilityCategory["OPTIMIZATION"] = "optimization";
    CapabilityCategory["INTEGRATION"] = "integration";
})(CapabilityCategory || (CapabilityCategory = {}));
export var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "debug";
    LogLevel["INFO"] = "info";
    LogLevel["WARN"] = "warn";
    LogLevel["ERROR"] = "error";
    LogLevel["SUCCESS"] = "success";
})(LogLevel || (LogLevel = {}));
// ============================================================================
// CONSTANTS
// ============================================================================
export const AGENT_INTERFACE_VERSION = '1.0.0';
export const DEFAULT_TIMEOUT = 300000; // 5 minutes
export const SUPPORTED_AGENT_CATEGORIES = Object.values(AgentCategory);
export const AGENT_ERROR_CODES = {
    VALIDATION_FAILED: 'VALIDATION_FAILED',
    EXECUTION_FAILED: 'EXECUTION_FAILED',
    DEPENDENCY_MISSING: 'DEPENDENCY_MISSING',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    TIMEOUT: 'TIMEOUT',
    ROLLBACK_FAILED: 'ROLLBACK_FAILED',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};
//# sourceMappingURL=agent.js.map