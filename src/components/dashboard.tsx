"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Users, User, Edit3, CheckSquare, ArrowRight, TrendingUp, Calculator, PieChart } from "lucide-react"

interface FamilyMember {
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
}

interface ActionItem {
  id: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
  completed: boolean
  dueDate?: string
  estimatedCost?: number
}

interface DiagnosisResult {
  totalAssets: number
  totalLiabilities: number
  netAssets: number
  estimatedTax: number
  taxRate: number
  basicDeduction: number
}

interface DashboardData {
  familyMembers: FamilyMember[]
  actionItems: ActionItem[]
  diagnosisResult: DiagnosisResult
  hasAssetData: boolean
}

interface FamilyData {
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

interface TaxCalculation {
  basicDeduction: number
  taxableAssets: number
  estimatedTax: number
  heirCount: number
}

interface DashboardProps {
  data: DashboardData
  familyData: FamilyData
  calculation: TaxCalculation
  onUpdate: (data: DashboardData) => void
  onBack: () => void
  onRestart: () => void
  onToAssets: () => void
}

export default function Dashboard({
  data,
  familyData,
  calculation,
  onUpdate,
  onBack,
  onRestart,
  onToAssets,
}: DashboardProps) {

  const toggleActionItem = (id: string) => {
    const updatedActionItems = data.actionItems.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item,
    )
    onUpdate({ ...data, actionItems: updatedActionItems })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "高"
      case "medium":
        return "中"
      case "low":
        return "低"
      default:
        return "-"
    }
  }

  const completedActions = data.actionItems.filter((item) => item.completed).length
  const totalActions = data.actionItems.length
  const progressPercentage = totalActions > 0 ? (completedActions / totalActions) * 100 : 0

  const generateFamilyMembers = (): FamilyMember[] => {
    const members: FamilyMember[] = []

    // 配偶者
    if (familyData.hasSpouse) {
      members.push({
        id: "spouse",
        name: "配偶者",
        relationship: "配偶者",
        isDeceased: false,
        inheritanceShare: 0.5, // 簡易計算
        inheritanceAmount: data.hasAssetData ? Math.round(data.diagnosisResult.netAssets * 0.5) : undefined,
        inheritanceTax: data.hasAssetData ? Math.round((calculation.estimatedTax * 0.5) / 10000) : undefined,
      })
    }

    // 子
    for (let i = 1; i <= familyData.childrenCount; i++) {
      const childShare = familyData.hasSpouse ? 0.5 / familyData.childrenCount : 1 / familyData.childrenCount
      members.push({
        id: `child-${i}`,
        name: `子${i}`,
        relationship: "子",
        isDeceased: false,
        inheritanceShare: childShare,
        inheritanceAmount: data.hasAssetData ? Math.round(data.diagnosisResult.netAssets * childShare) : undefined,
        inheritanceTax: data.hasAssetData ? Math.round((calculation.estimatedTax * childShare) / 10000) : undefined,
      })
    }

    // 孫（代襲相続）
    familyData.deceasedChildrenGrandchildren.forEach((grandchildrenCount, deceasedChildIndex) => {
      for (let i = 1; i <= grandchildrenCount; i++) {
        const grandchildShare = familyData.hasSpouse
          ? 0.5 / familyData.childrenCount / grandchildrenCount
          : 1 / familyData.childrenCount / grandchildrenCount
        members.push({
          id: `grandchild-${deceasedChildIndex}-${i}`,
          name: `孫${deceasedChildIndex + 1}-${i}`,
          relationship: "孫（代襲相続）",
          isDeceased: false,
          inheritanceShare: grandchildShare,
          inheritanceAmount: data.hasAssetData
            ? Math.round(data.diagnosisResult.netAssets * grandchildShare)
            : undefined,
          inheritanceTax: data.hasAssetData
            ? Math.round((calculation.estimatedTax * grandchildShare) / 10000)
            : undefined,
        })
      }
    })

    // 両親（子がいない場合）
    const hasChildren =
      familyData.childrenCount > 0 ||
      familyData.deceasedChildrenGrandchildren.reduce((sum, count) => sum + count, 0) > 0
    if (!hasChildren) {
      if (familyData.parentsAlive.father) {
        const parentShare = familyData.hasSpouse ? 1 / 3 / 2 : 1 / 2
        members.push({
          id: "father",
          name: "父",
          relationship: "父",
          isDeceased: false,
          inheritanceShare: parentShare,
          inheritanceAmount: data.hasAssetData ? Math.round(data.diagnosisResult.netAssets * parentShare) : undefined,
          inheritanceTax: data.hasAssetData ? Math.round((calculation.estimatedTax * parentShare) / 10000) : undefined,
        })
      }
      if (familyData.parentsAlive.mother) {
        const parentShare = familyData.hasSpouse ? 1 / 3 / 2 : 1 / 2
        members.push({
          id: "mother",
          name: "母",
          relationship: "母",
          isDeceased: false,
          inheritanceShare: parentShare,
          inheritanceAmount: data.hasAssetData ? Math.round(data.diagnosisResult.netAssets * parentShare) : undefined,
          inheritanceTax: data.hasAssetData ? Math.round((calculation.estimatedTax * parentShare) / 10000) : undefined,
        })
      }
    }

    return members
  }

  const familyMembers = generateFamilyMembers()

  const generateActionItems = (): ActionItem[] => {
    const items: ActionItem[] = []

    if (data.hasAssetData && calculation.estimatedTax > 0) {
      items.push({
        id: "will-creation",
        title: "遺言書の作成",
        description: "相続税対策と円滑な相続のため、公正証書遺言の作成を検討してください。",
        priority: "high",
        completed: false,
        dueDate: "6ヶ月以内",
        estimatedCost: 100000,
      })

      items.push({
        id: "life-insurance",
        title: "生命保険の活用",
        description: "相続税の非課税枠（500万円×法定相続人数）を活用した生命保険への加入を検討してください。",
        priority: "high",
        completed: false,
        dueDate: "3ヶ月以内",
        estimatedCost: 0,
      })

      items.push({
        id: "gift-tax-planning",
        title: "贈与税の活用",
        description: "年間110万円の基礎控除を活用した計画的な生前贈与を検討してください。",
        priority: "medium",
        completed: false,
        dueDate: "1年以内",
        estimatedCost: 0,
      })
    }

    items.push({
      id: "family-meeting",
      title: "家族会議の開催",
      description: "相続について家族で話し合い、意思を共有することが重要です。",
      priority: "medium",
      completed: false,
      dueDate: "1ヶ月以内",
      estimatedCost: 0,
    })

    items.push({
      id: "document-organization",
      title: "重要書類の整理",
      description: "不動産登記簿、預金通帳、保険証券などの重要書類を整理・保管してください。",
      priority: "low",
      completed: false,
      dueDate: "3ヶ月以内",
      estimatedCost: 0,
    })

    return items
  }

  useEffect(() => {
    if (data.actionItems.length === 0) {
      const newActionItems = generateActionItems()
      onUpdate({ ...data, actionItems: newActionItems })
    }
  }, [data, familyData.hasSpouse, calculation.estimatedTax, generateActionItems, onUpdate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50 p-4">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <Card className="glass">
          <CardHeader className="text-center">
            <CardTitle className="gradient-text text-3xl font-bold">相続対策ダッシュボード</CardTitle>
            <p className="text-muted-foreground">家族構成の管理と相続対策の進捗を確認できます</p>
          </CardHeader>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              基礎控除額
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold gradient-text">
                {(calculation.basicDeduction / 10000).toLocaleString()}万円
              </div>
              <p className="text-muted-foreground">3,000万円 + {calculation.heirCount}人 × 600万円</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>法定相続人の数（税法上カウント）: {calculation.heirCount}人</p>
                <p className="text-xs">※相続放棄者も人数に含める、養子は数制限あり</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              財産の表示と編集
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!data.hasAssetData ? (
              <div className="text-center space-y-4 py-8">
                <div className="text-muted-foreground">
                  相続財産が基礎控除（{(calculation.basicDeduction / 10000).toLocaleString()}
                  万円）を超える可能性がある場合、 財産を入力することで相続財産と相続税の見込みが計算できます。
                </div>
                <Button onClick={onToAssets} className="glass-button">
                  財産を入力する
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="glass-light rounded-lg overflow-hidden">
                  <div className="grid grid-cols-1 divide-y divide-white/40 md:grid-cols-2 md:divide-y-0 md:divide-x">
                    <div className="p-5 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {data.diagnosisResult.totalAssets.toLocaleString()}万円
                      </div>
                      <div className="text-base text-muted-foreground">総資産</div>
                    </div>
                    <div className="p-5 text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {data.diagnosisResult.totalLiabilities.toLocaleString()}万円
                      </div>
                      <div className="text-base text-muted-foreground">総負債</div>
                    </div>
                  </div>
                </div>
                <div className="h-px bg-black/10" />
                <div className="glass-light rounded-lg p-5 text-center">
                  <div className="text-3xl font-bold gradient-text">
                    {data.diagnosisResult.netAssets.toLocaleString()}万円
                  </div>
                  <div className="text-base text-muted-foreground">純資産</div>
                </div>
                <div className="text-center">
                  <Button onClick={onToAssets} variant="outline" className="glass-light bg-transparent">
                    財産を編集する
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              {data.hasAssetData ? "財産額での配分" : "基礎控除額での仮配分"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {data.hasAssetData
                ? `入力された純資産額（${data.diagnosisResult.netAssets.toLocaleString()}万円）に基づく法定相続分による配分`
                : "総財産がちょうど基礎控除額だった場合の法定相続分による配分"}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {familyMembers.map((member) => (
                <div key={member.id} className="flex justify-between items-center py-2 px-4 glass-light rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium">{member.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">({member.relationship})</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {(
                        data.hasAssetData
                          ? (member.inheritanceAmount ?? Math.round(
                              data.diagnosisResult.netAssets * (member.inheritanceShare || 0),
                            ))
                          : Math.round(
                              (calculation.basicDeduction / 10000) * (member.inheritanceShare || 0),
                            )
                      ).toLocaleString()}
                      万円
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {((member.inheritanceShare || 0) * 100).toFixed(1)}%
                      {data.hasAssetData ? "（純資産ベース）" : "（基礎控除ベース）"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Family composition management */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              家族構成の詳細管理
              <Button variant="ghost" size="sm" className="ml-auto glass-button">
                <Edit3 className="h-4 w-4" />
                編集
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {familyMembers.map((member) => (
                <Card
                  key={member.id}
                  className="glass-light border border-white/20 hover:border-white/40 transition-all"
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full glass-button flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{member.name}</h3>
                          <p className="text-sm text-muted-foreground">{member.relationship}</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        {member.inheritanceShare && (
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-3 w-3 text-green-600" />
                            <span className="text-green-600 font-medium">
                              相続割合: {(member.inheritanceShare * 100).toFixed(1)}%
                            </span>
                          </div>
                        )}
                        {member.inheritanceAmount && (
                          <div className="flex items-center gap-2">
                            <Calculator className="h-3 w-3 text-blue-600" />
                            <span className="text-blue-600 font-medium">
                              相続金額: {member.inheritanceAmount.toLocaleString()}万円
                            </span>
                          </div>
                        )}
                        {typeof member.inheritanceTax === "number" && (
                          <div className="flex items-center gap-2">
                            <Calculator className="h-3 w-3 text-red-600" />
                            <span className="text-red-600 font-medium">
                              相続税額: {member.inheritanceTax.toLocaleString()}万円
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Items Section */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              相続発生前に取るべきアクション
              <Badge variant="outline" className="ml-auto">
                {completedActions}/{totalActions} 完了
              </Badge>
            </CardTitle>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-gradient-to-r from-orange-400 to-pink-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.actionItems.map((item) => (
                <Card key={item.id} className={`glass-light transition-all ${item.completed ? "opacity-60" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={() => toggleActionItem(item.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`font-medium ${item.completed ? "line-through" : ""}`}>{item.title}</h3>
                          <Badge className={getPriorityColor(item.priority)}>
                            優先度: {getPriorityLabel(item.priority)}
                          </Badge>
                          {item.dueDate && (
                            <Badge variant="outline" className="text-xs">
                              期限: {item.dueDate}
                            </Badge>
                          )}
                        </div>
                        <p className={`text-sm text-muted-foreground ${item.completed ? "line-through" : ""}`}>
                          {item.description}
                        </p>
                        {item.estimatedCost && item.estimatedCost > 0 && (
                          <div className="flex items-center gap-1 text-xs text-orange-600">
                            <Calculator className="h-3 w-3" />
                            <span>概算費用: {item.estimatedCost.toLocaleString()}円</span>
                          </div>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-4">
          <Button variant="outline" onClick={onBack} className="flex-1 glass-light bg-transparent">
            家族構成に戻る
          </Button>
          <Button onClick={onRestart} className="glass-button flex-1">
            新しい診断を開始
          </Button>
        </div>
      </div>
    </div>
  )
}
