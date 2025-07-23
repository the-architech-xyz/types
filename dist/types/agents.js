/**
 * Agent Types
 *
 * Agent-specific types and interfaces for the AI-powered orchestration system.
 * Agents are the "brains" that coordinate plugin execution and make intelligent decisions.
 */
import { LogLevel, ProjectType, TargetPlatform, DEFAULT_TIMEOUT, ERROR_CODES } from './core.js';
export { LogLevel, ProjectType, TargetPlatform, DEFAULT_TIMEOUT, ERROR_CODES };
// ============================================================================
// ENUMS
// ============================================================================
export var AgentCategory;
(function (AgentCategory) {
    AgentCategory["FOUNDATION"] = "foundation";
    AgentCategory["FRAMEWORK"] = "framework";
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
    CapabilityCategory["FOUNDATION"] = "foundation";
    CapabilityCategory["FRAMEWORK"] = "framework";
    CapabilityCategory["SETUP"] = "setup";
    CapabilityCategory["CONFIGURATION"] = "configuration";
    CapabilityCategory["GENERATION"] = "generation";
    CapabilityCategory["VALIDATION"] = "validation";
    CapabilityCategory["OPTIMIZATION"] = "optimization";
    CapabilityCategory["INTEGRATION"] = "integration";
})(CapabilityCategory || (CapabilityCategory = {}));
// ============================================================================
// CONSTANTS
// ============================================================================
export const AGENT_INTERFACE_VERSION = '1.0.0';
export const SUPPORTED_AGENT_CATEGORIES = Object.values(AgentCategory);
export const AGENT_ERROR_CODES = ERROR_CODES;
//# sourceMappingURL=agents.js.map