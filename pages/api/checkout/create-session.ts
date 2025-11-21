import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { OrderStatus } from '@prisma/client';
import { logger } from '@/lib/logger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const timer = logger.startTimer('checkout-create-session');

  if (req.method !== 'POST') {
    logger.warn('API', 'POST /api/checkout/create-session', 'Method not allowed', {
      metadata: { method: req.method },
    });
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    const userId = (session?.user as any)?.id;

    logger.apiRequest('POST', '/api/checkout/create-session', userId, {
      cartItemsCount: req.body?.cart?.length || 0,
    });

    if (!session) {
      logger.warn('AUTH', 'Checkout Unauthorized', 'User attempted checkout without authentication', {
        ipAddress: req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress,
        endpoint: '/api/checkout/create-session',
      });
      return res.status(401).json({ error: 'Unauthorized. Please sign in.' });
    }

    const { cart, shippingInfo } = req.body;

    // Validation
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    if (!shippingInfo || !shippingInfo.name || !shippingInfo.address || !shippingInfo.email) {
      return res.status(400).json({ error: 'Missing shipping information' });
    }

    // Fetch customizations with model details
    const customizationIds = cart.map((item: any) => item.customizationId);
    const customizations = await prisma.customization.findMany({
      where: {
        id: { in: customizationIds },
      },
      include: {
        model: true,
      },
    });

    if (customizations.length !== cart.length) {
      return res.status(400).json({ error: 'Some customizations not found' });
    }

    // Calculate prices and create line items
    let totalAmount = 0;
    const orderItems: any[] = [];
    const stripeLineItems: any[] = [];

    for (const cartItem of cart) {
      const customization = customizations.find((c) => c.id === cartItem.customizationId);
      if (!customization) continue;

      const quantity = parseInt(cartItem.quantity) || 1;
      const unitPrice = Number(customization.model.basePrice);
      const subtotal = unitPrice * quantity;

      totalAmount += subtotal;

      orderItems.push({
        customizationId: customization.id,
        quantity,
        unitPrice,
        subtotal,
      });

      // Stripe line item
      stripeLineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: customization.model.name,
            description: `Customized ${customization.model.name}`,
            images: customization.model.previewImageUrl
              ? [customization.model.previewImageUrl]
              : [],
          },
          unit_amount: Math.round(unitPrice * 100), // Convert to cents
        },
        quantity,
      });
    }

    // Create order in database
    logger.info('ORDER', 'Create Order', `Creating order for ${cart.length} items`, {
      userId,
      metadata: { itemsCount: cart.length, totalAmount },
    });

    const order = await prisma.order.create({
      data: {
        userId: (session.user as any).id,
        status: OrderStatus.PENDING_PAYMENT,
        shippingInfo: shippingInfo,
        totalAmount,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });

    logger.orderEvent(order.id, 'Order Created', 'Order created successfully', userId, {
      totalAmount,
      itemsCount: order.items.length,
    });

    // Create Stripe checkout session
    logger.paymentEvent('Create Stripe Session', 'Creating Stripe checkout session', userId, {
      orderId: order.id,
      amount: totalAmount,
    });

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: stripeLineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?cancelled=true`,
      client_reference_id: order.id,
      customer_email: shippingInfo.email,
      metadata: {
        orderId: order.id,
        userId: (session.user as any).id,
      },
    });

    logger.paymentEvent('Stripe Session Created', `Stripe session created: ${stripeSession.id}`, userId, {
      orderId: order.id,
      sessionId: stripeSession.id,
      amount: totalAmount,
    });

    // Update order with stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        stripePaymentIntentId: stripeSession.id,
      },
    });

    const duration = timer();
    logger.apiResponse('POST', '/api/checkout/create-session', 200, duration, userId);

    return res.status(200).json({
      success: true,
      data: {
        sessionId: stripeSession.id,
        url: stripeSession.url,
        orderId: order.id,
      },
    });
  } catch (error) {
    const duration = timer();
    const userId = (await getServerSession(req, res, authOptions))?.user?.id;

    logger.apiError('POST', '/api/checkout/create-session', error as Error, userId, {
      cart: req.body?.cart,
      shippingInfo: req.body?.shippingInfo,
    });

    console.error('Error creating checkout session:', error);
    return res.status(500).json({
      error: 'Failed to create checkout session',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
