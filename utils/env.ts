import { z } from 'zod';
const serverEnvSchema = z.object({
  DATABASE_URL: z.string(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development')
});

type ServerEnv = z.infer<typeof serverEnvSchema>;

const rawEnv = {
  DATABASE_URL: process.env.DATABASE_URL || '',
  NODE_ENV: process.env.NODE_ENV || 'development'
};

const result = serverEnvSchema.safeParse(rawEnv);

if (!result.success) {
  throw new Error(`Invalid environment variables: ${result.error}`);
}

export const env: ServerEnv = result.data;
