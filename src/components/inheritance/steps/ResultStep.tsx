"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, BarChart3 } from "lucide-react"
import { TaxCalculation } from "../types"

export default function ResultStep({
  calculation,
  totalPlus,
  totalMinus,
  onBack,
  onToDashboard,
}: {
  calculation: TaxCalculation
  totalPlus: number
  totalMinus: number
  onBack: () => void
  onToDashboard: () => void
}) {
  const netInheritance = Math.max(0, (totalPlus - totalMinus) * 10000 - calculation.estimatedTax)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50 p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        <Card className="glass">
          <CardHeader className="text-center">
            <CardTitle className="gradient-text text-2xl font-bold">診断結果</CardTitle>
          </CardHeader>
        </Card>

        <div className="text-center space-y-2 glass-light rounded-lg p-6">
          <p className="text-lg font-medium">相続金額合計（税引き後）</p>
          <div className="text-4xl font-bold gradient-text">{netInheritance.toLocaleString()}円</div>
          {calculation.estimatedTax === 0 && (
            <p className="text-green-600 font-medium">基礎控除内のため相続税はかかりません</p>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-lg flex items-center space-x-2">
            <Calculator className="w-5 h-5" />
            <span>課税対象額の計算内訳</span>
          </h3>
          <div className="glass-light rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span>総財産額</span>
              <span className="font-medium">{totalPlus.toLocaleString()}万円</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>債務・費用</span>
              <span className="font-medium text-red-600">-{totalMinus.toLocaleString()}万円</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>基礎控除額</span>
              <span className="font-medium text-blue-600">
                -{(calculation.basicDeduction / 10000).toLocaleString()}万円
              </span>
            </div>
            <hr className="border-white/20" />
            <div className="flex justify-between font-medium text-lg">
              <span>課税対象額</span>
              <span className="gradient-text">{(calculation.taxableAssets / 10000).toLocaleString()}万円</span>
            </div>
            <div className="flex justify-between font-medium text-lg">
              <span>相続税額（概算）</span>
              <span className="text-red-600">{calculation.estimatedTax.toLocaleString()}円</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="glass-light bg-transparent">
            結果を保存
          </Button>
          <Button className="glass-button">専門家に相談</Button>
        </div>

        <div className="space-y-3">
          <Button onClick={onToDashboard} className="w-full glass-button">
            <BarChart3 className="w-4 h-4 mr-2" />
            ダッシュボードで詳細管理
          </Button>
        </div>

        <div className="space-y-3">
          <Button variant="ghost" onClick={() => window.location.reload()} className="w-full">
            最初からやり直す
          </Button>
          <Button variant="ghost" onClick={onBack} className="w-full">
            前に戻る
          </Button>
        </div>
      </div>
    </div>
  )
}
