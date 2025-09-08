import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { sendEmail } from '@/lib/email/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, text, from } = await request.json();

    if (!to || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject' },
        { status: 400 }
      );
    }

    const result = await resend.emails.send({
      from: from || process.env.RESEND_FROM_EMAIL || 'noreply@example.com',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    });

    return NextResponse.json({ 
      success: true, 
      messageId: result.data?.id,
      message: 'Email sent successfully' 
    });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}