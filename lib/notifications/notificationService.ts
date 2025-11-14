import prisma from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/email/mailer';
import { OrderStatus, PrintStatus } from '@prisma/client';

/**
 * Create a notification for a user
 */
export async function createNotification(
  userId: string,
  type: string,
  message: string,
  relatedId?: string
) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        relatedId: relatedId || null,
      },
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Send order status update notification
 */
export async function sendOrderStatusUpdate(
  orderId: string,
  newStatus: OrderStatus
) {
  try {
    // Get order with user details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
      },
    });

    if (!order) {
      console.error('Order not found:', orderId);
      return;
    }

    // Create notification message
    const statusMessages: Record<OrderStatus, string> = {
      PENDING_PAYMENT: 'Your order is awaiting payment',
      PAID: 'Payment confirmed! Your order is being processed',
      SCHEDULED: 'Your order has been scheduled for printing',
      PRINTING: 'Your order is now being printed',
      SHIPPED: 'Your order has been shipped!',
      DELIVERED: 'Your order has been delivered',
      CANCELLED: 'Your order has been cancelled',
    };

    const message = statusMessages[newStatus] || `Order status updated to ${newStatus}`;

    // Create notification in database
    await createNotification(
      order.userId,
      'order_status',
      message,
      orderId
    );

    // Send email notification
    const shippingInfo = order.shippingInfo as any;
    const userEmail = shippingInfo?.email || order.user.email;

    if (userEmail) {
      const template = emailTemplates.orderStatusUpdate(orderId, newStatus);
      await sendEmail(
        userEmail,
        template.subject,
        template.html,
        template.text
      );
    }

    console.log(`Notification sent for order ${orderId}: ${newStatus}`);
  } catch (error) {
    console.error('Error sending order status update:', error);
  }
}

/**
 * Send print job update notification
 */
export async function sendPrintJobUpdate(
  jobId: string,
  newStatus: PrintStatus
) {
  try {
    // Get print job with related order and user details
    const job = await prisma.printJob.findUnique({
      where: { id: jobId },
      include: {
        orderItem: {
          include: {
            order: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!job) {
      console.error('Print job not found:', jobId);
      return;
    }

    // Create notification message
    const statusMessages: Record<PrintStatus, string> = {
      SCHEDULED: 'Your print job has been scheduled',
      PRINTING: 'Your item is currently being printed',
      COMPLETED: 'Your print job has been completed!',
      FAILED: 'There was an issue with your print job',
    };

    const message = statusMessages[newStatus] || `Print job status: ${newStatus}`;

    // Create notification in database
    await createNotification(
      job.orderItem.order.userId,
      'print_job',
      message,
      jobId
    );

    // Send email notification for important statuses
    if ([PrintStatus.PRINTING, PrintStatus.COMPLETED, PrintStatus.FAILED].includes(newStatus)) {
      const shippingInfo = job.orderItem.order.shippingInfo as any;
      const userEmail = shippingInfo?.email || job.orderItem.order.user.email;

      if (userEmail) {
        const template = emailTemplates.printJobUpdate(job.orderItem.orderId, newStatus);
        await sendEmail(
          userEmail,
          template.subject,
          template.html,
          template.text
        );
      }
    }

    console.log(`Notification sent for print job ${jobId}: ${newStatus}`);
  } catch (error) {
    console.error('Error sending print job update:', error);
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(order: any) {
  try {
    const shippingInfo = order.shippingInfo as any;
    const userEmail = shippingInfo?.email || order.user.email;

    if (!userEmail) {
      console.error('No email address found for order:', order.id);
      return;
    }

    const template = emailTemplates.orderConfirmation(
      order.id,
      Number(order.totalAmount)
    );

    await sendEmail(
      userEmail,
      template.subject,
      template.html,
      template.text
    );

    // Create notification
    await createNotification(
      order.userId,
      'order_status',
      'Order confirmed! Your 3D print is being prepared.',
      order.id
    );

    console.log(`Order confirmation sent for order ${order.id}`);
  } catch (error) {
    console.error('Error sending order confirmation:', error);
  }
}
