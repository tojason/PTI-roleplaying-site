import { NextResponse } from 'next/server';
import { checkDbConnection } from '@/lib/db-server';

export async function GET() {
  try {
    const dbConnected = await checkDbConnection();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbConnected ? 'connected' : 'disconnected',
        api: 'running'
      },
      environment: process.env.NODE_ENV || 'unknown',
      version: process.env.npm_package_version || '1.0.0'
    };

    return NextResponse.json(health, { 
      status: dbConnected ? 200 : 503 
    });
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        services: {
          database: 'error',
          api: 'running'
        }
      },
      { status: 503 }
    );
  }
}