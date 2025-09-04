/**
 * Sentry Performance Monitoring Feature
 * 
 * Adds advanced performance tracking, web vitals, and transaction monitoring
 */

import { Blueprint } from '../../../../types/adapter.js';

const performanceMonitoringBlueprint: Blueprint = {
  id: 'sentry-performance-monitoring',
  name: 'Sentry Performance Monitoring',
  actions: [
    {
      type: 'RUN_COMMAND',
      command: 'npm install @sentry/nextjs @sentry/profiling-node'
    },
    {
      type: 'ADD_CONTENT',
      target: 'src/lib/monitoring/performance-tracker.ts',
      content: `import * as Sentry from '@sentry/nextjs';

// Performance monitoring utilities
export class PerformanceTracker {
  static startTransaction(name: string, op: string = 'custom') {
    return Sentry.startTransaction({
      name,
      op,
    });
  }

  static startSpan(transaction: any, name: string, op: string = 'custom') {
    return transaction.startChild({
      op,
      description: name,
    });
  }

  static finishSpan(span: any) {
    span.finish();
  }

  static finishTransaction(transaction: any) {
    transaction.finish();
  }

  static addBreadcrumb(message: string, category: string = 'performance', level: 'info' | 'warning' | 'error' = 'info') {
    Sentry.addBreadcrumb({
      message,
      category,
      level,
      timestamp: Date.now() / 1000,
    });
  }

  static setContext(key: string, context: any) {
    Sentry.setContext(key, context);
  }

  static setTag(key: string, value: string) {
    Sentry.setTag(key, value);
  }

  static setUser(user: { id?: string; email?: string; username?: string }) {
    Sentry.setUser(user);
  }

  // Web Vitals tracking
  static trackWebVitals() {
    {{#if module.parameters.web-vitals}}
    if (typeof window !== 'undefined') {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS((metric) => {
          Sentry.addBreadcrumb({
            message: 'CLS: ' + metric.value,
            category: 'web-vitals',
            level: 'info',
          });
        });

        getFID((metric) => {
          Sentry.addBreadcrumb({
            message: 'FID: ' + metric.value,
            category: 'web-vitals',
            level: 'info',
          });
        });

        getFCP((metric) => {
          Sentry.addBreadcrumb({
            message: 'FCP: ' + metric.value,
            category: 'web-vitals',
            level: 'info',
          });
        });

        getLCP((metric) => {
          Sentry.addBreadcrumb({
            message: 'LCP: ' + metric.value,
            category: 'web-vitals',
            level: 'info',
          });
        });

        getTTFB((metric) => {
          Sentry.addBreadcrumb({
            message: 'TTFB: ' + metric.value,
            category: 'web-vitals',
            level: 'info',
          });
        });
      });
    }
    {{/if}}
  }

  // API transaction tracking
  static trackApiCall(url: string, method: string, duration: number, status: number) {
    {{#if module.parameters.transactions}}
    const transaction = this.startTransaction('API Call', 'http.client');
    
    transaction.setData('url', url);
    transaction.setData('method', method);
    transaction.setData('status', status);
    transaction.setData('duration', duration);
    
    this.finishTransaction(transaction);
    {{/if}}
  }

  // Database query tracking
  static trackDatabaseQuery(query: string, duration: number, table?: string) {
    {{#if module.parameters.transactions}}
    const transaction = this.startTransaction('Database Query', 'db');
    
    transaction.setData('query', query);
    transaction.setData('duration', duration);
    if (table) {
      transaction.setData('table', table);
    }
    
    this.finishTransaction(transaction);
    {{/if}}
  }

  // Custom performance metrics
  static trackCustomMetric(name: string, value: number, unit: string = 'ms') {
    Sentry.addBreadcrumb({
      message: name + ': ' + value + ' ' + unit,
      category: 'custom-metric',
      level: 'info',
    });
  }

  // Memory usage tracking
  static trackMemoryUsage() {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      this.trackCustomMetric('Memory Used', memory.usedJSHeapSize, 'bytes');
      this.trackCustomMetric('Memory Total', memory.totalJSHeapSize, 'bytes');
      this.trackCustomMetric('Memory Limit', memory.jsHeapSizeLimit, 'bytes');
    }
  }

  // Network performance tracking
  static trackNetworkPerformance() {
    if (typeof window !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        this.trackCustomMetric('Connection Type', connection.effectiveType);
        this.trackCustomMetric('Downlink', connection.downlink, 'Mbps');
        this.trackCustomMetric('RTT', connection.rtt, 'ms');
      }
    }
  }
}`
    },
    {
      type: 'ADD_CONTENT',
      target: 'src/components/monitoring/performance-dashboard.tsx',
      content: `'use client';

import React, { useState, useEffect } from 'react';
import { PerformanceTracker } from '@/lib/monitoring/performance-tracker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState({
    pageLoad: 0,
    apiCalls: 0,
    dbQueries: 0,
    memoryUsage: 0,
    networkSpeed: 0,
  });

  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    if (isTracking) {
      PerformanceTracker.trackWebVitals();
      PerformanceTracker.trackMemoryUsage();
      PerformanceTracker.trackNetworkPerformance();
    }
  }, [isTracking]);

  const startTracking = () => {
    setIsTracking(true);
    PerformanceTracker.addBreadcrumb('Performance tracking started', 'performance');
  };

  const stopTracking = () => {
    setIsTracking(false);
    PerformanceTracker.addBreadcrumb('Performance tracking stopped', 'performance');
  };

  const simulateApiCall = () => {
    const start = Date.now();
    
    // Simulate API call
    setTimeout(() => {
      const duration = Date.now() - start;
      PerformanceTracker.trackApiCall('/api/test', 'GET', duration, 200);
      setMetrics(prev => ({ ...prev, apiCalls: prev.apiCalls + 1 }));
    }, Math.random() * 1000 + 500);
  };

  const simulateDbQuery = () => {
    const start = Date.now();
    
    // Simulate database query
    setTimeout(() => {
      const duration = Date.now() - start;
      PerformanceTracker.trackDatabaseQuery('SELECT * FROM users', duration, 'users');
      setMetrics(prev => ({ ...prev, dbQueries: prev.dbQueries + 1 }));
    }, Math.random() * 500 + 100);
  };

  const getPerformanceColor = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.poor) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Monitoring</h1>
          <p className="text-muted-foreground">
            Track and monitor your application's performance metrics
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={startTracking} disabled={isTracking}>
            Start Tracking
          </Button>
          <Button onClick={stopTracking} disabled={!isTracking} variant="outline">
            Stop Tracking
          </Button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Load Time</CardTitle>
            <Badge variant={isTracking ? 'default' : 'secondary'}>
              {isTracking ? 'Tracking' : 'Stopped'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getPerformanceColor(metrics.pageLoad, { good: 1000, poor: 3000 })}>
                {metrics.pageLoad}ms
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Average page load time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.apiCalls}</div>
            <p className="text-xs text-muted-foreground">
              Total API calls tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DB Queries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.dbQueries}</div>
            <p className="text-xs text-muted-foreground">
              Database queries tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getPerformanceColor(metrics.memoryUsage, { good: 50, poor: 100 })}>
                {metrics.memoryUsage}MB
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Current memory usage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Testing</CardTitle>
          <CardDescription>Simulate different performance scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button onClick={simulateApiCall}>
              Simulate API Call
            </Button>
            <Button onClick={simulateDbQuery}>
              Simulate DB Query
            </Button>
            <Button onClick={() => PerformanceTracker.trackCustomMetric('Custom Test', Math.random() * 100)}>
              Add Custom Metric
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Tips</CardTitle>
          <CardDescription>Best practices for optimal performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Badge variant="default">Tip</Badge>
              <span>Keep page load times under 1 second for optimal user experience</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="default">Tip</Badge>
              <span>Monitor API response times and optimize slow endpoints</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="default">Tip</Badge>
              <span>Use database query optimization to reduce query times</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="default">Tip</Badge>
              <span>Monitor memory usage to prevent memory leaks</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}`
    }
  ]
};
export default performanceMonitoringBlueprint;
