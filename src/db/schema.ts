import { randomUUID } from 'node:crypto'

import { relations } from 'drizzle-orm'
import { sql } from 'drizzle-orm'
import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core'

import type {
  AssetData,
  DashboardData,
  FamilyData,
  TaxCalculation,
} from '@/types/inheritance'

type ActionItem = DashboardData['actionItems'][number]
type FamilyMember = DashboardData['familyMembers'][number]
type DiagnosisResult = DashboardData['diagnosisResult']

/**
 * LINEミニアプリの利用者（LINEユーザーID）ごとに複数の相続診断プロファイルを保持するテーブル。
 * フロントエンドのステップウィザードで入力された家族構成・資産情報・計算結果をまとめて永続化する。
 */
export const estateProfiles = sqliteTable('estate_profiles', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  userId: text('user_id').notNull(),
  label: text('label'),
  notes: text('notes'),
  currentStep: text('current_step').default('intro').notNull(),
  hasAssetData: integer('has_asset_data', { mode: 'boolean' })
    .default(false)
    .notNull(),
  familyData: text('family_data', { mode: 'json' }).$type<FamilyData>().notNull(),
  assetData: text('asset_data', { mode: 'json' }).$type<AssetData>().notNull(),
  taxCalculation: text('tax_calculation', { mode: 'json' })
    .$type<TaxCalculation>()
    .notNull(),
  diagnosisSummary: text('diagnosis_summary', { mode: 'json' })
    .$type<DiagnosisResult>()
    .notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

/**
 * ダッシュボード上のアクション項目（TODOリスト）の状態を保持するテーブル。
 * 生成済みアクションの完了状況や期日をプロファイルごとに追跡する。
 */
export const profileActionItems = sqliteTable(
  'profile_action_items',
  {
    profileId: text('profile_id')
      .notNull()
      .references(() => estateProfiles.id, { onDelete: 'cascade' }),
    itemKey: text('item_key').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    priority: text('priority', { enum: ['high', 'medium', 'low'] as const })
      .notNull()
      .$type<ActionItem['priority']>(),
    completed: integer('completed', { mode: 'boolean' })
      .default(false)
      .notNull(),
    dueDate: text('due_date'),
    estimatedCostYen: integer('estimated_cost_yen'),
    orderIndex: integer('order_index'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.profileId, table.itemKey] }),
    index('profile_action_items_profile_idx').on(table.profileId),
  ],
)

/**
 * プロファイルに紐づく法定相続人のスナップショットを保存するテーブル。
 * 計算時点での相続割合や試算額をダッシュボード表示と同期させる。
 */
export const profileFamilyMembers = sqliteTable(
  'profile_family_members',
  {
    profileId: text('profile_id')
      .notNull()
      .references(() => estateProfiles.id, { onDelete: 'cascade' }),
    memberKey: text('member_key').notNull(),
    name: text('name').notNull(),
    relationship: text('relationship').notNull(),
    birthDate: text('birth_date'),
    age: integer('age'),
    address: text('address'),
    isDeceased: integer('is_deceased', { mode: 'boolean' })
      .default(false)
      .notNull(),
    inheritanceShare: real('inheritance_share'),
    inheritanceAmountManen: integer('inheritance_amount_manen'),
    inheritanceTaxManen: integer('inheritance_tax_manen'),
    metadata: text('metadata', { mode: 'json' }).$type<
      Omit<FamilyMember, 'id' | 'name' | 'relationship' | 'isDeceased'>
    >(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.profileId, table.memberKey] }),
    index('profile_family_members_profile_idx').on(table.profileId),
  ],
)

export const estateProfilesRelations = relations(estateProfiles, ({ many }) => ({
  actionItems: many(profileActionItems),
  familyMembers: many(profileFamilyMembers),
}))

export const profileActionItemsRelations = relations(
  profileActionItems,
  ({ one }) => ({
    profile: one(estateProfiles, {
      fields: [profileActionItems.profileId],
      references: [estateProfiles.id],
    }),
  }),
)

export const profileFamilyMembersRelations = relations(
  profileFamilyMembers,
  ({ one }) => ({
    profile: one(estateProfiles, {
      fields: [profileFamilyMembers.profileId],
      references: [estateProfiles.id],
    }),
  }),
)
