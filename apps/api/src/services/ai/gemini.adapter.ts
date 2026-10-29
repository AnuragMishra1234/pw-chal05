import { GenerationRequest, GenerationResponse, IGenAIAdapter } from './adapter.interface.js';
import { env } from '../../config/env.js';

export class GeminiProviderAdapter implements IGenAIAdapter {
  readonly providerName = 'gemini' as const;
  private apiKey: string;
  private model: string;
  private timeoutMs: number;

  constructor(apiKey?: string, model?: string, timeoutMs?: number) {
    this.apiKey = apiKey || env.GEMINI_API_KEY || '';
    this.model = model || env.LLM_MODEL || 'gemini-1.5-flash';
    this.timeoutMs = timeoutMs || env.LLM_TIMEOUT_MS || 25000;
  }

  async generateStructuredPlan(request: GenerationRequest): Promise<GenerationResponse> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in backend environment.');
    }

    const startTime = Date.now();
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const promptText = `${request.systemPrompt}\n\n${request.userPrompt}`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: promptText }]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: request.temperature ?? 0.3,
        maxOutputTokens: request.maxTokens ?? 4096
      }
    };

    let attempt = 0;
    const maxRetries = 2;

    while (true) {
      attempt++;
      let response: Response;
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(this.timeoutMs)
        });
      } catch (err: any) {
        if (attempt <= maxRetries && (err.name === 'TimeoutError' || err.name === 'AbortError' || err.message?.includes('fetch failed'))) {
          await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt - 1)));
          continue;
        }
        if (err.name === 'TimeoutError' || err.name === 'AbortError') {
          throw new Error(`Gemini API request timed out after ${this.timeoutMs}ms.`);
        }
        throw new Error(`Gemini network connection error: ${err.message}`);
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');

        if ((response.status === 429 || response.status === 503) && attempt <= maxRetries) {
          await new Promise(r => setTimeout(r, 750 * Math.pow(2, attempt - 1)));
          continue;
        }

        if (response.status === 429) {
          throw new Error('Gemini API rate limit exceeded. Please retry in a few moments.');
        }
        if (response.status === 401 || response.status === 403) {
          throw new Error('Gemini authentication failed. Please verify your GEMINI_API_KEY.');
        }
        throw new Error(`Gemini API returned error HTTP ${response.status}: ${errorText.substring(0, 200)}`);
      }

      const result = await response.json();
      const candidate = result?.candidates?.[0];
      const text = candidate?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('Gemini returned an empty completion response.');
      }

      return {
        rawContent: text,
        provider: 'gemini',
        model: this.model,
        durationMs: Date.now() - startTime,
        tokensUsed: {
          prompt: result?.usageMetadata?.promptTokenCount || 0,
          completion: result?.usageMetadata?.candidatesTokenCount || 0
        }
      };
    }
  }
}
