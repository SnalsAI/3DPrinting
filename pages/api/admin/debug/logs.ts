import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from '../../../../lib/prisma';
import { logger } from '../../../../lib/logger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const startTime = Date.now();

  try {
    // Check authentication and admin role
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      logger.warn('API', 'GET /api/admin/debug/logs', 'Unauthorized access attempt', {
        userId: session?.user?.id,
        ipAddress: req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress,
      });
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      const {
        level,
        category,
        search,
        userId,
        startDate,
        endDate,
        limit = '100',
        offset = '0',
      } = req.query;

      // Build filter conditions
      const where: any = {};

      if (level && typeof level === 'string') {
        where.level = level;
      }

      if (category && typeof category === 'string') {
        where.category = category;
      }

      if (userId && typeof userId === 'string') {
        where.userId = userId;
      }

      if (search && typeof search === 'string') {
        where.OR = [
          { message: { contains: search, mode: 'insensitive' } },
          { action: { contains: search, mode: 'insensitive' } },
          { error: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate && typeof startDate === 'string') {
          where.createdAt.gte = new Date(startDate);
        }
        if (endDate && typeof endDate === 'string') {
          where.createdAt.lte = new Date(endDate);
        }
      }

      // Fetch logs with pagination
      const [logs, totalCount] = await Promise.all([
        prisma.debugLog.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: parseInt(limit as string),
          skip: parseInt(offset as string),
        }),
        prisma.debugLog.count({ where }),
      ]);

      const duration = Date.now() - startTime;
      logger.apiResponse('GET', '/api/admin/debug/logs', 200, duration, session.user.id);

      return res.status(200).json({
        logs,
        pagination: {
          total: totalCount,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
        },
      });
    } else if (req.method === 'DELETE') {
      // Delete old logs
      const { olderThan } = req.query;

      if (!olderThan || typeof olderThan !== 'string') {
        return res.status(400).json({ error: 'olderThan parameter required' });
      }

      const deleteDate = new Date(olderThan);
      const result = await prisma.debugLog.deleteMany({
        where: {
          createdAt: {
            lt: deleteDate,
          },
        },
      });

      logger.systemEvent('Clear Logs', `Deleted ${result.count} logs older than ${olderThan}`, {
        deletedCount: result.count,
        olderThan,
      });

      const duration = Date.now() - startTime;
      logger.apiResponse('DELETE', '/api/admin/debug/logs', 200, duration, session.user.id);

      return res.status(200).json({
        message: 'Logs deleted successfully',
        deletedCount: result.count,
      });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logger.apiError('GET', '/api/admin/debug/logs', error, undefined, {
      query: req.query,
    });
    console.error('Error fetching debug logs:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
