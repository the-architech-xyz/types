/**
 * Plugin System Types
 *
 * Defines the interface for registering and managing technology stack plugins.
 * This enables true modularity where any UI library, database, framework, or feature
 * can be added as a plugin without modifying core code.
 */
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
export var TargetPlatform;
(function (TargetPlatform) {
    TargetPlatform["WEB"] = "web";
    TargetPlatform["MOBILE"] = "mobile";
    TargetPlatform["DESKTOP"] = "desktop";
    TargetPlatform["SERVER"] = "server";
    TargetPlatform["CLI"] = "cli";
})(TargetPlatform || (TargetPlatform = {}));
export var ProjectType;
(function (ProjectType) {
    ProjectType["NEXTJS"] = "nextjs";
    ProjectType["REACT"] = "react";
    ProjectType["VUE"] = "vue";
    ProjectType["NUXT"] = "nuxt";
    ProjectType["SVELTE"] = "svelte";
    ProjectType["ANGULAR"] = "angular";
    ProjectType["EXPO"] = "expo";
    ProjectType["REACT_NATIVE"] = "react-native";
    ProjectType["ELECTRON"] = "electron";
    ProjectType["TAURI"] = "tauri";
    ProjectType["NODE"] = "node";
    ProjectType["EXPRESS"] = "express";
    ProjectType["FASTIFY"] = "fastify";
    ProjectType["NESTJS"] = "nestjs";
    ProjectType["CUSTOM"] = "custom";
})(ProjectType || (ProjectType = {}));
//# sourceMappingURL=plugin.js.map