import { SentryClient } from './client';

export class PerformanceMonitor {
  private static transactions: Map<string, any> = new Map();

  /**
   * Start monitoring a page load
   */
  static startPageLoad(pageName: string) {
    const transaction = SentryClient.startTransaction(`page-load-${pageName}`, 'navigation');
    this.transactions.set(`page-${pageName}`, transaction);
    return transaction;
  }

  /**
   * Finish monitoring a page load
   */
  static finishPageLoad(pageName: string) {
    const transaction = this.transactions.get(`page-${pageName}`);
    if (transaction) {
      SentryClient.capturePerformance(transaction);
      this.transactions.delete(`page-${pageName}`);
    }
  }

  /**
   * Start monitoring an API call
   */
  static startApiCall(endpoint: string, method: string = 'GET') {
    const transaction = SentryClient.startTransaction(`api-${method.toLowerCase()}-${endpoint}`, 'http.client');
    this.transactions.set(`api-${endpoint}`, transaction);
    return transaction;
  }

  /**
   * Finish monitoring an API call
   */
  static finishApiCall(endpoint: string, statusCode?: number) {
    const transaction = this.transactions.get(`api-${endpoint}`);
    if (transaction) {
      if (statusCode) {
        transaction.setData('http.status_code', statusCode);
      }
      SentryClient.capturePerformance(transaction);
      this.transactions.delete(`api-${endpoint}`);
    }
  }

  /**
   * Start monitoring a database query
   */
  static startDatabaseQuery(query: string, table?: string) {
    const transaction = SentryClient.startTransaction(`db-query-${table || 'unknown'}`, 'db');
    transaction.setData('db.statement', query);
    if (table) {
      transaction.setData('db.table', table);
    }
    this.transactions.set(`db-${query}`, transaction);
    return transaction;
  }

  /**
   * Finish monitoring a database query
   */
  static finishDatabaseQuery(query: string, rowCount?: number) {
    const transaction = this.transactions.get(`db-${query}`);
    if (transaction) {
      if (rowCount !== undefined) {
        transaction.setData('db.rows_affected', rowCount);
      }
      SentryClient.capturePerformance(transaction);
      this.transactions.delete(`db-${query}`);
    }
  }

  /**
   * Track web vitals
   */
  static trackWebVitals(metric: {
    name: string;
    value: number;
    delta: number;
    id: string;
  }) {
    SentryClient.addBreadcrumb({
      message: `Web Vital: ${metric.name}`,
      category: 'web-vitals',
      level: 'info',
      data: {
        value: metric.value,
        delta: metric.delta,
        id: metric.id,
      },
    });
  }

  /**
   * Track custom performance metric
   */
  static trackCustomMetric(name: string, value: number, unit: string = 'ms') {
    SentryClient.addBreadcrumb({
      message: `Custom Metric: ${name}`,
      category: 'performance',
      level: 'info',
      data: {
        value,
        unit,
        timestamp: Date.now(),
      },
    });
  }
}
