"use client"

import { useMemo, useState, useCallback } from "react"
import Dashboard from "@/components/dashboard"

// ステップ用コンポーネント
import IntroStep from "./steps/IntroStep"
import SpouseStep from "./steps/SpouseStep"
import ChildrenStep from "./steps/ChildrenStep"
import ParentsStep from "./steps/ParentsStep"
import SiblingsStep from "./steps/SiblingsStep"
import AssetsStep from "./steps/AssetsStep"

// 型
import type { Step, FamilyData, AssetData, DashboardData, TaxCalculation } from "./types"

export default function InheritanceTaxDiagnosis() {
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

  const generateDashboardData = (hasAssets = false): DashboardData => {
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
  }

  const nextStep = () => {
    switch (currentStep) {
      case "intro":
        setCurrentStep("spouse")
        break
      case "spouse":
        setCurrentStep("children")
        break
      case "children":
        setCurrentStep("parents")
        break
      case "parents":
        setCurrentStep("siblings")
        break
      case "siblings":
        setDashboardData(generateDashboardData(false))
        setCurrentStep("dashboard")
        break
      case "assets":
        setDashboardData(generateDashboardData(true))
        setCurrentStep("dashboard")
        break
      default:
        break
    }
  }

  switch (currentStep) {
    case "intro":
      return <IntroStep onNext={nextStep} />
    case "spouse":
      return (
        <SpouseStep
          data={familyData}
          onUpdate={setFamilyData}
          onNext={nextStep}
          onBack={() => setCurrentStep("intro")}
        />
      )
    case "children":
      return (
        <ChildrenStep
          data={familyData}
          onUpdate={setFamilyData}
          onNext={nextStep}
          onBack={() => setCurrentStep("spouse")}
        />
      )
    case "parents":
      return (
        <ParentsStep
          data={familyData}
          onUpdate={setFamilyData}
          onNext={nextStep}
          onBack={() => setCurrentStep("children")}
        />
      )
    case "siblings":
      return (
        <SiblingsStep
          data={familyData}
          onUpdate={setFamilyData}
          onNext={nextStep}
          onBack={() => setCurrentStep("parents")}
        />
      )
    case "assets":
      return (
        <AssetsStep
          data={assetData}
          onUpdate={setAssetData}
          onNext={nextStep}
          onBack={() => setCurrentStep("dashboard")}
        />
      )
    case "dashboard":
      return (
        <Dashboard
          data={dashboardData}
          familyData={familyData}
          calculation={calculation}
          onUpdate={setDashboardData}
          onBack={() => setCurrentStep("siblings")}
          onRestart={() => {
            setCurrentStep("intro")
            setFamilyData({
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
            setAssetData({
              cash: 0,
              realEstate: 0,
              securities: 0,
              insurance: 0,
              other: 0,
              loans: 0,
              funeralCosts: 0,
              unpaidTaxes: 0,
            })
            setDashboardData({
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
          }}
          onToAssets={() => setCurrentStep("assets")}
        />
      )
    default:
      return <IntroStep onNext={nextStep} />
  }
}
