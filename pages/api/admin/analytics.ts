import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/lib/prisma';
import { OrderStatus, PrintStatus } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication and admin role
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { range } = req.query;

    // Calculate date filter based on range
    let startDate: Date | undefined;
    const now = new Date();

    switch (range) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        startDate = undefined;
    }

    // Fetch all orders for revenue and status analysis
    const orders = await prisma.order.findMany({
      where: startDate
        ? {
            createdAt: {
              gte: startDate,
            },
          }
        : undefined,
      include: {
        items: {
          include: {
            customization: {
              include: {
                model: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Calculate KPIs
    const paidOrders = orders.filter((o) =>
      [
        OrderStatus.PAID,
        OrderStatus.SCHEDULED,
        OrderStatus.PRINTING,
        OrderStatus.SHIPPED,
        OrderStatus.DELIVERED,
      ].includes(o.status)
    );

    const totalRevenue = paidOrders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0
    );

    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / paidOrders.length : 0;

    // Active users (users who placed orders in the time range)
    const activeUsers = new Set(orders.map((o) => o.userId)).size;

    // Print jobs stats
    const [completedPrintJobs, pendingPrintJobs] = await Promise.all([
      prisma.printJob.count({
        where: {
          status: PrintStatus.COMPLETED,
          ...(startDate && { createdAt: { gte: startDate } }),
        },
      }),
      prisma.printJob.count({
        where: {
          status: {
            in: [PrintStatus.SCHEDULED, PrintStatus.PRINTING],
          },
          ...(startDate && { createdAt: { gte: startDate } }),
        },
      }),
    ]);

    // Revenue over time (group by day)
    const revenueByDay: { [key: string]: { revenue: number; orders: number } } = {};

    paidOrders.forEach((order) => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (!revenueByDay[date]) {
        revenueByDay[date] = { revenue: 0, orders: 0 };
      }
      revenueByDay[date].revenue += Number(order.totalAmount);
      revenueByDay[date].orders += 1;
    });

    const revenueOverTime = Object.entries(revenueByDay)
      .map(([date, data]) => ({
        date,
        revenue: Number(data.revenue.toFixed(2)),
        orders: data.orders,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Orders by status
    const statusCounts: { [key: string]: number } = {};
    orders.forEach((order) => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });

    const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status: status.replace('_', ' '),
      count,
    }));

    // Popular models
    const modelStats: {
      [key: string]: { modelName: string; orderCount: number; revenue: number };
    } = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const modelId = item.customization.model.id;
        const modelName = item.customization.model.name;

        if (!modelStats[modelId]) {
          modelStats[modelId] = {
            modelName,
            orderCount: 0,
            revenue: 0,
          };
        }

        modelStats[modelId].orderCount += item.quantity;
        if (
          [
            OrderStatus.PAID,
            OrderStatus.SCHEDULED,
            OrderStatus.PRINTING,
            OrderStatus.SHIPPED,
            OrderStatus.DELIVERED,
          ].includes(order.status)
        ) {
          modelStats[modelId].revenue += Number(item.subtotal);
        }
      });
    });

    const popularModels = Object.values(modelStats)
      .sort((a, b) => b.orderCount - a.orderCount)
      .map((model) => ({
        ...model,
        revenue: Number(model.revenue.toFixed(2)),
      }));

    // Material usage
    const materialCounts: { [key: string]: number } = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        item.customization.model.availableMaterials.forEach((material) => {
          materialCounts[material] = (materialCounts[material] || 0) + item.quantity;
        });
      });
    });

    const materialUsage = Object.entries(materialCounts)
      .map(([material, count]) => ({
        material: material.replace('_', ' '),
        count,
      }))
      .sort((a, b) => b.count - a.count);

    return res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalRevenue: Number(totalRevenue.toFixed(2)),
          totalOrders,
          averageOrderValue: Number(averageOrderValue.toFixed(2)),
          activeUsers,
          completedPrintJobs,
          pendingPrintJobs,
        },
        revenueOverTime,
        ordersByStatus,
        popularModels,
        materialUsage,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({
      error: 'Failed to fetch analytics',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
