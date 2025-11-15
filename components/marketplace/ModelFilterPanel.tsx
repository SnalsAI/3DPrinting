import { useState } from 'react';
import { MaterialType, ProductType, OccasionType } from '@/types';

interface ModelFilterPanelProps {
  onFilterChange: (filters: {
    search: string;
    material: string;
    maxColors: string;
    productType: string;
    occasion: string;
  }) => void;
}

// Helper to format occasion labels
const formatOccasion = (occasion: OccasionType): string => {
  return occasion
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

export default function ModelFilterPanel({ onFilterChange }: ModelFilterPanelProps) {
  const [search, setSearch] = useState('');
  const [material, setMaterial] = useState('');
  const [maxColors, setMaxColors] = useState('');
  const [productType, setProductType] = useState('');
  const [occasion, setOccasion] = useState('');

  const materials = Object.values(MaterialType);
  const occasions = Object.values(OccasionType);

  const handleApplyFilters = () => {
    onFilterChange({ search, material, maxColors, productType, occasion });
  };

  const handleResetFilters = () => {
    setSearch('');
    setMaterial('');
    setMaxColors('');
    setProductType('');
    setOccasion('');
    onFilterChange({ search: '', material: '', maxColors: '', productType: '', occasion: '' });
  };

  return (
    <div className="bg-white rounded-2xl shadow-elegant-lg p-6 sticky top-24 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-display font-semibold text-gray-900">Filters</h3>
        <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      </div>

      {/* Search */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Search
        </label>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-all"
          />
          <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Product Type Filter */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Product Type
        </label>
        <select
          value={productType}
          onChange={(e) => setProductType(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-all font-medium"
        >
          <option value="">All Types</option>
          <option value="THREE_D_PRINT">🖨️ 3D Printing</option>
          <option value="PAPER_CRAFT">✂️ Paper Crafts</option>
        </select>
      </div>

      {/* Occasion Filter */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Occasion
        </label>
        <select
          value={occasion}
          onChange={(e) => setOccasion(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-all font-medium"
        >
          <option value="">All Occasions</option>
          {occasions.map((occ) => (
            <option key={occ} value={occ}>
              {formatOccasion(occ)}
            </option>
          ))}
        </select>
      </div>

      {/* Material Filter */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Material
        </label>
        <select
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-all font-medium"
        >
          <option value="">All Materials</option>
          {materials.map((mat) => (
            <option key={mat} value={mat}>
              {mat}
            </option>
          ))}
        </select>
      </div>

      {/* Max Colors Filter */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Min Colors
        </label>
        <select
          value={maxColors}
          onChange={(e) => setMaxColors(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-all font-medium"
        >
          <option value="">Any</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleApplyFilters}
          className="btn-primary w-full"
        >
          Apply Filters
        </button>
        <button
          onClick={handleResetFilters}
          className="btn-secondary w-full"
        >
          Reset All
        </button>
      </div>

      {/* Info */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg p-4 border border-primary-100">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-xs text-primary-800 font-medium leading-relaxed">
              All products are customizable with colors, text, and materials. Perfect for any occasion!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
