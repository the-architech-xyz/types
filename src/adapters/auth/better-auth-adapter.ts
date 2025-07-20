/**
 * Better Auth Adapter - Unified Authentication Interface
 * 
 * Implements the UnifiedAuth interface for Better Auth, providing
 * a standardized API that abstracts away Better Auth's specific implementation.
 */

import { UnifiedAuth, AuthSignInOptions, AuthSignOutOptions, AuthResult, AuthSession, AuthUser, AuthProvider, AuthCallbacks, AuthPages, LoginButtonProps, AuthFormProps, UserProfileProps, AuthGuardProps, SignInFormProps, SignUpFormProps, ComponentType } from '../../types/unified.js';
import { BetterAuthPlugin } from '../../plugins/auth/better-auth-plugin.js';

export class BetterAuthAdapter implements UnifiedAuth {
  private betterAuth: BetterAuthPlugin;
  private underlyingClient: any;

  constructor() {
    this.betterAuth = new BetterAuthPlugin();
  }

  // ============================================================================
  // CLIENT-SIDE AUTHENTICATION
  // ============================================================================

  get client() {
    return {
      signIn: async (provider: string, options?: AuthSignInOptions): Promise<AuthResult> => {
        try {
          // Map to Better Auth's signIn method
          const result = await this.underlyingClient?.signIn(provider, {
            redirectTo: options?.redirectTo,
            callbackUrl: options?.callbackUrl,
            email: options?.email,
            password: options?.password
          });

          return {
            success: true,
            user: this.mapUser(result?.user),
            session: this.mapSession(result?.session)
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Sign in failed'
          };
        }
      },

      signOut: async (options?: AuthSignOutOptions): Promise<AuthResult> => {
        try {
          await this.underlyingClient?.signOut({
            redirectTo: options?.redirectTo
          });

          return { success: true };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Sign out failed'
          };
        }
      },

      getSession: async (): Promise<AuthSession | null> => {
        try {
          const session = await this.underlyingClient?.getSession();
          return session ? this.mapSession(session) : null;
        } catch (error) {
          return null;
        }
      },

      getUser: async (): Promise<AuthUser | null> => {
        try {
          const user = await this.underlyingClient?.getUser();
          return user ? this.mapUser(user) : null;
        } catch (error) {
          return null;
        }
      },

      isAuthenticated: async (): Promise<boolean> => {
        try {
          const session = await this.underlyingClient?.getSession();
          return !!session;
        } catch (error) {
          return false;
        }
      },

      onAuthStateChange: (callback: (user: AuthUser | null) => void) => {
        // Better Auth doesn't have a direct auth state change listener
        // We'll implement this using polling or event emitters
        const interval = setInterval(async () => {
          const user = await this.getUser();
          callback(user);
        }, 1000);

        return () => clearInterval(interval);
      }
    };
  }

  // ============================================================================
  // SERVER-SIDE AUTHENTICATION
  // ============================================================================

  get server() {
    return {
      auth: async (req: Request, res: Response): Promise<AuthSession | null> => {
        try {
          const session = await this.underlyingClient?.getServerSession(req, res);
          return session ? this.mapSession(session) : null;
        } catch (error) {
          return null;
        }
      },

      protect: (handler: Function): Function => {
        return async (req: Request, res: Response) => {
          const session = await this.auth(req, res);
          if (!session) {
            return res.status(401).json({ error: 'Unauthorized' });
          }
          return handler(req, res);
        };
      },

      getServerSession: async (req: Request, res: Response): Promise<AuthSession | null> => {
        return this.auth(req, res);
      },

      requireAuth: (handler: Function): Function => {
        return this.protect(handler);
      }
    };
  }

  // ============================================================================
  // AUTHENTICATION COMPONENTS
  // ============================================================================

  get components() {
    return {
      LoginButton: this.createLoginButton(),
      AuthForm: this.createAuthForm(),
      UserProfile: this.createUserProfile(),
      AuthGuard: this.createAuthGuard(),
      SignInForm: this.createSignInForm(),
      SignUpForm: this.createSignUpForm()
    };
  }

  // ============================================================================
  // CONFIGURATION AND METADATA
  // ============================================================================

  get config() {
    return {
      providers: [
        {
          id: 'email',
          name: 'Email',
          type: 'email' as const,
          enabled: true
        },
        {
          id: 'github',
          name: 'GitHub',
          type: 'oauth' as const,
          enabled: false
        },
        {
          id: 'google',
          name: 'Google',
          type: 'oauth' as const,
          enabled: false
        }
      ],
      sessionStrategy: 'database' as const,
      callbacks: {
        signIn: async (user: AuthUser, account: any) => {
          return true;
        },
        session: async (session: AuthSession, user: AuthUser) => {
          return session;
        },
        jwt: async (token: any, user: AuthUser) => {
          return token;
        },
        redirect: async (url: string, baseUrl: string) => {
          return url.startsWith(baseUrl) ? url : baseUrl;
        }
      },
      pages: {
        signIn: '/auth/signin',
        signUp: '/auth/signup',
        error: '/auth/error',
        verifyRequest: '/auth/verify-request'
      }
    };
  }

  // ============================================================================
  // ESCAPE HATCH
  // ============================================================================

  getUnderlyingClient(): any {
    return this.underlyingClient;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private mapUser(betterAuthUser: any): AuthUser {
    if (!betterAuthUser) return null as any;

    return {
      id: betterAuthUser.id?.toString() || '',
      email: betterAuthUser.email || '',
      name: betterAuthUser.name || '',
      image: betterAuthUser.image || '',
      emailVerified: betterAuthUser.emailVerified ? new Date(betterAuthUser.emailVerified) : undefined,
      createdAt: betterAuthUser.createdAt ? new Date(betterAuthUser.createdAt) : new Date(),
      updatedAt: betterAuthUser.updatedAt ? new Date(betterAuthUser.updatedAt) : new Date(),
      ...betterAuthUser // Include any additional fields
    };
  }

  private mapSession(betterAuthSession: any): AuthSession {
    if (!betterAuthSession) return null as any;

    return {
      user: this.mapUser(betterAuthSession.user),
      expires: betterAuthSession.expires ? new Date(betterAuthSession.expires) : new Date(Date.now() + 24 * 60 * 60 * 1000),
      accessToken: betterAuthSession.accessToken,
      refreshToken: betterAuthSession.refreshToken
    };
  }

  private createLoginButton(): ComponentType<LoginButtonProps> {
    return (props: LoginButtonProps) => {
      const { provider, children, className, variant, size, onClick } = props;
      
      return {
        type: 'component',
        name: 'LoginButton',
        props: {
          provider,
          children: children || 'Sign In',
          className,
          variant: variant || 'default',
          size: size || 'md',
          onClick: onClick || (() => this.client.signIn(provider || 'email'))
        }
      };
    };
  }

  private createAuthForm(): ComponentType<AuthFormProps> {
    return (props: AuthFormProps) => {
      const { mode, providers, redirectTo, className, onSubmit } = props;
      
      return {
        type: 'component',
        name: 'AuthForm',
        props: {
          mode,
          providers: providers || ['email'],
          redirectTo,
          className,
          onSubmit: onSubmit || ((data: any) => {
            if (mode === 'signin') {
              return this.client.signIn('email', { email: data.email, password: data.password });
            } else if (mode === 'signup') {
              // Handle signup logic
              return this.client.signIn('email', { email: data.email, password: data.password });
            }
          })
        }
      };
    };
  }

  private createUserProfile(): ComponentType<UserProfileProps> {
    return (props: UserProfileProps) => {
      const { user, showAvatar, showEmail, className } = props;
      
      return {
        type: 'component',
        name: 'UserProfile',
        props: {
          user,
          showAvatar: showAvatar !== false,
          showEmail: showEmail !== false,
          className
        }
      };
    };
  }

  private createAuthGuard(): ComponentType<AuthGuardProps> {
    return (props: AuthGuardProps) => {
      const { children, fallback, requireAuth, roles } = props;
      
      return {
        type: 'component',
        name: 'AuthGuard',
        props: {
          children,
          fallback: fallback || { type: 'text', content: 'Please sign in to continue' },
          requireAuth: requireAuth !== false,
          roles
        }
      };
    };
  }

  private createSignInForm(): ComponentType<SignInFormProps> {
    return (props: SignInFormProps) => {
      const { providers, redirectTo, className, onSubmit } = props;
      
      return {
        type: 'component',
        name: 'SignInForm',
        props: {
          providers: providers || ['email'],
          redirectTo,
          className,
          onSubmit: onSubmit || ((data: any) => this.client.signIn('email', data))
        }
      };
    };
  }

  private createSignUpForm(): ComponentType<SignUpFormProps> {
    return (props: SignUpFormProps) => {
      const { providers, redirectTo, className, onSubmit } = props;
      
      return {
        type: 'component',
        name: 'SignUpForm',
        props: {
          providers: providers || ['email'],
          redirectTo,
          className,
          onSubmit: onSubmit || ((data: any) => {
            // Handle signup logic
            return this.client.signIn('email', data);
          })
        }
      };
    };
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  async initialize(context: any): Promise<void> {
    // Initialize the underlying Better Auth plugin
    const result = await this.betterAuth.install(context);
    
    if (result.success) {
      // Store the underlying client for escape hatch access
      this.underlyingClient = result.artifacts.find(a => a.path.includes('auth.ts'))?.content;
    }
  }
} 