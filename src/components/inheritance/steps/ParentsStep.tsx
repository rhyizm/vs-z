"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Users } from "lucide-react"
import { FamilyData } from "../../../types/inheritance"

export default function ParentsStep({
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

  useEffect(() => {
    if (hasAnyChildren) {
      onNext()
    }
  }, [hasAnyChildren, onNext])

  // 子がいる場合はスキップ
  if (hasAnyChildren) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="glass rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">STEP 3</span>
            <span className="text-sm text-muted-foreground">第2順位：直系尊属</span>
          </div>
          <Progress value={60} className="h-2" />
        </div>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>遺産を残す方のご両親について教えてください</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>父</Label>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className={data.parentsAlive.father ? "glass-button" : ""}
                    onClick={() => onUpdate({ ...data, parentsAlive: { ...data.parentsAlive, father: true } })}
                  >
                    生存
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={!data.parentsAlive.father ? "glass-button" : ""}
                    onClick={() => onUpdate({ ...data, parentsAlive: { ...data.parentsAlive, father: false } })}
                  >
                    死亡
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>母</Label>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className={data.parentsAlive.mother ? "glass-button" : ""}
                    onClick={() => onUpdate({ ...data, parentsAlive: { ...data.parentsAlive, mother: true } })}
                  >
                    生存
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={!data.parentsAlive.mother ? "glass-button" : ""}
                    onClick={() => onUpdate({ ...data, parentsAlive: { ...data.parentsAlive, mother: false } })}
                  >
                    死亡
                  </Button>
                </div>
              </div>
            </div>

            {!data.parentsAlive.father && !data.parentsAlive.mother && (
              <div className="space-y-3 p-4 glass-light rounded-lg">
                <Label>祖父母など上の世代で生存している方はいらっしゃいますか？</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className={data.grandparentsAlive ? "glass-button" : ""}
                    onClick={() => onUpdate({ ...data, grandparentsAlive: true })}
                  >
                    あり
                  </Button>
                  <Button
                    variant="outline"
                    className={!data.grandparentsAlive ? "glass-button" : ""}
                    onClick={() => onUpdate({ ...data, grandparentsAlive: false })}
                  >
                    なし
                  </Button>
                </div>
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
