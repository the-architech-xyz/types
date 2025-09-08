'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, Zap, TrendingUp } from 'lucide-react';
import { PerformanceMonitor } from '@/lib/sentry/performance';

interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  webVitals: {
    FCP?: number;
    LCP?: number;
    FID?: number;
    CLS?: number;
  };
}

export function PerformanceMonitorComponent() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    apiResponseTime: 0,
    webVitals: {},
  });

  useEffect(() => {
    // Track page load time
    const startTime = performance.now();
    
    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      setMetrics(prev => ({ ...prev, pageLoadTime: loadTime }));
      PerformanceMonitor.trackCustomMetric('page-load-time', loadTime);
    };

    // Track web vitals
    const trackWebVitals = () => {
      // This would typically use a web vitals library
      // For demo purposes, we'll simulate the data
      const mockVitals = {
        FCP: Math.random() * 2000 + 500,
        LCP: Math.random() * 3000 + 1000,
        FID: Math.random() * 100 + 10,
        CLS: Math.random() * 0.1,
      };

      setMetrics(prev => ({ 
        ...prev, 
        webVitals: mockVitals 
      }));

      Object.entries(mockVitals).forEach(([name, value]) => {
        PerformanceMonitor.trackWebVitals({
          name,
          value,
          delta: value,
          id: Math.random().toString(36).substr(2, 9),
        });
      });
    };

    if (document.readyState === 'complete') {
      handleLoad();
      trackWebVitals();
    } else {
      window.addEventListener('load', () => {
        handleLoad();
        trackWebVitals();
      });
    }

    // Track API response times (simulated)
    const trackApiPerformance = () => {
      const apiTime = Math.random() * 1000 + 100;
      setMetrics(prev => ({ ...prev, apiResponseTime: apiTime }));
      PerformanceMonitor.trackCustomMetric('api-response-time', apiTime);
    };

    // Simulate API calls
    const interval = setInterval(trackApiPerformance, 5000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  const getPerformanceStatus = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.poor) return 'warning';
    return 'poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Page Load Time</span>
                <Badge variant="outline">
                  {metrics.pageLoadTime.toFixed(0)}ms
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getStatusColor(
                    getPerformanceStatus(metrics.pageLoadTime, { good: 1000, poor: 3000 })
                  )}`}
                  style={{ width: `${Math.min((metrics.pageLoadTime / 3000) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Response Time</span>
                <Badge variant="outline">
                  {metrics.apiResponseTime.toFixed(0)}ms
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getStatusColor(
                    getPerformanceStatus(metrics.apiResponseTime, { good: 200, poor: 1000 })
                  )}`}
                  style={{ width: `${Math.min((metrics.apiResponseTime / 1000) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Web Vitals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(metrics.webVitals).map(([name, value]) => (
              <div key={name} className="text-center">
                <div className="text-2xl font-bold">
                  {typeof value === 'number' ? value.toFixed(0) : 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">{name}</div>
                <Badge 
                  variant="outline" 
                  className="mt-1"
                >
                  {getPerformanceStatus(value, { good: 1000, poor: 2500 })}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
