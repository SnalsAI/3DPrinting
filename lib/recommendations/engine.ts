import prisma from '@/lib/prisma';
import { MaterialType } from '@prisma/client';

/**
 * Get recommended models for a user based on their customization history
 */
export async function getRecommendedModels(userId: string, limit: number = 8) {
  try {
    // Get user's last 5 customizations
    const userCustomizations = await prisma.customization.findMany({
      where: { userId },
      include: {
        model: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    // If user has no history, return popular models
    if (userCustomizations.length === 0) {
      return await getPopularModels(limit);
    }

    // Extract user preferences
    const preferences = extractUserPreferences(userCustomizations);

    // Get models already customized by user
    const customizedModelIds = userCustomizations.map((c) => c.modelId);

    // Build recommendation query
    const where: any = {
      isActive: true,
      id: {
        notIn: customizedModelIds, // Exclude already customized models
      },
    };

    // Fetch all active models (we'll score them manually)
    const allModels = await prisma.model3D.findMany({
      where,
      include: {
        _count: {
          select: {
            customizations: true,
          },
        },
      },
    });

    // Score each model based on similarity
    const scoredModels = allModels.map((model) => {
      let score = 0;

      // Score based on matching materials
      const matchingMaterials = model.availableMaterials.filter((m) =>
        preferences.materials.includes(m)
      ).length;
      score += matchingMaterials * 3; // High weight for material match

      // Score based on max colors similarity
      if (model.maxColors >= preferences.avgMaxColors) {
        score += 2;
      }

      // Score based on popularity
      const popularity = model._count.customizations;
      score += Math.min(popularity / 10, 5); // Max 5 points for popularity

      // Boost recent models (created in last 30 days)
      const daysOld = (Date.now() - new Date(model.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysOld < 30) {
        score += 2;
      }

      return {
        ...model,
        score,
      };
    });

    // Sort by score and return top N
    scoredModels.sort((a, b) => b.score - a.score);

    return scoredModels.slice(0, limit);
  } catch (error) {
    console.error('Error getting recommended models:', error);
    // Fallback to popular models on error
    return await getPopularModels(limit);
  }
}

/**
 * Extract user preferences from customization history
 */
function extractUserPreferences(customizations: any[]) {
  const materials: MaterialType[] = [];
  let totalMaxColors = 0;

  customizations.forEach((customization) => {
    const params = customization.parameters as any;

    // Extract material preference
    if (params.material) {
      materials.push(params.material);
    }

    // Track max colors preference
    if (customization.model?.maxColors) {
      totalMaxColors += customization.model.maxColors;
    }
  });

  // Calculate average max colors
  const avgMaxColors = customizations.length > 0
    ? Math.round(totalMaxColors / customizations.length)
    : 1;

  // Get unique materials
  const uniqueMaterials = Array.from(new Set(materials));

  return {
    materials: uniqueMaterials,
    avgMaxColors,
  };
}

/**
 * Get popular models (fallback for new users)
 */
async function getPopularModels(limit: number = 8) {
  const models = await prisma.model3D.findMany({
    where: {
      isActive: true,
    },
    include: {
      _count: {
        select: {
          customizations: true,
        },
      },
    },
    orderBy: [
      {
        customizations: {
          _count: 'desc',
        },
      },
      {
        createdAt: 'desc',
      },
    ],
    take: limit,
  });

  return models;
}
