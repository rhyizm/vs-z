"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Users, Plus, Minus } from "lucide-react"
import { FamilyData } from "../../../types/inheritance"

export default function SiblingsStep({
  data,
  onUpdate,
  onNext,
  onBack,
}: {
  data: FamilyData
  onUpdate: (data: FamilyData) => void
  onNext: () => void
  onBack: () => void
}) {
  const hasAnyChildren =
    data.childrenCount > 0 || data.deceasedChildrenGrandchildren.reduce((sum, count) => sum + count, 0) > 0
  const hasAnyParents = data.parentsAlive.father || data.parentsAlive.mother || data.grandparentsAlive

  useEffect(() => {
    if (hasAnyChildren || hasAnyParents) {
      onNext()
    }
  }, [hasAnyChildren, hasAnyParents, onNext])

  // 上位相続人がいる場合はスキップ
  if (hasAnyChildren || hasAnyParents) {
    return null
  }

  const updateDeceasedSiblingsChildren = (index: number, count: number) => {
    const newArray = [...data.deceasedSiblingsChildren]
    newArray[index] = count
    onUpdate({ ...data, deceasedSiblingsChildren: newArray })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="glass rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">STEP 4</span>
            <span className="text-sm text-muted-foreground">第3順位：兄弟姉妹</span>
          </div>
          <Progress value={80} className="h-2" />
        </div>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>遺産を残す方の兄弟姉妹について教えてください</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 生存している兄弟姉妹 */}
            <div className="space-y-4">
              <div>
                <Label>全血の兄弟姉妹（両親が同じ）</Label>
                <div className="flex items-center justify-center space-x-4 mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      onUpdate({
                        ...data,
                        siblingsCount: {
                          ...data.siblingsCount,
                          fullBlood: Math.max(0, data.siblingsCount.fullBlood - 1),
                        },
                      })
                    }
                    disabled={data.siblingsCount.fullBlood === 0}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-xl font-bold w-12 text-center">{data.siblingsCount.fullBlood}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      onUpdate({
                        ...data,
                        siblingsCount: { ...data.siblingsCount, fullBlood: data.siblingsCount.fullBlood + 1 },
                      })
                    }
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label>半血の兄弟姉妹（片親が同じ）</Label>
                <div className="flex items-center justify-center space-x-4 mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      onUpdate({
                        ...data,
                        siblingsCount: {
                          ...data.siblingsCount,
                          halfBlood: Math.max(0, data.siblingsCount.halfBlood - 1),
                        },
                      })
                    }
                    disabled={data.siblingsCount.halfBlood === 0}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-xl font-bold w-12 text-center">{data.siblingsCount.halfBlood}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      onUpdate({
                        ...data,
                        siblingsCount: { ...data.siblingsCount, halfBlood: data.siblingsCount.halfBlood + 1 },
                      })
                    }
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">※半血は取り分が全血の1/2</p>
              </div>
            </div>

            {/* 亡くなった兄弟姉妹 */}
            <div className="space-y-3">
              <Label>亡くなった兄弟姉妹はいらっしゃいますか？</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className={data.deceasedSiblingsCount > 0 ? "glass-button" : ""}
                  onClick={() => onUpdate({ ...data, deceasedSiblingsCount: 1, deceasedSiblingsChildren: [0] })}
                >
                  はい
                </Button>
                <Button
                  variant="outline"
                  className={data.deceasedSiblingsCount === 0 ? "glass-button" : ""}
                  onClick={() => onUpdate({ ...data, deceasedSiblingsCount: 0, deceasedSiblingsChildren: [] })}
                >
                  いいえ
                </Button>
              </div>
            </div>

            {/* 亡くなった兄弟姉妹の詳細 */}
            {data.deceasedSiblingsCount > 0 && (
              <div className="space-y-4 p-4 glass-light rounded-lg">
                <div className="space-y-3">
                  <Label>亡くなった兄弟姉妹の人数</Label>
                  <div className="flex items-center justify-center space-x-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const newCount = Math.max(0, data.deceasedSiblingsCount - 1)
                        const newChildren = data.deceasedSiblingsChildren.slice(0, newCount)
                        onUpdate({ ...data, deceasedSiblingsCount: newCount, deceasedSiblingsChildren: newChildren })
                      }}
                      disabled={data.deceasedSiblingsCount === 0}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-xl font-bold w-12 text-center">{data.deceasedSiblingsCount}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const newCount = data.deceasedSiblingsCount + 1
                        const newChildren = [...data.deceasedSiblingsChildren, 0]
                        onUpdate({ ...data, deceasedSiblingsCount: newCount, deceasedSiblingsChildren: newChildren })
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* 各亡くなった兄弟姉妹の甥姪の人数 */}
                {Array.from({ length: data.deceasedSiblingsCount }, (_, i) => (
                  <div key={i} className="space-y-2">
                    <Label className="text-sm">亡くなった兄弟姉妹{i + 1}の子（甥姪）の人数</Label>
                    <div className="flex items-center justify-center space-x-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateDeceasedSiblingsChildren(i, Math.max(0, (data.deceasedSiblingsChildren[i] || 0) - 1))
                        }
                        disabled={(data.deceasedSiblingsChildren[i] || 0) === 0}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-lg font-medium w-8 text-center">
                        {data.deceasedSiblingsChildren[i] || 0}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateDeceasedSiblingsChildren(i, (data.deceasedSiblingsChildren[i] || 0) + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">※兄弟姉妹の代襲は1代限り（再代襲なし）</p>
              </div>
            )}

            <div className="pt-4 space-y-3">
              <Button onClick={onNext} className="w-full glass-button">
                次へ進む
              </Button>
              <Button variant="ghost" onClick={onBack} className="w-full">
                前に戻る
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
