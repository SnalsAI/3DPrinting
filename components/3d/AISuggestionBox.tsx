import { useState } from 'react';
import { MaterialType } from '@prisma/client';

interface AISuggestionBoxProps {
  modelId: string;
  onApply: (suggestion: {
    color: string;
    text: string;
    material: MaterialType;
  }) => void;
}

export default function AISuggestionBox({ modelId, onApply }: AISuggestionBoxProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<any>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt || prompt.length < 3) {
      setError('Please provide a more detailed description');
      return;
    }

    setLoading(true);
    setError('');
    setSuggestion(null);

    try {
      const response = await fetch('/api/ai/generate-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          modelId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate suggestion');
      }

      setSuggestion(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate');
    } finally {
      setLoading(false);
    }
  };

  const handleApplySuggestion = () => {
    if (suggestion) {
      onApply({
        color: suggestion.color,
        text: suggestion.text,
        material: suggestion.material,
      });
      setSuggestion(null);
      setPrompt('');
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center space-x-2">
        <span className="text-2xl">🤖</span>
        <h3 className="text-lg font-semibold text-gray-900">AI Design Assistant</h3>
      </div>

      <p className="text-sm text-gray-600">
        Describe your style and let AI suggest the perfect customization
      </p>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g., 'Elegant gadget for a Star Wars fan, black and red colors'"
        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
        rows={3}
        maxLength={200}
        disabled={loading}
      />

      {error && (
        <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
          {error}
        </div>
      )}

      {suggestion && (
        <div className="bg-white border border-purple-300 rounded p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-purple-700">✨ AI Suggestion</span>
            <button
              onClick={handleApplySuggestion}
              className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded transition"
            >
              Apply
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Color:</span>
              <div className="flex items-center space-x-1 mt-1">
                <div
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: suggestion.color }}
                />
                <span className="font-mono">{suggestion.color}</span>
              </div>
            </div>
            <div>
              <span className="text-gray-500">Text:</span>
              <div className="font-semibold mt-1">{suggestion.text}</div>
            </div>
            <div>
              <span className="text-gray-500">Material:</span>
              <div className="font-semibold mt-1">{suggestion.material}</div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading || !prompt}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded font-medium transition text-sm"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin h-4 w-4 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Generating...
          </span>
        ) : (
          '✨ Get AI Suggestion'
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Powered by {process.env.NEXT_PUBLIC_AI_PROVIDER || 'AI'} • Max 200 characters
      </p>
    </div>
  );
}
