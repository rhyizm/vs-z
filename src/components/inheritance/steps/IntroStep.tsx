"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { HelpHint } from "@/components/help/help-hint"
import { Calculator } from "lucide-react"

export default function IntroStep({ onNext }: { onNext: () => void }) {
  const [agreed, setAgreed] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl gradient-text">相続税かんたん診断</CardTitle>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>本ツールは生前の試算です。死亡日の入力は不要です。</p>
            <p className="flex items-center justify-center gap-2">
              <span>基礎控除 = 3,000万円 + 600万円 × 法定相続人の数</span>
              <HelpHint
                size="sm"
                label="法定相続人の説明"
                tooltip="法律で決まっている相続できる人です。"
                popoverTitle="法定相続人とは"
              >
                <div className="space-y-1">
                  <p>法律で決まっている相続できる人。</p>
                  <p>（例：配偶者や子どもなど）</p>
                </div>
              </HelpHint>
            </p>
            <p className="text-xs">相続放棄予定者がいても「放棄がなかったものとした場合の人数」で計算します。</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            {isMounted ? (
              <Checkbox
                id="agreement"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked === true)}
              />
            ) : (
              <div
                aria-hidden
                className="h-4 w-4 shrink-0 rounded-sm border border-primary shadow"
              />
            )}
            <Label htmlFor="agreement" className="text-sm">
              注意事項に同意します（本診断は法的助言ではありません）
            </Label>
          </div>
          <Button onClick={onNext} className="w-full glass-button font-medium py-6" size="lg" disabled={!agreed}>
            診断をはじめる
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
