import { useState } from 'react';
import { MaterialType } from '@prisma/client';

interface ModelFilterPanelProps {
  onFilterChange: (filters: {
    search: string;
    material: string;
    maxColors: string;
  }) => void;
}

export default function ModelFilterPanel({ onFilterChange }: ModelFilterPanelProps) {
  const [search, setSearch] = useState('');
  const [material, setMaterial] = useState('');
  const [maxColors, setMaxColors] = useState('');

  const materials = Object.values(MaterialType);

  const handleApplyFilters = () => {
    onFilterChange({ search, material, maxColors });
  };

  const handleResetFilters = () => {
    setSearch('');
    setMaterial('');
    setMaxColors('');
    onFilterChange({ search: '', material: '', maxColors: '' });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 sticky top-24">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search
        </label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
          placeholder="Search models..."
          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Material Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Material
        </label>
        <select
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Min Colors
        </label>
        <select
          value={maxColors}
          onChange={(e) => setMaxColors(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          <option value="">Any</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={handleApplyFilters}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-medium transition"
        >
          Apply Filters
        </button>
        <button
          onClick={handleResetFilters}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded font-medium transition"
        >
          Reset
        </button>
      </div>

      {/* Info */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          All models are customizable with colors, text, and materials.
        </p>
      </div>
    </div>
  );
}
