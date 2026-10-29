import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(8000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().optional().default(''),
  FRONTEND_ORIGIN: z.string().default('http://localhost:3000'),
  SESSION_SECRET: z.string().default('celebration-planner-secret-key-phase2-dev-only'),
  LLM_PROVIDER: z.enum(['gemini', 'groq', 'mock']).default('mock'),
  GEMINI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  LLM_MODEL: z.string().optional(),
  LLM_TIMEOUT_MS: z.coerce.number().default(25000)
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('[celebration-api] Invalid environment configuration:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
