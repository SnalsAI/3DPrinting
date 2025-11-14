import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyApiKey } from '@/lib/middleware/checkApiKey';
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
    // Verify API key
    const verification = await verifyApiKey(req, res);
    if (!verification.valid) {
      return res.status(401).json({ error: verification.error });
    }

    const { modelId, customization, quantity, shippingInfo } = req.body;

    // Validation
    if (!modelId || !customization || !quantity || !shippingInfo) {
      return res.status(400).json({
        error: 'Missing required fields: modelId, customization, quantity, shippingInfo',
      });
    }

    // Verify model exists
    const model = await prisma.model3D.findUnique({
      where: { id: modelId },
    });

    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    // Find or create a guest user for API orders
    let user = await prisma.user.findUnique({
      where: { email: shippingInfo.email },
    });

    if (!user) {
      // Create guest user
      user = await prisma.user.create({
        data: {
          email: shippingInfo.email,
          name: shippingInfo.name,
        },
      });
    }

    // Create customization
    const customizationRecord = await prisma.customization.create({
      data: {
        modelId,
        userId: user.id,
        parameters: customization,
        logoFileUrl: customization.logoUrl || null,
      },
    });

    // Calculate price
    const unitPrice = Number(model.basePrice);
    const subtotal = unitPrice * quantity;

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        status: OrderStatus.PENDING_PAYMENT,
        shippingInfo,
        totalAmount: subtotal,
        items: {
          create: [
            {
              customizationId: customizationRecord.id,
              quantity,
              unitPrice,
              subtotal,
            },
          ],
        },
      },
    });

    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: model.name,
              description: `Customized ${model.name}`,
              images: model.previewImageUrl ? [model.previewImageUrl] : [],
            },
            unit_amount: Math.round(unitPrice * 100),
          },
          quantity,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?cancelled=true`,
      client_reference_id: order.id,
      customer_email: shippingInfo.email,
      metadata: {
        orderId: order.id,
        userId: user.id,
        source: 'public_api',
        apiClientId: verification.clientId || '',
      },
    });

    // Update order with Stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        stripePaymentIntentId: stripeSession.id,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        checkoutUrl: stripeSession.url,
        orderId: order.id,
        sessionId: stripeSession.id,
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
