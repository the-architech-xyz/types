import { NextRequest, NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/db/connection';

export async function GET(request: NextRequest) {
  try {
    const health = await checkDatabaseHealth();
    
    if (health.status === 'healthy') {
      return NextResponse.json({
        status: 'healthy',
        database: {
          status: health.status,
          latency: `${health.latency}ms`,
        },
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json({
        status: 'unhealthy',
        database: {
          status: health.status,
          error: health.error,
          latency: `${health.latency}ms`,
        },
        timestamp: new Date().toISOString(),
      }, { status: 503 });
    }
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
