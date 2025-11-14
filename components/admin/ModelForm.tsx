import { useState } from 'react';
import { MaterialType } from '@prisma/client';

interface ModelFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ModelForm({ onSuccess, onCancel }: ModelFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    fileUrl: '',
    previewImageUrl: '',
    availableMaterials: [MaterialType.PLA],
    maxColors: 1,
    basePrice: 10,
  });

  const materials = Object.values(MaterialType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/models/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create model');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialToggle = (material: MaterialType) => {
    const current = formData.availableMaterials;
    if (current.includes(material)) {
      setFormData({
        ...formData,
        availableMaterials: current.filter((m) => m !== material),
      });
    } else {
      setFormData({
        ...formData,
        availableMaterials: [...current, material],
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Model Name *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="input-field"
          placeholder="e.g., Phone Stand Pro"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="input-field"
          rows={3}
          placeholder="Describe your 3D model..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          File URL (.stl or .glb) *
        </label>
        <input
          type="url"
          required
          value={formData.fileUrl}
          onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
          className="input-field"
          placeholder="https://example.com/model.stl"
        />
        <p className="text-xs text-gray-500 mt-1">
          For now, provide a direct URL. File upload feature coming soon.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Preview Image URL
        </label>
        <input
          type="url"
          value={formData.previewImageUrl}
          onChange={(e) => setFormData({ ...formData, previewImageUrl: e.target.value })}
          className="input-field"
          placeholder="https://example.com/preview.jpg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Available Materials *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {materials.map((material) => (
            <label
              key={material}
              className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={formData.availableMaterials.includes(material)}
                onChange={() => handleMaterialToggle(material)}
                className="rounded text-blue-600"
              />
              <span className="text-sm">{material}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Colors
          </label>
          <select
            value={formData.maxColors}
            onChange={(e) => setFormData({ ...formData, maxColors: parseInt(e.target.value) })}
            className="input-field"
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Base Price ($)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.basePrice}
            onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
            className="input-field"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Model'}
        </button>
      </div>
    </form>
  );
}
