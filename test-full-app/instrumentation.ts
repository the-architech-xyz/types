import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export function onRequestError(err: unknown, request: {
  path: string;
  method: string;
  headers: Record<string, string | string[] | undefined>;
}) {
  Sentry.captureException(err, {
    contexts: {
      request: request,
    },
  });
}