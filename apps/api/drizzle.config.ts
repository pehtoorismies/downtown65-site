import { type Config, defineConfig } from 'drizzle-kit'
import 'dotenv/config'

export default defineConfig({
  breakpoints: true,
  dialect: 'sqlite',
  driver: 'd1-http',

  out: './drizzle',
  schema: './src/db/schema.ts',
  //   dbCredentials: {
  //     accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
  //     databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
  //     token: process.env.CLOUDFLARE_D1_TOKEN!,
  //   },
}) satisfies Config
