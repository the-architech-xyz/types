// Email template management

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  text?: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage for demo purposes
// In production, use a database
const templates: EmailTemplate[] = [];

export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  return templates;
}

export async function getEmailTemplate(id: string): Promise<EmailTemplate | null> {
  return templates.find(t => t.id === id) || null;
}

export async function createEmailTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate> {
  const newTemplate: EmailTemplate = {
    id: Math.random().toString(36).substr(2, 9),
    ...template,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  templates.push(newTemplate);
  return newTemplate;
}

export async function updateEmailTemplate(id: string, updates: Partial<Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>>): Promise<EmailTemplate | null> {
  const template = templates.find(t => t.id === id);
  if (!template) return null;
  
  Object.assign(template, updates, { updatedAt: new Date() });
  return template;
}

export async function deleteEmailTemplate(id: string): Promise<boolean> {
  const index = templates.findIndex(t => t.id === id);
  if (index === -1) return false;
  
  templates.splice(index, 1);
  return true;
}

// Pre-built email templates
export const defaultTemplates = {
  welcome: {
    name: 'Welcome Email',
    subject: 'Welcome to {{appName}}!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Welcome to {{appName}}!</h1>
        <p>Hi {{userName}},</p>
        <p>Thank you for joining us! We're excited to have you on board.</p>
        <p>Get started by exploring our features and don't hesitate to reach out if you have any questions.</p>
        <p>Best regards,<br>The {{appName}} Team</p>
      </div>
    `,
    text: `Welcome to {{appName}}!\n\nHi {{userName}},\n\nThank you for joining us! We're excited to have you on board.\n\nGet started by exploring our features and don't hesitate to reach out if you have any questions.\n\nBest regards,\nThe {{appName}} Team`
  },
  passwordReset: {
    name: 'Password Reset',
    subject: 'Reset your {{appName}} password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Password Reset Request</h1>
        <p>Hi {{userName}},</p>
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        <a href="{{resetLink}}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
        <p>Best regards,<br>The {{appName}} Team</p>
      </div>
    `,
    text: `Password Reset Request\n\nHi {{userName}},\n\nWe received a request to reset your password. Click the link below to reset it:\n\n{{resetLink}}\n\nIf you didn't request this, please ignore this email.\n\nThis link will expire in 1 hour.\n\nBest regards,\nThe {{appName}} Team`
  }
};
