import { NextRequest, NextResponse } from 'next/server';
import { getEmailTemplates, createEmailTemplate } from '@/lib/email/templates';

export async function GET(request: NextRequest) {
  try {
    const templates = await getEmailTemplates();
    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Get templates error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, subject, html, text } = await request.json();

    if (!name || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: name, subject, html' },
        { status: 400 }
      );
    }

    const template = await createEmailTemplate({
      name,
      subject,
      html,
      text,
    });

    return NextResponse.json({ 
      success: true, 
      template,
      message: 'Template created successfully' 
    });
  } catch (error) {
    console.error('Create template error:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}