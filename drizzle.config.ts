import type { Config } from 'drizzle-kit';

export default {
  schema: './src/infrastructure/database/drizzle/schema.ts',
  out: './src/infrastructure/database/drizzle/migrations',
  dialect: 'sqlite',
  driver: 'expo',
} satisfies Config;
