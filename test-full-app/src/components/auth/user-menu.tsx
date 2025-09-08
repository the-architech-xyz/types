'use client';

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
