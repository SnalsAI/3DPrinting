import { useState } from 'react';
import { MaterialType, ProductType, PaperType, CuttingMachine, OccasionType } from '@/types';

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
    productType: 'THREE_D_PRINT' as ProductType,
    fileUrl: '',
    previewImageUrl: '',
    availableMaterials: [MaterialType.PLA],
    paperTypes: [] as PaperType[],
    compatibleMachines: [] as CuttingMachine[],
    occasions: [] as OccasionType[],
    maxColors: 1,
    basePrice: 10,
  });

  const materials = Object.values(MaterialType);
  const paperTypes = Object.values(PaperType);
  const cuttingMachines = Object.values(CuttingMachine);
  const occasions = Object.values(OccasionType);

  const is3DPrint = formData.productType === 'THREE_D_PRINT';

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

  const handlePaperTypeToggle = (paperType: PaperType) => {
    const current = formData.paperTypes;
    if (current.includes(paperType)) {
      setFormData({
        ...formData,
        paperTypes: current.filter((p) => p !== paperType),
      });
    } else {
      setFormData({
        ...formData,
        paperTypes: [...current, paperType],
      });
    }
  };

  const handleMachineToggle = (machine: CuttingMachine) => {
    const current = formData.compatibleMachines;
    if (current.includes(machine)) {
      setFormData({
        ...formData,
        compatibleMachines: current.filter((m) => m !== machine),
      });
    } else {
      setFormData({
        ...formData,
        compatibleMachines: [...current, machine],
      });
    }
  };

  const handleOccasionToggle = (occasion: OccasionType) => {
    const current = formData.occasions;
    if (current.includes(occasion)) {
      setFormData({
        ...formData,
        occasions: current.filter((o) => o !== occasion),
      });
    } else {
      setFormData({
        ...formData,
        occasions: [...current, occasion],
      });
    }
  };

  const formatOccasion = (occasion: OccasionType): string => {
    return occasion
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formatMachine = (machine: CuttingMachine): string => {
    return machine
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formatPaperType = (paperType: PaperType): string => {
    return paperType
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded animate-slide-up">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-red-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-semibold">Error</h3>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Product Type Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Product Type *
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, productType: 'THREE_D_PRINT' as ProductType })}
            className={`p-4 border-2 rounded-xl transition-all ${
              is3DPrint
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-4xl mb-2">🖨️</div>
            <div className={`font-semibold ${is3DPrint ? 'text-primary-700' : 'text-gray-700'}`}>
              3D Printing
            </div>
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, productType: 'PAPER_CRAFT' as ProductType })}
            className={`p-4 border-2 rounded-xl transition-all ${
              !is3DPrint
                ? 'border-paper-600 bg-paper-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-4xl mb-2">✂️</div>
            <div className={`font-semibold ${!is3DPrint ? 'text-paper-700' : 'text-gray-700'}`}>
              Paper Craft
            </div>
          </button>
        </div>
      </div>

      {/* Basic Information */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Product Name *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="input-field"
          placeholder="e.g., Birthday Party Decoration Set"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="input-field"
          rows={4}
          placeholder="Describe your product in detail..."
        />
      </div>

      {/* File URL - Conditional based on product type */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {is3DPrint ? 'File URL (.stl or .glb)' : 'Design File URL (.svg or .dxf)'} {!is3DPrint && '*'}
        </label>
        <input
          type="url"
          required={!is3DPrint}
          value={formData.fileUrl}
          onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
          className="input-field"
          placeholder={is3DPrint ? "https://example.com/model.stl" : "https://example.com/design.svg"}
        />
        <p className="text-xs text-gray-500 mt-1">
          {is3DPrint
            ? 'Provide a direct URL to the 3D model file'
            : 'Provide a direct URL to the cutting file (SVG, DXF, etc.)'}
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
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

      {/* Occasions */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Occasions (select all that apply)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto border rounded-lg p-3 bg-gray-50">
          {occasions.map((occasion) => (
            <label
              key={occasion}
              className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-white transition-colors"
            >
              <input
                type="checkbox"
                checked={formData.occasions.includes(occasion)}
                onChange={() => handleOccasionToggle(occasion)}
                className="rounded text-primary-600"
              />
              <span className="text-sm">{formatOccasion(occasion)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 3D Print Specific Fields */}
      {is3DPrint && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Available Materials *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {materials.map((material) => (
              <label
                key={material}
                className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-primary-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={formData.availableMaterials.includes(material)}
                  onChange={() => handleMaterialToggle(material)}
                  className="rounded text-primary-600"
                />
                <span className="text-sm font-medium">{material}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Paper Craft Specific Fields */}
      {!is3DPrint && (
        <>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Paper Types *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {paperTypes.map((paperType) => (
                <label
                  key={paperType}
                  className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-paper-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.paperTypes.includes(paperType)}
                    onChange={() => handlePaperTypeToggle(paperType)}
                    className="rounded text-paper-600"
                  />
                  <span className="text-sm font-medium">{formatPaperType(paperType)}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Compatible Cutting Machines *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {cuttingMachines.map((machine) => (
                <label
                  key={machine}
                  className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-paper-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.compatibleMachines.includes(machine)}
                    onChange={() => handleMachineToggle(machine)}
                    className="rounded text-paper-600"
                  />
                  <span className="text-sm font-medium">{formatMachine(machine)}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Common Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Max Colors
          </label>
          <select
            value={formData.maxColors}
            onChange={(e) => setFormData({ ...formData, maxColors: parseInt(e.target.value) })}
            className="input-field"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
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

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
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
          className={is3DPrint ? 'btn-primary' : 'btn-paper'}
          disabled={loading}
        >
          {loading ? (
            <span className="inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </span>
          ) : (
            `Create ${is3DPrint ? '3D Print' : 'Paper Craft'} Product`
          )}
        </button>
      </div>
    </form>
  );
}
