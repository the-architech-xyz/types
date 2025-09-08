import crypto from 'crypto';

export interface WebhookEvent {
  type: string;
  data: any;
  created_at: string;
}

export interface WebhookResult {
  success: boolean;
  error?: string;
}

export async function handleWebhook(body: string, signature: string): Promise<WebhookResult> {
  try {
    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature);
    if (!isValid) {
      return { success: false, error: 'Invalid signature' };
    }

    const event: WebhookEvent = JSON.parse(body);
    
    // Process different event types
    switch (event.type) {
      case 'email.sent':
        await handleEmailSent(event.data);
        break;
      case 'email.delivered':
        await handleEmailDelivered(event.data);
        break;
      case 'email.bounced':
        await handleEmailBounced(event.data);
        break;
      case 'email.complained':
        await handleEmailComplained(event.data);
        break;
      case 'email.opened':
        await handleEmailOpened(event.data);
        break;
      case 'email.clicked':
        await handleEmailClicked(event.data);
        break;
      default:
        console.log('Unknown webhook event type:', event.type);
    }

    return { success: true };
  } catch (error) {
    console.error('Webhook processing error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

function verifyWebhookSignature(body: string, signature: string): boolean {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn('RESEND_WEBHOOK_SECRET not set, skipping signature verification');
    return true; // Allow in development
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex');

  return signature === expectedSignature;
}

async function handleEmailSent(data: any) {
  console.log('Email sent:', data.email_id);
  // Log to database, update analytics, etc.
}

async function handleEmailDelivered(data: any) {
  console.log('Email delivered:', data.email_id);
  // Update delivery status in database
}

async function handleEmailBounced(data: any) {
  console.log('Email bounced:', data.email_id, data.reason);
  // Handle bounce, update user status, etc.
}

async function handleEmailComplained(data: any) {
  console.log('Email complained:', data.email_id);
  // Handle complaint, update user preferences, etc.
}

async function handleEmailOpened(data: any) {
  console.log('Email opened:', data.email_id);
  // Track open rate, update analytics
}

async function handleEmailClicked(data: any) {
  console.log('Email clicked:', data.email_id, data.link);
  // Track click rate, update analytics
}
