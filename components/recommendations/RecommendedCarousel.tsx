import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ModelCard from '@/components/marketplace/ModelCard';

export default function RecommendedCarousel() {
  const { data: session } = useSession();
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session) {
      fetchRecommendations();
    }
  }, [session]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/recommendations');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch recommendations');
      }

      setModels(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Silently fail - recommendations are nice-to-have
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!session || loading || error || models.length === 0) {
    return null; // Don't show anything if not logged in or no recommendations
  }

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
          <p className="text-gray-600 mt-1">
            Based on your customization history
          </p>
        </div>
      </div>

      {/* Horizontal scrollable grid */}
      <div className="relative">
        <div className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory scrollbar-hide">
          {models.map((model) => (
            <div
              key={model.id}
              className="flex-shrink-0 w-80 snap-start"
            >
              <ModelCard model={model} />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
