import prisma from '@/lib/prisma';
import { MaterialType, OrderStatus, PrintStatus } from '@prisma/client';
import { estimatePrintTime } from '@/utils/helpers';

/**
 * Get order items with customizations for print job creation
 */
export async function getOrderItemsWithCustomizations(orderId: string) {
  return await prisma.orderItem.findMany({
    where: {
      orderId,
    },
    include: {
      customization: {
        include: {
          model: true,
        },
      },
      order: true,
    },
  });
}

/**
 * Find a compatible print partner for given requirements
 */
export async function getCompatiblePartner(
  material: MaterialType,
  colorCount: number = 1
) {
  // Find active partners that support the material and color count
  const partners = await prisma.printPartner.findMany({
    where: {
      isActive: true,
      supportedMaterials: {
        has: material,
      },
      maxColors: {
        gte: colorCount,
      },
    },
    include: {
      printJobs: {
        where: {
          status: {
            in: [PrintStatus.SCHEDULED, PrintStatus.PRINTING],
          },
        },
      },
    },
  });

  if (partners.length === 0) {
    return null;
  }

  // Sort by load (fewer active jobs = higher priority)
  partners.sort((a, b) => a.printJobs.length - b.printJobs.length);

  return partners[0];
}

/**
 * Create print jobs for all items in an order
 */
export async function assignPrintJobs(orderId: string) {
  try {
    // Get order with items
    const orderItems = await getOrderItemsWithCustomizations(orderId);

    if (orderItems.length === 0) {
      throw new Error('No order items found');
    }

    const createdJobs: any[] = [];

    // Create a print job for each order item
    for (const orderItem of orderItems) {
      const { customization } = orderItem;
      const params = customization.parameters as any;

      // Extract requirements from customization
      const material = params.material || MaterialType.PLA;
      const colorCount = params.color ? 1 : 1; // Simplified for now

      // Find compatible partner
      const partner = await getCompatiblePartner(material, colorCount);

      if (!partner) {
        console.warn(
          `No compatible partner found for order item ${orderItem.id} with material ${material}`
        );
        // Create job without partner assignment
      }

      // Estimate print time (mock calculation)
      const volume = 100; // Mock volume - in real scenario, calculate from 3D model
      const estimatedTime = estimatePrintTime(material, volume);

      // Create print job
      const printJob = await prisma.printJob.create({
        data: {
          orderItemId: orderItem.id,
          partnerId: partner?.id || null,
          status: PrintStatus.SCHEDULED,
          estimatedPrintTimeMinutes: estimatedTime,
          assignedColors: params.color ? [params.color] : [],
          notes: partner
            ? `Assigned to ${partner.name}`
            : 'Waiting for partner assignment',
        },
        include: {
          partner: true,
          orderItem: {
            include: {
              customization: {
                include: {
                  model: true,
                },
              },
            },
          },
        },
      });

      createdJobs.push(printJob);

      console.log(
        `Print job created for order item ${orderItem.id}, assigned to ${partner?.name || 'unassigned'}`
      );
    }

    // Update order status to SCHEDULED if all jobs are created
    if (createdJobs.length === orderItems.length) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.SCHEDULED,
        },
      });
    }

    return createdJobs;
  } catch (error) {
    console.error('Error assigning print jobs:', error);
    throw error;
  }
}

/**
 * Update print job status
 */
export async function updatePrintJobStatus(
  jobId: string,
  status: PrintStatus,
  notes?: string
) {
  const job = await prisma.printJob.update({
    where: { id: jobId },
    data: {
      status,
      notes: notes || undefined,
    },
    include: {
      orderItem: {
        include: {
          order: true,
        },
      },
    },
  });

  // If job is completed, check if all jobs in the order are completed
  if (status === PrintStatus.COMPLETED) {
    const order = job.orderItem.order;
    const allJobs = await prisma.printJob.findMany({
      where: {
        orderItem: {
          orderId: order.id,
        },
      },
    });

    const allCompleted = allJobs.every((j) => j.status === PrintStatus.COMPLETED);

    if (allCompleted) {
      // Update order status to PRINTING → SHIPPED
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.SHIPPED,
        },
      });
    } else {
      // At least one job is in progress
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.PRINTING,
        },
      });
    }
  }

  return job;
}
