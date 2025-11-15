import Link from 'next/link';
import { MaterialType, ProductType, PaperType, CuttingMachine, OccasionType } from '@/types';
import { formatCurrency } from '@/utils/helpers';

interface ModelCardProps {
  model: any;
}

// Helper to format occasion labels
const formatOccasion = (occasion: OccasionType): string => {
  return occasion
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

// Helper to format cutting machine labels
const formatMachine = (machine: CuttingMachine): string => {
  return machine
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

export default function ModelCard({ model }: ModelCardProps) {
  const isNew = new Date(model.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const customizationCount = model._count?.customizations || 0;
  const isPaperCraft = model.productType === 'PAPER_CRAFT';

  // Get icon based on product type
  const ProductIcon = () => {
    if (isPaperCraft) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    );
  };

  return (
    <Link href={`/customize/${model.id}`}>
      <div className="group bg-white rounded-2xl shadow-elegant hover:shadow-elegant-xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 hover:border-primary-200 animate-fade-in">
        {/* Image */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          {model.previewImageUrl ? (
            <img
              src={model.previewImageUrl}
              alt={model.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <ProductIcon />
              <span className="ml-2 text-4xl font-display">
                {isPaperCraft ? '✂️' : '🖨️'}
              </span>
            </div>
          )}

          {/* Type Badge */}
          <div className={`absolute top-4 left-4 ${isPaperCraft ? 'bg-gradient-to-r from-paper-500 to-paper-600' : 'bg-gradient-to-r from-primary-500 to-primary-600'} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center space-x-1`}>
            <ProductIcon />
            <span>{isPaperCraft ? 'Paper Craft' : '3D Print'}</span>
          </div>

          {/* New Badge */}
          {isNew && (
            <div className="absolute top-4 right-4 bg-gradient-to-r from-accent-500 to-accent-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
              NEW
            </div>
          )}

          {/* Customization Count */}
          {customizationCount > 0 && (
            <div className="absolute bottom-4 right-4 bg-black bg-opacity-80 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium">
              {customizationCount} made
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-display font-semibold text-gray-900 text-lg mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
            {model.name}
          </h3>

          <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
            {model.description}
          </p>

          {/* Occasions */}
          {model.occasions && model.occasions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {model.occasions.slice(0, 2).map((occasion: OccasionType) => (
                <span
                  key={occasion}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-primary-50 to-accent-50 text-primary-700 border border-primary-100"
                >
                  {formatOccasion(occasion)}
                </span>
              ))}
              {model.occasions.length > 2 && (
                <span className="text-xs text-gray-500 self-center font-medium">
                  +{model.occasions.length - 2} more
                </span>
              )}
            </div>
          )}

          {/* Materials or Paper Types */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {isPaperCraft ? (
              <>
                {model.paperTypes?.slice(0, 2).map((paperType: PaperType) => (
                  <span
                    key={paperType}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-paper-100 text-paper-800 border border-paper-200"
                  >
                    {paperType.split('_').join(' ')}
                  </span>
                ))}
                {model.paperTypes && model.paperTypes.length > 2 && (
                  <span className="text-xs text-gray-500 self-center">
                    +{model.paperTypes.length - 2}
                  </span>
                )}
              </>
            ) : (
              <>
                {model.availableMaterials?.slice(0, 2).map((material: MaterialType) => (
                  <span
                    key={material}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 border border-primary-200"
                  >
                    {material}
                  </span>
                ))}
                {model.availableMaterials && model.availableMaterials.length > 2 && (
                  <span className="text-xs text-gray-500 self-center">
                    +{model.availableMaterials.length - 2}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Cutting Machines (for paper crafts) */}
          {isPaperCraft && model.compatibleMachines && model.compatibleMachines.length > 0 && (
            <div className="flex items-center space-x-1 text-xs text-gray-600 mb-4 bg-gray-50 rounded-lg p-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
              </svg>
              <span className="font-medium truncate">
                {formatMachine(model.compatibleMachines[0])}
                {model.compatibleMachines.length > 1 && ` +${model.compatibleMachines.length - 1}`}
              </span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              <div className="text-xs text-gray-500 font-medium">Starting from</div>
              <div className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                {formatCurrency(Number(model.basePrice))}
              </div>
            </div>

            <div className="flex items-center space-x-1.5 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
              </svg>
              <span className="font-semibold">{model.maxColors} color{model.maxColors > 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* CTA Button */}
          <button className={`mt-4 w-full ${isPaperCraft ? 'btn-paper' : 'btn-primary'} text-sm`}>
            Customize Now
          </button>
        </div>
      </div>
    </Link>
  );
}
