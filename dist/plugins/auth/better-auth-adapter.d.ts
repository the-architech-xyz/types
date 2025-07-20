import type { UnifiedAuth, AuthSignInOptions, AuthSignOutOptions, AuthResult, AuthSession, AuthUser, AuthProvider, AuthCallbacks, AuthPages, LoginButtonProps, AuthFormProps, UserProfileProps, AuthGuardProps, SignInFormProps, SignUpFormProps, ComponentType } from '../../types/unified';
/**
 * Better Auth Adapter
 *
 * Implements the UnifiedAuth interface for Better Auth
 * Translates Better Auth's API to the unified interface
 */
export declare class BetterAuthAdapter implements UnifiedAuth {
    private betterAuthClient;
    private betterAuthServer;
    private betterAuthConfig;
    config: {
        providers: AuthProvider[];
        sessionStrategy: 'jwt' | 'database';
        callbacks: AuthCallbacks;
        pages: AuthPages;
    };
    constructor(betterAuthClient: any, betterAuthServer: any, config: any);
    client: {
        signIn: (provider: string, options?: AuthSignInOptions) => Promise<AuthResult>;
        signOut: (options?: AuthSignOutOptions) => Promise<AuthResult>;
        getSession: () => Promise<AuthSession | null>;
        getUser: () => Promise<AuthUser | null>;
        isAuthenticated: () => Promise<boolean>;
        onAuthStateChange: (callback: (user: AuthUser | null) => void) => any;
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
    getUnderlyingClient: () => any;
    private transformUser;
    private transformSession;
    private transformProviders;
    private transformCallbacks;
    private transformPages;
    private createLoginButton;
    private createAuthForm;
    private createUserProfile;
    private createAuthGuard;
    private createSignInForm;
    private createSignUpForm;
}
/**
 * Factory function to create a Better Auth adapter
 */
export declare function createBetterAuthAdapter(betterAuthClient: any, betterAuthServer: any, config: any): UnifiedAuth;
