export interface GenerationRequest {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  jsonSchema?: Record<string, any>;
}

export interface GenerationResponse {
  rawContent: string;
  provider: 'gemini' | 'groq' | 'mock';
  model: string;
  durationMs: number;
  tokensUsed?: {
    prompt: number;
    completion: number;
  };
}

export interface IGenAIAdapter {
  readonly providerName: 'gemini' | 'groq' | 'mock';
  generateStructuredPlan(request: GenerationRequest): Promise<GenerationResponse>;
}
