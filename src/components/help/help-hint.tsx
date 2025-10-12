"use client"

import * as React from "react"
import { CircleHelp } from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type HelpIconButtonSize = "sm" | "md"

const sizeClasses: Record<HelpIconButtonSize, string> = {
  sm: "h-7 w-7",
  md: "h-8 w-8",
}

const iconSizeClasses: Record<HelpIconButtonSize, string> = {
  sm: "h-[18px] w-[18px]",
  md: "h-[20px] w-[20px]",
}

const HelpIconButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string
  size?: HelpIconButtonSize
}>(
  (
    {
      className,
      label = "ヘルプ",
      size = "md",
      type = "button",
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      className={cn(
        "inline-flex items-center justify-center rounded-full",
        "bg-transparent text-muted-foreground transition hover:text-foreground",
        "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      <CircleHelp aria-hidden="true" className={cn("shrink-0", iconSizeClasses[size])} />
      <span className="sr-only">{label}</span>
    </button>
  ),
)

HelpIconButton.displayName = "HelpIconButton"

function useIsFinePointer() {
  const [isFinePointer, setIsFinePointer] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false
    if (!window.matchMedia) return false
    return window.matchMedia("(pointer: fine)").matches
  })

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return

    const mediaQuery = window.matchMedia("(pointer: fine)")
    const handleChange = (event: MediaQueryListEvent) => setIsFinePointer(event.matches)

    setIsFinePointer(mediaQuery.matches)

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    }

    // Safari < 14 fallback
    mediaQuery.addListener?.(handleChange)
    return () => mediaQuery.removeListener?.(handleChange)
  }, [])

  return isFinePointer
}

/**
 * HelpHint は円形のヘルプアイコンボタンと Tooltip / Popover の制御をまとめたコンポーネントです。
 * - `(pointer: fine)` な環境（マウス）ではホバーで短文のツールチップを表示します。
 * - タッチ／コースポインタ環境ではタップで開閉するポップオーバーを出し、複数行やリンクを扱えます。
 * - フォーカスリング・サイズ・`aria-label`・Esc や外側クリックでのクローズなどは shadcn/ui のベストプラクティスに沿っています。
 *
 * 使用例:
 * ```tsx
 * import { HelpHint } from "@/components/help/help-hint"
 *
 * <HelpHint tooltip="この項目は請求書番号です" />
 *
 * <HelpHint
 *   popoverTitle="請求書番号について"
 *   tooltip="請求書番号の説明"
 *   side="right"
 *   align="start"
 * >
 *   <p>形式は <code>INV-YYYY-####</code> です。例: INV-2025-0001</p>
 *   <p>
 *     サンプルや詳細は
 *     <a
 *       href="https://example.com/docs/invoice"
 *       target="_blank"
 *       rel="noreferrer"
 *       className="underline"
 *     >
 *       ドキュメント
 *     </a>
 *     を参照してください。
 *   </p>
 * </HelpHint>
 * ```
 *
 * アクセシビリティの注意:
 * - `label` を設定するとボタンの `aria-label` とスクリーンリーダー向けテキストを制御できます。
 * - Tooltip / Popover は Radix UI を利用しており、Esc で閉じる・フォーカス管理などの基本操作が揃っています。
 * - フォーム入力と組み合わせる場合は、必要に応じて `aria-describedby` で SR 専用の補足説明を関連付けてください。
 */
export type HelpHintProps = {
  label?: string
  tooltip?: string
  popoverTitle?: string
  children?: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  size?: HelpIconButtonSize
}

export function HelpHint({
  label = "ヘルプ",
  tooltip = "ヘルプ",
  popoverTitle,
  children,
  side = "top",
  align = "center",
  size = "md",
}: HelpHintProps) {
  const isFinePointer = useIsFinePointer()

  if (isFinePointer && tooltip) {
    return (
      <TooltipProvider delayDuration={200} skipDelayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpIconButton aria-label={label} size={size} />
          </TooltipTrigger>
          <TooltipContent
            side={side}
            align={align}
            collisionPadding={8}
            className="max-w-xs text-sm leading-5"
          >
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <HelpIconButton aria-label={label} size={size} />
      </PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        collisionPadding={8}
        className="w-72 max-w-[90vw] space-y-2 text-sm leading-6 text-muted-foreground"
      >
        {popoverTitle && (
          <div className="font-medium text-foreground">
            {popoverTitle}
          </div>
        )}
        {children ?? tooltip}
      </PopoverContent>
    </Popover>
  )
}
