import { Blueprint } from '../../types/adapter.js';

export const blueprint: Blueprint = {
  id: 'better-auth-nextjs-integration',
  name: 'Better Auth Next.js Integration',
  description: 'Complete Next.js integration for Better Auth',
  version: '1.0.0',
  actions: [
    // API Routes
    {
      type: 'CREATE_FILE',
      path: 'src/app/api/auth/[...all]/route.ts',
      content: `import { NextRequest } from 'next/server';
import { authHandler } from '@/lib/auth/nextjs-handler';

export async function GET(request: NextRequest) {
  return authHandler(request);
}

export async function POST(request: NextRequest) {
  return authHandler(request);
}

export async function PUT(request: NextRequest) {
  return authHandler(request);
}

export async function DELETE(request: NextRequest) {
  return authHandler(request);
}

export async function PATCH(request: NextRequest) {
  return authHandler(request);
}
`,
      condition: '{{#if integration.features.apiRoutes}}'
    },

    // Next.js Handler
    {
      type: 'ADD_CONTENT',
      target: 'src/lib/auth/nextjs-handler.ts',
      content: `import { NextRequest, NextResponse } from 'next/server';
import { auth } from './config';

export async function authHandler(request: NextRequest) {
  try {
    const response = await auth.handler(request);
    return response;
  } catch (error) {
    console.error('Auth handler error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
`,
      condition: '{{#if integration.features.apiRoutes}}'
    },

    // Middleware
    {
      type: 'ADD_CONTENT',
      target: 'src/middleware.ts',
      content: `import { NextRequest } from 'next/server';
import { authMiddleware } from '@/lib/auth/middleware';

export function middleware(request: NextRequest) {
  return authMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
`,
      condition: '{{#if integration.features.middleware}}'
    },

    // Auth Middleware
    {
      type: 'ADD_CONTENT',
      target: 'src/lib/auth/middleware.ts',
      content: `import { NextRequest, NextResponse } from 'next/server';

export function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password', '/'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Check authentication for protected routes
  // This is a simplified example - in production you'd check the session
  const sessionToken = request.cookies.get('better-auth.session_token')?.value;
  
  if (!sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}
`,
      condition: '{{#if integration.features.middleware}}'
    },

    // Auth Provider Component
    {
      type: 'ADD_CONTENT',
      target: 'src/components/auth/auth-provider.tsx',
      content: `'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/auth/config';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthResult {
  user?: User;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, name: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state
    const initAuth = async () => {
      try {
        const session = await auth.api.getSession({
          headers: new Headers()
        });
        setUser(session?.user || null);
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const result = await auth.api.signInEmail({
        body: { email, password }
      });
      
      if (result?.user) {
        setUser(result.user);
      }
      
      return result || { error: 'Sign in failed' };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'Sign in failed' };
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<AuthResult> => {
    try {
      const result = await auth.api.signUpEmail({
        body: { email, password, name }
      });
      
      if (result?.user) {
        setUser(result.user);
      }
      
      return result || { error: 'Sign up failed' };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: 'Sign up failed' };
    }
  };

  const signOut = async () => {
    try {
      await auth.api.signOut({
        headers: new Headers()
      });
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
`,
      condition: '{{#if integration.features.uiComponents}}'
    },

    // Login Form Component
    {
      type: 'ADD_CONTENT',
      target: 'src/components/auth/login-form.tsx',
      content: `'use client';

import { useState } from 'react';
import { useAuth } from './auth-provider';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error);
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
`,
      condition: '{{#if integration.features.uiComponents}}'
    },

    // Register Form Component
    {
      type: 'ADD_CONTENT',
      target: 'src/components/auth/register-form.tsx',
      content: `'use client';

import { useState } from 'react';
import { useAuth } from './auth-provider';
import { useRouter } from 'next/navigation';

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signUp(email, password, name);
      if (result.error) {
        setError(result.error);
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? 'Creating account...' : 'Sign Up'}
      </button>
    </form>
  );
}
`,
      condition: '{{#if integration.features.uiComponents}}'
    },

    // User Menu Component
    {
      type: 'ADD_CONTENT',
      target: 'src/components/auth/user-menu.tsx',
      content: `'use client';

import { useAuth } from './auth-provider';
import { useRouter } from 'next/navigation';

export function UserMenu() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!user) {
    return (
      <div className="flex space-x-4">
        <button
          onClick={() => router.push('/login')}
          className="text-gray-700 hover:text-gray-900"
        >
          Sign In
        </button>
        <button
          onClick={() => router.push('/register')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Sign Up
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <span className="text-gray-700">
        Hello, {user.name || user.email}
      </span>
      <button
        onClick={handleSignOut}
        className="text-gray-700 hover:text-gray-900"
      >
        Sign Out
      </button>
    </div>
  );
}
`,
      condition: '{{#if integration.features.uiComponents}}'
    },

    // Admin Panel API Routes
    {
      type: 'ADD_CONTENT',
      target: 'src/app/api/admin/users/route.ts',
      content: `import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get users from your database
    // This is a placeholder - implement based on your database setup
    const users = [];

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
`,
      condition: '{{#if integration.features.adminPanel}}'
    },

    // Email Verification API Routes
    {
      type: 'ADD_CONTENT',
      target: 'src/app/api/auth/verify-email/route.ts',
      content: `import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    // Verify email with Better Auth
    const result = await auth.api.verifyEmail({
      query: { token }
    });

    if (result?.status) {
      return NextResponse.redirect(new URL('/email-verified', request.url));
    } else {
      return NextResponse.redirect(new URL('/email-verification-failed', request.url));
    }
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(new URL('/email-verification-failed', request.url));
  }
}
`,
      condition: '{{#if integration.features.emailVerification}}'
    },

    // MFA API Routes
    {
      type: 'ADD_CONTENT',
      target: 'src/app/api/auth/mfa/setup/route.ts',
      content: `import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Setup MFA for user
    const result = await auth.api.setupMFA({
      body: { userId: session.user.id }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('MFA setup error:', error);
    return NextResponse.json({ error: 'Failed to setup MFA' }, { status: 500 });
  }
}
`,
      condition: '{{#if integration.features.mfa}}'
    },

    // Password Reset API Routes
    {
      type: 'ADD_CONTENT',
      target: 'src/app/api/auth/reset-password/route.ts',
      content: `import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Send password reset email
    await auth.api.forgetPassword({
      body: { email }
    });

    return NextResponse.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'Failed to send reset email' }, { status: 500 });
  }
}
`,
      condition: '{{#if integration.features.passwordReset}}'
    }
  ]
};
