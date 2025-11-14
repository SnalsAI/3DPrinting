import nodemailer from 'nodemailer';

// Email transport configuration
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  // Check if email is enabled
  const emailEnabled = process.env.EMAIL_ENABLED === 'true';

  if (!emailEnabled) {
    console.log('Email is disabled. Set EMAIL_ENABLED=true to enable.');
    return null;
  }

  // Create transporter
  try {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    return transporter;
  } catch (error) {
    console.error('Failed to create email transporter:', error);
    return null;
  }
}

/**
 * Send an email
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<boolean> {
  const transport = getTransporter();

  if (!transport) {
    // Email disabled - log instead
    console.log('📧 [EMAIL MOCK]');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text || html.substring(0, 100)}...`);
    return true; // Return success for mock
  }

  try {
    await transport.sendMail({
      from: `${process.env.EMAIL_FROM_NAME || '3D PrintHub'} <${process.env.EMAIL_FROM_ADDRESS || 'noreply@3dprinthub.com'}>`,
      to,
      subject,
      text: text || '',
      html,
    });

    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Email templates
 */
export const emailTemplates = {
  orderConfirmation: (orderId: string, totalAmount: number) => ({
    subject: `Order Confirmation #${orderId.slice(0, 8)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Order Confirmed! 🎉</h1>
        <p>Thank you for your order. We've received your payment and your 3D print is being prepared.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order ID:</strong> #${orderId.slice(0, 8)}</p>
          <p><strong>Total:</strong> $${totalAmount.toFixed(2)}</p>
        </div>
        <h2 style="color: #1f2937;">What happens next?</h2>
        <ul>
          <li>Your order is being assigned to our print partners</li>
          <li>You'll receive updates as your print progresses</li>
          <li>Track your order status in your account dashboard</li>
        </ul>
        <p>Thank you for choosing 3D PrintHub!</p>
      </div>
    `,
    text: `Order Confirmed! Order ID: #${orderId.slice(0, 8)}. Total: $${totalAmount.toFixed(2)}. Your 3D print is being prepared.`,
  }),

  orderStatusUpdate: (orderId: string, status: string) => ({
    subject: `Order Update: ${status} - #${orderId.slice(0, 8)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Order Status Update</h1>
        <p>Your order status has been updated!</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order ID:</strong> #${orderId.slice(0, 8)}</p>
          <p><strong>Status:</strong> ${status}</p>
        </div>
        <p>You can track your order progress in your account dashboard.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/orders/${orderId}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">View Order</a>
      </div>
    `,
    text: `Order Update: Your order #${orderId.slice(0, 8)} status is now ${status}.`,
  }),

  printJobUpdate: (orderId: string, jobStatus: string) => ({
    subject: `Print Update: ${jobStatus}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Print Job Update 🖨️</h1>
        <p>Good news! Your 3D print job has been updated.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Status:</strong> ${jobStatus}</p>
        </div>
        <p>Your order is progressing smoothly. We'll notify you when it ships!</p>
      </div>
    `,
    text: `Print Job Update: ${jobStatus}`,
  }),
};
