import 'dotenv/config'

import { defineConfig } from 'drizzle-kit'

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
const databaseId =
  process.env.CLOUDFLARE_D1_DATABASE_ID ?? process.env.CLOUDFLARE_DATABASE_ID
const token = process.env.CLOUDFLARE_D1_TOKEN ?? process.env.CLOUDFLARE_API_TOKEN

if (!accountId || !databaseId || !token) {
  throw new Error(
    'Missing Cloudflare D1 credentials. Ensure CLOUDFLARE_ACCOUNT_ID, ' +
      'CLOUDFLARE_D1_DATABASE_ID (or CLOUDFLARE_DATABASE_ID) and ' +
      'CLOUDFLARE_D1_TOKEN (or CLOUDFLARE_API_TOKEN) are set.',
  )
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId,
    databaseId,
    token,
  },
})
