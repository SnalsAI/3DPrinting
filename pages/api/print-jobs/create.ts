import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { assignPrintJobs } from '@/lib/printJobs/assignment';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication and admin role
    const session = await getServerSession(req, res, authOptions);

    if (!session || (session.user as any).role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }

    const { orderId } = req.body;

    // Validation
    if (!orderId) {
      return res.status(400).json({ error: 'Missing required field: orderId' });
    }

    // Assign print jobs
    const printJobs = await assignPrintJobs(orderId);

    return res.status(201).json({
      success: true,
      data: {
        printJobs,
        count: printJobs.length,
      },
    });
  } catch (error) {
    console.error('Error creating print jobs:', error);
    return res.status(500).json({
      error: 'Failed to create print jobs',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
