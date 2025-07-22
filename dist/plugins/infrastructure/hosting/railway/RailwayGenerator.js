export class RailwayGenerator {
    static generateRailwayConfig(config) {
        const railwayJson = {
            '$schema': 'https://railway.app/railway.schema.json',
            build: {
                builder: config.build.builder,
                ...(config.build.builder === 'dockerfile' && { dockerfilePath: config.build.dockerfilePath }),
                ...(config.build.buildCommand && { buildCommand: config.build.buildCommand }),
                watchPatterns: config.build.watchPatterns,
            },
            deploy: {
                ...(config.deploy.startCommand && { startCommand: config.deploy.startCommand }),
                restartPolicyType: config.deploy.restartPolicyType,
                ...(config.deploy.restartPolicyMaxRetries && { restartPolicyMaxRetries: config.deploy.restartPolicyMaxRetries }),
                healthcheckPath: config.healthcheckPath,
                healthcheckTimeout: config.deploy.healthcheckTimeout,
                healthcheckInterval: config.deploy.healthcheckInterval,
                healthcheckRetries: config.deploy.healthcheckRetries,
            },
        };
        return JSON.stringify(railwayJson, null, 2);
    }
    static generatePackageJsonScripts() {
        return JSON.stringify({
            scripts: {
                'deploy': 'railway up',
                'deploy:prod': 'railway up --environment production',
                'deploy:staging': 'railway up --environment staging',
                'railway:link': 'railway link',
                'railway:status': 'railway status',
                'railway:logs': 'railway logs',
            }
        }, null, 2);
    }
    static generateEnvConfig(config) {
        let envContent = '# Railway Configuration\n';
        if (config.projectId) {
            envContent += `RAILWAY_PROJECT_ID="${config.projectId}"\n`;
        }
        if (config.token) {
            envContent += `RAILWAY_TOKEN="${config.token}"\n`;
        }
        return envContent;
    }
    static generateReadme() {
        return `# Railway Deployment

This project is configured for deployment to [Railway](https://railway.app).

## Setup

1.  **Install Railway CLI:**
    \`\`\`bash
    npm install -g @railway/cli
    \`\`\`

2.  **Login to Railway:**
    \`\`\`bash
    railway login
    \`\`\`

3.  **Link your project:**
    \`\`\`bash
    npm run railway:link
    \`\`\`
    This will associate your local repository with a Railway project.

## Deployment

To deploy your application, use the following scripts:

-   \`npm run deploy\`: Deploy to the default (production) environment.
-   \`npm run deploy:staging\`: Deploy to the staging environment.

## Configuration

The deployment is configured via the \`railway.json\` file in the root of the project. You can customize the build and deploy settings in this file.

### Environment Variables

The following environment variables can be used to configure the Railway integration:

-   \`RAILWAY_PROJECT_ID\`: The ID of your Railway project.
-   \`RAILWAY_TOKEN\`: A Railway token for authentication (optional, can use login).

These can be set in your \`.env\` file or directly in the Railway project settings.
`;
    }
}
//# sourceMappingURL=RailwayGenerator.js.map