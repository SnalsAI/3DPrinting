import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { updatePrintJobStatus } from '@/lib/printJobs/assignment';
import { PrintStatus } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid job ID' });
  }

  try {
    // Check authentication and admin role
    const session = await getServerSession(req, res, authOptions);

    if (!session || (session.user as any).role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }

    const { status, notes } = req.body;

    // Validation
    if (!status || !Object.values(PrintStatus).includes(status)) {
      return res.status(400).json({ error: 'Invalid or missing status' });
    }

    // Update print job status
    const updatedJob = await updatePrintJobStatus(id, status, notes);

    return res.status(200).json({
      success: true,
      data: updatedJob,
    });
  } catch (error) {
    console.error('Error updating print job status:', error);
    return res.status(500).json({
      error: 'Failed to update print job status',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
