'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EmailStats {
  totalSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
}

interface EmailAnalyticsProps {
  stats: EmailStats;
}

export function EmailAnalytics({ stats }: EmailAnalyticsProps) {
  const deliveryRate = stats.totalSent > 0 ? (stats.delivered / stats.totalSent) * 100 : 0;
  const openRate = stats.delivered > 0 ? (stats.opened / stats.delivered) * 100 : 0;
  const clickRate = stats.delivered > 0 ? (stats.clicked / stats.delivered) * 100 : 0;
  const bounceRate = stats.totalSent > 0 ? (stats.bounced / stats.totalSent) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSent.toLocaleString()}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{deliveryRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            {stats.delivered.toLocaleString()} delivered
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{openRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            {stats.opened.toLocaleString()} opened
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{clickRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            {stats.clicked.toLocaleString()} clicked
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{bounceRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            {stats.bounced.toLocaleString()} bounced
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Complaints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{stats.complained}</div>
          <Badge variant={stats.complained > 0 ? 'destructive' : 'secondary'}>
            {stats.complained > 0 ? 'Action Required' : 'Clean'}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
