// ========= 型定義 =========
export type Step = "intro" | "spouse" | "children" | "parents" | "siblings" | "dashboard" | "assets" | "result"

export type UUID = string

export type Relation = "spouse" | "child" | "descendant" | "ascendant" | "sibling" | "nephew_niece"

export type Adoption = "none" | "ordinary" | "special"

export interface Person {
  id: UUID
  displayName?: string
  relation: Relation
  generation?: number
  parentId?: UUID
  isSpouse?: boolean
  isHalfBlood?: boolean
  adoption?: Adoption
  renounced?: boolean
  disqualified?: boolean
  excluded?: boolean
  includedForTaxCount: boolean
  excludedByAdoptionCapForTax?: boolean
  civilShare?: { numerator: number; denominator: number; note?: string }
  allocationAtBasicDeductionYen?: number
}

export interface FamilyData {
  hasSpouse: boolean
  childrenCount: number
  deceasedChildrenCount: number
  deceasedChildrenGrandchildren: number[]
  adoptionCount: { ordinary: number; special: number }
  parentsAlive: { father: boolean; mother: boolean }
  grandparentsAlive: boolean
  siblingsCount: { fullBlood: number; halfBlood: number }
  deceasedSiblingsCount: number
  deceasedSiblingsChildren: number[]
}

export interface AssetData {
  cash: number
  realEstate: number
  securities: number
  insurance: number
  other: number
  loans: number
  funeralCosts: number
  unpaidTaxes: number
}

export interface TaxCalculation {
  basicDeduction: number
  taxableAssets: number
  estimatedTax: number
  heirCount: number
}

export interface DashboardData {
  familyMembers: Array<{
    id: string
    name: string
    relationship: string
    birthDate?: string
    age?: number
    address?: string
    isDeceased: boolean
    inheritanceShare?: number
    inheritanceAmount?: number
    inheritanceTax?: number
  }>
  actionItems: Array<{
    id: string
    title: string
    description: string
    priority: "high" | "medium" | "low"
    completed: boolean
    dueDate?: string
    estimatedCost?: number
  }>
  diagnosisResult: {
    totalAssets: number
    totalLiabilities: number
    netAssets: number
    estimatedTax: number
    taxRate: number
    basicDeduction: number
  }
  hasAssetData: boolean
}
