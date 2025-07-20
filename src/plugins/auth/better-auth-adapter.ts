import type { 
  UnifiedAuth, 
  AuthSignInOptions, 
  AuthSignOutOptions, 
  AuthResult, 
  AuthSession, 
  AuthUser, 
  AuthProvider, 
  AuthCallbacks, 
  AuthPages,
  LoginButtonProps,
  AuthFormProps,
  UserProfileProps,
  AuthGuardProps,
  SignInFormProps,
  SignUpFormProps,
  ComponentType
} from '../../types/unified';

/**
 * Better Auth Adapter
 * 
 * Implements the UnifiedAuth interface for Better Auth
 * Translates Better Auth's API to the unified interface
 */
export class BetterAuthAdapter implements UnifiedAuth {
  private betterAuthClient: any;
  private betterAuthServer: any;
  private betterAuthConfig: any;

  // Public config property for the unified interface
  public config: {
    providers: AuthProvider[];
    sessionStrategy: 'jwt' | 'database';
    callbacks: AuthCallbacks;
    pages: AuthPages;
  };

  constructor(betterAuthClient: any, betterAuthServer: any, config: any) {
    this.betterAuthClient = betterAuthClient;
    this.betterAuthServer = betterAuthServer;
    this.betterAuthConfig = config;
    
    // Initialize the unified config
    this.config = {
      providers: this.transformProviders(),
      sessionStrategy: config.sessionStrategy || 'jwt',
      callbacks: this.transformCallbacks(),
      pages: this.transformPages(),
    };
  }

  // Client-side authentication
  client = {
    signIn: async (provider: string, options?: AuthSignInOptions): Promise<AuthResult> => {
      try {
        const result = await this.betterAuthClient.signIn(provider, {
          redirectTo: options?.redirectTo,
          callbackUrl: options?.callbackUrl,
          email: options?.email,
          password: options?.password,
        });

        return {
          success: true,
          user: this.transformUser(result.user),
          session: this.transformSession(result.session),
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Sign in failed',
        };
      }
    },

    signOut: async (options?: AuthSignOutOptions): Promise<AuthResult> => {
      try {
        await this.betterAuthClient.signOut({
          redirectTo: options?.redirectTo,
        });

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Sign out failed',
        };
      }
    },

    getSession: async (): Promise<AuthSession | null> => {
      try {
        const session = await this.betterAuthClient.getSession();
        return session ? this.transformSession(session) : null;
      } catch (error) {
        return null;
      }
    },

    getUser: async (): Promise<AuthUser | null> => {
      try {
        const user = await this.betterAuthClient.getUser();
        return user ? this.transformUser(user) : null;
      } catch (error) {
        return null;
      }
    },

    isAuthenticated: async (): Promise<boolean> => {
      try {
        const session = await this.betterAuthClient.getSession();
        return !!session;
      } catch (error) {
        return false;
      }
    },

