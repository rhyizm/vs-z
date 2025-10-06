import type {
  AssetData,
  DashboardData,
  FamilyData,
  Step,
  TaxCalculation,
} from './inheritance'

export interface EstateProfilePayload {
  id?: string | null
  label?: string | null
  notes?: string | null
  currentStep: Step
  familyData: FamilyData
  assetData: AssetData
  dashboardData: DashboardData
  taxCalculation: TaxCalculation
}

export interface EstateProfileResponse {
  id: string
  userId: string
  label?: string | null
  notes?: string | null
  currentStep: Step
  familyData: FamilyData
  assetData: AssetData
  dashboardData: DashboardData
  taxCalculation: TaxCalculation
  createdAt: string
  updatedAt: string
}

