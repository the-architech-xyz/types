/**
 * Dashboard Question Strategy
 *
 * Provides intelligent questions and recommendations specifically for dashboard projects.
 */
import { BaseQuestionStrategy } from '../question-strategy.js';
export class DashboardStrategy extends BaseQuestionStrategy {
    name = 'Dashboard Strategy';
    projectType = 'dashboard';
    getProjectQuestions(context) {
        return [
            {
                id: 'projectName',
                type: 'input',
                message: 'What\'s your dashboard name?',
                description: 'This will be used for your project directory and app title',
                default: 'my-dashboard',
                order: 1
            },
            {
                id: 'dashboardType',
                type: 'select',
                message: 'What type of dashboard are you building?',
                description: 'This helps us recommend the right features and components',
                choices: [
                    { name: 'Analytics Dashboard', value: 'analytics', recommended: true },
                    { name: 'Admin Panel', value: 'admin' },
                    { name: 'Business Intelligence', value: 'bi' },
                    { name: 'Project Management', value: 'project' },
                    { name: 'Customer Portal', value: 'customer' },
                    { name: 'Data Visualization', value: 'data-viz' }
                ],
                default: 'analytics',
                order: 2
            },
            {
                id: 'dataSources',
                type: 'multiselect',
                message: 'What data sources will you connect to?',
                description: 'Select all that apply',
                choices: [
                    { name: 'Database (PostgreSQL, MySQL)', value: 'database', recommended: true },
                    { name: 'API Endpoints', value: 'api' },
                    { name: 'File Uploads', value: 'files' },
                    { name: 'Third-party Services', value: 'third-party' },
                    { name: 'Real-time Data', value: 'realtime' },
                    { name: 'External APIs', value: 'external-apis' }
                ],
                default: ['database'],
                order: 3
            },
            {
                id: 'userRoles',
                type: 'multiselect',
                message: 'What user roles do you need?',
                description: 'Select all that apply',
                choices: [
                    { name: 'Admin (Full access)', value: 'admin', recommended: true },
                    { name: 'Manager (Limited admin)', value: 'manager' },
                    { name: 'User (Basic access)', value: 'user' },
                    { name: 'Viewer (Read-only)', value: 'viewer' },
                    { name: 'Guest (Public)', value: 'guest' }
                ],
                default: ['admin'],
                order: 4
            },
            {
                id: 'charts',
                type: 'confirm',
                message: 'Do you need charts and graphs?',
                description: 'Data visualization components',
                default: true,
                order: 5
            },
            {
                id: 'tables',
                type: 'confirm',
                message: 'Do you need data tables?',
                description: 'Sortable, filterable data tables',
                default: true,
                order: 6
            },
            {
                id: 'filters',
                type: 'confirm',
                message: 'Do you need advanced filtering?',
                description: 'Date ranges, search, filters',
                default: true,
                order: 7
            },
            {
                id: 'export',
                type: 'confirm',
                message: 'Do you need data export?',
                description: 'Export to CSV, PDF, Excel',
                default: true,
                order: 8
            },
            {
                id: 'notifications',
                type: 'confirm',
                message: 'Do you need notifications?',
                description: 'Alerts, email notifications, real-time updates',
                default: true,
                order: 9
            }
        ];
    }
    getFeatureQuestions(context) {
        const questions = [];
        // Add chart library questions if charts are enabled
        if (context.features.includes('charts')) {
            questions.push({
                id: 'chartLibrary',
                type: 'select',
                message: 'Which chart library do you prefer?',
                description: 'Choose your data visualization library',
                choices: [
                    { name: 'Recharts (React-based)', value: 'recharts', recommended: true },
                    { name: 'Chart.js (Popular)', value: 'chartjs' },
                    { name: 'D3.js (Advanced)', value: 'd3' },
                    { name: 'Victory (React)', value: 'victory' },
                    { name: 'Nivo (Beautiful)', value: 'nivo' }
                ],
                default: 'recharts',
                order: 10
            });
        }
        // Add notification questions if enabled
        if (context.features.includes('notifications')) {
            questions.push({
                id: 'notificationTypes',
                type: 'multiselect',
                message: 'Which notification types do you need?',
                description: 'Select all that apply',
                choices: [
                    { name: 'In-app notifications', value: 'in-app', recommended: true },
                    { name: 'Email notifications', value: 'email' },
                    { name: 'SMS notifications', value: 'sms' },
                    { name: 'Push notifications', value: 'push' },
                    { name: 'Slack/Discord', value: 'slack' }
                ],
                default: ['in-app', 'email'],
                order: 11
            });
        }
        // Add export questions if enabled
        if (context.features.includes('export')) {
            questions.push({
                id: 'exportFormats',
                type: 'multiselect',
                message: 'Which export formats do you need?',
                description: 'Select all that apply',
                choices: [
                    { name: 'CSV', value: 'csv', recommended: true },
                    { name: 'Excel (XLSX)', value: 'xlsx' },
                    { name: 'PDF', value: 'pdf' },
                    { name: 'JSON', value: 'json' },
                    { name: 'PNG (Charts)', value: 'png' }
                ],
                default: ['csv', 'xlsx'],
                order: 12
            });
        }
        return questions;
    }
    getDatabaseRecommendation(context) {
        return {
            category: 'database',
            plugin: 'prisma',
            provider: 'neon',
            reason: 'Excellent for complex queries and data relationships',
            confidence: 0.9,
            alternatives: ['drizzle', 'supabase']
        };
    }
    getAuthRecommendation(context) {
        return {
            category: 'auth',
            plugin: 'clerk',
            reason: 'Pre-built components perfect for admin interfaces',
            confidence: 0.9,
            alternatives: ['better-auth', 'nextauth']
        };
    }
    getUIRecommendation(context) {
        return {
            category: 'ui',
            plugin: 'mui',
            reason: 'Comprehensive component library for data-heavy interfaces',
            confidence: 0.9,
            alternatives: ['shadcn-ui', 'chakra-ui']
        };
    }
    getPaymentRecommendation(context) {
        return {
            category: 'payment',
            plugin: 'stripe',
            reason: 'Most popular payment processor with excellent documentation',
            confidence: 0.9,
            alternatives: ['paypal', 'square']
        };
    }
    getEmailRecommendation(context) {
        return {
            category: 'email',
            plugin: 'resend',
            reason: 'Developer-friendly email API with great deliverability',
            confidence: 0.9,
            alternatives: ['sendgrid', 'mailgun']
        };
    }
}
//# sourceMappingURL=dashboard-strategy.js.map