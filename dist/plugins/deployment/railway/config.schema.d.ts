export interface ConfigSchema {
    projectId?: string;
    token?: string;
    environment?: 'production' | 'staging' | 'development';
    autoDeploy?: boolean;
    healthcheckPath?: string;
}
