/**
 * Enhanced Plugin Interface System
 *
 * Defines category-specific plugin interfaces and dynamic parameter schemas
 * that enable plugins to drive their own configuration questions and ensure
 * consistent unified exports across different technologies.
 */
import { IPlugin, PluginCategory, PluginContext, ValidationResult } from './plugin.js';
export interface IEnhancedPlugin extends IPlugin {
    getParameterSchema(): ParameterSchema;
    getDynamicQuestions(context: PluginContext): PluginQuestion[];
    validateConfiguration(config: Record<string, any>): ValidationResult;
    generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate;
}
export interface IUIDatabasePlugin extends IEnhancedPlugin {
    getDatabaseProviders(): DatabaseProvider[];
    getORMOptions(): ORMOption[];
    getDatabaseFeatures(): DatabaseFeature[];
    getConnectionOptions(): ConnectionOption[];
}
export interface IUIAuthPlugin extends IEnhancedPlugin {
    getAuthProviders(): AuthProvider[];
    getAuthFeatures(): AuthFeature[];
    getSessionOptions(): SessionOption[];
    getSecurityOptions(): SecurityOption[];
}
export interface IUIPlugin extends IEnhancedPlugin {
    getUILibraries(): UILibrary[];
    getComponentOptions(): ComponentOption[];
    getThemeOptions(): ThemeOption[];
    getStylingOptions(): StylingOption[];
}
export interface IUIDeploymentPlugin extends IEnhancedPlugin {
    getDeploymentPlatforms(): DeploymentPlatform[];
    getEnvironmentOptions(): EnvironmentOption[];
    getInfrastructureOptions(): InfrastructureOption[];
}
export interface IUITestingPlugin extends IEnhancedPlugin {
    getTestingFrameworks(): TestingFramework[];
    getTestTypes(): TestType[];
    getCoverageOptions(): CoverageOption[];
}
export interface IUIEmailPlugin extends IEnhancedPlugin {
    getEmailServices(): EmailService[];
    getEmailFeatures(): EmailFeature[];
    getTemplateOptions(): TemplateOption[];
}
export interface IUIMonitoringPlugin extends IEnhancedPlugin {
    getMonitoringServices(): MonitoringService[];
    getAnalyticsOptions(): AnalyticsOption[];
    getAlertOptions(): AlertOption[];
}
export interface IUIPaymentPlugin extends IEnhancedPlugin {
    getPaymentProviders(): PaymentProvider[];
    getPaymentFeatures(): PaymentFeature[];
    getBillingOptions(): BillingOption[];
}
export interface IUIBlockchainPlugin extends IEnhancedPlugin {
    getBlockchainNetworks(): BlockchainNetwork[];
    getSmartContractOptions(): SmartContractOption[];
    getWalletOptions(): WalletOption[];
}
export interface ParameterSchema {
    category: PluginCategory;
    parameters: ParameterDefinition[];
    dependencies: ParameterDependency[];
    validations: ParameterValidation[];
    groups: ParameterGroup[];
}
export interface ParameterDefinition {
    id: string;
    name: string;
    type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'object' | 'array';
    description: string;
    required: boolean;
    default?: any;
    options?: ParameterOption[];
    conditions?: ParameterCondition[];
    validation?: ParameterValidationRule[];
    group?: string;
    order?: number;
}
export interface ParameterOption {
    value: string | number | boolean;
    label: string;
    description?: string;
    recommended?: boolean;
    disabled?: boolean;
}
export interface ParameterCondition {
    parameter: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
    value: any;
    action: 'show' | 'hide' | 'enable' | 'disable' | 'require' | 'optional';
}
export interface ParameterDependency {
    parameter: string;
    dependsOn: string;
    condition: ParameterCondition;
    message?: string;
}
export interface ParameterValidation {
    parameter: string;
    rules: ParameterValidationRule[];
}
export interface ParameterValidationRule {
    type: 'required' | 'pattern' | 'min' | 'max' | 'minLength' | 'maxLength' | 'custom';
    value?: any;
    message: string;
    validator?: (value: any, config: Record<string, any>) => boolean | string;
}
export interface ParameterGroup {
    id: string;
    name: string;
    description: string;
    order: number;
    parameters: string[];
}
export interface PluginQuestion {
    id: string;
    type: 'confirm' | 'input' | 'select' | 'checkbox' | 'multiselect';
    name: string;
    message: string;
    description?: string;
    choices?: QuestionChoice[];
    default?: any;
    when?: (answers: Record<string, any>) => boolean;
    validate?: (input: any) => boolean | string;
    group?: string;
    order?: number;
}
export interface QuestionChoice {
    name: string;
    value: any;
    description?: string;
    recommended?: boolean;
    disabled?: boolean;
}
export interface UnifiedInterfaceTemplate {
    category: PluginCategory;
    exports: ExportDefinition[];
    types: TypeDefinition[];
    utilities: UtilityDefinition[];
    constants: ConstantDefinition[];
    documentation: string;
}
export interface ExportDefinition {
    name: string;
    type: 'function' | 'class' | 'interface' | 'type' | 'constant';
    implementation: string;
    documentation: string;
    parameters?: ParameterDefinition[];
    returnType?: string;
    examples?: string[];
}
export interface TypeDefinition {
    name: string;
    type: 'interface' | 'type' | 'enum';
    definition: string;
    documentation: string;
    properties?: TypeProperty[];
}
export interface TypeProperty {
    name: string;
    type: string;
    required: boolean;
    description: string;
    default?: any;
}
export interface UtilityDefinition {
    name: string;
    type: 'function' | 'class';
    implementation: string;
    documentation: string;
    parameters: ParameterDefinition[];
    returnType: string;
    examples: string[];
}
export interface ConstantDefinition {
    name: string;
    value: any;
    documentation: string;
    type: string;
}
export interface DatabasePluginConfig {
    provider: DatabaseProvider;
    connection: DatabaseConnection;
    features: DatabaseFeatures;
    orm?: ORMConfig;
    migrations?: MigrationConfig;
    seeding?: SeedingConfig;
}
export interface NeonConfig extends DatabasePluginConfig {
    provider: DatabaseProvider.NEON;
    connection: {
        connectionString: string;
        region?: string;
        ssl?: boolean;
    };
}
export interface SupabaseConfig extends DatabasePluginConfig {
    provider: DatabaseProvider.SUPABASE;
    connection: {
        projectUrl: string;
        apiKey: string;
        serviceRoleKey?: string;
        anonKey?: string;
    };
}
export interface MongoDBConfig extends DatabasePluginConfig {
    provider: DatabaseProvider.MONGODB;
    connection: {
        connectionString: string;
        databaseName: string;
        options?: Record<string, any>;
    };
}
export interface AuthPluginConfig {
    providers: AuthProvider[];
    features: AuthFeatures;
    session: SessionConfig;
    security: SecurityConfig;
}
export interface BetterAuthConfig extends AuthPluginConfig {
    providers: AuthProvider[];
    features: {
        emailVerification: boolean;
        passwordReset: boolean;
        twoFactor: boolean;
        sessionManagement: boolean;
        rbac: boolean;
        oauthCallbacks: boolean;
    };
    session: {
        duration: number;
        refreshToken: boolean;
        secure: boolean;
    };
}
export interface NextAuthConfig extends AuthPluginConfig {
    providers: AuthProvider[];
    features: {
        emailVerification: boolean;
        passwordReset: boolean;
        twoFactor: boolean;
        sessionManagement: boolean;
        rbac: boolean;
        oauthCallbacks: boolean;
    };
    session: {
        duration: number;
        strategy: 'jwt' | 'database';
        maxAge: number;
        updateAge: number;
    };
}
export interface UIPluginConfig {
    library: UILibrary;
    theme: ThemeConfig;
    components: ComponentConfig;
    styling: StylingConfig;
    features: UIFeatures;
}
export interface ShadcnUIConfig extends UIPluginConfig {
    library: UILibrary.SHADCN_UI;
    theme: {
        mode: ThemeOption;
        colors?: Record<string, string>;
        fonts?: Record<string, string>;
    };
    components: {
        list: ComponentOption[];
        custom?: Record<string, any>;
    };
    styling: {
        approach: StylingOption.TAILWIND;
        customCSS?: string;
    };
    features: {
        animations: boolean;
        responsiveDesign: boolean;
        accessibility: boolean;
        iconLibrary: boolean;
        internationalization: boolean;
    };
}
export declare enum DatabaseProvider {
    NEON = "neon",
    SUPABASE = "supabase",
    MONGODB = "mongodb",
    PLANETSCALE = "planetscale",
    LOCAL = "local"
}
export declare enum ORMOption {
    DRIZZLE = "drizzle",
    PRISMA = "prisma",
    TYPEORM = "typeorm",
    MONGOOSE = "mongoose"
}
export declare enum DatabaseFeature {
    MIGRATIONS = "migrations",
    SEEDING = "seeding",
    BACKUP = "backup",
    CONNECTION_POOLING = "connectionPooling",
    SSL = "ssl",
    READ_REPLICAS = "readReplicas"
}
export declare enum AuthProvider {
    CREDENTIALS = "credentials",
    GOOGLE = "google",
    GITHUB = "github",
    DISCORD = "discord",
    TWITTER = "twitter",
    FACEBOOK = "facebook",
    APPLE = "apple"
}
export declare enum AuthFeature {
    EMAIL_VERIFICATION = "emailVerification",
    PASSWORD_RESET = "passwordReset",
    TWO_FACTOR = "twoFactor",
    SESSION_MANAGEMENT = "sessionManagement",
    RBAC = "rbac",
    OAUTH_CALLBACKS = "oauthCallbacks"
}
export declare enum UILibrary {
    SHADCN_UI = "shadcn-ui",
    CHAKRA_UI = "chakra-ui",
    MUI = "mui",
    TAMAGUI = "tamagui",
    ANT_DESIGN = "antd",
    RADIX_UI = "radix"
}
export declare enum ComponentOption {
    BUTTON = "button",
    CARD = "card",
    INPUT = "input",
    FORM = "form",
    MODAL = "modal",
    TABLE = "table",
    NAVIGATION = "navigation",
    SELECT = "select",
    CHECKBOX = "checkbox",
    SWITCH = "switch",
    BADGE = "badge",
    AVATAR = "avatar",
    ALERT = "alert"
}
export declare enum ThemeOption {
    LIGHT = "light",
    DARK = "dark",
    AUTO = "auto"
}
export declare enum StylingOption {
    TAILWIND = "tailwind",
    CSS_MODULES = "css-modules",
    STYLED_COMPONENTS = "styled-components",
    EMOTION = "emotion"
}
export declare enum DeploymentPlatform {
    VERCEL = "vercel",
    RAILWAY = "railway",
    NETLIFY = "netlify",
    AWS = "aws",
    GCP = "gcp",
    DOCKER = "docker"
}
export declare enum TestingFramework {
    VITEST = "vitest",
    JEST = "jest",
    PLAYWRIGHT = "playwright",
    CYPRESS = "cypress"
}
export declare enum EmailService {
    RESEND = "resend",
    SENDGRID = "sendgrid",
    MAILGUN = "mailgun",
    SES = "ses"
}
export declare enum MonitoringService {
    SENTRY = "sentry",
    VERCEL_ANALYTICS = "vercelAnalytics",
    GOOGLE_ANALYTICS = "googleAnalytics",
    POSTHOG = "posthog",
    MIXPANEL = "mixpanel"
}
export declare enum PaymentProvider {
    STRIPE = "stripe",
    PAYPAL = "paypal",
    SQUARE = "square",
    PADDLE = "paddle"
}
export declare enum BlockchainNetwork {
    ETHEREUM = "ethereum",
    POLYGON = "polygon",
    SOLANA = "solana",
    BSC = "bsc"
}
export type DatabaseConnection = NeonConfig['connection'] | SupabaseConfig['connection'] | MongoDBConfig['connection'];
export type DatabaseFeatures = Partial<Record<DatabaseFeature, boolean>>;
export type AuthProviders = AuthProvider[];
export type AuthFeatures = Partial<Record<AuthFeature, boolean>>;
export type UILibraries = UILibrary[];
export type ComponentOptions = ComponentOption[];
export type ThemeOptions = ThemeOption;
export type StylingOptions = StylingOption;
export type DeploymentPlatforms = DeploymentPlatform[];
export type TestingFrameworks = TestingFramework[];
export type EmailServices = EmailService[];
export type MonitoringServices = MonitoringService[];
export type PaymentProviders = PaymentProvider[];
export type BlockchainNetworks = BlockchainNetwork[];
export interface ConnectionOption {
    name: string;
    value: string;
    description: string;
    required: boolean;
    secret?: boolean;
}
export interface SessionOption {
    name: string;
    value: string | number | boolean;
    description: string;
    type: 'string' | 'number' | 'boolean';
}
export interface SecurityOption {
    name: string;
    value: string | number | boolean;
    description: string;
    type: 'string' | 'number' | 'boolean';
}
export interface InfrastructureOption {
    name: string;
    value: string | number | boolean;
    description: string;
    type: 'string' | 'number' | 'boolean';
}
export interface TestType {
    name: string;
    value: string;
    description: string;
}
export interface CoverageOption {
    name: string;
    value: string | number | boolean;
    description: string;
    type: 'string' | 'number' | 'boolean';
}
export interface EmailFeature {
    name: string;
    value: string;
    description: string;
}
export interface TemplateOption {
    name: string;
    value: string;
    description: string;
}
export interface AnalyticsOption {
    name: string;
    value: string | number | boolean;
    description: string;
    type: 'string' | 'number' | 'boolean';
}
export interface AlertOption {
    name: string;
    value: string | number | boolean;
    description: string;
    type: 'string' | 'number' | 'boolean';
}
export interface PaymentFeature {
    name: string;
    value: string;
    description: string;
}
export interface BillingOption {
    name: string;
    value: string | number | boolean;
    description: string;
    type: 'string' | 'number' | 'boolean';
}
export interface SmartContractOption {
    name: string;
    value: string;
    description: string;
}
export interface WalletOption {
    name: string;
    value: string;
    description: string;
}
export interface ORMConfig {
    type: ORMOption;
    features: string[];
    configuration: Record<string, any>;
}
export interface MigrationConfig {
    enabled: boolean;
    autoGenerate: boolean;
    directory: string;
}
export interface SeedingConfig {
    enabled: boolean;
    directory: string;
    files: string[];
}
export interface SessionConfig {
    duration: number;
    refreshToken?: boolean;
    secure?: boolean;
    strategy?: 'jwt' | 'database';
    maxAge?: number;
    updateAge?: number;
}
export interface SecurityConfig {
    secret: string;
    redirectUrl: string;
    callbackUrl: string;
}
export interface ThemeConfig {
    mode: ThemeOption;
    colors?: Record<string, string>;
    fonts?: Record<string, string>;
}
export interface ComponentConfig {
    list: ComponentOption[];
    custom?: Record<string, any>;
}
export interface StylingConfig {
    approach: StylingOption;
    customCSS?: string;
}
export interface UIFeatures {
    animations: boolean;
    responsiveDesign: boolean;
    accessibility: boolean;
    iconLibrary: boolean;
    internationalization: boolean;
}
export interface EnvironmentOption {
    name: string;
    value: string;
    description: string;
}
