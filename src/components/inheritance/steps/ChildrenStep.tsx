"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Users, Plus, Minus } from "lucide-react"
import { FamilyData } from "../types"

export default function ChildrenStep({
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
  const updateDeceasedChildrenGrandchildren = (index: number, count: number) => {
    const newArray = [...data.deceasedChildrenGrandchildren]
    newArray[index] = count
    onUpdate({ ...data, deceasedChildrenGrandchildren: newArray })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="glass rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">STEP 2</span>
            <span className="text-sm text-muted-foreground">第1順位：子系</span>
          </div>
          <Progress value={40} className="h-2" />
        </div>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>遺産を残す方のお子さまについて教えてください</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 生存している子の人数 */}
            <div className="space-y-3">
              <Label>生存している子の人数（実子＋養子）</Label>
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onUpdate({ ...data, childrenCount: Math.max(0, data.childrenCount - 1) })}
                  disabled={data.childrenCount === 0}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-2xl font-bold w-12 text-center">{data.childrenCount}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onUpdate({ ...data, childrenCount: data.childrenCount + 1 })}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* 亡くなった子はいる？ */}
            <div className="space-y-3">
              <Label>亡くなった子はいらっしゃいますか？</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className={data.deceasedChildrenCount > 0 ? "glass-button" : ""}
                  onClick={() => onUpdate({ ...data, deceasedChildrenCount: 1, deceasedChildrenGrandchildren: [0] })}
                >
                  はい
                </Button>
                <Button
                  variant="outline"
                  className={data.deceasedChildrenCount === 0 ? "glass-button" : ""}
                  onClick={() => onUpdate({ ...data, deceasedChildrenCount: 0, deceasedChildrenGrandchildren: [] })}
                >
                  いいえ
                </Button>
              </div>
            </div>

            {/* 亡くなった子の詳細 */}
            {data.deceasedChildrenCount > 0 && (
              <div className="space-y-4 p-4 glass-light rounded-lg">
                <div className="space-y-3">
                  <Label>亡くなった子の人数</Label>
                  <div className="flex items-center justify-center space-x-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const newCount = Math.max(0, data.deceasedChildrenCount - 1)
                        const newGrandchildren = data.deceasedChildrenGrandchildren.slice(0, newCount)
                        onUpdate({
                          ...data,
                          deceasedChildrenCount: newCount,
                          deceasedChildrenGrandchildren: newGrandchildren,
                        })
                      }}
                      disabled={data.deceasedChildrenCount === 0}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-xl font-bold w-12 text-center">{data.deceasedChildrenCount}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const newCount = data.deceasedChildrenCount + 1
                        const newGrandchildren = [...data.deceasedChildrenGrandchildren, 0]
                        onUpdate({
                          ...data,
                          deceasedChildrenCount: newCount,
                          deceasedChildrenGrandchildren: newGrandchildren,
                        })
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* 各亡くなった子の孫の人数 */}
                {Array.from({ length: data.deceasedChildrenCount }, (_, i) => (
                  <div key={i} className="space-y-2">
                    <Label className="text-sm">亡くなった子{i + 1}の子（孫）の人数</Label>
                    <div className="flex items-center justify-center space-x-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateDeceasedChildrenGrandchildren(
                            i,
                            Math.max(0, (data.deceasedChildrenGrandchildren[i] || 0) - 1),
                          )
                        }
                        disabled={(data.deceasedChildrenGrandchildren[i] || 0) === 0}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-lg font-medium w-8 text-center">
                        {data.deceasedChildrenGrandchildren[i] || 0}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateDeceasedChildrenGrandchildren(i, (data.deceasedChildrenGrandchildren[i] || 0) + 1)
                        }
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 養子の人数 */}
            <div className="space-y-4 p-4 glass-light rounded-lg">
              <Label>養子は何人いらっしゃいますか？</Label>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">普通養子</Label>
                  <div className="flex items-center justify-center space-x-4 mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onUpdate({
                          ...data,
                          adoptionCount: {
                            ...data.adoptionCount,
                            ordinary: Math.max(0, data.adoptionCount.ordinary - 1),
                          },
                        })
                      }
                      disabled={data.adoptionCount.ordinary === 0}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-lg font-medium w-8 text-center">{data.adoptionCount.ordinary}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onUpdate({
                          ...data,
                          adoptionCount: { ...data.adoptionCount, ordinary: data.adoptionCount.ordinary + 1 },
                        })
                      }
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm">特別養子</Label>
                  <div className="flex items-center justify-center space-x-4 mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onUpdate({
                          ...data,
                          adoptionCount: {
                            ...data.adoptionCount,
                            special: Math.max(0, data.adoptionCount.special - 1),
                          },
                        })
                      }
                      disabled={data.adoptionCount.special === 0}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-lg font-medium w-8 text-center">{data.adoptionCount.special}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onUpdate({
                          ...data,
                          adoptionCount: { ...data.adoptionCount, special: data.adoptionCount.special + 1 },
                        })
                      }
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                ※基礎控除用の人数は養子カウントを自動制限（実子あり1人／実子なし2人）
              </p>
            </div>

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
