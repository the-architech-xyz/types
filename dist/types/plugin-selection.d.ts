/**
 * Plugin Selection Types
 *
 * Defines interfaces for interactive plugin selection and configuration
 * during project generation.
 */
import { DatabaseProvider, ORMLibrary, AuthProvider, AuthFeature, UILibrary, DeploymentPlatform, EmailService, TestingFramework } from './shared-config.js';
export interface DatabaseSelection {
    enabled: boolean;
    provider: DatabaseProvider;
    orm: ORMLibrary;
    features: Partial<Record<string, boolean>>;
}
export interface AuthSelection {
    enabled: boolean;
    providers: AuthProvider[];
    features: Partial<Record<AuthFeature, boolean>>;
}
export interface UISelection {
    enabled: boolean;
    library: UILibrary;
    features: Partial<Record<string, boolean>>;
}
export interface DeploymentSelection {
    enabled: boolean;
    platform: DeploymentPlatform;
    features: Partial<Record<string, boolean>>;
}
export interface EmailSelection {
    enabled: boolean;
    service: EmailService;
    features: Partial<Record<string, boolean>>;
}
export interface TestingSelection {
    enabled: boolean;
    framework: TestingFramework;
    features: Partial<Record<string, boolean>>;
}
export interface MonitoringSelection {
    enabled: boolean;
    services: string[];
    features: Partial<Record<string, boolean>>;
}
export interface PaymentSelection {
    enabled: boolean;
    providers: string[];
    features: Partial<Record<string, boolean>>;
}
export interface BlockchainSelection {
    enabled: boolean;
    networks: string[];
    features: Partial<Record<string, boolean>>;
}
export interface PluginSelection {
    database: DatabaseSelection;
    authentication: AuthSelection;
    ui: UISelection;
    deployment: DeploymentSelection;
    email: EmailSelection;
    testing: TestingSelection;
    monitoring: MonitoringSelection;
    payment: PaymentSelection;
    blockchain: BlockchainSelection;
}
export declare const DEFAULT_DATABASE_SELECTION: DatabaseSelection;
export declare const DEFAULT_AUTH_SELECTION: AuthSelection;
export declare const DEFAULT_UI_SELECTION: UISelection;
export declare const DEFAULT_DEPLOYMENT_SELECTION: DeploymentSelection;
export declare const DEFAULT_EMAIL_SELECTION: EmailSelection;
export declare const DEFAULT_TESTING_SELECTION: TestingSelection;
export declare const DEFAULT_MONITORING_SELECTION: MonitoringSelection;
export declare const DEFAULT_PAYMENT_SELECTION: PaymentSelection;
export declare const DEFAULT_BLOCKCHAIN_SELECTION: BlockchainSelection;
export declare const DEFAULT_PLUGIN_SELECTION: PluginSelection;
export interface PluginRecommendation {
    pluginId: string;
    reason: string;
    confidence: 'low' | 'medium' | 'high';
    benefits: string[];
    complexity: 'low' | 'medium' | 'high';
    popularity: 'low' | 'medium' | 'high';
}
export interface PluginCompatibility {
    compatible: boolean;
    conflicts: string[];
    dependencies: string[];
    warnings: string[];
    recommendations: string[];
}
export interface PluginPrompt {
    type: 'select' | 'confirm' | 'input' | 'checkbox';
    name: string;
    message: string;
    choices?: PluginChoice[];
    default?: any;
    when?: (answers: any) => boolean;
    validate?: (input: any) => boolean | string;
    description?: string;
}
export interface PluginChoice {
    name: string;
    value: any;
    description?: string;
    recommended?: boolean;
    disabled?: boolean;
}
export interface ConfigParameter {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect';
    label: string;
    description: string;
    required: boolean;
    default?: any;
    options?: ConfigOption[];
    validation?: {
        pattern?: string;
        min?: number;
        max?: number;
        custom?: (value: any) => boolean | string;
    };
}
export interface ConfigOption {
    label: string;
    value: any;
    description?: string;
}
export interface PluginConfiguration {
    pluginId: string;
    parameters: ConfigParameter[];
    values: Record<string, any>;
}
