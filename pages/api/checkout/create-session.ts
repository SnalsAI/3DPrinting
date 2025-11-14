import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { OrderStatus } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
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

    // Create Stripe checkout session
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

    // Update order with stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        stripePaymentIntentId: stripeSession.id,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        sessionId: stripeSession.id,
        url: stripeSession.url,
        orderId: order.id,
      },
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({
      error: 'Failed to create checkout session',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
