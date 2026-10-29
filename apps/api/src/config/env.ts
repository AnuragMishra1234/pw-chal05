import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

export const envSchema = z.object({
  PORT: z.coerce.number().default(8000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().optional().default(''),
  FRONTEND_ORIGIN: z.string().default('http://localhost:3000'),
  SESSION_SECRET: z.string().default('celebration-planner-secret-key-phase2-dev-only'),
  LLM_PROVIDER: z.enum(['gemini', 'groq', 'mock']).default('mock'),
  GEMINI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  LLM_MODEL: z.string().optional(),
  LLM_TIMEOUT_MS: z.coerce.number().default(25000),
  ALLOW_MOCK_IN_PRODUCTION: z.string().optional().transform(v => v === 'true')
}).superRefine((data, ctx) => {
  if (data.NODE_ENV === 'production') {
    if (!data.MONGODB_URI || (!data.MONGODB_URI.startsWith('mongodb://') && !data.MONGODB_URI.startsWith('mongodb+srv://'))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['MONGODB_URI'],
        message: 'MONGODB_URI is required and must be a valid mongodb:// or mongodb+srv:// connection string in production mode.'
      });
    }

    if (data.SESSION_SECRET === 'celebration-planner-secret-key-phase2-dev-only') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['SESSION_SECRET'],
        message: 'Default development SESSION_SECRET cannot be used in production.'
      });
    }

    if (data.LLM_PROVIDER === 'gemini' && !data.GEMINI_API_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['GEMINI_API_KEY'],
        message: 'GEMINI_API_KEY is required in production when LLM_PROVIDER is "gemini".'
      });
    }

    if (data.LLM_PROVIDER === 'groq' && !data.GROQ_API_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['GROQ_API_KEY'],
        message: 'GROQ_API_KEY is required in production when LLM_PROVIDER is "groq".'
      });
    }

    if (data.LLM_PROVIDER === 'mock' && !data.ALLOW_MOCK_IN_PRODUCTION) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['LLM_PROVIDER'],
        message: 'LLM_PROVIDER cannot be "mock" in production unless ALLOW_MOCK_IN_PRODUCTION=true is explicitly set.'
      });
    }
  }
});

export function parseEnv(rawEnv: Record<string, any> = process.env) {
  return envSchema.safeParse(rawEnv);
}

const parsed = parseEnv(process.env);

if (!parsed.success) {
  if (process.env.NODE_ENV === 'production') {
    console.error('[celebration-api] FATAL: Invalid production environment configuration:');
    console.error(parsed.error.format());
    process.exit(1);
  } else {
    console.warn('[celebration-api] Environment notice:', parsed.error.format());
  }
}

export const env = parsed.success ? parsed.data : envSchema.parse({ ...process.env, NODE_ENV: 'development' });
