// drizzle.config.ts
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const databaseId =
  process.env.CLOUDFLARE_D1_DATABASE_ID ?? process.env.CLOUDFLARE_DATABASE_ID;
const token =
  process.env.CLOUDFLARE_D1_TOKEN ?? process.env.CLOUDFLARE_API_TOKEN;

// どの drizzle-kit コマンドで呼ばれているかを判定
const args = process.argv.join(' ');
const needsD1 = /\b(push|studio|introspect)\b/i.test(args); // D1 HTTP が必要なとき
const hasD1Creds = Boolean(accountId && databaseId && token);

if (needsD1 && !hasD1Creds) {
  throw new Error(
    'Missing Cloudflare D1 credentials. Ensure CLOUDFLARE_ACCOUNT_ID, ' +
      'CLOUDFLARE_D1_DATABASE_ID (or CLOUDFLARE_DATABASE_ID) and ' +
      'CLOUDFLARE_D1_TOKEN (or CLOUDFLARE_API_TOKEN) are set.',
  );
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'sqlite', // ← generate はこれだけで充分
  ...(hasD1Creds && {
    driver: 'd1-http',
    dbCredentials: { accountId, databaseId, token },
  }),
});
