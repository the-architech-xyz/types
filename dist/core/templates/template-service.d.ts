/**
 * Template Service - EJS-based template rendering for The Architech CLI
 *
 * Provides a centralized service for rendering templates with:
 * - Variable substitution
 * - Conditional logic
 * - File includes
 * - Error handling
 * - Logging
 * - Framework-aware rendering
 */
import { Logger } from '../../types/agents.js';
export interface TemplateData {
    [key: string]: any;
}
export interface TemplateOptions {
    logger?: Logger;
    root?: string;
    filename?: string;
}
export type TemplateCategory = 'shared' | 'frameworks' | 'packages';
export declare class TemplateService {
    private logger?;
    private templatesRoot;
    constructor(templatesRoot?: string, options?: TemplateOptions);
    /**
     * Render a template with the given data (legacy method for backward compatibility)
     */
    renderTemplate(agentName: string, templatePath: string, data: TemplateData, options?: TemplateOptions): Promise<string>;
    /**
     * Simple render method - alias for renderTemplateNew
     */
    render(templatePath: string, data: TemplateData, options?: TemplateOptions): Promise<string>;
    /**
     * Render a template with the new unified structure
     */
    renderTemplateNew(category: TemplateCategory, templatePath: string, data: TemplateData, options?: TemplateOptions): Promise<string>;
    /**
     * Render a framework-specific template
     */
    renderFrameworkTemplate(framework: string, templatePath: string, data: TemplateData, options?: TemplateOptions): Promise<string>;
    /**
     * Render a template and write it to a file (legacy method)
     */
    renderAndWrite(agentName: string, templatePath: string, outputPath: string, data: TemplateData, options?: TemplateOptions): Promise<void>;
    /**
     * Render a template and write it to a file (new method)
     */
    renderAndWriteNew(category: TemplateCategory, templatePath: string, outputPath: string, data: TemplateData, options?: TemplateOptions): Promise<void>;
    /**
     * Render a framework template and write it to a file
     */
    renderFrameworkAndWrite(framework: string, templatePath: string, outputPath: string, data: TemplateData, options?: TemplateOptions): Promise<void>;
    /**
     * Check if a template exists
     */
    templateExists(agentName: string, templatePath: string): Promise<boolean>;
    /**
     * Check if a template exists in the new structure
     */
    templateExistsNew(category: TemplateCategory, templatePath: string): Promise<boolean>;
    /**
     * Check if a framework template exists
     */
    frameworkTemplateExists(framework: string, templatePath: string): Promise<boolean>;
    /**
     * List available templates for an agent (legacy)
     */
    listTemplates(agentName: string): Promise<string[]>;
    /**
     * List available templates in the new structure
     */
    listTemplatesNew(category: TemplateCategory): Promise<string[]>;
    /**
     * Get template content without rendering (for debugging)
     */
    getTemplateContent(agentName: string, templatePath: string): Promise<string>;
    /**
     * Get template content from new structure
     */
    getTemplateContentNew(category: TemplateCategory, templatePath: string): Promise<string>;
}
export declare const templateService: TemplateService;
