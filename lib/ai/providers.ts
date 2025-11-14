import { MaterialType } from '@prisma/client';

// AI Provider types
export enum AIProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  MOCK = 'mock',
}

export interface AICustomizationSuggestion {
  color: string;
  text: string;
  material: MaterialType;
}

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey?: string;
  model?: string;
}

// Base AI Provider interface
export interface IAIProvider {
  generateCustomization(prompt: string, modelContext?: any): Promise<AICustomizationSuggestion>;
}

// OpenAI Provider
class OpenAIProvider implements IAIProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateCustomization(prompt: string, modelContext?: any): Promise<AICustomizationSuggestion> {
    const systemPrompt = `You are an expert designer of 3D printed objects.
You receive a textual prompt from a user describing the desired style for a customizable object.
Respond ONLY with a JSON object containing:
- "color": color code or name (e.g., "#1A1A1A" or "black")
- "text": a short phrase or word to engrave (max 20 characters)
- "material": one of ["PLA", "PETG", "ABS", "RESIN", "NYLON", "TPU", "WOOD_FILLED", "METAL_FILLED"]

User prompt: "${prompt}"`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 150,
        }),
      });

      if (!response.ok) {
        throw new Error('OpenAI API request failed');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Parse JSON response
      const parsed = JSON.parse(content);
      return {
        color: parsed.color || '#3b82f6',
        text: parsed.text || 'CUSTOM',
        material: parsed.material || MaterialType.PLA,
      };
    } catch (error) {
      console.error('OpenAI error:', error);
      throw error;
    }
  }
}

// Anthropic Provider (Claude)
class AnthropicProvider implements IAIProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'claude-3-sonnet-20240229') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateCustomization(prompt: string, modelContext?: any): Promise<AICustomizationSuggestion> {
    const systemPrompt = `You are an expert designer of 3D printed objects.
Respond ONLY with a JSON object containing:
- "color": color code or name
- "text": a short phrase or word to engrave (max 20 characters)
- "material": one of ["PLA", "PETG", "ABS", "RESIN", "NYLON", "TPU", "WOOD_FILLED", "METAL_FILLED"]`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 150,
          messages: [
            {
              role: 'user',
              content: `${systemPrompt}\n\nUser prompt: "${prompt}"`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Anthropic API request failed');
      }

      const data = await response.json();
      const content = data.content[0]?.text;

      if (!content) {
        throw new Error('No response from Anthropic');
      }

      // Parse JSON response
      const parsed = JSON.parse(content);
      return {
        color: parsed.color || '#3b82f6',
        text: parsed.text || 'CUSTOM',
        material: parsed.material || MaterialType.PLA,
      };
    } catch (error) {
      console.error('Anthropic error:', error);
      throw error;
    }
  }
}

// Mock Provider (for testing)
class MockProvider implements IAIProvider {
  async generateCustomization(prompt: string, modelContext?: any): Promise<AICustomizationSuggestion> {
    // Simple mock logic based on keywords
    const lowerPrompt = prompt.toLowerCase();

    let color = '#3b82f6'; // default blue
    let text = 'CUSTOM';
    let material = MaterialType.PLA;

    // Color detection
    if (lowerPrompt.includes('black') || lowerPrompt.includes('dark')) {
      color = '#1f2937';
    } else if (lowerPrompt.includes('red')) {
      color = '#ef4444';
    } else if (lowerPrompt.includes('green')) {
      color = '#22c55e';
    } else if (lowerPrompt.includes('blue')) {
      color = '#3b82f6';
    } else if (lowerPrompt.includes('white') || lowerPrompt.includes('light')) {
      color = '#f3f4f6';
    } else if (lowerPrompt.includes('gold') || lowerPrompt.includes('yellow')) {
      color = '#eab308';
    }

    // Text detection
    if (lowerPrompt.includes('star wars')) {
      text = 'FORCE';
    } else if (lowerPrompt.includes('gaming') || lowerPrompt.includes('gamer')) {
      text = 'GAME ON';
    } else if (lowerPrompt.includes('professional') || lowerPrompt.includes('business')) {
      text = 'PRO';
    } else if (lowerPrompt.includes('love')) {
      text = 'LOVE';
    }

    // Material detection
    if (lowerPrompt.includes('flexible') || lowerPrompt.includes('rubber')) {
      material = MaterialType.TPU;
    } else if (lowerPrompt.includes('strong') || lowerPrompt.includes('durable')) {
      material = MaterialType.PETG;
    } else if (lowerPrompt.includes('detailed') || lowerPrompt.includes('smooth')) {
      material = MaterialType.RESIN;
    } else if (lowerPrompt.includes('wood')) {
      material = MaterialType.WOOD_FILLED;
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return { color, text, material };
  }
}

// Factory function to get the appropriate provider
export function getAIProvider(config?: AIProviderConfig): IAIProvider {
  const provider = config?.provider || process.env.AI_PROVIDER || AIProvider.MOCK;
  const apiKey = config?.apiKey;

  switch (provider) {
    case AIProvider.OPENAI:
      if (!apiKey && !process.env.OPENAI_API_KEY) {
        console.warn('OpenAI API key not found, falling back to mock provider');
        return new MockProvider();
      }
      return new OpenAIProvider(apiKey || process.env.OPENAI_API_KEY!, config?.model);

    case AIProvider.ANTHROPIC:
      if (!apiKey && !process.env.ANTHROPIC_API_KEY) {
        console.warn('Anthropic API key not found, falling back to mock provider');
        return new MockProvider();
      }
      return new AnthropicProvider(apiKey || process.env.ANTHROPIC_API_KEY!, config?.model);

    case AIProvider.MOCK:
    default:
      return new MockProvider();
  }
}
