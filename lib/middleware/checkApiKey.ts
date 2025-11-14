import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

/**
 * Middleware to verify API key from Authorization header
 */
export async function verifyApiKey(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<{ valid: boolean; clientId?: string; error?: string }> {
  // Get API key from Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return {
      valid: false,
      error: 'Missing Authorization header',
    };
  }

  // Extract token (Bearer sk_partner_abc123)
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return {
      valid: false,
      error: 'Invalid Authorization header format. Use: Bearer <api_key>',
    };
  }

  const apiKey = parts[1];

  // Verify API key in database
  try {
    const client = await prisma.apiClient.findUnique({
      where: { apiKey },
    });

    if (!client) {
      return {
        valid: false,
        error: 'Invalid API key',
      };
    }

    if (!client.isActive) {
      return {
        valid: false,
        error: 'API key is inactive',
      };
    }

    return {
      valid: true,
      clientId: client.id,
    };
  } catch (error) {
    console.error('Error verifying API key:', error);
    return {
      valid: false,
      error: 'Internal server error',
    };
  }
}

/**
 * Generate a new API key
 */
export function generateApiKey(): string {
  const prefix = 'sk_partner_';
  const randomPart = Math.random().toString(36).substring(2, 15) +
                     Math.random().toString(36).substring(2, 15);
  return prefix + randomPart;
}
