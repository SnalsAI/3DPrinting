import Link from 'next/link';
import { MaterialType } from '@prisma/client';
import { formatCurrency } from '@/utils/helpers';

interface ModelCardProps {
  model: any;
}

export default function ModelCard({ model }: ModelCardProps) {
  const isNew = new Date(model.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const customizationCount = model._count?.customizations || 0;

  return (
    <Link href={`/customize/${model.id}`}>
      <div className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer">
        {/* Image */}
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {model.previewImageUrl ? (
            <img
              src={model.previewImageUrl}
              alt={model.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
          )}

          {/* New Badge */}
          {isNew && (
            <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
              NEW
            </div>
          )}

          {/* Customization Count */}
          {customizationCount > 0 && (
            <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
              {customizationCount} made
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition">
            {model.name}
          </h3>

          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {model.description}
          </p>

          {/* Materials */}
          <div className="flex flex-wrap gap-1 mb-3">
            {model.availableMaterials.slice(0, 3).map((material: MaterialType) => (
              <span
                key={material}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
              >
                {material}
              </span>
            ))}
            {model.availableMaterials.length > 3 && (
              <span className="text-xs text-gray-500 self-center">
                +{model.availableMaterials.length - 3}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <div>
              <div className="text-xs text-gray-500">Starting from</div>
              <div className="text-lg font-bold text-gray-900">
                {formatCurrency(Number(model.basePrice))}
              </div>
            </div>

            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
              </svg>
              <span>Max {model.maxColors} color{model.maxColors > 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* CTA Button */}
          <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-medium transition group-hover:bg-blue-700">
            Customize Now
          </button>
        </div>
      </div>
    </Link>
  );
}
