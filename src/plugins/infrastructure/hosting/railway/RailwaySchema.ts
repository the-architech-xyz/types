import { ConfigSchema } from '../../../../types/plugins.js';

export interface RailwayConfig {
  projectId?: string;
  serviceId?: string;
  token?: string;
  environment: string;
  autoDeploy: boolean;
  healthcheckPath: string;
  build: {
    builder: 'nixpacks' | 'dockerfile';
    dockerfilePath?: string;
    buildCommand?: string;
    watchPatterns?: string[];
  };
  deploy: {
    startCommand?: string;
    restartPolicyType: 'on_failure' | 'always' | 'never';
    restartPolicyMaxRetries?: number;
    healthcheckTimeout?: number;
    healthcheckInterval?: number;
    healthcheckRetries?: number;
  };
}

export const RailwayConfigSchema: ConfigSchema = {
  type: 'object',
  properties: {
    projectId: {
      type: 'string',
      description: 'The Railway project ID. Can be found in your project settings.',
    },
    serviceId: {
      type: 'string',
      description: 'The Railway service ID. If not provided, a new service will be created.',
    },
    token: {
      type: 'string',
      description: 'A Railway project or environment token for authentication.',
    },
    environment: {
      type: 'string',
      description: 'The Railway environment to deploy to.',
      default: 'production',
    },
    autoDeploy: {
      type: 'boolean',
      description: 'Enable automatic deployments from your Git repository.',
      default: true,
    },
    healthcheckPath: {
      type: 'string',
      description: 'The path for the health check endpoint (e.g., /api/health).',
      default: '/api/health',
    },
    build: {
      type: 'object',
      description: 'Configuration for the build process.',
      properties: {
        builder: {
          type: 'string',
          description: 'The builder to use for your application.',
          enum: ['nixpacks', 'dockerfile'],
          default: 'nixpacks',
        },
        dockerfilePath: {
          type: 'string',
          description: 'The path to the Dockerfile if using the dockerfile builder.',
        },
        buildCommand: {
          type: 'string',
          description: 'A custom command to build your application (e.g., npm run build).',
        },
        watchPatterns: {
          type: 'array',
          description: 'Patterns to watch for changes to trigger a rebuild.',
          items: {
            type: 'string',
            description: 'A file or glob pattern to watch.'
          },
          default: ['**/*'],
        },
      },
      default: {
        builder: 'nixpacks',
        watchPatterns: ['**/*'],
      },
    },
    deploy: {
      type: 'object',
      description: 'Configuration for the deployment process.',
      properties: {
        startCommand: {
          type: 'string',
          description: 'The command to start your application after a deployment.',
        },
        restartPolicyType: {
          type: 'string',
          description: 'The restart policy for your application.',
          enum: ['on_failure', 'always', 'never'],
          default: 'on_failure',
        },
        restartPolicyMaxRetries: {
          type: 'number',
          description: 'The maximum number of times to retry a failed deployment.',
          default: 10,
        },
        healthcheckTimeout: {
          type: 'number',
          description: 'The timeout in seconds for the health check.',
          default: 300,
        },
        healthcheckInterval: {
          type: 'number',
          description: 'The interval in seconds between health checks.',
          default: 5,
        },
        healthcheckRetries: {
          type: 'number',
          description: 'The number of retries for a failed health check.',
          default: 3,
        },
      },
      default: {
        restartPolicyType: 'on_failure',
        restartPolicyMaxRetries: 10,
      },
    },
  },
  required: ['environment'],
  additionalProperties: false,
};

export const RailwayDefaultConfig: RailwayConfig = {
  environment: 'production',
  autoDeploy: true,
  healthcheckPath: '/api/health',
  build: {
    builder: 'nixpacks',
    watchPatterns: ['**/*'],
  },
  deploy: {
    restartPolicyType: 'on_failure',
    restartPolicyMaxRetries: 10,
    healthcheckTimeout: 300,
  },
}; 