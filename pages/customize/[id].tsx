import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import CustomizationPanel from '@/components/3d/CustomizationPanel';
import { MaterialType } from '@prisma/client';

// Dynamic import to avoid SSR issues with Three.js
const ModelViewer = dynamic(() => import('@/components/3d/ModelViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading 3D viewer...</p>
      </div>
    </div>
  ),
});

interface CustomizationParams {
  color: string;
  text?: string;
  material: MaterialType;
  logoUrl?: string;
}

export default function CustomizePage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session, status } = useSession();

  const [model, setModel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [currentParams, setCurrentParams] = useState<CustomizationParams>({
    color: '#3b82f6',
    text: '',
    material: MaterialType.PLA,
    logoUrl: '',
  });

  useEffect(() => {
    if (id) {
      fetchModel();
    }
  }, [id]);

  const fetchModel = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/models/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch model');
      }

      setModel(data.data);
      // Set default material from available materials
      if (data.data.availableMaterials && data.data.availableMaterials.length > 0) {
        setCurrentParams((prev) => ({
          ...prev,
          material: data.data.availableMaterials[0],
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (params: CustomizationParams) => {
    setCurrentParams(params);
  };

  const handleSave = async (params: CustomizationParams) => {
    if (!session) {
      alert('Please sign in to save customizations');
      router.push('/');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/customizations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId: id,
          parameters: {
            color: params.color,
            text: params.text,
            material: params.material,
            logoUrl: params.logoUrl,
          },
          logoFileUrl: params.logoUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save customization');
      }

      alert('Customization saved successfully!');
      // Could redirect to checkout or user's customizations page
      // router.push(`/account/customizations`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
      alert(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading model...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-600 text-lg">{error || 'Model not found'}</p>
            <button
              onClick={() => router.push('/explore')}
              className="mt-4 btn-primary"
            >
              Back to Models
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mock model URL - in production, use actual file URL
  const modelUrl = model.fileUrl || '/models/sample.glb';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="h-screen pt-16">
        <div className="h-full flex flex-col md:flex-row">
          {/* 3D Viewer - Left Side (70%) */}
          <div className="flex-1 md:w-[70%] p-4 md:p-6">
            <div className="h-full">
              <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{model.name}</h1>
                <p className="text-gray-600">{model.description}</p>
              </div>
              <div className="h-[calc(100%-4rem)]">
                <ModelViewer
                  modelUrl={modelUrl}
                  color={currentParams.color}
                  scale={1}
                />
              </div>
            </div>
          </div>

          {/* Customization Panel - Right Side (30%) */}
          <div className="md:w-[30%] bg-white border-l border-gray-200 h-full overflow-hidden">
            <CustomizationPanel
              modelId={model.id}
              availableMaterials={model.availableMaterials}
              maxColors={model.maxColors}
              onApply={handleApply}
              onSave={handleSave}
              loading={saving}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
