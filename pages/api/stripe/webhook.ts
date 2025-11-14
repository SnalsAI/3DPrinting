import type { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';
import { assignPrintJobs } from '@/lib/printJobs/assignment';
import { sendOrderConfirmationEmail } from '@/lib/notifications/notificationService';
import { createInvoiceForOrder } from '@/lib/invoices/generator';

// Disable body parser for this endpoint
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).json({
      error: 'Webhook signature verification failed',
    });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Get order ID from metadata
        const orderId = session.metadata?.orderId;

        if (!orderId) {
          console.error('No orderId in session metadata');
          break;
        }

        // Update order status to PAID
        const order = await prisma.order.update({
          where: { id: orderId },
          data: {
            status: OrderStatus.PAID,
          },
          include: {
            items: true,
            user: true,
          },
        });

        console.log('Order marked as PAID:', orderId);

        // Trigger print job creation automatically
        try {
          const printJobs = await assignPrintJobs(orderId);
          console.log(`Created ${printJobs.length} print jobs for order ${orderId}`);
        } catch (jobError) {
          console.error('Error creating print jobs:', jobError);
          // Don't fail the webhook if print job creation fails
        }

        // Send order confirmation email and notification
        try {
          await sendOrderConfirmationEmail(order);
        } catch (emailError) {
          console.error('Error sending order confirmation:', emailError);
          // Don't fail the webhook if email fails
        }

        // Generate invoice automatically
        try {
          const invoice = await createInvoiceForOrder(orderId);
          console.log(`Invoice ${invoice.invoiceNumber} generated for order ${orderId}`);
        } catch (invoiceError) {
          console.error('Error generating invoice:', invoiceError);
          // Don't fail the webhook if invoice generation fails
        }

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error('Payment failed:', paymentIntent.id);

        // Update order status to CANCELLED
        const orderId = paymentIntent.metadata?.orderId;
        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: OrderStatus.CANCELLED,
            },
          });
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
