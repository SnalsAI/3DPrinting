import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ModelCard from '@/components/marketplace/ModelCard';
import ModelFilterPanel from '@/components/marketplace/ModelFilterPanel';

export default function ExplorePage() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    material: '',
    maxColors: '',
  });

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async (customFilters?: typeof filters) => {
    setLoading(true);
    setError('');

    const activeFilters = customFilters || filters;

    // Build query string
    const params = new URLSearchParams();
    if (activeFilters.search) params.append('search', activeFilters.search);
    if (activeFilters.material) params.append('material', activeFilters.material);
    if (activeFilters.maxColors) params.append('maxColors', activeFilters.maxColors);

    try {
      const response = await fetch(`/api/models/public?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch models');
      }

      setModels(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    fetchModels(newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Explore & Customize
          </h1>
          <p className="text-lg text-gray-600">
            Browse our collection of customizable 3D models
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters - Left Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <ModelFilterPanel onFilterChange={handleFilterChange} />
          </div>

          {/* Models Grid - Main Content */}
          <div className="flex-1">
            {/* Results Count */}
            {!loading && (
              <div className="mb-6 text-sm text-gray-600">
                {models.length} model{models.length !== 1 ? 's' : ''} found
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading models...</p>
                </div>
              </div>
            )}

            {/* No Results */}
            {!loading && models.length === 0 && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No models found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters to see more results.
                </p>
                <button
                  onClick={() => handleFilterChange({ search: '', material: '', maxColors: '' })}
                  className="btn-primary"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {/* Models Grid */}
            {!loading && models.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {models.map((model) => (
                  <ModelCard key={model.id} model={model} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
