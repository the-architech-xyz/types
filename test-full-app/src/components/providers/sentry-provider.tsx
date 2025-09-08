'use client';

import { ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';

interface SentryProviderProps {
  children: ReactNode;
}

/**
 * Sentry Provider Component
 * 
 * Provides Sentry error monitoring context
 * Handles error boundaries and performance monitoring
 */
export function SentryProvider({ children }: SentryProviderProps) {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium text-gray-900">
                Something went wrong
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                We&apos;re sorry, but something unexpected happened. Our team has been notified.
              </p>
              <div className="mt-4">
                <button
                  onClick={resetError}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      beforeCapture={(scope, error, errorInfo) => {
        scope.setTag('errorBoundary', true);
        scope.setContext('errorInfo', { errorInfo });
        return scope;
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}