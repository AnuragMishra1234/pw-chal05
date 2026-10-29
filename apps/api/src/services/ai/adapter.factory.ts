import { IGenAIAdapter } from './adapter.interface.js';
import { GeminiProviderAdapter } from './gemini.adapter.js';
import { GroqProviderAdapter } from './groq.adapter.js';
import { MockProviderAdapter } from './mock.adapter.js';
import { env } from '../../config/env.js';

export class AIProviderFactory {
  static getAdapter(preference?: 'gemini' | 'groq' | 'mock'): IGenAIAdapter {
    const selectedProvider = preference || env.LLM_PROVIDER || 'mock';

    if (selectedProvider === 'gemini') {
      if (env.GEMINI_API_KEY) {
        return new GeminiProviderAdapter();
      }
      if (env.NODE_ENV === 'production') {
        throw new Error('GEMINI_API_KEY is required in production when LLM_PROVIDER=gemini.');
      }
      console.warn('[celebration-api] GEMINI_API_KEY not configured. Falling back to MockProviderAdapter for testing/development.');
      return new MockProviderAdapter();
    }

    if (selectedProvider === 'groq') {
      if (env.GROQ_API_KEY) {
        return new GroqProviderAdapter();
      }
      if (env.NODE_ENV === 'production') {
        throw new Error('GROQ_API_KEY is required in production when LLM_PROVIDER=groq.');
      }
      console.warn('[celebration-api] GROQ_API_KEY not configured. Falling back to MockProviderAdapter for testing/development.');
      return new MockProviderAdapter();
    }

    // Default to mock adapter
    return new MockProviderAdapter();
  }
}
