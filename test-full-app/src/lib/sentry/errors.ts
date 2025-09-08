import { SentryClient } from './client';

export class ErrorHandler {
  /**
   * Handle API errors
   */
  static handleApiError(error: Error, context: {
    endpoint: string;
    method: string;
    statusCode?: number;
    userId?: string;
  }) {
    SentryClient.addBreadcrumb({
      message: `API Error: ${context.method} ${context.endpoint}`,
      category: 'api',
      level: 'error',
      data: context,
    });

    SentryClient.captureException(error, {
      api: context,
    });
  }

  /**
   * Handle database errors
   */
  static handleDatabaseError(error: Error, context: {
    query: string;
    table?: string;
    operation: string;
  }) {
    SentryClient.addBreadcrumb({
      message: `Database Error: ${context.operation} on ${context.table || 'unknown table'}`,
      category: 'database',
      level: 'error',
      data: context,
    });

    SentryClient.captureException(error, {
      database: context,
    });
  }

  /**
   * Handle authentication errors
   */
  static handleAuthError(error: Error, context: {
    userId?: string;
    action: string;
    provider?: string;
  }) {
    SentryClient.addBreadcrumb({
      message: `Auth Error: ${context.action}`,
      category: 'auth',
      level: 'error',
      data: context,
    });

    SentryClient.captureException(error, {
      auth: context,
    });
  }

  /**
   * Handle payment errors
   */
  static handlePaymentError(error: Error, context: {
    amount?: number;
    currency?: string;
    paymentMethod?: string;
    transactionId?: string;
  }) {
    SentryClient.addBreadcrumb({
      message: 'Payment Error',
      category: 'payment',
      level: 'error',
      data: context,
    });

    SentryClient.captureException(error, {
      payment: context,
    });
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(error: Error, context: {
    field: string;
    value: any;
    rule: string;
    form?: string;
  }) {
    SentryClient.addBreadcrumb({
      message: `Validation Error: ${context.field}`,
      category: 'validation',
      level: 'warning',
      data: context,
    });

    SentryClient.captureException(error, {
      validation: context,
    });
  }

  /**
   * Handle external service errors
   */
  static handleExternalServiceError(error: Error, context: {
    service: string;
    endpoint: string;
    statusCode?: number;
    response?: any;
  }) {
    SentryClient.addBreadcrumb({
      message: `External Service Error: ${context.service}`,
      category: 'external-service',
      level: 'error',
      data: context,
    });

    SentryClient.captureException(error, {
      externalService: context,
    });
  }
}
