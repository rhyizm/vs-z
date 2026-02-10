# VS-Z (相続税シミュレーター)

相続税の概算計算と相続対策の可視化を行うNext.jsアプリケーションです。\
ランディングページと診断アプリを同一プロジェクトに統合しています。

## テスト用URL
- ランディングページ: `https://s-zk.misclib.com`
- 診断アプリ: `https://s-zk.misclib.com/check`

## 主な構成
- Next.js App Router + TypeScript
- Tailwind CSS v4 + shadcn/ui
- next-intl による多言語対応（`/ja`, `/en`）
- LINE LIFF 認証（開発時はスキップ可能）
- Turso + Drizzle ORM

## 開発サーバー
```bash
pnpm dev
```
- 開発ポート: `3039`
- 例: `http://localhost:3039`

## 環境変数
`.env` を用意し、必要な値を設定してください。

必須（本番/LINE認証利用時）
- `NEXT_PUBLIC_LIFF_ID`
- `NEXT_PUBLIC_LINE_CHANNEL_ID`
- `LINE_CHANNEL_SECRET`
- `LINE_LOGIN_CHANNEL_ID`

開発時の認証スキップ
- `NEXT_PUBLIC_SKIP_LINE_AUTH=true`
  - 開発環境でLINE認証をスキップします（本番では無効化推奨）。

Turso
- `TURSO_CONNECTION_URL`
- `TURSO_AUTH_TOKEN`

## データベース（Turso + Drizzle）
```bash
pnpm db:generate
pnpm db:migrate
```

## 主要ルート
- ランディング: `src/app/[locale]/page.tsx`
- 診断アプリ: `src/app/[locale]/check/page.tsx`

## ディレクトリ概要
```
/
├── public/                 # 静的アセット
├── src/
│   ├── app/                # App Router
│   │   ├── [locale]/        # ロケール別ルート
│   │   ├── api/             # API routes
│   │   └── globals.css
│   ├── components/          # UI/レイアウト/機能コンポーネント
│   ├── i18n/                # next-intl設定
│   ├── lib/                 # LIFF/DBなど
│   └── messages/            # 翻訳ファイル
└── package.json
```

## スクリプト
- `pnpm dev` 開発
- `pnpm build` ビルド
- `pnpm start` 本番起動
- `pnpm lint` Lint

