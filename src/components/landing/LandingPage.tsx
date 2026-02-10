import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@/i18n/navigation';
import {
  AlertTriangle,
  ArrowRight,
  Calculator,
  CheckCircle2,
  Clock,
  FileText,
  Heart,
  PieChart,
  Shield,
  TrendingDown,
  Users,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="landing-page min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50 text-foreground">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-foreground" />
            <span className="text-xl font-bold">相続税シミュレーター</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              機能
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              使い方
            </a>
            <Button asChild className="glass-button">
              <Link href="/check">今すぐ始める</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[600px] md:min-h-[700px] flex items-center">
        <div className="absolute inset-0">
          <img
            src="/hero-image.webp"
            alt="家族で相続について話し合う様子"
            className="h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8 text-center">
              <div className="inline-flex items-center gap-2 glass-light rounded-full px-4 py-2 text-sm text-white/90">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                無料で使える相続税計算ツール
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance leading-tight text-white">
                <span className="gradient-text">相続が発生してからでは</span>
                <br />
                もう遅い
              </h1>

              <p className="text-lg md:text-xl text-white/95 text-pretty leading-relaxed max-w-3xl mx-auto">
                相続税の申告期限は相続発生から <span className="font-bold">わずか10ヶ月</span>
                。想定外の相続税で家族が困らないよう、今すぐ相続税の概算を確認しましょう。
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button size="lg" className="glass-button text-base px-8 py-6 w-full sm:w-auto" asChild>
                  <Link href="/check">
                    今すぐ無料で計算する
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="glass-light bg-white/10 border-white/30 text-white hover:bg-white/20 text-base px-8 py-6 w-full sm:w-auto"
                  asChild
                >
                  <a href="#how-it-works">使い方を見る</a>
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-8 max-w-2xl mx-auto">
                {[
                  { label: 'で計算完了', value: '3分' },
                  { label: '登録不要', value: '無料' },
                  { label: '入力項目', value: '簡単' },
                ].map((stat) => (
                  <div key={stat.label} className="glass-light bg-white/10 backdrop-blur-md rounded-lg p-4">
                    <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs md:text-sm text-white/80 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-r from-red-50/50 to-orange-50/50">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 glass-light rounded-full px-4 py-2 text-sm text-red-600 font-medium">
              <AlertTriangle className="h-4 w-4" />
              相続発生後に直面する問題
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              こんな事態を避けるために
              <br />
              <span className="gradient-text">今すぐ対策が必要です</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: TrendingDown,
                title: '想定外の相続税',
                description: '相続税が予想以上に高額で、納税資金が不足。自宅や事業用資産を売却せざるを得ない事態に。',
                detail: '実例: 相続税2,000万円の納税資金不足',
              },
              {
                icon: Users,
                title: '家族間のトラブル',
                description: '遺産分割の方針が決まっておらず、相続人同士で争いに。関係が悪化し、調停や裁判に発展することも。',
                detail: '実例: 遺産分割協議が3年以上難航',
              },
              {
                icon: Clock,
                title: '申告期限の切迫',
                description: '相続発生から10ヶ月以内に申告・納税が必要。準備不足で期限に間に合わず、延滞税や加算税が発生。',
                detail: '実例: 延滞税・加算税で300万円追加',
              },
              {
                icon: FileText,
                title: '特例の適用漏れ',
                description: '配偶者控除や小規模宅地等の特例を知らず、本来払わなくてよい相続税を納付してしまう。',
                detail: '実例: 特例適用で1,500万円節税可能だった',
              },
            ].map((problem) => (
              <Card key={problem.title} className="glass border-red-200/40 hover:border-red-300/60 transition-all">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                    <problem.icon className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{problem.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{problem.description}</p>
                  <div className="pt-2 text-xs text-red-600 font-medium">{problem.detail}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center pt-8">
            <Card className="glass-light border-orange-200/40 inline-block">
              <CardContent className="p-6 space-y-3">
                <h3 className="text-xl font-bold text-foreground">
                  このアプリで <span className="gradient-text">達成できること</span>
                </h3>
                <p className="text-muted-foreground max-w-2xl">
                  相続税シミュレーターを使えば、相続発生前に必要な対策を立てられます
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Shield,
                title: '納税資金の準備ができる',
                description:
                  '相続税の概算を事前に把握することで、生命保険の活用や資産の組み替えなど、計画的な納税資金の準備が可能になります。',
                points: [
                  '相続税額の概算を把握し、必要な納税資金を算出',
                  '生命保険や預貯金など、流動性の高い資産で準備',
                  '自宅や事業用資産の売却を回避',
                ],
              },
              {
                icon: Heart,
                title: '家族間のトラブルを防止',
                description:
                  '法定相続分と各相続人の相続額を可視化することで、家族で事前に話し合い、円満な相続を実現できます。',
                points: [
                  '各相続人の法定相続分を明確に把握',
                  '家族で相続方針を事前に共有・合意',
                  '遺言書作成の基礎資料として活用',
                ],
              },
              {
                icon: TrendingDown,
                title: '節税対策の検討ができる',
                description:
                  '相続税額を把握することで、生前贈与や不動産の活用など、効果的な節税対策を専門家と相談できます。',
                points: [
                  '生前贈与（年110万円の非課税枠）の活用',
                  '小規模宅地等の特例の適用可否を確認',
                  '配偶者控除（最大1.6億円）の活用計画',
                ],
              },
              {
                icon: FileText,
                title: 'スムーズな相続手続き',
                description:
                  '事前に相続税額と財産配分を把握しておくことで、相続発生後の申告・納税手続きを円滑に進められます。',
                points: [
                  '10ヶ月の申告期限に余裕を持って対応',
                  '必要書類の準備を計画的に進行',
                  '延滞税・加算税のリスクを回避',
                ],
              },
            ].map((benefit) => (
              <Card key={benefit.title} className="glass border-white/20 hover:border-green-200/40 transition-all">
                <CardContent className="p-8 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="space-y-3 flex-1">
                      <h3 className="text-xl font-bold text-foreground">{benefit.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {benefit.points.map((point) => (
                          <li key={point} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 bg-gradient-to-br from-blue-50/30 to-purple-50/30">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">主な機能</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              相続対策に必要な計算を、わかりやすく、正確に
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: '家族構成の入力',
                description:
                  '配偶者、子、孫、両親、兄弟姉妹など、家族構成を簡単に入力。代襲相続や養子縁組にも対応し、正確な法定相続人を自動判定します。',
                bullets: [
                  '配偶者・子・孫の有無と人数',
                  '代襲相続の自動計算',
                  '養子の取り扱い（実子の有無で判定）',
                  '両親・兄弟姉妹の相続順位判定',
                ],
              },
              {
                icon: Calculator,
                title: '相続税の自動計算',
                description:
                  '基礎控除額（3,000万円 + 600万円 × 法定相続人数）、課税対象額、相続税の概算を自動計算。複雑な税率表や計算式を理解する必要はありません。',
                bullets: [
                  '総資産・総負債を入力するだけ',
                  '基礎控除額の自動計算',
                  '速算表による相続税概算',
                  '配偶者控除や各種特例の適用目安',
                ],
              },
              {
                icon: PieChart,
                title: '財産配分の可視化',
                description:
                  '法定相続分にもとづいた財産配分をグラフで表示。家族で共有しやすいレポートを自動生成します。',
                bullets: [
                  '財産配分のグラフ表示',
                  '納税資金シミュレーション',
                  '不足資金の可視化',
                  '各相続人の相続税額を個別表示',
                ],
              },
            ].map((feature) => (
              <Card key={feature.title} className="glass border-white/20 hover:border-white/40 transition-all">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg glass-button flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {feature.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">使い方</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              3つのステップで、相続税の概算と財産配分がわかります
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: '家族構成を入力',
                description:
                  '配偶者の有無、子・孫の人数、両親の生存状況、兄弟姉妹の人数など、簡単な質問に答えるだけで家族構成を登録。代襲相続や養子縁組も考慮した正確な法定相続人を自動判定します。',
                time: '所要時間: 約1分',
              },
              {
                step: '2',
                title: '財産を入力',
                description:
                  '総資産（現金、預貯金、不動産、有価証券など）と総負債（借入金、未払金など）を入力。正確な金額がわからない場合は概算でもOK。より詳細な相続税の概算と各相続人の相続税額を確認できます。',
                time: '所要時間: 約1分',
              },
              {
                step: '3',
                title: '結果を確認',
                description:
                  '基礎控除額、相続税の概算、法定相続分による財産配分を確認。各相続人の相続額と相続税額も表示されます。さらに、相続対策のアクションアイテムも提案します。',
                time: '所要時間: 約1分',
              },
            ].map((step, index) => (
              <div key={step.title} className="relative">
                <div className="glass-light rounded-2xl p-8 space-y-4 h-full">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center text-white font-bold text-xl">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  <div className="pt-2 text-sm font-medium text-foreground">{step.time}</div>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-8">
            <Card className="glass border-white/20">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-foreground mb-4 text-center">計算結果の活用方法</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { icon: FileText, title: '専門家への相談資料', description: '税理士や弁護士に相談する際の基礎資料として活用できます' },
                    { icon: Users, title: '家族での話し合い', description: '相続方針を家族で共有し、事前に合意形成を図れます' },
                    { icon: Shield, title: '対策の立案', description: '生前贈与や保険活用など、具体的な対策を検討できます' },
                  ].map((item) => (
                    <div key={item.title} className="space-y-2">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
                        <item.icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <h4 className="font-bold text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Urgency Section */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-r from-orange-50/50 to-red-50/50">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              <span className="gradient-text">今すぐ</span>始めるべき理由
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              相続対策は、早ければ早いほど選択肢が広がります
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                title: '時間が必要な対策がある',
                description:
                  '生前贈与は年110万円まで非課税ですが、効果を発揮するには長期間の実施が必要。相続発生の3年前までの贈与は相続財産に加算されるため、早めの対策が重要です。',
                detail: '例: 10年間の生前贈与で1,100万円の非課税枠を活用',
              },
              {
                icon: AlertTriangle,
                title: '相続は突然やってくる',
                description:
                  '相続は予期せぬタイミングで発生します。「まだ大丈夫」と思っているうちに、対策の機会を逃してしまうケースが多数。今日から準備を始めることが、家族を守ることにつながります。',
                detail: '統計: 相続の約40%が60代以下で発生',
              },
              {
                icon: TrendingDown,
                title: '対策の選択肢が減る',
                description:
                  '相続発生後は、生前贈与や不動産の組み替えなど、多くの節税対策が使えなくなります。事前に相続税額を把握し、計画的に対策を実施することで、数百万円〜数千万円の節税が可能です。',
                detail: '例: 小規模宅地等の特例で最大80%評価減',
              },
            ].map((reason) => (
              <Card key={reason.title} className="glass border-orange-200/40">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                    <reason.icon className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{reason.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{reason.description}</p>
                  <div className="pt-2 border-t border-border/40">
                    <p className="text-xs text-muted-foreground">{reason.detail}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center pt-8">
            <Card className="glass-light border-orange-200/40 inline-block max-w-3xl">
              <CardContent className="p-8">
                <p className="text-xl font-bold text-foreground mb-3">
                  <span className="gradient-text">「いつか」ではなく「今日」</span>から始めましょう
                </p>
                <p className="text-muted-foreground mb-6">
                  わずか3分の入力で、あなたの家族の未来を守る第一歩を踏み出せます
                </p>
                <Button size="lg" className="glass-button text-base px-8 py-6" asChild>
                  <Link href="/check">
                    今すぐ無料で計算する
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="glass border-white/20">
            <CardContent className="p-8 md:p-12 text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
                家族の未来を守るために
                <br />
                <span className="gradient-text">今すぐ相続税の計算を</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
                登録不要、完全無料。わずか3分で相続税の概算と財産配分がわかります。
                <br />
                相続発生前の今だからこそ、できる対策があります。
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button size="lg" className="glass-button text-base px-8 py-6" asChild>
                  <Link href="/check">
                    無料で計算を始める
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-8 max-w-xl mx-auto">
                {['登録不要', '完全無料', '個人情報不要'].map((item) => (
                  <div key={item} className="text-center">
                    <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">相続税シミュレーター</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">© 2025 相続税シミュレーター. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
