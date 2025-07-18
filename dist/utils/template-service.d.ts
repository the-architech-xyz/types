/**
 * Template Service - EJS-based template rendering for The Architech CLI
 *
 * Provides a centralized service for rendering templates with:
 * - Variable substitution
 * - Conditional logic
 * - File includes
 * - Error handling
 * - Logging
 */
import { Logger } from '../types/agent.js';
export interface TemplateData {
    [key: string]: any;
}
export interface TemplateOptions {
    logger?: Logger;
    root?: string;
    filename?: string;
}
export declare class TemplateService {
    private logger?;
    private templatesRoot;
    constructor(templatesRoot?: string, options?: TemplateOptions);
    /**
     * Render a template with the given data
     */
    renderTemplate(agentName: string, templatePath: string, data: TemplateData, options?: TemplateOptions): Promise<string>;
    /**
     * Render a template and write it to a file
     */
    renderAndWrite(agentName: string, templatePath: string, outputPath: string, data: TemplateData, options?: TemplateOptions): Promise<void>;
    /**
     * Check if a template exists
     */
    templateExists(agentName: string, templatePath: string): Promise<boolean>;
    /**
     * List available templates for an agent
     */
    listTemplates(agentName: string): Promise<string[]>;
    /**
     * Get template content without rendering (for debugging)
     */
    getTemplateContent(agentName: string, templatePath: string): Promise<string>;
}
export declare const templateService: TemplateService;
