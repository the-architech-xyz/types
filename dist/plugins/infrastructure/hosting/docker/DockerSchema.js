export const DockerConfigSchema = {
    type: 'object',
    properties: {
        imageName: {
            type: 'string',
            description: 'Name of the Docker image',
            default: 'my-app'
        },
        imageTag: {
            type: 'string',
            description: 'Tag for the Docker image',
            default: 'latest'
        },
        port: {
            type: 'number',
            description: 'Port to expose in the container',
            default: 3000
        },
        enableMultiStage: {
            type: 'boolean',
            description: 'Enable multi-stage build for optimization',
            default: true
        },
        enableHealthCheck: {
            type: 'boolean',
            description: 'Enable health checks for the container',
            default: true
        },
        enableOptimization: {
            type: 'boolean',
            description: 'Enable build optimizations',
            default: true
        },
        nodeVersion: {
            type: 'string',
            description: 'Node.js version to use',
            default: '18-alpine'
        },
        baseImage: {
            type: 'string',
            description: 'Base Docker image to use',
            default: 'node:18-alpine'
        },
        workingDir: {
            type: 'string',
            description: 'Working directory in the container',
            default: '/app'
        },
        user: {
            type: 'string',
            description: 'User to run the container as',
            default: 'node'
        },
        environment: {
            type: 'object',
            description: 'Environment variables for the container',
            default: {}
        },
        volumes: {
            type: 'array',
            description: 'Volume mounts for the container',
            items: {
                type: 'string',
                description: 'Volume mount path'
            },
            default: []
        },
        networks: {
            type: 'array',
            description: 'Docker networks to connect to',
            items: {
                type: 'string',
                description: 'Network name'
            },
            default: []
        },
        restartPolicy: {
            type: 'string',
            description: 'Container restart policy',
            enum: ['no', 'always', 'unless-stopped', 'on-failure'],
            default: 'unless-stopped'
        },
        buildContext: {
            type: 'string',
            description: 'Build context directory',
            default: '.'
        },
        buildArgs: {
            type: 'object',
            description: 'Build arguments for Docker build',
            default: {}
        },
        target: {
            type: 'string',
            description: 'Target stage for multi-stage builds',
            default: 'production'
        },
        memory: {
            type: 'string',
            description: 'Memory limit for the container',
            default: '512m'
        },
        cpu: {
            type: 'string',
            description: 'CPU limit for the container',
            default: '0.5'
        },
        ulimits: {
            type: 'object',
            description: 'Ulimit settings for the container',
            default: {}
        },
        securityOpt: {
            type: 'array',
            description: 'Security options for the container',
            items: {
                type: 'string',
                description: 'Security option'
            },
            default: []
        },
        capabilities: {
            type: 'array',
            description: 'Linux capabilities to add or drop',
            items: {
                type: 'string',
                description: 'Linux capability'
            },
            default: []
        },
        readOnly: {
            type: 'boolean',
            description: 'Mount container root filesystem as read-only',
            default: false
        },
        healthCheckCmd: {
            type: 'string',
            description: 'Health check command',
            default: 'curl -f http://localhost:3000/health || exit 1'
        },
        healthCheckInterval: {
            type: 'string',
            description: 'Health check interval',
            default: '30s'
        },
        healthCheckTimeout: {
            type: 'string',
            description: 'Health check timeout',
            default: '10s'
        },
        healthCheckRetries: {
            type: 'number',
            description: 'Number of health check retries',
            default: 3
        },
        healthCheckStartPeriod: {
            type: 'string',
            description: 'Health check start period',
            default: '40s'
        },
        logDriver: {
            type: 'string',
            description: 'Logging driver for the container',
            default: 'json-file'
        },
        logOpt: {
            type: 'object',
            description: 'Logging driver options',
            default: {}
        },
        maxMemory: {
            type: 'string',
            description: 'Maximum memory limit',
            default: '1g'
        },
        maxCpu: {
            type: 'string',
            description: 'Maximum CPU limit',
            default: '1.0'
        },
        maxPids: {
            type: 'number',
            description: 'Maximum number of processes',
            default: 100
        },
        hostname: {
            type: 'string',
            description: 'Container hostname',
            default: ''
        },
        dns: {
            type: 'array',
            description: 'DNS servers for the container',
            items: {
                type: 'string',
                description: 'DNS server'
            },
            default: []
        },
        dnsSearch: {
            type: 'array',
            description: 'DNS search domains',
            items: {
                type: 'string',
                description: 'DNS search domain'
            },
            default: []
        },
        extraHosts: {
            type: 'array',
            description: 'Extra hosts entries',
            items: {
                type: 'string',
                description: 'Host entry'
            },
            default: []
        },
        tmpfs: {
            type: 'array',
            description: 'Tmpfs mounts',
            items: {
                type: 'string',
                description: 'Tmpfs mount'
            },
            default: []
        },
        storageOpt: {
            type: 'object',
            description: 'Storage driver options',
            default: {}
        }
    },
    required: ['imageName', 'imageTag', 'port'],
    additionalProperties: false
};
export const DockerDefaultConfig = {
    imageName: 'my-app',
    imageTag: 'latest',
    port: 3000,
    enableMultiStage: true,
    enableHealthCheck: true,
    enableOptimization: true,
    nodeVersion: '18-alpine',
    baseImage: 'node:18-alpine',
    workingDir: '/app',
    user: 'node',
    environment: {},
    volumes: [],
    networks: [],
    restartPolicy: 'unless-stopped',
    buildContext: '.',
    buildArgs: {},
    target: 'production',
    memory: '512m',
    cpu: '0.5',
    ulimits: {},
    securityOpt: [],
    capabilities: [],
    readOnly: false,
    healthCheckCmd: 'curl -f http://localhost:3000/health || exit 1',
    healthCheckInterval: '30s',
    healthCheckTimeout: '10s',
    healthCheckRetries: 3,
    healthCheckStartPeriod: '40s',
    logDriver: 'json-file',
    logOpt: {},
    maxMemory: '1g',
    maxCpu: '1.0',
    maxPids: 100,
    hostname: '',
    dns: [],
    dnsSearch: [],
    extraHosts: [],
    tmpfs: [],
    storageOpt: {}
};
//# sourceMappingURL=DockerSchema.js.map