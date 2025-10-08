"use client"

import { useMemo, useState, useCallback, useEffect, useRef } from "react"
import type { ReactNode } from "react"
import Dashboard from "@/components/dashboard"
import { useLiff } from "@/lib/liff"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useEstateProfile } from "@/hooks/useEstateProfile"

// ステップ用コンポーネント
import IntroStep from "./steps/IntroStep"
import SpouseStep from "./steps/SpouseStep"
import ChildrenStep from "./steps/ChildrenStep"
import ParentsStep from "./steps/ParentsStep"
import SiblingsStep from "./steps/SiblingsStep"
import AssetsStep from "./steps/AssetsStep"

// 型
import type { Step, FamilyData, AssetData, DashboardData, TaxCalculation } from "@/types/inheritance"
import type { EstateProfilePayload } from "@/types/estate-profile"

export default function InheritanceTaxDiagnosis() {
  return <InheritanceTaxDiagnosisContent />
}

function InheritanceTaxDiagnosisContent() {
  const { isReady, isLoggedIn, login, error, syncingSession, token } = useLiff()
  const isAuthenticating = isLoggedIn && (!token || syncingSession)
  const [currentStep, setCurrentStep] = useState<Step>("intro")
  const [familyData, setFamilyData] = useState<FamilyData>({
    hasSpouse: false,
    childrenCount: 0,
    deceasedChildrenCount: 0,
    deceasedChildrenGrandchildren: [],
    adoptionCount: { ordinary: 0, special: 0 },
    parentsAlive: { father: false, mother: false },
    grandparentsAlive: false,
    siblingsCount: { fullBlood: 0, halfBlood: 0 },
    deceasedSiblingsCount: 0,
    deceasedSiblingsChildren: [],
  })

  const [assetData, setAssetData] = useState<AssetData>({
    cash: 0,
    realEstate: 0,
    securities: 0,
    insurance: 0,
    other: 0,
    loans: 0,
    funeralCosts: 0,
    unpaidTaxes: 0,
  })

  const lastPersistedAssetDataRef = useRef<AssetData>(assetData)

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    familyMembers: [],
    actionItems: [],
    diagnosisResult: {
      totalAssets: 0,
      totalLiabilities: 0,
      netAssets: 0,
      estimatedTax: 0,
      taxRate: 0,
      basicDeduction: 0,
    },
    hasAssetData: false,
  })

  const totalPlus = useMemo(
    () => assetData.cash + assetData.realEstate + assetData.securities + assetData.insurance + assetData.other,
    [assetData.cash, assetData.realEstate, assetData.securities, assetData.insurance, assetData.other],
  )

  const totalMinus = useMemo(
    () => assetData.loans + assetData.funeralCosts + assetData.unpaidTaxes,
    [assetData.loans, assetData.funeralCosts, assetData.unpaidTaxes],
  )

  const calculateHeirs = useCallback((): number => {
    let heirs = 0

    // 配偶者
    if (familyData.hasSpouse) heirs += 1

    // 第1順位：子系
    const totalChildren =
      familyData.childrenCount + familyData.deceasedChildrenGrandchildren.reduce((sum, count) => sum + count, 0)
    if (totalChildren > 0) {
      heirs += totalChildren
      // 養子の人数制限を適用
      const totalAdoptions = familyData.adoptionCount.ordinary + familyData.adoptionCount.special
      const realChildren = familyData.childrenCount - totalAdoptions
      const adoptionLimit = realChildren > 0 ? 1 : 2
      const countedAdoptions = Math.min(totalAdoptions, adoptionLimit)
      heirs =
        (familyData.hasSpouse ? 1 : 0) +
        realChildren +
        countedAdoptions +
        familyData.deceasedChildrenGrandchildren.reduce((sum, count) => sum + count, 0)
      return heirs
    }

    // 第2順位：直系尊属
    if (familyData.parentsAlive.father || familyData.parentsAlive.mother || familyData.grandparentsAlive) {
      if (familyData.parentsAlive.father) heirs += 1
      if (familyData.parentsAlive.mother) heirs += 1
      if (!familyData.parentsAlive.father && !familyData.parentsAlive.mother && familyData.grandparentsAlive) {
        heirs += 2 // 祖父母等
      }
      return heirs
    }

    // 第3順位：兄弟姉妹
    heirs += familyData.siblingsCount.fullBlood + familyData.siblingsCount.halfBlood
    heirs += familyData.deceasedSiblingsChildren.reduce((sum, count) => sum + count, 0)

    return heirs
  }, [familyData])

  const calculateTax = useCallback((): TaxCalculation => {
    const heirCount = calculateHeirs()
    const basicDeduction = 30000000 + 6000000 * heirCount
    const totalAssets = totalPlus * 10000
    const totalDebts = totalMinus * 10000
    const taxableAssets = Math.max(0, totalAssets - totalDebts - basicDeduction)

    let estimatedTax = 0
    if (taxableAssets > 0) {
      if (taxableAssets <= 10000000) {
        estimatedTax = taxableAssets * 0.1
      } else if (taxableAssets <= 30000000) {
        estimatedTax = taxableAssets * 0.15 - 500000
      } else if (taxableAssets <= 50000000) {
        estimatedTax = taxableAssets * 0.2 - 2000000
      } else {
        estimatedTax = taxableAssets * 0.3 - 7000000
      }
    }

    return {
      basicDeduction,
      taxableAssets,
      estimatedTax: Math.max(0, estimatedTax),
      heirCount,
    }
  }, [calculateHeirs, totalPlus, totalMinus])

  const calculation = useMemo(() => calculateTax(), [calculateTax])

  const generateDashboardData = useCallback(
    (hasAssets = false): DashboardData => {
      const familyMembers: DashboardData["familyMembers"] = []
      const actionItems: DashboardData["actionItems"] = []

      const diagnosisResult = {
        totalAssets: totalPlus,
        totalLiabilities: totalMinus,
        netAssets: totalPlus - totalMinus,
        estimatedTax: calculation.estimatedTax,
        taxRate: totalPlus > 0 ? (calculation.estimatedTax / (totalPlus * 10000)) * 100 : 0,
        basicDeduction: calculation.basicDeduction,
      }

      return {
        familyMembers,
        actionItems,
        diagnosisResult,
        hasAssetData: hasAssets,
      }
    },
    [calculation.basicDeduction, calculation.estimatedTax, totalMinus, totalPlus],
  )

  const {
    profileId,
    profile,
    saveProfile,
    isSaving,
    isLoading,
    error: persistenceError,
    loadLatestProfile,
  } = useEstateProfile()

  const hasRequestedProfileRef = useRef(false)
  const hasAppliedProfileRef = useRef(false)

  const persistProfile = useCallback(
    (
      nextStep: Step,
      overrides?: {
        dashboard?: DashboardData
        asset?: AssetData
      },
    ) => {
      const payload: EstateProfilePayload = {
        id: profileId ?? undefined,
        currentStep: nextStep,
        familyData,
        assetData: overrides?.asset ?? assetData,
        dashboardData: overrides?.dashboard ?? dashboardData,
        taxCalculation: calculation,
      }

      lastPersistedAssetDataRef.current = payload.assetData
      void saveProfile(payload)
    },
    [assetData, calculation, dashboardData, familyData, profileId, saveProfile],
  )

  const updateDashboardAndPersist = useCallback(
    (hasAssets: boolean) => {
      const updatedDashboard = generateDashboardData(hasAssets)
      setDashboardData(updatedDashboard)
      persistProfile("dashboard", { dashboard: updatedDashboard })
    },
    [generateDashboardData, persistProfile],
  )

  const nextStep = useCallback(() => {
    switch (currentStep) {
      case "intro":
        setCurrentStep("spouse")
        persistProfile("spouse")
        break
      case "spouse":
        setCurrentStep("children")
        persistProfile("children")
        break
      case "children":
        setCurrentStep("parents")
        persistProfile("parents")
        break
      case "parents":
        setCurrentStep("siblings")
        persistProfile("siblings")
        break
      case "siblings":
        setCurrentStep("dashboard")
        updateDashboardAndPersist(false)
        break
      case "assets":
        setCurrentStep("dashboard")
        updateDashboardAndPersist(true)
        break
      default:
        break
    }
  }, [currentStep, persistProfile, updateDashboardAndPersist])

  useEffect(() => {
    if (!isReady) {
      return
    }

    if (!isLoggedIn || !token) {
      setCurrentStep("intro")
      hasRequestedProfileRef.current = false
      hasAppliedProfileRef.current = false
      return
    }

    if (hasRequestedProfileRef.current) {
      return
    }

    hasRequestedProfileRef.current = true

    loadLatestProfile().catch((error) => {
      console.error("Failed to load estate profile:", error)
      hasRequestedProfileRef.current = false
    })
  }, [isReady, isLoggedIn, token, loadLatestProfile])

  useEffect(() => {
    if (!profile) {
      hasAppliedProfileRef.current = false
      return
    }

    if (hasAppliedProfileRef.current) {
      return
    }

    setFamilyData(profile.familyData)
    setAssetData(profile.assetData)
    lastPersistedAssetDataRef.current = profile.assetData
    setDashboardData(profile.dashboardData)
    setCurrentStep("dashboard")
    hasAppliedProfileRef.current = true
  }, [profile])

  if (!isReady || isLoading || isAuthenticating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="flex flex-col items-center space-y-4 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>LINEアカウント情報を確認しています...</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white/80 backdrop-blur shadow-xl p-8 space-y-6 text-center">
          <h1 className="text-2xl font-semibold">LINE連携が必要です</h1>
          <p className="text-sm text-muted-foreground">
            相続診断を開始する前に、LINEログインでミニアプリへの接続を完了してください。
          </p>
          {error && (
            <div className="rounded-md bg-red-50 text-red-600 text-sm p-3">
              {error}
            </div>
          )}
          <Button
            size="lg"
            className="w-full bg-[#06c755] hover:bg-[#05b14c]"
            onClick={login}
            disabled={syncingSession}
          >
            {syncingSession ? "連携中..." : "LINEでログイン"}
          </Button>
          <p className="text-xs text-muted-foreground">
            ボタンを押すとLINEアプリが開き、認証完了後にステップが表示されます。
          </p>
        </div>
      </div>
    )
  }

  const persistenceNotice = persistenceError ? (
    <div className="fixed top-4 inset-x-0 flex justify-center px-4 z-50">
      <div className="max-w-md w-full rounded-md bg-red-50 text-red-600 text-sm px-4 py-2 shadow">
        {persistenceError}
      </div>
    </div>
  ) : null

  const savingIndicator = isSaving ? (
    <div className="fixed top-4 right-4 text-xs text-muted-foreground bg-white/80 px-3 py-1 rounded-full shadow">
      保存中...
    </div>
  ) : null

  let content: ReactNode

  switch (currentStep) {
    case "intro":
      content = <IntroStep onNext={nextStep} />
      break
    case "spouse":
      content = (
        <SpouseStep
          data={familyData}
          onUpdate={setFamilyData}
          onNext={nextStep}
          onBack={() => {
            setCurrentStep("intro")
            persistProfile("intro")
          }}
        />
      )
      break
    case "children":
      content = (
        <ChildrenStep
          data={familyData}
          onUpdate={setFamilyData}
          onNext={nextStep}
          onBack={() => {
            setCurrentStep("spouse")
            persistProfile("spouse")
          }}
        />
      )
      break
    case "parents":
      content = (
        <ParentsStep
          data={familyData}
          onUpdate={setFamilyData}
          onNext={nextStep}
          onBack={() => {
            setCurrentStep("children")
            persistProfile("children")
          }}
        />
      )
      break
    case "siblings":
      content = (
        <SiblingsStep
          data={familyData}
          onUpdate={setFamilyData}
          onNext={nextStep}
          onBack={() => {
            setCurrentStep("parents")
            persistProfile("parents")
          }}
        />
      )
      break
    case "assets":
      content = (
        <AssetsStep
          data={assetData}
          onUpdate={setAssetData}
          onNext={nextStep}
          onBack={() => {
            setAssetData({ ...lastPersistedAssetDataRef.current })
            setCurrentStep("dashboard")
            persistProfile("dashboard", {
              asset: lastPersistedAssetDataRef.current,
              dashboard: dashboardData,
            })
          }}
        />
      )
      break
    case "dashboard":
      content = (
        <Dashboard
          data={dashboardData}
          familyData={familyData}
          calculation={calculation}
          onUpdate={(data) => {
            setDashboardData(data)
            persistProfile("dashboard", { dashboard: data })
          }}
          onEditFamily={() => {
            setCurrentStep("spouse")
            persistProfile("spouse")
          }}
          onToAssets={() => {
            setCurrentStep("assets")
            persistProfile("assets")
          }}
        />
      )
      break
    default:
      content = <IntroStep onNext={nextStep} />
      break
  }

  return (
    <>
      {persistenceNotice}
      {savingIndicator}
      {content}
    </>
  )
}
