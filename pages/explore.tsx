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
    productType: '',
    occasion: '',
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
    if (activeFilters.productType) params.append('productType', activeFilters.productType);
    if (activeFilters.occasion) params.append('occasion', activeFilters.occasion);

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
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="font-display font-bold text-gray-900 mb-4">
            Explore Our <span className="gradient-text">Creative Collection</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover customizable 3D prints and paper crafts perfect for birthdays, weddings,
            corporate events, religious celebrations, and more. Create something unique for every occasion!
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters - Left Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <ModelFilterPanel onFilterChange={handleFilterChange} />
          </div>

          {/* Models Grid - Main Content */}
          <div className="flex-1">
            {/* Results Count and Stats */}
            {!loading && (
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-700">
                    {models.length} product{models.length !== 1 ? 's' : ''} found
                  </span>
                  {(filters.productType || filters.occasion) && (
                    <span className="text-xs text-gray-500">
                      (filtered)
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <span>Grid View</span>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-lg shadow-sm animate-slide-up">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-semibold">Error</h3>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center h-96">
                <div className="text-center animate-fade-in">
                  <div className="relative inline-block">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary-600"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-6 text-gray-600 font-medium">Loading amazing products...</p>
                  <p className="mt-2 text-sm text-gray-500">This won't take long</p>
                </div>
              </div>
            )}

            {/* No Results */}
            {!loading && models.length === 0 && (
              <div className="card-elegant text-center max-w-lg mx-auto animate-slide-up">
                <div className="text-7xl mb-6">🔍</div>
                <h3 className="text-2xl font-display font-semibold text-gray-900 mb-3">
                  No products found
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  We couldn't find any products matching your criteria. Try adjusting your filters or browse all products.
                </p>
                <button
                  onClick={() => handleFilterChange({ search: '', material: '', maxColors: '', productType: '', occasion: '' })}
                  className="btn-primary"
                >
                  <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Models Grid */}
            {!loading && models.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {models.map((model) => (
                  <ModelCard key={model.id} model={model} />
                ))}
              </div>
            )}

            {/* Load More - Future Enhancement */}
            {!loading && models.length > 0 && models.length % 12 === 0 && (
              <div className="mt-12 text-center">
                <p className="text-sm text-gray-500 mb-4">
                  Showing {models.length} products
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA Section */}
        {!loading && models.length > 0 && (
          <div className="mt-16 bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl shadow-elegant-xl p-8 md:p-12 text-white text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Can't find what you're looking for?
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Contact us for custom designs tailored to your specific event or occasion. We'd love to help bring your vision to life!
            </p>
            <button className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg shadow-elegant-lg transition-all transform hover:-translate-y-0.5">
              Request Custom Design
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
