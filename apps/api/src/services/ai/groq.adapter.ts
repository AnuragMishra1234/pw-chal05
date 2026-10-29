import { GenerationRequest, GenerationResponse, IGenAIAdapter } from './adapter.interface.js';
import { env } from '../../config/env.js';

export class GroqProviderAdapter implements IGenAIAdapter {
  readonly providerName = 'groq' as const;
  private apiKey: string;
  private model: string;
  private timeoutMs: number;

  constructor(apiKey?: string, model?: string, timeoutMs?: number) {
    this.apiKey = apiKey || env.GROQ_API_KEY || '';
    this.model = model || env.LLM_MODEL || 'llama-3.3-70b-versatile';
    this.timeoutMs = timeoutMs || env.LLM_TIMEOUT_MS || 25000;
  }

  async generateStructuredPlan(request: GenerationRequest): Promise<GenerationResponse> {
    if (!this.apiKey) {
      throw new Error('GROQ_API_KEY is not configured in backend environment.');
    }

    const startTime = Date.now();
    const endpoint = 'https://api.groq.com/openai/v1/chat/completions';

    const payload = {
      model: this.model,
      messages: [
        { role: 'system', content: request.systemPrompt },
        { role: 'user', content: request.userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: request.temperature ?? 0.3,
      max_tokens: request.maxTokens ?? 4096
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
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
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
          throw new Error(`Groq API request timed out after ${this.timeoutMs}ms.`);
        }
        throw new Error(`Groq network connection error: ${err.message}`);
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');

        if ((response.status === 429 || response.status === 503) && attempt <= maxRetries) {
          await new Promise(r => setTimeout(r, 750 * Math.pow(2, attempt - 1)));
          continue;
        }

        if (response.status === 429) {
          throw new Error('Groq API rate limit exceeded. Please retry in a few moments.');
        }
        if (response.status === 401 || response.status === 403) {
          throw new Error('Groq authentication failed. Please verify your GROQ_API_KEY.');
        }
        throw new Error(`Groq API returned error HTTP ${response.status}: ${errorText.substring(0, 200)}`);
      }

      const result = await response.json();
      const text = result?.choices?.[0]?.message?.content;

      if (!text) {
        throw new Error('Groq returned an empty completion response.');
      }

      return {
        rawContent: text,
        provider: 'groq',
        model: this.model,
        durationMs: Date.now() - startTime,
        tokensUsed: {
          prompt: result?.usage?.prompt_tokens || 0,
          completion: result?.usage?.completion_tokens || 0
        }
      };
    }
  }
}
