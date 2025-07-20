/**
 * Unified Interfaces - The "Standard Electrical Outlets"
 *
 * These interfaces define the standard APIs that all plugins must implement
 * through their adapters. This enables true modularity and no lock-in.
 */
import { ValidationResult } from './agent.js';
export interface UnifiedAuth {
    client: {
        signIn: (provider: string, options?: AuthSignInOptions) => Promise<AuthResult>;
        signOut: (options?: AuthSignOutOptions) => Promise<AuthResult>;
        getSession: () => Promise<AuthSession | null>;
        getUser: () => Promise<AuthUser | null>;
        isAuthenticated: () => Promise<boolean>;
        onAuthStateChange: (callback: (user: AuthUser | null) => void) => () => void;
    };
    server: {
        auth: (req: Request, res: Response) => Promise<AuthSession | null>;
        protect: (handler: Function) => Function;
        getServerSession: (req: Request, res: Response) => Promise<AuthSession | null>;
        requireAuth: (handler: Function) => Function;
    };
    components: {
        LoginButton: ComponentType<LoginButtonProps>;
        AuthForm: ComponentType<AuthFormProps>;
        UserProfile: ComponentType<UserProfileProps>;
        AuthGuard: ComponentType<AuthGuardProps>;
        SignInForm: ComponentType<SignInFormProps>;
        SignUpForm: ComponentType<SignUpFormProps>;
    };
    config: {
        providers: AuthProvider[];
        sessionStrategy: 'jwt' | 'database';
        callbacks: AuthCallbacks;
        pages: AuthPages;
    };
    getUnderlyingClient: () => any;
}
export type ComponentType<P = any> = (props: P) => any;
export interface AuthSignInOptions {
    redirectTo?: string;
    callbackUrl?: string;
    email?: string;
    password?: string;
    provider?: string;
}
export interface AuthSignOutOptions {
    redirectTo?: string;
}
export interface AuthResult {
    success: boolean;
    error?: string;
    user?: AuthUser;
    session?: AuthSession;
}
export interface AuthSession {
    user: AuthUser;
    expires: Date;
    accessToken?: string;
    refreshToken?: string;
}
export interface AuthUser {
    id: string;
    email: string;
    name?: string;
    image?: string;
    emailVerified?: boolean;
    createdAt: Date;
    updatedAt: Date;
    [key: string]: any;
}
export interface AuthProvider {
    id: string;
    name: string;
    type: 'oauth' | 'email' | 'credentials';
    enabled: boolean;
    config?: Record<string, any>;
}
export interface AuthCallbacks {
    signIn?: (user: AuthUser, account: any) => Promise<boolean>;
    session?: (session: AuthSession, user: AuthUser) => Promise<AuthSession>;
    jwt?: (token: any, user: AuthUser) => Promise<any>;
    redirect?: (url: string, baseUrl: string) => Promise<string>;
}
export interface AuthPages {
    signIn?: string;
    signUp?: string;
    error?: string;
    verifyRequest?: string;
}
export interface LoginButtonProps {
    provider?: string;
    children?: any;
    className?: string;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    onClick?: () => void;
}
export interface AuthFormProps {
    mode: 'signin' | 'signup' | 'forgot-password';
    providers?: string[];
    redirectTo?: string;
    className?: string;
    onSubmit?: (data: any) => void;
}
export interface UserProfileProps {
    user?: AuthUser;
    showAvatar?: boolean;
    showEmail?: boolean;
    className?: string;
}
export interface AuthGuardProps {
    children: any;
    fallback?: any;
    requireAuth?: boolean;
    roles?: string[];
}
export interface SignInFormProps {
    providers?: string[];
    redirectTo?: string;
    className?: string;
    onSubmit?: (data: any) => void;
}
export interface SignUpFormProps {
    providers?: string[];
    redirectTo?: string;
    className?: string;
    onSubmit?: (data: any) => void;
}
export interface UnifiedUI {
    tokens: {
        colors: ColorTokens;
        spacing: SpacingTokens;
        typography: TypographyTokens;
        shadows: ShadowTokens;
        radii: RadiusTokens;
        breakpoints: BreakpointTokens;
    };
    components: {
        Button: ComponentType<ButtonProps>;
        Input: ComponentType<InputProps>;
        Card: ComponentType<CardProps>;
        Text: ComponentType<TextProps>;
        Stack: ComponentType<StackProps>;
        Box: ComponentType<BoxProps>;
        Modal: ComponentType<ModalProps>;
        Form: ComponentType<FormProps>;
        Select: ComponentType<SelectProps>;
        Checkbox: ComponentType<CheckboxProps>;
        Radio: ComponentType<RadioProps>;
        Switch: ComponentType<SwitchProps>;
        Badge: ComponentType<BadgeProps>;
        Avatar: ComponentType<AvatarProps>;
        Alert: ComponentType<AlertProps>;
        Toast: ComponentType<ToastProps>;
    };
    utils: {
        cn: (...classes: (string | undefined | null | false)[]) => string;
        createVariant: (base: string, variants: Record<string, string>) => Function;
        createComponent: <T extends Record<string, any>>(defaultProps: T) => ComponentType<T>;
    };
    theme: {
        light: ThemeColors;
        dark: ThemeColors;
        current: 'light' | 'dark';
        switchTheme: () => void;
        setTheme: (theme: 'light' | 'dark') => void;
        useTheme: () => {
            theme: 'light' | 'dark';
            toggle: () => void;
        };
    };
    getUnderlyingTokens: () => any;
    getUnderlyingTheme: () => any;
}
export interface ColorTokens {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    input: string;
    ring: string;
    destructive: string;
    destructiveForeground: string;
    success: string;
    successForeground: string;
    warning: string;
    warningForeground: string;
    info: string;
    infoForeground: string;
    [key: string]: string;
}
export interface SpacingTokens {
    0: string;
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
    8: string;
    10: string;
    12: string;
    16: string;
    20: string;
    24: string;
    32: string;
    40: string;
    48: string;
    56: string;
    64: string;
    [key: string]: string;
}
export interface TypographyTokens {
    fontFamily: {
        sans: string;
        serif: string;
        mono: string;
    };
    fontSize: {
        xs: string;
        sm: string;
        base: string;
        lg: string;
        xl: string;
        '2xl': string;
        '3xl': string;
        '4xl': string;
        '5xl': string;
        '6xl': string;
    };
    fontWeight: {
        light: string;
        normal: string;
        medium: string;
        semibold: string;
        bold: string;
        extrabold: string;
    };
    lineHeight: {
        none: string;
        tight: string;
        snug: string;
        normal: string;
        relaxed: string;
        loose: string;
    };
}
export interface ShadowTokens {
    sm: string;
    base: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    inner: string;
    none: string;
}
export interface RadiusTokens {
    none: string;
    sm: string;
    base: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    full: string;
}
export interface BreakpointTokens {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
}
export interface ThemeColors {
    background: string;
    foreground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
    [key: string]: string;
}
export interface ButtonProps {
    children?: any;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    disabled?: boolean;
    loading?: boolean;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
    [key: string]: any;
}
export interface InputProps {
    value?: string;
    placeholder?: string;
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
    disabled?: boolean;
    error?: boolean;
    onChange?: (value: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    className?: string;
    [key: string]: any;
}
export interface CardProps {
    children?: any;
    variant?: 'default' | 'outline';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    className?: string;
    [key: string]: any;
}
export interface TextProps {
    children?: any;
    variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'label';
    size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
    color?: string;
    className?: string;
    [key: string]: any;
}
export interface StackProps {
    children?: any;
    direction?: 'horizontal' | 'vertical';
    spacing?: string | number;
    align?: 'start' | 'center' | 'end' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'between' | 'around';
    className?: string;
    [key: string]: any;
}
export interface BoxProps {
    children?: any;
    padding?: string | number;
    margin?: string | number;
    width?: string | number;
    height?: string | number;
    className?: string;
    [key: string]: any;
}
export interface ModalProps {
    children?: any;
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    className?: string;
    [key: string]: any;
}
export interface FormProps {
    children?: any;
    onSubmit?: (data: any) => void;
    className?: string;
    [key: string]: any;
}
export interface SelectProps {
    value?: string;
    options: Array<{
        value: string;
        label: string;
    }>;
    placeholder?: string;
    disabled?: boolean;
    onChange?: (value: string) => void;
    className?: string;
    [key: string]: any;
}
export interface CheckboxProps {
    checked?: boolean;
    disabled?: boolean;
    onChange?: (checked: boolean) => void;
    label?: string;
    className?: string;
    [key: string]: any;
}
export interface RadioProps {
    value?: string;
    options: Array<{
        value: string;
        label: string;
    }>;
    disabled?: boolean;
    onChange?: (value: string) => void;
    className?: string;
    [key: string]: any;
}
export interface SwitchProps {
    checked?: boolean;
    disabled?: boolean;
    onChange?: (checked: boolean) => void;
    label?: string;
    className?: string;
    [key: string]: any;
}
export interface BadgeProps {
    children?: any;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    size?: 'default' | 'sm' | 'lg';
    className?: string;
    [key: string]: any;
}
export interface AvatarProps {
    src?: string;
    alt?: string;
    fallback?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    [key: string]: any;
}
export interface AlertProps {
    children?: any;
    variant?: 'default' | 'destructive' | 'warning' | 'info';
    title?: string;
    className?: string;
    [key: string]: any;
}
export interface ToastProps {
    children?: any;
    variant?: 'default' | 'destructive' | 'warning' | 'info';
    title?: string;
    duration?: number;
    className?: string;
    [key: string]: any;
}
export interface UnifiedDatabase {
    client: {
        query: (sql: string, params?: any[]) => Promise<any[]>;
        insert: (table: string, data: any) => Promise<InsertResult>;
        update: (table: string, where: any, data: any) => Promise<UpdateResult>;
        delete: (table: string, where: any) => Promise<DeleteResult>;
        transaction: <T>(fn: (tx: UnifiedDatabase['client']) => Promise<T>) => Promise<T>;
        raw: (sql: string, params?: any[]) => Promise<any>;
    };
    schema: {
        users: TableSchema;
        posts: TableSchema;
        comments: TableSchema;
        categories: TableSchema;
        tags: TableSchema;
        [key: string]: TableSchema;
    };
    migrations: {
        generate: (name: string) => Promise<void>;
        run: () => Promise<void>;
        reset: () => Promise<void>;
        status: () => Promise<MigrationStatus[]>;
    };
    connection: {
        connect: () => Promise<void>;
        disconnect: () => Promise<void>;
        isConnected: () => boolean;
        health: () => Promise<ConnectionHealth>;
    };
    getUnderlyingClient: () => any;
    getUnderlyingSchema: () => any;
}
export interface InsertResult {
    id: string | number;
    affectedRows: number;
    data: any;
}
export interface UpdateResult {
    affectedRows: number;
    data: any;
}
export interface DeleteResult {
    affectedRows: number;
}
export interface TableSchema {
    name: string;
    columns: ColumnSchema[];
    indexes: IndexSchema[];
    relations: RelationSchema[];
}
export interface ColumnSchema {
    name: string;
    type: string;
    nullable: boolean;
    primaryKey: boolean;
    unique: boolean;
    defaultValue?: any;
    references?: {
        table: string;
        column: string;
    };
}
export interface IndexSchema {
    name: string;
    columns: string[];
    unique: boolean;
    type?: 'btree' | 'hash' | 'gin' | 'gist';
}
export interface RelationSchema {
    name: string;
    type: 'one-to-one' | 'one-to-many' | 'many-to-many';
    fromTable: string;
    fromColumn: string;
    toTable: string;
    toColumn: string;
    onDelete?: 'cascade' | 'set-null' | 'restrict';
    onUpdate?: 'cascade' | 'set-null' | 'restrict';
}
export interface MigrationStatus {
    name: string;
    applied: boolean;
    appliedAt?: Date;
}
export interface ConnectionHealth {
    status: 'healthy' | 'unhealthy' | 'unknown';
    latency?: number;
    error?: string;
}
export interface UnifiedDeployment {
    deploy: (options?: DeployOptions) => Promise<DeployResult>;
    build: (options?: BuildOptions) => Promise<BuildResult>;
    preview: (options?: PreviewOptions) => Promise<PreviewResult>;
    environments: {
        list: () => Promise<Environment[]>;
        create: (name: string, options?: EnvironmentOptions) => Promise<Environment>;
        delete: (name: string) => Promise<void>;
        promote: (from: string, to: string) => Promise<void>;
    };
    domains: {
        list: () => Promise<Domain[]>;
        add: (domain: string, options?: DomainOptions) => Promise<Domain>;
        remove: (domain: string) => Promise<void>;
        verify: (domain: string) => Promise<DomainVerification>;
    };
    config: {
        platform: string;
        environment: string;
        region?: string;
        autoDeploy: boolean;
        previewDeployments: boolean;
        customDomain: boolean;
        ssl: boolean;
        ciCd: boolean;
    };
    getRequiredEnvVars: () => string[];
    getDeploymentFiles: () => DeploymentFile[];
    validateConfig: () => Promise<ValidationResult>;
    getUnderlyingClient: () => any;
}
export interface DeployOptions {
    environment?: string;
    branch?: string;
    commit?: string;
    variables?: Record<string, string>;
    functions?: Record<string, any>;
}
export interface DeployResult {
    success: boolean;
    url?: string;
    deploymentId?: string;
    error?: string;
    logs?: string[];
}
export interface BuildOptions {
    environment?: string;
    clean?: boolean;
    cache?: boolean;
}
export interface BuildResult {
    success: boolean;
    outputPath?: string;
    error?: string;
    logs?: string[];
}
export interface PreviewOptions {
    branch?: string;
    commit?: string;
    variables?: Record<string, string>;
}
export interface PreviewResult {
    success: boolean;
    url?: string;
    previewId?: string;
    error?: string;
}
export interface Environment {
    name: string;
    url?: string;
    status: 'active' | 'inactive' | 'building' | 'error';
    createdAt: Date;
    updatedAt: Date;
}
export interface EnvironmentOptions {
    variables?: Record<string, string>;
    region?: string;
    autoDeploy?: boolean;
}
export interface Domain {
    name: string;
    status: 'active' | 'pending' | 'error';
    ssl: boolean;
    createdAt: Date;
}
export interface DomainOptions {
    ssl?: boolean;
    redirects?: string[];
}
export interface DomainVerification {
    verified: boolean;
    error?: string;
    dnsRecords?: DNSRecord[];
}
export interface DNSRecord {
    type: 'A' | 'CNAME' | 'TXT' | 'MX';
    name: string;
    value: string;
    ttl?: number;
}
export interface DeploymentFile {
    name: string;
    description: string;
    required: boolean;
    content?: string;
    path?: string;
}
export interface UnifiedTesting {
    runTests: (options?: TestRunOptions) => Promise<TestRunResult>;
    runUnitTests: (options?: TestRunOptions) => Promise<TestRunResult>;
    runIntegrationTests: (options?: TestRunOptions) => Promise<TestRunResult>;
    runE2ETests: (options?: TestRunOptions) => Promise<TestRunResult>;
    generateCoverage: (options?: CoverageOptions) => Promise<CoverageResult>;
    getCoverageReport: () => Promise<CoverageReport>;
    getTestUtilities: () => TestUtility[];
    createMock: <T>(template: T) => T;
    createTestData: (schema: any) => any;
    getTestFiles: () => TestFile[];
    generateTestFile: (component: string, type: 'unit' | 'integration' | 'e2e') => Promise<string>;
    config: {
        framework: string;
        coverage: boolean;
        e2e: boolean;
        unitTesting: boolean;
        integrationTesting: boolean;
        e2eTesting: boolean;
        coverageReporting: boolean;
        testUtilities: boolean;
    };
    getRequiredDependencies: () => string[];
    getTestScripts: () => Record<string, string>;
    validateConfig: () => Promise<ValidationResult>;
    getUnderlyingClient: () => any;
}
export interface TestRunOptions {
    pattern?: string;
    watch?: boolean;
    coverage?: boolean;
    environment?: string;
    timeout?: number;
}
export interface TestRunResult {
    success: boolean;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
    errors?: TestError[];
    logs?: string[];
}
export interface TestError {
    test: string;
    message: string;
    stack?: string;
    expected?: any;
    actual?: any;
}
export interface CoverageOptions {
    threshold?: number;
    reporters?: string[];
    exclude?: string[];
}
export interface CoverageResult {
    success: boolean;
    coverage: number;
    reportPath?: string;
    details?: CoverageDetails;
}
export interface CoverageDetails {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
}
export interface CoverageReport {
    summary: CoverageDetails;
    files: Record<string, CoverageDetails>;
    timestamp: Date;
}
export interface TestUtility {
    name: string;
    description: string;
    type: 'mock' | 'fixture' | 'helper' | 'matcher';
    usage: string;
}
export interface TestFile {
    name: string;
    description: string;
    type: 'unit' | 'integration' | 'e2e';
    path: string;
    content?: string;
}
export interface UnifiedEmail {
    send: (options: EmailSendOptions) => Promise<EmailSendResult>;
    sendTemplate: (options: EmailTemplateOptions) => Promise<EmailSendResult>;
    sendBulk: (options: EmailBulkOptions) => Promise<EmailBulkResult>;
    templates: {
        list: () => Promise<EmailTemplate[]>;
        create: (template: EmailTemplateCreate) => Promise<EmailTemplate>;
        update: (id: string, template: EmailTemplateUpdate) => Promise<EmailTemplate>;
        delete: (id: string) => Promise<void>;
        render: (id: string, data: Record<string, any>) => Promise<string>;
    };
    validation: {
        validateEmail: (email: string) => Promise<EmailValidationResult>;
        validateDomain: (domain: string) => Promise<DomainValidationResult>;
        checkDeliverability: (email: string) => Promise<DeliverabilityResult>;
    };
    analytics: {
        getStats: (options?: EmailStatsOptions) => Promise<EmailStats>;
        getEvents: (options?: EmailEventsOptions) => Promise<EmailEvent[]>;
        trackOpen: (messageId: string) => Promise<void>;
        trackClick: (messageId: string, link: string) => Promise<void>;
    };
    config: {
        provider: string;
        apiKey: string;
        fromEmail: string;
        fromName?: string;
        replyTo?: string;
        webhookUrl?: string;
        sandboxMode: boolean;
    };
    getRequiredEnvVars: () => string[];
    getEmailTemplates: () => EmailTemplateFile[];
    validateConfig: () => Promise<ValidationResult>;
    getUnderlyingClient: () => any;
}
export interface EmailSendOptions {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    from?: string;
    replyTo?: string;
    cc?: string[];
    bcc?: string[];
    attachments?: EmailAttachment[];
    headers?: Record<string, string>;
    templateId?: string;
    templateData?: Record<string, any>;
}
export interface EmailSendResult {
    success: boolean;
    messageId?: string;
    error?: string;
    providerResponse?: any;
}
export interface EmailTemplateOptions {
    templateId: string;
    to: string | string[];
    data: Record<string, any>;
    subject?: string;
    from?: string;
    replyTo?: string;
}
export interface EmailBulkOptions {
    emails: Array<{
        to: string;
        subject: string;
        text?: string;
        html?: string;
        templateId?: string;
        templateData?: Record<string, any>;
    }>;
    from?: string;
    replyTo?: string;
}
export interface EmailBulkResult {
    success: boolean;
    sent: number;
    failed: number;
    errors: Array<{
        email: string;
        error: string;
    }>;
}
export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    html: string;
    text?: string;
    variables: string[];
    createdAt: Date;
    updatedAt: Date;
}
export interface EmailTemplateCreate {
    name: string;
    subject: string;
    html: string;
    text?: string;
    variables?: string[];
}
export interface EmailTemplateUpdate {
    name?: string;
    subject?: string;
    html?: string;
    text?: string;
    variables?: string[];
}
export interface EmailValidationResult {
    valid: boolean;
    error?: string;
    suggestions?: string[];
}
export interface DomainValidationResult {
    valid: boolean;
    hasMX: boolean;
    hasSPF: boolean;
    hasDKIM: boolean;
    hasDMARC: boolean;
    error?: string;
}
export interface DeliverabilityResult {
    deliverable: boolean;
    score: number;
    risk: 'low' | 'medium' | 'high';
    reasons: string[];
}
export interface EmailStatsOptions {
    startDate?: Date;
    endDate?: Date;
    templateId?: string;
}
export interface EmailStats {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
    spamReports: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
}
export interface EmailEventsOptions {
    startDate?: Date;
    endDate?: Date;
    eventType?: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed';
    messageId?: string;
}
export interface EmailEvent {
    id: string;
    messageId: string;
    eventType: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed';
    timestamp: Date;
    data?: Record<string, any>;
}
export interface EmailAttachment {
    filename: string;
    content: Buffer | string;
    contentType?: string;
    contentId?: string;
}
export interface EmailTemplateFile {
    name: string;
    description: string;
    type: 'welcome' | 'verification' | 'reset-password' | 'notification' | 'marketing';
    path: string;
    content?: string;
}
export interface UnifiedMonitoring {
    errors: {
        captureException: (error: Error, context?: ErrorContext) => Promise<void>;
        captureMessage: (message: string, level?: ErrorLevel, context?: ErrorContext) => Promise<void>;
        setUser: (user: MonitoringUser) => void;
        setTag: (key: string, value: string) => void;
        setContext: (name: string, context: Record<string, any>) => void;
    };
    performance: {
        startTransaction: (name: string, operation?: string) => MonitoringTransaction;
        startSpan: (name: string, operation?: string) => MonitoringSpan;
        measure: (name: string, fn: () => any) => Promise<any>;
        mark: (name: string) => void;
        measureMark: (name: string, startMark: string, endMark: string) => void;
    };
    analytics: {
        track: (event: string, properties?: Record<string, any>) => void;
        identify: (userId: string, traits?: Record<string, any>) => void;
        page: (name: string, properties?: Record<string, any>) => void;
        group: (groupId: string, traits?: Record<string, any>) => void;
    };
    logging: {
        log: (level: LogLevel, message: string, context?: LogContext) => void;
        info: (message: string, context?: LogContext) => void;
        warn: (message: string, context?: LogContext) => void;
        error: (message: string, context?: LogContext) => void;
        debug: (message: string, context?: LogContext) => void;
    };
    health: {
        check: (name: string, checkFn: () => Promise<HealthCheckResult>) => void;
        getStatus: () => Promise<HealthStatus>;
        addHealthIndicator: (name: string, indicator: HealthIndicator) => void;
    };
    alerts: {
        createAlert: (alert: AlertConfig) => Promise<Alert>;
        updateAlert: (alertId: string, updates: Partial<AlertConfig>) => Promise<Alert>;
        deleteAlert: (alertId: string) => Promise<void>;
        listAlerts: () => Promise<Alert[]>;
    };
    config: {
        provider: string;
        dsn: string;
        environment: string;
        release?: string;
        debug: boolean;
        tracesSampleRate: number;
        profilesSampleRate: number;
    };
    getRequiredEnvVars: () => string[];
    getMonitoringFiles: () => MonitoringFile[];
    validateConfig: () => Promise<ValidationResult>;
    getUnderlyingClient: () => any;
}
export interface ErrorContext {
    user?: MonitoringUser;
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    level?: ErrorLevel;
    fingerprint?: string[];
}
export type ErrorLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug';
export interface MonitoringUser {
    id: string;
    email?: string;
    username?: string;
    ip_address?: string;
    [key: string]: any;
}
export interface MonitoringTransaction {
    id: string;
    name: string;
    operation?: string;
    setTag: (key: string, value: string) => void;
    setData: (key: string, value: any) => void;
    finish: () => void;
    createChildSpan: (name: string, operation?: string) => MonitoringSpan;
}
export interface MonitoringSpan {
    id: string;
    name: string;
    operation?: string;
    setTag: (key: string, value: string) => void;
    setData: (key: string, value: any) => void;
    finish: () => void;
}
export interface LogContext {
    userId?: string;
    sessionId?: string;
    requestId?: string;
    tags?: Record<string, string>;
    extra?: Record<string, any>;
}
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export interface HealthCheckResult {
    status: 'healthy' | 'unhealthy' | 'degraded';
    message?: string;
    details?: Record<string, any>;
    timestamp: Date;
}
export interface HealthStatus {
    status: 'healthy' | 'unhealthy' | 'degraded';
    checks: Record<string, HealthCheckResult>;
    timestamp: Date;
}
export interface HealthIndicator {
    name: string;
    check: () => Promise<HealthCheckResult>;
    interval?: number;
}
export interface AlertConfig {
    name: string;
    description?: string;
    condition: AlertCondition;
    severity: 'low' | 'medium' | 'high' | 'critical';
    channels: string[];
    enabled: boolean;
}
export interface AlertCondition {
    type: 'threshold' | 'anomaly' | 'custom';
    metric: string;
    operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne';
    value: number;
    duration: string;
}
export interface Alert {
    id: string;
    name: string;
    description?: string;
    condition: AlertCondition;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'active' | 'resolved' | 'acknowledged';
    createdAt: Date;
    updatedAt: Date;
    lastTriggered?: Date;
}
export interface MonitoringFile {
    name: string;
    description: string;
    type: 'config' | 'middleware' | 'utils' | 'health-check';
    path: string;
    content?: string;
}
