import { randomUUID } from 'node:crypto'

import { and, asc, desc, eq } from 'drizzle-orm'

import {
  estateProfiles,
  profileActionItems,
  profileFamilyMembers,
} from '@/db/schema'
import { getDbFromBindings } from '@/lib/db/client'
import { getLocalD1Bindings } from '@/lib/db/local-d1'

import type { CloudflareBindings } from '@/lib/db/types'
import type { EstateProfilePayload, EstateProfileResponse } from '@/types/estate-profile'
import type { Step } from '@/types/inheritance'

type UpsertResult = {
  id: string
  created: boolean
}

function assertBindings(bindings?: CloudflareBindings): asserts bindings is CloudflareBindings {
  if (!bindings) {
    throw new Error(
      'Cloudflare D1 bindings are required to access the database. Configure a binding or run `wrangler d1` to provision a local database.',
    )
  }
}

export async function upsertEstateProfile(
  bindings: CloudflareBindings | undefined,
  userId: string,
  payload: EstateProfilePayload,
): Promise<UpsertResult> {
  const effectiveBindings = bindings ?? (await getLocalD1Bindings()) ?? undefined

  assertBindings(effectiveBindings)

  const db = getDbFromBindings(effectiveBindings)

  const profileId = payload.id ?? randomUUID()
  const timestamp = new Date()

  if (payload.id) {
    const existingProfile = await db
      .select({ id: estateProfiles.id })
      .from(estateProfiles)
      .where(and(eq(estateProfiles.id, profileId), eq(estateProfiles.userId, userId)))
      .limit(1)

    if (!existingProfile.length) {
      throw new Error('対象のプロファイルが見つかりません。')
    }

    await db
      .update(estateProfiles)
      .set({
        label: payload.label ?? null,
        notes: payload.notes ?? null,
        currentStep: payload.currentStep,
        hasAssetData: payload.dashboardData.hasAssetData,
        familyData: payload.familyData,
        assetData: payload.assetData,
        taxCalculation: payload.taxCalculation,
        diagnosisSummary: payload.dashboardData.diagnosisResult,
        updatedAt: timestamp,
      })
      .where(and(eq(estateProfiles.id, profileId), eq(estateProfiles.userId, userId)))

    await db.delete(profileActionItems).where(eq(profileActionItems.profileId, profileId))
    await db.delete(profileFamilyMembers).where(eq(profileFamilyMembers.profileId, profileId))
  } else {
    await db.insert(estateProfiles).values({
      id: profileId,
      userId,
      label: payload.label ?? null,
      notes: payload.notes ?? null,
      currentStep: payload.currentStep,
      hasAssetData: payload.dashboardData.hasAssetData,
      familyData: payload.familyData,
      assetData: payload.assetData,
      taxCalculation: payload.taxCalculation,
      diagnosisSummary: payload.dashboardData.diagnosisResult,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
  }

  if (payload.dashboardData.actionItems.length) {
    await db.insert(profileActionItems).values(
      payload.dashboardData.actionItems.map((item, index) => ({
        profileId,
        itemKey: item.id,
        title: item.title,
        description: item.description,
        priority: item.priority,
        completed: item.completed,
        dueDate: item.dueDate ?? null,
        estimatedCostYen: item.estimatedCost ?? null,
        orderIndex: index,
        createdAt: timestamp,
        updatedAt: timestamp,
      })),
    )
  }

  if (payload.dashboardData.familyMembers.length) {
    await db.insert(profileFamilyMembers).values(
      payload.dashboardData.familyMembers.map((member) => {
        const {
          id,
          name,
          relationship,
          isDeceased,
          inheritanceShare,
          inheritanceAmount,
          inheritanceTax,
          ...metadata
        } = member
        return {
          profileId,
          memberKey: id,
          name,
          relationship,
          birthDate: member.birthDate ?? null,
          age: member.age ?? null,
          address: member.address ?? null,
          isDeceased,
          inheritanceShare: inheritanceShare ?? null,
          inheritanceAmountManen: inheritanceAmount ?? null,
          inheritanceTaxManen: inheritanceTax ?? null,
          metadata,
          createdAt: timestamp,
          updatedAt: timestamp,
        }
      }),
    )
  }

  return { id: profileId, created: !payload.id }
}

export async function getLatestEstateProfile(
  bindings: CloudflareBindings | undefined,
  userId: string,
): Promise<EstateProfileResponse | null> {
  const effectiveBindings = bindings ?? (await getLocalD1Bindings()) ?? undefined

  assertBindings(effectiveBindings)

  const db = getDbFromBindings(effectiveBindings)

  const [profile] = await db
    .select({
      id: estateProfiles.id,
      label: estateProfiles.label,
      notes: estateProfiles.notes,
      currentStep: estateProfiles.currentStep,
      hasAssetData: estateProfiles.hasAssetData,
      familyData: estateProfiles.familyData,
      assetData: estateProfiles.assetData,
      taxCalculation: estateProfiles.taxCalculation,
      diagnosisSummary: estateProfiles.diagnosisSummary,
      createdAt: estateProfiles.createdAt,
      updatedAt: estateProfiles.updatedAt,
    })
    .from(estateProfiles)
    .where(eq(estateProfiles.userId, userId))
    .orderBy(desc(estateProfiles.updatedAt))
    .limit(1)

  if (!profile) {
    return null
  }

  const actionItems = await db
    .select({
      itemKey: profileActionItems.itemKey,
      title: profileActionItems.title,
      description: profileActionItems.description,
      priority: profileActionItems.priority,
      completed: profileActionItems.completed,
      dueDate: profileActionItems.dueDate,
      estimatedCostYen: profileActionItems.estimatedCostYen,
      orderIndex: profileActionItems.orderIndex,
    })
    .from(profileActionItems)
    .where(eq(profileActionItems.profileId, profile.id))
    .orderBy(asc(profileActionItems.orderIndex))

  const familyMembers = await db
    .select({
      memberKey: profileFamilyMembers.memberKey,
      name: profileFamilyMembers.name,
      relationship: profileFamilyMembers.relationship,
      birthDate: profileFamilyMembers.birthDate,
      age: profileFamilyMembers.age,
      address: profileFamilyMembers.address,
      isDeceased: profileFamilyMembers.isDeceased,
      inheritanceShare: profileFamilyMembers.inheritanceShare,
      inheritanceAmountManen: profileFamilyMembers.inheritanceAmountManen,
      inheritanceTaxManen: profileFamilyMembers.inheritanceTaxManen,
      metadata: profileFamilyMembers.metadata,
    })
    .from(profileFamilyMembers)
    .where(eq(profileFamilyMembers.profileId, profile.id))

  const toIsoString = (value: Date | number): string => {
    if (value instanceof Date) {
      return value.toISOString()
    }
    return new Date(value).toISOString()
  }

  return {
    id: profile.id,
    userId,
    label: profile.label ?? undefined,
    notes: profile.notes ?? undefined,
    currentStep: profile.currentStep as Step,
    familyData: profile.familyData,
    assetData: profile.assetData,
    dashboardData: {
      familyMembers: familyMembers.map((member) => ({
        id: member.memberKey,
        name: member.name,
        relationship: member.relationship,
        birthDate: member.birthDate ?? undefined,
        age: member.age ?? undefined,
        address: member.address ?? undefined,
        isDeceased: member.isDeceased,
        inheritanceShare: member.inheritanceShare ?? undefined,
        inheritanceAmount: member.inheritanceAmountManen ?? undefined,
        inheritanceTax: member.inheritanceTaxManen ?? undefined,
        ...(member.metadata ?? {}),
      })),
      actionItems: actionItems.map((item) => ({
        id: item.itemKey,
        title: item.title,
        description: item.description,
        priority: item.priority,
        completed: item.completed,
        dueDate: item.dueDate ?? undefined,
        estimatedCost: item.estimatedCostYen ?? undefined,
      })),
      diagnosisResult: profile.diagnosisSummary,
      hasAssetData: profile.hasAssetData,
    },
    taxCalculation: profile.taxCalculation,
    createdAt: toIsoString(profile.createdAt),
    updatedAt: toIsoString(profile.updatedAt),
  }
}
