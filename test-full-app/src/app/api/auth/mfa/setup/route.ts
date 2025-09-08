import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Setup MFA for user
    const result = await auth.api.setupMFA({
      body: { userId: session.user.id }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('MFA setup error:', error);
    return NextResponse.json({ error: 'Failed to setup MFA' }, { status: 500 });
  }
}
