import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

const prismaConfig = defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});

export default prismaConfig;
