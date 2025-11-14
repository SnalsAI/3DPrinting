import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import ModelForm from '@/components/admin/ModelForm';
import ModelsTable from '@/components/admin/ModelsTable';

export default function AdminModelsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }

    if (session && (session.user as any).role !== 'ADMIN') {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session && (session.user as any).role === 'ADMIN') {
      fetchModels();
    }
  }, [session]);

  const fetchModels = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/models/list');
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

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/models/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete model');
      }

      // Refresh models list
      fetchModels();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete model');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchModels();
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session || (session.user as any).role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">3D Models Management</h1>
              <p className="mt-2 text-gray-600">
                Manage your 3D printable models catalog
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary"
            >
              {showForm ? 'Cancel' : '+ Add New Model'}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="mb-8 card">
            <h2 className="text-xl font-semibold mb-4">Add New Model</h2>
            <ModelForm
              onSuccess={handleFormSuccess}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Models</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{models.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Active Models</div>
            <div className="mt-2 text-3xl font-bold text-green-600">
              {models.filter((m) => m.isActive).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Customizations</div>
            <div className="mt-2 text-3xl font-bold text-blue-600">
              {models.reduce((sum, m) => sum + (m._count?.customizations || 0), 0)}
            </div>
          </div>
        </div>

        {/* Models Table */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">All Models</h2>
          <ModelsTable
            models={models}
            onDelete={handleDelete}
          />
        </div>
      </main>
    </div>
  );
}
