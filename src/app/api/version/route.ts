import { NextResponse } from 'next/server';
import { APP_VERSION } from '@/lib/version';

export async function GET() {
  return NextResponse.json({
    version: APP_VERSION,
    frontend: 'SuperAdmin Portal',
    timestamp: new Date().toISOString(),
  });
}
