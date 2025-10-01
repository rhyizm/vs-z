"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Users } from "lucide-react"
import { FamilyData } from "../../../types/inheritance"

export default function SpouseStep({
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="glass rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">STEP 1</span>
            <span className="text-sm text-muted-foreground">配偶者の有無</span>
          </div>
          <Progress value={20} className="h-2" />
        </div>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>遺産を残す方に配偶者はいらっしゃいますか？</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">法律婚の配偶者について教えてください</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className={`h-20 ${data.hasSpouse ? "glass-button" : ""}`}
                onClick={() => onUpdate({ ...data, hasSpouse: true })}
              >
                <div className="text-center">
                  <div className="text-lg font-medium">いる</div>
                  <div className="text-xs text-muted-foreground">法律婚</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className={`h-20 ${!data.hasSpouse ? "glass-button" : ""}`}
                onClick={() => onUpdate({ ...data, hasSpouse: false })}
              >
                <div className="text-center">
                  <div className="text-lg font-medium">いない</div>
                  <div className="text-xs text-muted-foreground">離婚済・死別</div>
                </div>
              </Button>
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
