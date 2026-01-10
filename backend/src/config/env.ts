import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),

  // Database
  DATABASE_URL: z.string().url(),

  // Redis
  REDIS_URL: z.string().url(),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.union([z.string(), z.number()]).default('24h'),
  JWT_REFRESH_EXPIRES_IN: z.union([z.string(), z.number()]).default('7d'),

  // MinIO
  MINIO_ENDPOINT: z.string(),
  MINIO_PORT: z.string().transform(Number).default('9000'),
  MINIO_ACCESS_KEY: z.string(),
  MINIO_SECRET_KEY: z.string(),
  MINIO_USE_SSL: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  MINIO_BUCKET: z.string().default('workflow-plugins'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Plugin limits
  PLUGIN_TIMEOUT_MS: z.string().transform(Number).default('30000'),
  PLUGIN_MEMORY_LIMIT_MB: z.string().transform(Number).default('512'),
});

export type Env = z.infer<typeof envSchema>;

// Validate and export environment variables
const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parseResult.error.format());
  process.exit(1);
}

export const env = parseResult.data;
