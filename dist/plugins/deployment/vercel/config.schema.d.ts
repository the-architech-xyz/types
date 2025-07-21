export interface ConfigSchema {
    projectId?: string;
    orgId?: string;
    token?: string;
    environment?: 'production' | 'preview' | 'development';
    autoDeploy?: boolean;
}
