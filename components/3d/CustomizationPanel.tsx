import { useState } from 'react';
import { MaterialType } from '@prisma/client';
import AISuggestionBox from './AISuggestionBox';

interface CustomizationParams {
  color: string;
  text?: string;
  material: MaterialType;
  logoUrl?: string;
}

interface CustomizationPanelProps {
  modelId: string;
  availableMaterials: MaterialType[];
  maxColors: number;
  onApply: (params: CustomizationParams) => void;
  onSave: (params: CustomizationParams) => void;
  loading?: boolean;
}

const COLOR_PRESETS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Black', value: '#1f2937' },
  { name: 'White', value: '#f3f4f6' },
  { name: 'Orange', value: '#f97316' },
];

export default function CustomizationPanel({
  modelId,
  availableMaterials,
  maxColors,
  onApply,
  onSave,
  loading = false,
}: CustomizationPanelProps) {
  const [params, setParams] = useState<CustomizationParams>({
    color: '#3b82f6',
    text: '',
    material: availableMaterials[0] || MaterialType.PLA,
    logoUrl: '',
  });

  const handleApply = () => {
    onApply(params);
  };

  const handleSave = () => {
    onSave(params);
  };

  const handleAISuggestion = (suggestion: { color: string; text: string; material: MaterialType }) => {
    setParams({
      ...params,
      color: suggestion.color,
      text: suggestion.text,
      material: suggestion.material,
    });
    // Auto-apply preview
    onApply({
      ...params,
      color: suggestion.color,
      text: suggestion.text,
      material: suggestion.material,
    });
  };

  return (
    <div className="h-full overflow-y-auto bg-white p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Customize Your Model</h2>
        <p className="text-sm text-gray-600">
          Personalize your 3D print with colors, text, and materials
        </p>
      </div>

      {/* AI Suggestion Box */}
      <AISuggestionBox
        modelId={modelId}
        onApply={handleAISuggestion}
      />

      {/* Color Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Primary Color
        </label>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => setParams({ ...params, color: preset.value })}
              className={`h-12 rounded border-2 transition ${
                params.color === preset.value
                  ? 'border-blue-600 ring-2 ring-blue-200'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ backgroundColor: preset.value }}
              title={preset.name}
            />
          ))}
        </div>
        <input
          type="color"
          value={params.color}
          onChange={(e) => setParams({ ...params, color: e.target.value })}
          className="w-full h-10 rounded border border-gray-300 cursor-pointer"
        />
        <p className="text-xs text-gray-500 mt-1">
          Selected: {params.color}
        </p>
      </div>

      {/* Custom Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom Text (Optional)
        </label>
        <input
          type="text"
          value={params.text}
          onChange={(e) => setParams({ ...params, text: e.target.value })}
          placeholder="Enter text to engrave..."
          maxLength={30}
          className="input-field"
        />
        <p className="text-xs text-gray-500 mt-1">
          Max 30 characters. Text will be embossed on the model.
        </p>
      </div>

      {/* Material Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Material
        </label>
        <select
          value={params.material}
          onChange={(e) => setParams({ ...params, material: e.target.value as MaterialType })}
          className="input-field"
        >
          {availableMaterials.map((material) => (
            <option key={material} value={material}>
              {material}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Different materials have different properties and prices.
        </p>
      </div>

      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Logo URL (Optional)
        </label>
        <input
          type="url"
          value={params.logoUrl}
          onChange={(e) => setParams({ ...params, logoUrl: e.target.value })}
          placeholder="https://example.com/logo.png"
          className="input-field"
        />
        <p className="text-xs text-gray-500 mt-1">
          Provide a URL to a logo image (PNG recommended).
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4 border-t">
        <button
          onClick={handleApply}
          disabled={loading}
          className="w-full btn-secondary"
        >
          Apply Preview
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full btn-primary"
        >
          {loading ? 'Saving...' : 'Save Customization'}
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-blue-800">
        <p className="font-medium mb-1">Preview Mode</p>
        <p className="text-xs">
          Click "Apply Preview" to see changes in 3D. Click "Save" to store your customization.
        </p>
      </div>
    </div>
  );
}
