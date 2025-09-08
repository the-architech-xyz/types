import * as Sentry from '@sentry/nextjs';

// Performance monitoring utilities
export class PerformanceMonitor {
  private static transactions: Map<string, unknown> = new Map();

  /**
   * Start a performance transaction
   */
  static startSpan(name: string, op: string, description?: string) {
    return Sentry.startSpan({ name, op }, () => {});
  }

  /**
   * Finish a performance transaction
   */
  static finishTransaction(name: string) {
    const transaction = this.transactions.get(name);
    if (transaction) {
      transaction.finish();
      this.transactions.delete(name);
    }
  }

  /**
   * Add a span to a transaction
   */
  static addSpan(transactionName: string, spanName: string, op: string) {
    const transaction = this.transactions.get(transactionName);
    if (transaction) {
      return transaction.startChild({
        op,
        description: spanName,
      });
    }
    return null;
  }

  /**
   * Monitor API call performance
   */
  static async monitorApiCall<T>(
    apiName: string,
    apiCall: () => Promise<T>
  ): Promise<T> {
    const span = this.startSpan(`api.${apiName}`, 'http.client');
    
    try {
      const result = await apiCall();
      // Span automatically handles status
      return result;
    } catch (error) {
      // Span automatically handles error status
      throw error;
    } finally {
      this.finishTransaction(`api.${apiName}`);
    }
  }

  /**
   * Monitor function execution time
   */
  static async monitorFunction<T>(
    functionName: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const span = this.startSpan(`function.${functionName}`, 'function');
    
    try {
      const result = await fn();
      // Span automatically handles status
      return result;
    } catch (error) {
      // Span automatically handles error status
      throw error;
    } finally {
      this.finishTransaction(`function.${functionName}`);
    }
  }
}

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const startSpan = (name: string, op: string) => {
    return PerformanceMonitor.startSpan(name, op);
  };

  const finishTransaction = (name: string) => {
    PerformanceMonitor.finishTransaction(name);
  };

  const monitorApiCall = <T>(apiName: string, apiCall: () => Promise<T>) => {
    return PerformanceMonitor.monitorApiCall(apiName, apiCall);
  };

  const monitorFunction = <T>(functionName: string, fn: () => Promise<T>) => {
    return PerformanceMonitor.monitorFunction(functionName, fn);
  };

  return {
    startSpan,
    finishTransaction,
    monitorApiCall,
    monitorFunction,
  };
}