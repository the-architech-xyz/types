'use client';

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
