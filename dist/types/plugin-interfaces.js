/**
 * Enhanced Plugin Interface System
 *
 * Defines category-specific plugin interfaces and dynamic parameter schemas
 * that enable plugins to drive their own configuration questions and ensure
 * consistent unified exports across different technologies.
 */
// ============================================================================
// ENUM DEFINITIONS
// ============================================================================
export var DatabaseProvider;
(function (DatabaseProvider) {
    DatabaseProvider["NEON"] = "neon";
    DatabaseProvider["SUPABASE"] = "supabase";
    DatabaseProvider["MONGODB"] = "mongodb";
    DatabaseProvider["PLANETSCALE"] = "planetscale";
    DatabaseProvider["LOCAL"] = "local";
})(DatabaseProvider || (DatabaseProvider = {}));
export var ORMOption;
(function (ORMOption) {
    ORMOption["DRIZZLE"] = "drizzle";
    ORMOption["PRISMA"] = "prisma";
    ORMOption["TYPEORM"] = "typeorm";
    ORMOption["MONGOOSE"] = "mongoose";
})(ORMOption || (ORMOption = {}));
export var DatabaseFeature;
(function (DatabaseFeature) {
    DatabaseFeature["MIGRATIONS"] = "migrations";
    DatabaseFeature["SEEDING"] = "seeding";
    DatabaseFeature["BACKUP"] = "backup";
    DatabaseFeature["CONNECTION_POOLING"] = "connectionPooling";
    DatabaseFeature["SSL"] = "ssl";
    DatabaseFeature["READ_REPLICAS"] = "readReplicas";
})(DatabaseFeature || (DatabaseFeature = {}));
export var AuthProvider;
(function (AuthProvider) {
    AuthProvider["CREDENTIALS"] = "credentials";
    AuthProvider["GOOGLE"] = "google";
    AuthProvider["GITHUB"] = "github";
    AuthProvider["DISCORD"] = "discord";
    AuthProvider["TWITTER"] = "twitter";
    AuthProvider["FACEBOOK"] = "facebook";
    AuthProvider["APPLE"] = "apple";
})(AuthProvider || (AuthProvider = {}));
export var AuthFeature;
(function (AuthFeature) {
    AuthFeature["EMAIL_VERIFICATION"] = "emailVerification";
    AuthFeature["PASSWORD_RESET"] = "passwordReset";
    AuthFeature["TWO_FACTOR"] = "twoFactor";
    AuthFeature["SESSION_MANAGEMENT"] = "sessionManagement";
    AuthFeature["RBAC"] = "rbac";
    AuthFeature["OAUTH_CALLBACKS"] = "oauthCallbacks";
})(AuthFeature || (AuthFeature = {}));
export var UILibrary;
(function (UILibrary) {
    UILibrary["SHADCN_UI"] = "shadcn-ui";
    UILibrary["CHAKRA_UI"] = "chakra-ui";
    UILibrary["MUI"] = "mui";
    UILibrary["TAMAGUI"] = "tamagui";
    UILibrary["ANT_DESIGN"] = "antd";
    UILibrary["RADIX_UI"] = "radix";
})(UILibrary || (UILibrary = {}));
export var ComponentOption;
(function (ComponentOption) {
    ComponentOption["BUTTON"] = "button";
    ComponentOption["CARD"] = "card";
    ComponentOption["INPUT"] = "input";
    ComponentOption["FORM"] = "form";
    ComponentOption["MODAL"] = "modal";
    ComponentOption["TABLE"] = "table";
    ComponentOption["NAVIGATION"] = "navigation";
    ComponentOption["SELECT"] = "select";
    ComponentOption["CHECKBOX"] = "checkbox";
    ComponentOption["SWITCH"] = "switch";
    ComponentOption["BADGE"] = "badge";
    ComponentOption["AVATAR"] = "avatar";
    ComponentOption["ALERT"] = "alert";
})(ComponentOption || (ComponentOption = {}));
export var ThemeOption;
(function (ThemeOption) {
    ThemeOption["LIGHT"] = "light";
    ThemeOption["DARK"] = "dark";
    ThemeOption["AUTO"] = "auto";
})(ThemeOption || (ThemeOption = {}));
export var StylingOption;
(function (StylingOption) {
    StylingOption["TAILWIND"] = "tailwind";
    StylingOption["CSS_MODULES"] = "css-modules";
    StylingOption["STYLED_COMPONENTS"] = "styled-components";
    StylingOption["EMOTION"] = "emotion";
})(StylingOption || (StylingOption = {}));
export var DeploymentPlatform;
(function (DeploymentPlatform) {
    DeploymentPlatform["VERCEL"] = "vercel";
    DeploymentPlatform["RAILWAY"] = "railway";
    DeploymentPlatform["NETLIFY"] = "netlify";
    DeploymentPlatform["AWS"] = "aws";
    DeploymentPlatform["GCP"] = "gcp";
    DeploymentPlatform["DOCKER"] = "docker";
})(DeploymentPlatform || (DeploymentPlatform = {}));
export var TestingFramework;
(function (TestingFramework) {
    TestingFramework["VITEST"] = "vitest";
    TestingFramework["JEST"] = "jest";
    TestingFramework["PLAYWRIGHT"] = "playwright";
    TestingFramework["CYPRESS"] = "cypress";
})(TestingFramework || (TestingFramework = {}));
export var EmailService;
(function (EmailService) {
    EmailService["RESEND"] = "resend";
    EmailService["SENDGRID"] = "sendgrid";
    EmailService["MAILGUN"] = "mailgun";
    EmailService["SES"] = "ses";
})(EmailService || (EmailService = {}));
export var MonitoringService;
(function (MonitoringService) {
    MonitoringService["SENTRY"] = "sentry";
    MonitoringService["VERCEL_ANALYTICS"] = "vercelAnalytics";
    MonitoringService["GOOGLE_ANALYTICS"] = "googleAnalytics";
    MonitoringService["POSTHOG"] = "posthog";
    MonitoringService["MIXPANEL"] = "mixpanel";
})(MonitoringService || (MonitoringService = {}));
export var PaymentProvider;
(function (PaymentProvider) {
    PaymentProvider["STRIPE"] = "stripe";
    PaymentProvider["PAYPAL"] = "paypal";
    PaymentProvider["SQUARE"] = "square";
    PaymentProvider["PADDLE"] = "paddle";
})(PaymentProvider || (PaymentProvider = {}));
export var BlockchainNetwork;
(function (BlockchainNetwork) {
    BlockchainNetwork["ETHEREUM"] = "ethereum";
    BlockchainNetwork["POLYGON"] = "polygon";
    BlockchainNetwork["SOLANA"] = "solana";
    BlockchainNetwork["BSC"] = "bsc";
})(BlockchainNetwork || (BlockchainNetwork = {}));
// ============================================================================
// ENUMS
// ============================================================================ 
//# sourceMappingURL=plugin-interfaces.js.map