    onAuthStateChange: (callback: (user: AuthUser | null) => void) => {
      return this.betterAuthClient.onAuthStateChange((user: any) => {
        callback(user ? this.transformUser(user) : null);
      });
    },
  };

  // Server-side authentication
  server = {
    auth: async (req: Request, res: Response): Promise<AuthSession | null> => {
      try {
        const session = await this.betterAuthServer.auth(req, res);
        return session ? this.transformSession(session) : null;
      } catch (error) {
        return null;
      }
    },

    protect: (handler: Function): Function => {
      return this.betterAuthServer.protect(handler);
    },

    getServerSession: async (req: Request, res: Response): Promise<AuthSession | null> => {
      try {
        const session = await this.betterAuthServer.getServerSession(req, res);
        return session ? this.transformSession(session) : null;
      } catch (error) {
        return null;
      }
    },

    requireAuth: (handler: Function): Function => {
      return this.betterAuthServer.requireAuth(handler);
    },
  };

  // Authentication components
  components = {
    LoginButton: this.createLoginButton(),
    AuthForm: this.createAuthForm(),
    UserProfile: this.createUserProfile(),
    AuthGuard: this.createAuthGuard(),
    SignInForm: this.createSignInForm(),
    SignUpForm: this.createSignUpForm(),
  };

  // Escape hatch for advanced use cases
  getUnderlyingClient = () => this.betterAuthClient;

  // Helper methods for data transformation
  private transformUser(betterAuthUser: any): AuthUser {
    return {
      id: betterAuthUser.id,
      email: betterAuthUser.email,
      name: betterAuthUser.name,
      image: betterAuthUser.image,
      emailVerified: betterAuthUser.emailVerified,
      createdAt: new Date(betterAuthUser.createdAt),
      updatedAt: new Date(betterAuthUser.updatedAt),
      ...betterAuthUser, // Preserve any additional fields
    };
  }

  private transformSession(betterAuthSession: any): AuthSession {
    return {
      user: this.transformUser(betterAuthSession.user),
      expires: new Date(betterAuthSession.expires),
      accessToken: betterAuthSession.accessToken,
      refreshToken: betterAuthSession.refreshToken,
    };
  }

  private transformProviders(): AuthProvider[] {
    return Object.entries(this.betterAuthConfig.providers || {}).map(([id, provider]: [string, any]) => ({
      id,
      name: provider.name || id,
      type: provider.type || 'oauth',
      enabled: provider.enabled !== false,
      config: provider,
    }));
  }

  private transformCallbacks(): AuthCallbacks {
    return {
      signIn: this.betterAuthConfig.callbacks?.signIn,
      session: this.betterAuthConfig.callbacks?.session,
      jwt: this.betterAuthConfig.callbacks?.jwt,
      redirect: this.betterAuthConfig.callbacks?.redirect,
    };
  }

  private transformPages(): AuthPages {
    return {
      signIn: this.betterAuthConfig.pages?.signIn,
      signUp: this.betterAuthConfig.pages?.signUp,
      error: this.betterAuthConfig.pages?.error,
      verifyRequest: this.betterAuthConfig.pages?.verifyRequest,
    };
  }

  // Component factories
  private createLoginButton(): ComponentType<LoginButtonProps> {
    return (props: LoginButtonProps) => {
      const { provider, children, className, variant = 'default', size = 'md', onClick } = props;
      
      const handleClick = async () => {
        if (onClick) {
          onClick();
        } else {
          await this.client.signIn(provider || 'credentials');
        }
      };

      return {
        type: 'button',
        className: `btn btn-${variant} btn-${size} ${className || ''}`,
        onClick: handleClick,
        children: children || `Sign in with ${provider || 'Credentials'}`,
      };
    };
  }

  private createAuthForm(): ComponentType<AuthFormProps> {
    return (props: AuthFormProps) => {
      const { mode, providers, redirectTo, className, onSubmit } = props;
      
      return {
        type: 'form',
        className: `auth-form auth-form-${mode} ${className || ''}`,
        onSubmit: onSubmit || (async (data: any) => {
          if (mode === 'signin') {
            await this.client.signIn('credentials', { ...data, redirectTo });
          } else if (mode === 'signup') {
            // Handle signup logic
            await this.client.signIn('credentials', { ...data, redirectTo });
          }
        }),
        children: [
          // Form fields would be rendered here
          { elementType: 'input', name: 'email', inputType: 'email', placeholder: 'Email' },
          { elementType: 'input', name: 'password', inputType: 'password', placeholder: 'Password' },
          { elementType: 'button', buttonType: 'submit', children: mode === 'signin' ? 'Sign In' : 'Sign Up' },
        ],
      };
    };
  }

  private createUserProfile(): ComponentType<UserProfileProps> {
    return (props: UserProfileProps) => {
      const { user, showAvatar = true, showEmail = true, className } = props;
      
      return {
        type: 'div',
        className: `user-profile ${className || ''}`,
        children: [
          showAvatar && user?.image && {
            type: 'img',
            src: user.image,
            alt: user.name || 'User avatar',
            className: 'user-avatar',
          },
          { type: 'div', className: 'user-info', children: [
            user?.name && { type: 'h3', children: user.name },
            showEmail && user?.email && { type: 'p', children: user.email },
          ]},
        ],
      };
    };
  }

  private createAuthGuard(): ComponentType<AuthGuardProps> {
    return (props: AuthGuardProps) => {
      const { children, fallback, requireAuth = true, roles } = props;
      
      // This would typically use React hooks to check auth state
      // For now, we'll return a simple wrapper
      return {
        type: 'div',
        className: 'auth-guard',
        children: requireAuth ? children : fallback || 'Authentication required',
      };
    };
  }

  private createSignInForm(): ComponentType<SignInFormProps> {
    return (props: SignInFormProps) => {
      return this.createAuthForm()({ ...props, mode: 'signin' });
    };
  }

  private createSignUpForm(): ComponentType<SignUpFormProps> {
    return (props: SignUpFormProps) => {
      return this.createAuthForm()({ ...props, mode: 'signup' });
    };
  }
}

/**
 * Factory function to create a Better Auth adapter
 */
export function createBetterAuthAdapter(
  betterAuthClient: any,
  betterAuthServer: any,
  config: any
): UnifiedAuth {
  return new BetterAuthAdapter(betterAuthClient, betterAuthServer, config);
} 