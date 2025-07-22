import { PayPalConfig } from './PayPalSchema.js';

export class PayPalGenerator {
  static generatePayPalClient(config: PayPalConfig): string {
    return `import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

const configureEnvironment = function () {
  const clientId = process.env.PAYPAL_CLIENT_ID || '${config.clientId}';
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || '${config.clientSecret}';

  if (process.env.NODE_ENV === 'production' || '${config.environment}' === 'live') {
    return new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret);
  }
  return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
};

const client = new checkoutNodeJssdk.core.PayPalHttpClient(configureEnvironment());

export default client;
`;
  }

  static generateCreateOrderRoute(config: PayPalConfig): string {
    return `import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/paypal/client';
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

export async function POST(req: NextRequest) {
  const { cart } = await req.json();

  if (!cart) {
    return NextResponse.json({ error: 'Cart not provided' }, { status: 400 });
  }

  const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: '${config.intent.toUpperCase()}',
    purchase_units: [
      {
        amount: {
          currency_code: '${config.currency}',
          value: cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2),
        },
      },
    ],
  });

  try {
    const order = await client.execute(request);
    return NextResponse.json({ id: order.result.id });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
`;
  }

  static generateCaptureOrderRoute(config: PayPalConfig): string {
    return `import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/paypal/client';
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

export async function POST(req: NextRequest) {
  const { orderID } = await req.json();

  if (!orderID) {
    return NextResponse.json({ error: 'Order ID not provided' }, { status: 400 });
  }

  const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  try {
    const capture = await client.execute(request);
    // Here you can save the capture details to your database
    return NextResponse.json({ capture });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
`;
  }

  static generateWebhookRoute(config: PayPalConfig): string {
    return `import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/paypal/client';
// You would need to implement a webhook verification function
// import { verifyWebhook } from '@/lib/paypal/utils'; 

export async function POST(req: NextRequest) {
  const body = await req.json();
  const headers = req.headers;

  // const isVerified = verifyWebhook(headers, body, '${config.webhookId}');
  // if(!isVerified) {
  //   return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 });
  // }

  const eventType = body.event_type;
  
  // Handle the event
  switch (eventType) {
    case 'PAYMENT.CAPTURE.COMPLETED':
      // Handle payment capture completed
      break;
    // Add more cases for other events you want to handle
    default:
      console.log(\`Unhandled event type: \${eventType}\`);
  }

  return NextResponse.json({ received: true });
}
`;
  }

  static generateEnvConfig(config: PayPalConfig): string {
    return `
# PayPal Configuration
PAYPAL_CLIENT_ID="${config.clientId}"
PAYPAL_CLIENT_SECRET="${config.clientSecret}"
PAYPAL_ENVIRONMENT="${config.environment}"
${config.webhookId ? `PAYPAL_WEBHOOK_ID="${config.webhookId}"` : ''}
`;
  }

  static generatePackageJson(config: PayPalConfig): string {
    return JSON.stringify({
      dependencies: {
        '@paypal/checkout-server-sdk': '^1.0.3',
        '@paypal/react-paypal-js': '^8.1.3',
      }
    }, null, 2);
  }

  static generateReadme(): string {
    return `# PayPal Payment Integration

This project is configured to use PayPal for processing payments.

## Configuration

The following environment variables are required for the PayPal integration:

- \`PAYPAL_CLIENT_ID\`: Your PayPal application's client ID.
- \`PAYPAL_CLIENT_SECRET\`: Your PayPal application's client secret.
- \`PAYPAL_ENVIRONMENT\`: The environment to use (\`sandbox\` or \`live\`).
- \`PAYPAL_WEBHOOK_ID\`: (Optional) Your PayPal webhook ID for event notifications.

These should be set in your \`.env\` file.

## API Routes

The following API routes are available for handling payments:

- \`/api/paypal/orders\`: Create a new order.
- \`/api/paypal/orders/[orderID]/capture\`: Capture a payment for an order.
- \`/api/paypal/webhook\`: Handles incoming webhook events from PayPal.
`;
  }
} 