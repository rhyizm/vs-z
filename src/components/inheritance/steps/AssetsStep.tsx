"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PieChart, Plus, Calculator, Home, TrendingUp, Shield, Car, Minus, CreditCard, Receipt, AlertCircle } from "lucide-react"
import { AssetData } from "../../../types/inheritance"

export default function AssetsStep({
  data,
  onUpdate,
  onNext,
  onBack,
}: {
  data: AssetData
  onUpdate: (data: AssetData) => void
  onNext: () => void
  onBack: () => void
}) {
  const totalPlus = useMemo(
    () => data.cash + data.realEstate + data.securities + data.insurance + data.other,
    [data.cash, data.realEstate, data.securities, data.insurance, data.other],
  )
  const totalMinus = useMemo(
    () => data.loans + data.funeralCosts + data.unpaidTaxes,
    [data.loans, data.funeralCosts, data.unpaidTaxes],
  )

  const toInt = (v: string) => (v === "" ? 0 : Number.parseInt(v) || 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5" />
              <span>財産と債務について教えてください</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* プラスの財産 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-green-600" />
                <span className="font-medium">プラスの財産</span>
                <span className="text-sm text-muted-foreground">合計: {totalPlus.toLocaleString()}万円</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calculator className="w-5 h-5 text-blue-500" />
                  <div className="flex-1">
                    <Label className="text-sm font-medium">現金・預貯金</Label>
                    <div className="relative mt-1">
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        value={data.cash || ""}
                        onChange={(e) => onUpdate({ ...data, cash: toInt(e.target.value) })}
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        万円
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Home className="w-5 h-5 text-orange-500" />
                  <div className="flex-1">
                    <Label className="text-sm font-medium">不動産</Label>
                    <div className="relative mt-1">
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        value={data.realEstate || ""}
                        onChange={(e) => onUpdate({ ...data, realEstate: toInt(e.target.value) })}
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        万円
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <div className="flex-1">
                    <Label className="text-sm font-medium">有価証券</Label>
                    <div className="relative mt-1">
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        value={data.securities || ""}
                        onChange={(e) => onUpdate({ ...data, securities: toInt(e.target.value) })}
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        万円
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-purple-500" />
                  <div className="flex-1">
                    <Label className="text-sm font-medium">生命保険金</Label>
                    <div className="relative mt-1">
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        value={data.insurance || ""}
                        onChange={(e) => onUpdate({ ...data, insurance: toInt(e.target.value) })}
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        万円
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Car className="w-5 h-5 text-gray-500" />
                  <div className="flex-1">
                    <Label className="text-sm font-medium">その他</Label>
                    <div className="relative mt-1">
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        value={data.other || ""}
                        onChange={(e) => onUpdate({ ...data, other: toInt(e.target.value) })}
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        万円
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* マイナスの財産 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Minus className="w-5 h-5 text-red-600" />
                <span className="font-medium">マイナスの財産・費用</span>
                <span className="text-sm text-muted-foreground">合計: {totalMinus.toLocaleString()}万円</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-red-500" />
                  <div className="flex-1">
                    <Label className="text-sm font-medium">借入金・ローン</Label>
                    <div className="relative mt-1">
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        value={data.loans || ""}
                        onChange={(e) => onUpdate({ ...data, loans: toInt(e.target.value) })}
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        万円
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Receipt className="w-5 h-5 text-orange-500" />
                  <div className="flex-1">
                    <Label className="text-sm font-medium">葬式費用</Label>
                    <div className="relative mt-1">
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        value={data.funeralCosts || ""}
                        onChange={(e) => onUpdate({ ...data, funeralCosts: toInt(e.target.value) })}
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        万円
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  <div className="flex-1">
                    <Label className="text-sm font-medium">未払いの税金・費用</Label>
                    <div className="relative mt-1">
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        value={data.unpaidTaxes || ""}
                        onChange={(e) => onUpdate({ ...data, unpaidTaxes: toInt(e.target.value) })}
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        万円
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button onClick={onNext} className="w-full glass-button">
                診断結果を見る
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
