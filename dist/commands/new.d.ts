/**
 * New Command - Project Generation
 *
 * Handles the creation of new projects with intelligent template selection
 * and guided customization.
 */
import { WorkflowTemplate } from '../core/workflow/workflow-templates.js';
export interface NewOptions {
    packageManager?: string;
    noGit?: boolean;
    noInstall?: boolean;
    yes?: boolean;
    projectType?: 'quick-prototype' | 'scalable-monorepo';
    template?: string;
}
export interface NewConfig {
    projectName: string;
    projectType: 'quick-prototype' | 'scalable-monorepo';
    packageManager: string;
    skipGit: boolean;
    skipInstall: boolean;
    useDefaults: boolean;
    userInput?: string;
    template: string;
    selectedTemplate?: WorkflowTemplate;
    customizations?: Record<string, any>;
}
export declare function newCommand(projectName?: string, options?: NewOptions): Promise<void>;
