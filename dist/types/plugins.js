/**
 * Plugin Types and Interfaces
 *
 * Defines the core plugin system types, interfaces, and utilities.
 */
/**
 * Plugin Types
 *
 * Plugin-specific types and interfaces for the modular technology system.
 * Plugins are the "hands" that implement specific technologies and generate artifacts.
 */
import { ProjectType, TargetPlatform, DatabaseFeature, ORMOption, ConnectionOption, AuthFeature, SessionOption, SecurityOption, ComponentOption, ThemeOption, StylingOption, EmailFeature, TemplateOption, TestType, CoverageOption, PaymentFeature, AnalyticsOption, AlertOption, 
// Blockchain types
BlockchainNetwork, SmartContractOption, WalletOption, 
// Framework types
FrameworkOption, BuildOption, DeploymentOption } from './core.js';
export { ProjectType, TargetPlatform, 
// Database enums
DatabaseFeature, ORMOption, ConnectionOption, 
// Auth enums
AuthFeature, SessionOption, SecurityOption, 
// UI enums
ComponentOption, ThemeOption, StylingOption, 
// Email enums
EmailFeature, TemplateOption, 
// Testing enums
TestType, CoverageOption, 
// Payment enums
PaymentFeature, 
// Monitoring enums
AnalyticsOption, AlertOption, 
// Blockchain enums
BlockchainNetwork, SmartContractOption, WalletOption, 
// Framework enums
FrameworkOption, BuildOption, DeploymentOption };
/**
 * Billing Options for Payment Plugins
 */
export var BillingOption;
(function (BillingOption) {
    BillingOption["SUBSCRIPTION"] = "subscription";
    BillingOption["ONE_TIME"] = "one-time";
    BillingOption["USAGE_BASED"] = "usage-based";
    BillingOption["FREEMIUM"] = "freemium";
    BillingOption["ENTERPRISE"] = "enterprise";
})(BillingOption || (BillingOption = {}));
export var PluginCategory;
(function (PluginCategory) {
    // Framework plugins
    PluginCategory["FRAMEWORK"] = "framework";
    // UI/UX plugins
    PluginCategory["UI_LIBRARY"] = "ui-library";
    PluginCategory["DESIGN_SYSTEM"] = "design-system";
    PluginCategory["ICON_LIBRARY"] = "icon-library";
    PluginCategory["ANIMATION"] = "animation";
    // Database plugins
    PluginCategory["DATABASE"] = "database";
    PluginCategory["ORM"] = "orm";
    PluginCategory["MIGRATION"] = "migration";
    // Authentication plugins
    PluginCategory["AUTHENTICATION"] = "authentication";
    PluginCategory["AUTHORIZATION"] = "authorization";
    // Feature plugins
    PluginCategory["PAYMENT"] = "payment";
    PluginCategory["EMAIL"] = "email";
    PluginCategory["NOTIFICATION"] = "notification";
    PluginCategory["ANALYTICS"] = "analytics";
    PluginCategory["MONITORING"] = "monitoring";
    PluginCategory["TESTING"] = "testing";
    // Infrastructure plugins
    PluginCategory["DEPLOYMENT"] = "deployment";
    PluginCategory["CI_CD"] = "ci-cd";
    PluginCategory["CONTAINERIZATION"] = "containerization";
    // Development plugins
    PluginCategory["CODE_QUALITY"] = "code-quality";
    PluginCategory["LINTING"] = "linting";
    PluginCategory["FORMATTING"] = "formatting";
    PluginCategory["BUNDLING"] = "bundling";
    // Platform plugins
    PluginCategory["MOBILE"] = "mobile";
    PluginCategory["DESKTOP"] = "desktop";
    PluginCategory["PWA"] = "pwa";
    // Integration plugins
    PluginCategory["API"] = "api";
    PluginCategory["GRAPHQL"] = "graphql";
    PluginCategory["WEBSOCKET"] = "websocket";
    // Custom category
    PluginCategory["CUSTOM"] = "custom";
})(PluginCategory || (PluginCategory = {}));
//# sourceMappingURL=plugins.js.map