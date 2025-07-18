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
import * as ejs from 'ejs';
import fs from 'fs-extra';
import * as path from 'path';
import { fileURLToPath } from 'url';
export class TemplateService {
    logger;
    templatesRoot;
    constructor(templatesRoot = 'templates', options = {}) {
        this.templatesRoot = templatesRoot;
        if (options.logger) {
            this.logger = options.logger;
        }
    }
    /**
     * Render a template with the given data
     */
    async renderTemplate(agentName, templatePath, data, options = {}) {
        const fullTemplatePath = path.join(this.templatesRoot, agentName, templatePath);
        try {
            this.logger?.info(`Rendering template: ${fullTemplatePath}`);
            // Check if template exists
            if (!await fs.pathExists(fullTemplatePath)) {
                throw new Error(`Template not found: ${fullTemplatePath}`);
            }
            // Read template content
            const template = await fs.readFile(fullTemplatePath, 'utf-8');
            // Render with EJS
            const rendered = ejs.render(template, data, {
                root: path.dirname(fullTemplatePath),
                filename: fullTemplatePath,
                ...options
            });
            this.logger?.success(`Template rendered successfully: ${templatePath}`);
            return rendered;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger?.error(`Failed to render template ${templatePath}: ${errorMessage}`, error);
            throw new Error(`Template rendering failed: ${errorMessage}`);
        }
    }
    /**
     * Render a template and write it to a file
     */
    async renderAndWrite(agentName, templatePath, outputPath, data, options = {}) {
        try {
            this.logger?.info(`Rendering and writing: ${templatePath} -> ${outputPath}`);
            const content = await this.renderTemplate(agentName, templatePath, data, options);
            // Ensure output directory exists
            await fs.ensureDir(path.dirname(outputPath));
            // Write the rendered content
            await fs.writeFile(outputPath, content);
            this.logger?.success(`File written successfully: ${outputPath}`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger?.error(`Failed to render and write ${templatePath}: ${errorMessage}`, error);
            throw error;
        }
    }
    /**
     * Check if a template exists
     */
    async templateExists(agentName, templatePath) {
        const fullPath = path.join(this.templatesRoot, agentName, templatePath);
        return await fs.pathExists(fullPath);
    }
    /**
     * List available templates for an agent
     */
    async listTemplates(agentName) {
        const agentTemplatesPath = path.join(this.templatesRoot, agentName);
        if (!await fs.pathExists(agentTemplatesPath)) {
            return [];
        }
        const templates = [];
        const walkDir = async (dir, baseDir) => {
            const files = await fs.readdir(dir);
            for (const file of files) {
                const fullPath = path.join(dir, file);
                const stat = await fs.stat(fullPath);
                if (stat.isDirectory()) {
                    await walkDir(fullPath, baseDir);
                }
                else if (file.endsWith('.ejs')) {
                    const relativePath = path.relative(baseDir, fullPath);
                    templates.push(relativePath);
                }
            }
        };
        await walkDir(agentTemplatesPath, agentTemplatesPath);
        return templates;
    }
    /**
     * Get template content without rendering (for debugging)
     */
    async getTemplateContent(agentName, templatePath) {
        const fullPath = path.join(this.templatesRoot, agentName, templatePath);
        if (!await fs.pathExists(fullPath)) {
            throw new Error(`Template not found: ${fullPath}`);
        }
        return await fs.readFile(fullPath, 'utf-8');
    }
}
// Export a default instance
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Resolve to project root and then to src/templates
const projectRoot = path.resolve(__dirname, '..', '..');
const templatesPath = path.join(projectRoot, 'src', 'templates');
export const templateService = new TemplateService(templatesPath);
//# sourceMappingURL=template-service.js.map