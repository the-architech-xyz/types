import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    // Verify email with Better Auth
    const result = await auth.api.verifyEmail({
      query: { token }
    });

    if (result?.status) {
      return NextResponse.redirect(new URL('/email-verified', request.url));
    } else {
      return NextResponse.redirect(new URL('/email-verification-failed', request.url));
    }
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(new URL('/email-verification-failed', request.url));
  }
}
