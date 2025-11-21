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
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { timeRange = '24h' } = req.query;

    // Calculate time range
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case '1h':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Fetch statistics
    const [
      totalLogs,
      errorCount,
      warnCount,
      infoCount,
      debugCount,
      logsByCategory,
      recentErrors,
      topEndpoints,
      averageDuration,
    ] = await Promise.all([
      // Total logs
      prisma.debugLog.count({
        where: { createdAt: { gte: startDate } },
      }),

      // Count by level
      prisma.debugLog.count({
        where: { level: 'ERROR', createdAt: { gte: startDate } },
      }),
      prisma.debugLog.count({
        where: { level: 'WARN', createdAt: { gte: startDate } },
      }),
      prisma.debugLog.count({
        where: { level: 'INFO', createdAt: { gte: startDate } },
      }),
      prisma.debugLog.count({
        where: { level: 'DEBUG', createdAt: { gte: startDate } },
      }),

      // Logs by category
      prisma.debugLog.groupBy({
        by: ['category'],
        where: { createdAt: { gte: startDate } },
        _count: true,
      }),

      // Recent errors
      prisma.debugLog.findMany({
        where: {
          level: 'ERROR',
          createdAt: { gte: startDate },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          action: true,
          message: true,
          error: true,
          category: true,
          endpoint: true,
          createdAt: true,
        },
      }),

      // Top endpoints by request count
      prisma.debugLog.groupBy({
        by: ['endpoint'],
        where: {
          endpoint: { not: null },
          createdAt: { gte: startDate },
        },
        _count: true,
        orderBy: { _count: { endpoint: 'desc' } },
        take: 10,
      }),

      // Average duration for API calls
      prisma.debugLog.aggregate({
        where: {
          duration: { not: null },
          createdAt: { gte: startDate },
        },
        _avg: { duration: true },
      }),
    ]);

    // Calculate hourly distribution
    const hourlyDistribution = await prisma.$queryRaw<
      Array<{ hour: string; count: bigint }>
    >`
      SELECT
        DATE_TRUNC('hour', "createdAt") as hour,
        COUNT(*) as count
      FROM "debug_logs"
      WHERE "createdAt" >= ${startDate}
      GROUP BY DATE_TRUNC('hour', "createdAt")
      ORDER BY hour DESC
      LIMIT 24
    `;

    const duration = Date.now() - startTime;
    logger.apiResponse('GET', '/api/admin/debug/stats', 200, duration, session.user.id);

    return res.status(200).json({
      summary: {
        total: totalLogs,
        byLevel: {
          error: errorCount,
          warn: warnCount,
          info: infoCount,
          debug: debugCount,
        },
      },
      byCategory: logsByCategory.map((item) => ({
        category: item.category,
        count: item._count,
      })),
      recentErrors: recentErrors,
      topEndpoints: topEndpoints.map((item) => ({
        endpoint: item.endpoint,
        count: item._count,
      })),
      performance: {
        averageDuration: averageDuration._avg.duration || 0,
      },
      hourlyDistribution: hourlyDistribution.map((item) => ({
        hour: item.hour,
        count: Number(item.count),
      })),
      timeRange,
    });
  } catch (error: any) {
    logger.apiError('GET', '/api/admin/debug/stats', error);
    console.error('Error fetching debug stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
