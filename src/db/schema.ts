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
  uniqueIndex,
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

export const users = sqliteTable(
  'users',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    liffSub: text('liff_sub').notNull(),
    clerkUserId: text('clerk_user_id'),
    externalId: text('external_id'),
    primaryEmailAddressId: text('primary_email_address_id'),
    firstName: text('first_name'),
    lastName: text('last_name'),
    displayName: text('display_name'),
    imageUrl: text('image_url'),
    phoneNumber: text('phone_number'),
    publicMetadata: text('public_metadata', { mode: 'json' }).$type<
      Record<string, unknown>
    >(),
    unsafeMetadata: text('unsafe_metadata', { mode: 'json' }).$type<
      Record<string, unknown>
    >(),
    lastLoginAt: integer('last_login_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex('users_liff_sub_idx').on(table.liffSub),
    uniqueIndex('users_clerk_user_id_idx').on(table.clerkUserId),
    uniqueIndex('users_external_id_idx').on(table.externalId),
  ],
)

export const userEmailAddresses = sqliteTable(
  'user_email_addresses',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    emailAddress: text('email_address').notNull(),
    verificationStatus: text('verification_status'),
    isPrimary: integer('is_primary', { mode: 'boolean' })
      .default(false)
      .notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('user_email_addresses_user_idx').on(table.userId),
    uniqueIndex('user_email_addresses_email_idx').on(table.emailAddress),
  ],
)

/**
 * LINEミニアプリの利用者（LINEユーザーID）ごとに複数の相続診断プロファイルを保持するテーブル。
 * フロントエンドのステップウィザードで入力された家族構成・資産情報・計算結果をまとめて永続化する。
 */
export const estateProfiles = sqliteTable('estate_profiles', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
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

export const usersRelations = relations(users, ({ many }) => ({
  emailAddresses: many(userEmailAddresses),
  estateProfiles: many(estateProfiles),
}))

export const userEmailAddressesRelations = relations(
  userEmailAddresses,
  ({ one }) => ({
    user: one(users, {
      fields: [userEmailAddresses.userId],
      references: [users.id],
    }),
  }),
)

export const estateProfilesRelations = relations(estateProfiles, ({ many, one }) => ({
  actionItems: many(profileActionItems),
  familyMembers: many(profileFamilyMembers),
  user: one(users, {
    fields: [estateProfiles.userId],
    references: [users.id],
  }),
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
