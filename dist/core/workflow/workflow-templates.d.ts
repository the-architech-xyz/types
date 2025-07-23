/**
 * Workflow Templates System
 *
 * Pre-configured plugin selections for common use cases.
 * Dramatically reduces questions from 20+ to 2-5 while maintaining customization.
 */
interface PluginSelection {
    database: DatabaseSelection;
    authentication: AuthSelection;
    ui: UISelection;
    deployment: DeploymentSelection;
    testing: TestingSelection;
    email: EmailSelection;
    monitoring: MonitoringSelection;
    payment: PaymentSelection;
    blockchain: BlockchainSelection;
}
interface DatabaseSelection {
    enabled: boolean;
    provider: string;
    orm: string;
    features: Record<string, boolean>;
}
interface AuthSelection {
    enabled: boolean;
    providers: string[];
    features: Record<string, boolean>;
}
interface UISelection {
    enabled: boolean;
    library: string;
    features: Record<string, boolean>;
}
interface DeploymentSelection {
    enabled: boolean;
    platform: string;
    features: Record<string, boolean>;
}
interface TestingSelection {
    enabled: boolean;
    framework: string;
    features: Record<string, boolean>;
}
interface EmailSelection {
    enabled: boolean;
    service: string;
    features: Record<string, boolean>;
}
interface MonitoringSelection {
    enabled: boolean;
    services: string[];
    features: Record<string, boolean>;
}
interface PaymentSelection {
    enabled: boolean;
    providers: string[];
    features: Record<string, boolean>;
}
interface BlockchainSelection {
    enabled: boolean;
    networks: string[];
    features: Record<string, boolean>;
}
export interface WorkflowTemplate {
    id: string;
    name: string;
    description: string;
    questions: number;
    estimatedTime: string;
    targetAudience: string[];
    pluginSelection: PluginSelection;
    customizations: TemplateCustomization[];
    keywords: string[];
    complexity: 'beginner' | 'intermediate' | 'expert';
}
export interface TemplateCustomization {
    id: string;
    name: string;
    description: string;
    type: 'boolean' | 'choice' | 'text';
    options?: string[];
    default?: any;
    required?: boolean;
}
export interface TemplateSuggestion {
    template: WorkflowTemplate;
    confidence: number;
    reason: string;
    keywords: string[];
}
export declare const WORKFLOW_TEMPLATES: WorkflowTemplate[];
export declare class WorkflowTemplateService {
    /**
     * Get all available templates
     */
    static getTemplates(): WorkflowTemplate[];
    /**
     * Get template by ID
     */
    static getTemplate(id: string): WorkflowTemplate | undefined;
    /**
     * Get templates by complexity level
     */
    static getTemplatesByComplexity(complexity: 'beginner' | 'intermediate' | 'expert'): WorkflowTemplate[];
    /**
     * Get templates by target audience
     */
    static getTemplatesByAudience(audience: string): WorkflowTemplate[];
    /**
     * Get custom template (full customization)
     */
    static getCustomTemplate(): WorkflowTemplate;
}
export {};
