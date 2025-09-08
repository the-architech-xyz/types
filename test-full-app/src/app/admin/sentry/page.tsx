import { PerformanceMonitorComponent } from '@/components/sentry/PerformanceMonitor';
import { UserFeedbackComponent } from '@/components/sentry/UserFeedback';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, MessageSquare, AlertTriangle } from 'lucide-react';

export default function SentryAdminPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Sentry Monitoring</h1>
        <p className="text-muted-foreground">
          Monitor errors, performance, and user feedback
        </p>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            User Feedback
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <PerformanceMonitorComponent />
        </TabsContent>

        <TabsContent value="feedback">
          <div className="max-w-2xl">
            <UserFeedbackComponent />
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Alert Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Configure Sentry alerts and notifications here. This would typically
                connect to your Sentry dashboard for alert management.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
