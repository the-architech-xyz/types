/**
 * Email Next.js API Routes Integration Feature
 * 
 * Provides Next.js API route for email sending
 * Connects the agnostic Email adapter with Next.js framework
 */

import { Blueprint } from '../../types/adapter.js';

export const emailNextjsApiRoutesBlueprint: Blueprint = {
  id: 'email-nextjs-api-routes',
  name: 'Email Next.js API Routes',
  actions: [
    {
      type: 'CREATE_FILE',
      path: 'src/app/api/email/send/route.ts',
      content: `import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/sender';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, template, data } = await request.json();

    if (!to || !subject || !template) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, template' },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      to,
      subject,
      template,
      data: data || {},
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}`
    }
  ]
};
