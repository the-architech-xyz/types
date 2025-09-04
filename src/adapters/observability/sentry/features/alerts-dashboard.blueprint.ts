/**
 * Sentry Alerts & Dashboard Feature
 * 
 * Adds custom alerts, monitoring dashboard, and notification system
 */

import { Blueprint } from '../../../../types/adapter.js';

const alertsDashboardBlueprint: Blueprint = {
  id: 'sentry-alerts-dashboard',
  name: 'Sentry Alerts & Dashboard',
  actions: [
    {
      type: 'ADD_CONTENT',
      target: 'src/lib/monitoring/alert-manager.ts',
      content: `import * as Sentry from '@sentry/nextjs';

// Alert configuration interfaces
export interface AlertRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  threshold: number;
  timeWindow: number; // in minutes
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  notifications: NotificationConfig[];
}

export interface NotificationConfig {
  type: 'email' | 'slack' | 'webhook' | 'sms';
  target: string;
  enabled: boolean;
}

export interface AlertEvent {
  id: string;
  ruleId: string;
  message: string;
  severity: string;
  timestamp: Date;
  resolved: boolean;
  metadata: Record<string, any>;
}

// Alert manager
export class AlertManager {
  private alerts: AlertRule[] = [];
  private events: AlertEvent[] = [];
  
  constructor() {
    this.initializeDefaultAlerts();
  }

  private initializeDefaultAlerts() {
    this.alerts = [
      {
        id: 'error-rate-high',
        name: 'High Error Rate',
        description: 'Alert when error rate exceeds threshold',
        condition: 'error_rate > threshold',
        threshold: 5,
        timeWindow: 5,
        severity: 'high',
        enabled: true,
        notifications: [
          { type: 'email', target: 'admin@example.com', enabled: true },
          { type: 'slack', target: '#alerts', enabled: true },
        ],
      },
      {
        id: 'response-time-slow',
        name: 'Slow Response Time',
        description: 'Alert when average response time is too high',
        condition: 'avg_response_time > threshold',
        threshold: 2000,
        timeWindow: 10,
        severity: 'medium',
        enabled: true,
        notifications: [
          { type: 'email', target: 'dev@example.com', enabled: true },
        ],
      },
      {
        id: 'memory-usage-high',
        name: 'High Memory Usage',
        description: 'Alert when memory usage exceeds threshold',
        condition: 'memory_usage > threshold',
        threshold: 80,
        timeWindow: 5,
        severity: 'critical',
        enabled: true,
        notifications: [
          { type: 'email', target: 'ops@example.com', enabled: true },
          { type: 'sms', target: '+1234567890', enabled: true },
        ],
      },
    ];
  }

  async createAlert(alert: Omit<AlertRule, 'id'>): Promise<AlertRule> {
    const newAlert: AlertRule = {
      ...alert,
      id: this.generateId('alert'),
    };
    
    this.alerts.push(newAlert);
    return newAlert;
  }

  async updateAlert(alertId: string, updates: Partial<AlertRule>): Promise<boolean> {
    const index = this.alerts.findIndex(alert => alert.id === alertId);
    if (index === -1) return false;
    
    this.alerts[index] = { ...this.alerts[index], ...updates };
    return true;
  }

  async deleteAlert(alertId: string): Promise<boolean> {
    const index = this.alerts.findIndex(alert => alert.id === alertId);
    if (index === -1) return false;
    
    this.alerts.splice(index, 1);
    return true;
  }

  async getAlerts(): Promise<AlertRule[]> {
    return this.alerts;
  }

  async getAlert(alertId: string): Promise<AlertRule | null> {
    return this.alerts.find(alert => alert.id === alertId) || null;
  }

  async getAlertEvents(alertId?: string): Promise<AlertEvent[]> {
    if (alertId) {
      return this.events.filter(event => event.ruleId === alertId);
    }
    return this.events;
  }

  async triggerAlert(ruleId: string, message: string, metadata: Record<string, any> = {}): Promise<void> {
    const rule = await this.getAlert(ruleId);
    if (!rule || !rule.enabled) return;

    const event: AlertEvent = {
      id: this.generateId('event'),
      ruleId,
      message,
      severity: rule.severity,
      timestamp: new Date(),
      resolved: false,
      metadata,
    };

    this.events.push(event);
    
    // Send notifications
    await this.sendNotifications(rule, event);
    
    // Capture with Sentry
    Sentry.captureMessage(message, 'error');
  }

  async resolveAlert(eventId: string): Promise<boolean> {
    const event = this.events.find(e => e.id === eventId);
    if (!event) return false;
    
    event.resolved = true;
    return true;
  }

  private async sendNotifications(rule: AlertRule, event: AlertEvent): Promise<void> {
    for (const notification of rule.notifications) {
      if (!notification.enabled) continue;
      
      try {
        switch (notification.type) {
          case 'email':
            await this.sendEmailNotification(notification.target, event);
            break;
          case 'slack':
            await this.sendSlackNotification(notification.target, event);
            break;
          case 'webhook':
            await this.sendWebhookNotification(notification.target, event);
            break;
          case 'sms':
            await this.sendSMSNotification(notification.target, event);
            break;
        }
      } catch (error) {
        console.error('Failed to send notification:', error);
      }
    }
  }

  private async sendEmailNotification(target: string, event: AlertEvent): Promise<void> {
    // Mock email sending
    console.log('Sending email alert to:', target, 'Message:', event.message);
  }

  private async sendSlackNotification(target: string, event: AlertEvent): Promise<void> {
    // Mock Slack notification
    console.log('Sending Slack alert to:', target, 'Message:', event.message);
  }

  private async sendWebhookNotification(target: string, event: AlertEvent): Promise<void> {
    // Mock webhook notification
    console.log('Sending webhook alert to:', target, 'Message:', event.message);
  }

  private async sendSMSNotification(target: string, event: AlertEvent): Promise<void> {
    // Mock SMS notification
    console.log('Sending SMS alert to:', target, 'Message:', event.message);
  }

  // Monitoring utilities
  async checkErrorRate(): Promise<number> {
    // Mock error rate calculation
    return Math.random() * 10;
  }

  async checkResponseTime(): Promise<number> {
    // Mock response time calculation
    return Math.random() * 3000;
  }

  async checkMemoryUsage(): Promise<number> {
    // Mock memory usage calculation
    return Math.random() * 100;
  }

  async runHealthChecks(): Promise<void> {
    const errorRate = await this.checkErrorRate();
    const responseTime = await this.checkResponseTime();
    const memoryUsage = await this.checkMemoryUsage();

    // Check error rate alert
    if (errorRate > 5) {
      await this.triggerAlert('error-rate-high', 'High error rate detected: ' + errorRate.toFixed(2) + '%', {
        errorRate,
        timestamp: new Date().toISOString(),
      });
    }

    // Check response time alert
    if (responseTime > 2000) {
      await this.triggerAlert('response-time-slow', 'Slow response time detected: ' + responseTime.toFixed(0) + 'ms', {
        responseTime,
        timestamp: new Date().toISOString(),
      });
    }

    // Check memory usage alert
    if (memoryUsage > 80) {
      await this.triggerAlert('memory-usage-high', 'High memory usage detected: ' + memoryUsage.toFixed(1) + '%', {
        memoryUsage,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private generateId(prefix: string): string {
    return prefix + '_' + Math.random().toString(36).substr(2, 9);
  }
}`
    },
    {
      type: 'ADD_CONTENT',
      target: 'src/components/monitoring/alerts-dashboard.tsx',
      content: `{{#if module.parameters.dashboard}}
'use client';

import React, { useState, useEffect } from 'react';
import { AlertManager } from '@/lib/monitoring/alert-manager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function AlertsDashboard() {
  const [alertManager] = useState(() => new AlertManager());
  const [alerts, setAlerts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newAlert, setNewAlert] = useState({
    name: '',
    description: '',
    condition: '',
    threshold: 0,
    timeWindow: 5,
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    enabled: true,
  });

  useEffect(() => {
    loadAlerts();
    loadEvents();
  }, []);

  const loadAlerts = async () => {
    try {
      const alertList = await alertManager.getAlerts();
      setAlerts(alertList);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  const loadEvents = async () => {
    try {
      const eventList = await alertManager.getAlertEvents();
      setEvents(eventList);
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  const createAlert = async () => {
    try {
      await alertManager.createAlert(newAlert);
      setNewAlert({
        name: '',
        description: '',
        condition: '',
        threshold: 0,
        timeWindow: 5,
        severity: 'medium',
        enabled: true,
      });
      setIsCreating(false);
      loadAlerts();
    } catch (error) {
      console.error('Failed to create alert:', error);
    }
  };

  const toggleAlert = async (alertId: string, enabled: boolean) => {
    try {
      await alertManager.updateAlert(alertId, { enabled });
      loadAlerts();
    } catch (error) {
      console.error('Failed to toggle alert:', error);
    }
  };

  const runHealthChecks = async () => {
    try {
      await alertManager.runHealthChecks();
      loadEvents();
    } catch (error) {
      console.error('Failed to run health checks:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getSeverityTextColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alerts & Monitoring</h1>
          <p className="text-muted-foreground">
            Manage alerts and monitor system health
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsCreating(true)}>
            Create Alert
          </Button>
          <Button onClick={runHealthChecks} variant="outline">
            Run Health Checks
          </Button>
        </div>
      </div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
            <p className="text-xs text-muted-foreground">
              Configured alert rules
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {alerts.filter(a => a.enabled).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently enabled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alert Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {events.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Total events triggered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unresolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {events.filter(e => !e.resolved).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending resolution
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Create Alert Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Alert</CardTitle>
            <CardDescription>Set up a new monitoring alert</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Alert Name</label>
                <Input
                  value={newAlert.name}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter alert name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Severity</label>
                <select
                  value={newAlert.severity}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, severity: e.target.value as any }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newAlert.description}
                onChange={(e) => setNewAlert(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this alert monitors"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Condition</label>
                <Input
                  value={newAlert.condition}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, condition: e.target.value }))}
                  placeholder="e.g., error_rate > threshold"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Threshold</label>
                <Input
                  type="number"
                  value={newAlert.threshold}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, threshold: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Time Window (minutes)</label>
                <Input
                  type="number"
                  value={newAlert.timeWindow}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, timeWindow: Number(e.target.value) }))}
                  placeholder="5"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={createAlert}>
                Create Alert
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.map((alert) => (
          <Card key={alert.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{alert.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant={getSeverityColor(alert.severity)}>
                    {alert.severity}
                  </Badge>
                  <Button
                    size="sm"
                    variant={alert.enabled ? "default" : "outline"}
                    onClick={() => toggleAlert(alert.id, !alert.enabled)}
                  >
                    {alert.enabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
              </div>
              <CardDescription>{alert.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Condition:</span>
                  <span className="font-mono">{alert.condition}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Threshold:</span>
                  <span>{alert.threshold}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Time Window:</span>
                  <span>{alert.timeWindow} minutes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Notifications:</span>
                  <span>{alert.notifications.length} configured</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alert Events</CardTitle>
          <CardDescription>Latest triggered alerts and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.slice(0, 10).map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">{event.message}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(event.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getSeverityColor(event.severity)}>
                    {event.severity}
                  </Badge>
                  <Badge variant={event.resolved ? 'default' : 'destructive'}>
                    {event.resolved ? 'Resolved' : 'Active'}
                  </Badge>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No alert events yet. Run health checks to test your alerts.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
{{/if}}`
    }
  ]
};
export default alertsDashboardBlueprint;
