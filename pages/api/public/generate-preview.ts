import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyApiKey } from '@/lib/middleware/checkApiKey';
import prisma from '@/lib/prisma';
import { MaterialType } from '@prisma/client';
import { estimatePrintTime } from '@/utils/helpers';

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

    const { modelId, customization } = req.body;

    // Validation
    if (!modelId || !customization) {
      return res.status(400).json({
        error: 'Missing required fields: modelId, customization',
      });
    }

    // Verify model exists
    const model = await prisma.model3D.findUnique({
      where: { id: modelId },
    });

    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    // Calculate estimated price
    const basePriceNum = Number(model.basePrice);
    const material = customization.material || MaterialType.PLA;

    // Material price multipliers
    const materialMultipliers: Record<string, number> = {
      PLA: 1.0,
      PETG: 1.2,
      ABS: 1.15,
      TPU: 1.5,
      NYLON: 1.4,
      RESIN: 1.3,
      WOOD_FILLED: 1.6,
      METAL_FILLED: 2.0,
    };

    const multiplier = materialMultipliers[material] || 1.0;
    const estimatedPrice = basePriceNum * multiplier;

    // Generate mock preview (in production, this would use actual 3D rendering)
    const previewImageUrl = model.previewImageUrl || '/api/placeholder-preview.png';

    // Check if printable
    const printable = model.availableMaterials.includes(material);

    // Estimate print time
    const printTimeMinutes = estimatePrintTime(material, 100);

    return res.status(200).json({
      success: true,
      data: {
        previewImageUrl,
        estimatedPrice: parseFloat(estimatedPrice.toFixed(2)),
        printable,
        estimatedPrintTimeMinutes: printTimeMinutes,
        material,
      },
    });
  } catch (error) {
    console.error('Error generating preview:', error);
    return res.status(500).json({
      error: 'Failed to generate preview',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
