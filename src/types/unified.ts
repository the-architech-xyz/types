/**
 * Unified Interfaces - The "Standard Electrical Outlets"
 * 
 * These interfaces define the standard APIs that all plugins must implement
 * through their adapters. This enables true modularity and no lock-in.
 */

// ============================================================================
// UNIFIED AUTHENTICATION INTERFACE
// ============================================================================

export interface UnifiedAuth {
  // Client-side authentication
  client: {
    signIn: (provider: string, options?: AuthSignInOptions) => Promise<AuthResult>;
    signOut: (options?: AuthSignOutOptions) => Promise<AuthResult>;
    getSession: () => Promise<AuthSession | null>;
    getUser: () => Promise<AuthUser | null>;
    isAuthenticated: () => Promise<boolean>;
    onAuthStateChange: (callback: (user: AuthUser | null) => void) => () => void;
  };
  
  // Server-side authentication
  server: {
    auth: (req: Request, res: Response) => Promise<AuthSession | null>;
    protect: (handler: Function) => Function;
    getServerSession: (req: Request, res: Response) => Promise<AuthSession | null>;
    requireAuth: (handler: Function) => Function;
  };
  
  // Authentication components
  components: {
    LoginButton: ComponentType<LoginButtonProps>;
    AuthForm: ComponentType<AuthFormProps>;
    UserProfile: ComponentType<UserProfileProps>;
    AuthGuard: ComponentType<AuthGuardProps>;
    SignInForm: ComponentType<SignInFormProps>;
    SignUpForm: ComponentType<SignUpFormProps>;
  };
  
  // Configuration and metadata
  config: {
    providers: AuthProvider[];
    sessionStrategy: 'jwt' | 'database';
    callbacks: AuthCallbacks;
    pages: AuthPages;
  };
  
  // Escape hatch for advanced use cases
  getUnderlyingClient: () => any;
}

// Generic component type for React components
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
  [key: string]: any; // Allow for provider-specific fields
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

// ============================================================================
// UNIFIED UI INTERFACE
// ============================================================================

export interface UnifiedUI {
  // Design tokens and theme
  tokens: {
    colors: ColorTokens;
    spacing: SpacingTokens;
    typography: TypographyTokens;
    shadows: ShadowTokens;
    radii: RadiusTokens;
    breakpoints: BreakpointTokens;
  };
  
  // Core UI components
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
  
  // Utility functions
  utils: {
    cn: (...classes: (string | undefined | null | false)[]) => string;
    createVariant: (base: string, variants: Record<string, string>) => Function;
    createComponent: <T extends Record<string, any>>(defaultProps: T) => ComponentType<T>;
  };
  
  // Theme management
  theme: {
    light: ThemeColors;
    dark: ThemeColors;
    current: 'light' | 'dark';
    switchTheme: () => void;
    setTheme: (theme: 'light' | 'dark') => void;
    useTheme: () => { theme: 'light' | 'dark'; toggle: () => void };
  };
  
  // Escape hatch for advanced use cases
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

// Common component props
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
  options: Array<{ value: string; label: string }>;
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
  options: Array<{ value: string; label: string }>;
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

// ============================================================================
// UNIFIED DATABASE INTERFACE
// ============================================================================

export interface UnifiedDatabase {
  // Database client operations
  client: {
    query: (sql: string, params?: any[]) => Promise<any[]>;
    insert: (table: string, data: any) => Promise<InsertResult>;
    update: (table: string, where: any, data: any) => Promise<UpdateResult>;
    delete: (table: string, where: any) => Promise<DeleteResult>;
    transaction: <T>(fn: (tx: UnifiedDatabase['client']) => Promise<T>) => Promise<T>;
    raw: (sql: string, params?: any[]) => Promise<any>;
  };
  
  // Schema management
  schema: {
    users: TableSchema;
    posts: TableSchema;
    comments: TableSchema;
    categories: TableSchema;
    tags: TableSchema;
    [key: string]: TableSchema;
  };
  
  // Migration utilities
  migrations: {
    generate: (name: string) => Promise<void>;
    run: () => Promise<void>;
    reset: () => Promise<void>;
    status: () => Promise<MigrationStatus[]>;
  };
  
  // Connection management
  connection: {
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    isConnected: () => boolean;
    health: () => Promise<ConnectionHealth>;
  };
  
  // Escape hatch for advanced use cases
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

// ============================================================================
// UNIFIED INTERFACE REGISTRY
// ============================================================================

export interface UnifiedInterfaceRegistry {
  auth: Map<string, UnifiedAuth>;
  ui: Map<string, UnifiedUI>;
  database: Map<string, UnifiedDatabase>;
  
  register: <T extends keyof UnifiedInterfaceRegistry>(
    category: T,
    name: string,
    implementation: UnifiedInterfaceRegistry[T] extends Map<string, infer U> ? U : never
  ) => void;
  
  get: <T extends keyof UnifiedInterfaceRegistry>(
    category: T,
    name: string
  ) => UnifiedInterfaceRegistry[T] extends Map<string, infer U> ? U | undefined : never;
  
  list: <T extends keyof UnifiedInterfaceRegistry>(
    category: T
  ) => string[];
  
  has: <T extends keyof UnifiedInterfaceRegistry>(
    category: T,
    name: string
  ) => boolean;
}

// ============================================================================
// ADAPTER FACTORY
// ============================================================================

export interface AdapterFactory {
  createAuthAdapter: (pluginName: string) => Promise<UnifiedAuth>;
  createUIAdapter: (pluginName: string) => Promise<UnifiedUI>;
  createDatabaseAdapter: (pluginName: string) => Promise<UnifiedDatabase>;
} 